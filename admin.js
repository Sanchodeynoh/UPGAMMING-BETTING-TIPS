// admin.js

let adminToken = sessionStorage.getItem("upgamming_admin_token") || null;

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`
  };
}

function showDashboard() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";
  loadMatches();
  loadLiveMatches();
  loadBlogs();
}

function showLogin() {
  document.getElementById("loginView").style.display = "block";
  document.getElementById("dashboardView").style.display = "none";
}

// ---------- Login ----------
document.getElementById("loginBtn").addEventListener("click", async () => {
  const password = document.getElementById("passwordInput").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      sessionStorage.setItem("upgamming_admin_token", adminToken);
      showDashboard();
    } else {
      errorEl.textContent = data.error || "Login failed.";
    }
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Could not connect to the backend. Check API_BASE_URL in config.js.";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  adminToken = null;
  sessionStorage.removeItem("upgamming_admin_token");
  showLogin();
});

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn[data-tab]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach((p) => (p.style.display = "none"));
    document.getElementById(`${btn.dataset.tab}Tab`).style.display = "block";
  });
});

// ---------- Matches ----------
async function loadMatches() {
  const list = document.getElementById("matchesList");
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/matches`, { headers: authHeaders() });
    if (res.status === 401) return showLogin();
    const data = await res.json();
    const matches = Object.values(data.matches);

    if (!matches.length) {
      list.innerHTML = `<div class="empty-state">No matches yet.</div>`;
      return;
    }

    list.innerHTML = matches
      .map(
        (m) => `
      <div class="admin-list-item">
        <div class="info">
          <div class="title">${m.home} vs ${m.away}</div>
          <div class="sub">${m.league} &middot; ${m.date} ${m.time} &middot; id: ${m.id}</div>
        </div>
        <div class="actions">
          <button class="delete" onclick="deleteMatch('${m.id}')">Delete</button>
        </div>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Could not load matches.</div>`;
  }
}

document.getElementById("addMatchBtn").addEventListener("click", async () => {
  const msg = document.getElementById("matchFormMsg");
  msg.textContent = "";
  msg.className = "admin-msg";

  const match = {
    id: document.getElementById("m_id").value.trim(),
    league: document.getElementById("m_league").value.trim(),
    flag: document.getElementById("m_flag").value.trim() || "⚽",
    date: document.getElementById("m_date").value,
    time: document.getElementById("m_time").value.trim(),
    home: document.getElementById("m_home").value.trim(),
    away: document.getElementById("m_away").value.trim(),
    homeForm: document.getElementById("m_homeForm").value.trim() || "DDDDD",
    awayForm: document.getElementById("m_awayForm").value.trim() || "DDDDD",
    odds: {
      home: document.getElementById("m_oddsHome").value.trim() || "0",
      draw: document.getElementById("m_oddsDraw").value.trim() || "0",
      away: document.getElementById("m_oddsAway").value.trim() || "0"
    },
    pick: document.getElementById("m_pick").value.trim(),
    goals: document.getElementById("m_goals").value.trim() || "-",
    score: document.getElementById("m_score").value.trim(),
    venue: document.getElementById("m_venue").value.trim(),
    analysis: document.getElementById("m_analysis").value.trim()
  };

  if (!match.id || !match.date || !match.league || !match.home || !match.away) {
    msg.textContent = "ID, league, date, home, and away are required.";
    msg.classList.add("error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/matches`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(match)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Failed to add match.";
      msg.classList.add("error");
      return;
    }

    msg.textContent = "Match added successfully.";
    msg.classList.add("success");
    loadMatches();
  } catch (err) {
    console.error(err);
    msg.textContent = "Could not connect to the backend.";
    msg.classList.add("error");
  }
});

async function deleteMatch(id) {
  if (!confirm(`Delete match ${id}?`)) return;
  try {
    await fetch(`${API_BASE_URL}/api/admin/matches/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    loadMatches();
  } catch (err) {
    console.error(err);
    alert("Failed to delete match.");
  }
}

// ---------- Livescores ----------
async function loadLiveMatches() {
  const list = document.getElementById("liveList");
  try {
    const res = await fetch(`${API_BASE_URL}/api/livescores`);
    const data = await res.json();
    const matches = data.matches || [];

    if (!matches.length) {
      list.innerHTML = `<div class="empty-state">No live matches yet.</div>`;
      return;
    }

    list.innerHTML = matches
      .map(
        (m) => `
      <div class="admin-list-item">
        <div class="info">
          <div class="title">${m.home} ${m.homeScore} - ${m.awayScore} ${m.away}</div>
          <div class="sub">${m.league} &middot; ${m.status} &middot; min ${m.minute} &middot; id: ${m.id}</div>
        </div>
        <div class="actions">
          <button onclick="bumpScore('${m.id}','home')">+1 Home</button>
          <button onclick="bumpScore('${m.id}','away')">+1 Away</button>
          <button class="delete" onclick="deleteLiveMatch('${m.id}')">Delete</button>
        </div>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Could not load live matches.</div>`;
  }
}

async function bumpScore(id, side) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/livescores`);
    const data = await res.json();
    const match = (data.matches || []).find((m) => m.id === id);
    if (!match) return;

    const update =
      side === "home" ? { homeScore: match.homeScore + 1 } : { awayScore: match.awayScore + 1 };

    await fetch(`${API_BASE_URL}/api/admin/livescores/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(update)
    });
    loadLiveMatches();
  } catch (err) {
    console.error(err);
    alert("Failed to update score.");
  }
}

document.getElementById("addLiveBtn").addEventListener("click", async () => {
  const msg = document.getElementById("liveFormMsg");
  msg.textContent = "";
  msg.className = "admin-msg";

  const lv = {
    id: document.getElementById("lv_id").value.trim(),
    league: document.getElementById("lv_league").value.trim(),
    flag: document.getElementById("lv_flag").value.trim() || "⚽",
    date: document.getElementById("lv_date").value,
    time: document.getElementById("lv_time").value.trim(),
    home: document.getElementById("lv_home").value.trim(),
    away: document.getElementById("lv_away").value.trim(),
    homeScore: parseInt(document.getElementById("lv_homeScore").value, 10) || 0,
    awayScore: parseInt(document.getElementById("lv_awayScore").value, 10) || 0,
    minute: parseInt(document.getElementById("lv_minute").value, 10) || 0,
    status: document.getElementById("lv_status").value
  };

  if (!lv.id || !lv.home || !lv.away) {
    msg.textContent = "ID, home, and away are required.";
    msg.classList.add("error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/livescores`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(lv)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Failed to add live match.";
      msg.classList.add("error");
      return;
    }

    msg.textContent = "Live match added.";
    msg.classList.add("success");
    loadLiveMatches();
  } catch (err) {
    console.error(err);
    msg.textContent = "Could not connect to the backend.";
    msg.classList.add("error");
  }
});

async function deleteLiveMatch(id) {
  if (!confirm(`Delete live match ${id}?`)) return;
  try {
    await fetch(`${API_BASE_URL}/api/admin/livescores/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    loadLiveMatches();
  } catch (err) {
    console.error(err);
    alert("Failed to delete live match.");
  }
}

// ---------- Blogs ----------
async function loadBlogs() {
  const list = document.getElementById("blogsList");
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs`);
    const data = await res.json();

    if (!data.blogs.length) {
      list.innerHTML = `<div class="empty-state">No blog posts yet.</div>`;
      return;
    }

    list.innerHTML = data.blogs
      .map(
        (b) => `
      <div class="admin-list-item">
        <div class="info">
          <div class="title">${b.title}</div>
          <div class="sub">${b.date} &middot; ${b.author} &middot; id: ${b.id}</div>
        </div>
        <div class="actions">
          <button class="delete" onclick="deleteBlog('${b.id}')">Delete</button>
        </div>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Could not load blog posts.</div>`;
  }
}

document.getElementById("addBlogBtn").addEventListener("click", async () => {
  const msg = document.getElementById("blogFormMsg");
  msg.textContent = "";
  msg.className = "admin-msg";

  const post = {
    id: document.getElementById("b_id").value.trim(),
    title: document.getElementById("b_title").value.trim(),
    author: document.getElementById("b_author").value.trim() || "UPGAMMING Team",
    date: document.getElementById("b_date").value,
    summary: document.getElementById("b_summary").value.trim(),
    content: document.getElementById("b_content").value.trim()
  };

  if (!post.id || !post.title || !post.content) {
    msg.textContent = "ID, title, and content are required.";
    msg.classList.add("error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/blogs`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(post)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Failed to add blog post.";
      msg.classList.add("error");
      return;
    }

    msg.textContent = "Blog post published.";
    msg.classList.add("success");
    loadBlogs();
  } catch (err) {
    console.error(err);
    msg.textContent = "Could not connect to the backend.";
    msg.classList.add("error");
  }
});

async function deleteBlog(id) {
  if (!confirm(`Delete blog post ${id}?`)) return;
  try {
    await fetch(`${API_BASE_URL}/api/admin/blogs/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    loadBlogs();
  } catch (err) {
    console.error(err);
    alert("Failed to delete blog post.");
  }
}

// ---------- Init ----------
if (adminToken) {
  showDashboard();
} else {
  showLogin();
}
