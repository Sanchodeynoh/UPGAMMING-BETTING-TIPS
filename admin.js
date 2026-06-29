// admin.js

let adminToken = sessionStorage.getItem("upgamming_admin_token") || null;
let editingMatchId = null;

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
  loadInquiries();
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
function clearMatchForm() {
  [
    "m_id", "m_league", "m_flag", "m_date", "m_time", "m_home", "m_away",
    "m_homeForm", "m_awayForm", "m_oddsHome", "m_oddsDraw", "m_oddsAway",
    "m_pick", "m_goals", "m_score", "m_venue", "m_analysis"
  ].forEach((id) => (document.getElementById(id).value = ""));
  document.getElementById("m_addValueBets").checked = false;
  document.getElementById("m_addBankers").checked = false;
  document.getElementById("m_id").disabled = false;
}

function exitEditMode() {
  editingMatchId = null;
  clearMatchForm();
  document.getElementById("matchFormTitle").textContent = "Add New Match";
  document.getElementById("addMatchBtn").textContent = "Add Match";
  document.getElementById("cancelEditBtn").style.display = "none";
}

document.getElementById("cancelEditBtn").addEventListener("click", exitEditMode);

async function loadMatches() {
  const list = document.getElementById("matchesList");
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/matches`, { headers: authHeaders() });
    if (res.status === 401) return showLogin();
    const data = await res.json();
    const matches = Object.values(data.matches);

    const valueBetIds = new Set(
      (data.betOfTheDay.valueBets || []).flatMap((g) => g.matchIds)
    );
    const bankerIds = new Set(
      (data.betOfTheDay.bankers || []).flatMap((g) => g.matchIds)
    );

    if (!matches.length) {
      list.innerHTML = `<div class="empty-state">No matches yet.</div>`;
      return;
    }

    list.innerHTML = matches
      .map((m) => {
        const tags = [];
        if (valueBetIds.has(m.id)) tags.push("Value Bet");
        if (bankerIds.has(m.id)) tags.push("Banker");
        return `
      <div class="admin-list-item">
        <div class="info">
          <div class="title">${m.home} vs ${m.away}</div>
          <div class="sub">${m.league} &middot; ${m.date} ${m.time} &middot; id: ${m.id}${tags.length ? " &middot; " + tags.join(", ") : ""}</div>
        </div>
        <div class="actions">
          <button onclick='startEditMatch(${JSON.stringify(m).replace(/'/g, "&apos;")}, ${valueBetIds.has(m.id)}, ${bankerIds.has(m.id)})'>Edit</button>
          <button class="delete" onclick="deleteMatch('${m.id}')">Delete</button>
        </div>
      </div>`;
      })
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Could not load matches.</div>`;
  }
}

function startEditMatch(m, isValueBet, isBanker) {
  editingMatchId = m.id;
  document.getElementById("m_id").value = m.id;
  document.getElementById("m_id").disabled = true; // id can't change
  document.getElementById("m_league").value = m.league || "";
  document.getElementById("m_flag").value = m.flag || "";
  document.getElementById("m_date").value = m.date || "";
  document.getElementById("m_time").value = m.time || "";
  document.getElementById("m_home").value = m.home || "";
  document.getElementById("m_away").value = m.away || "";
  document.getElementById("m_homeForm").value = m.homeForm || "";
  document.getElementById("m_awayForm").value = m.awayForm || "";
  document.getElementById("m_oddsHome").value = (m.odds && m.odds.home) || "";
  document.getElementById("m_oddsDraw").value = (m.odds && m.odds.draw) || "";
  document.getElementById("m_oddsAway").value = (m.odds && m.odds.away) || "";
  document.getElementById("m_pick").value = m.pick || "";
  document.getElementById("m_goals").value = m.goals || "";
  document.getElementById("m_score").value = m.score || "";
  document.getElementById("m_venue").value = m.venue || "";
  document.getElementById("m_analysis").value = m.analysis || "";
  document.getElementById("m_addValueBets").checked = !!isValueBet;
  document.getElementById("m_addBankers").checked = !!isBanker;

  document.getElementById("matchFormTitle").textContent = `Editing match: ${m.id}`;
  document.getElementById("addMatchBtn").textContent = "Save Changes";
  document.getElementById("cancelEditBtn").style.display = "block";
  document.getElementById("matchesTab").scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildMatchPayload() {
  return {
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
    analysis: document.getElementById("m_analysis").value.trim(),
    addToValueBets: document.getElementById("m_addValueBets").checked,
    addToBankers: document.getElementById("m_addBankers").checked
  };
}

document.getElementById("addMatchBtn").addEventListener("click", async () => {
  const msg = document.getElementById("matchFormMsg");
  msg.textContent = "";
  msg.className = "admin-msg";

  const match = buildMatchPayload();

  if (!match.id || !match.date || !match.league || !match.home || !match.away) {
    msg.textContent = "ID, league, date, home, and away are required.";
    msg.classList.add("error");
    return;
  }

  try {
    const url = editingMatchId
      ? `${API_BASE_URL}/api/admin/matches/${editingMatchId}`
      : `${API_BASE_URL}/api/admin/matches`;
    const method = editingMatchId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(match)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.error || "Failed to save match.";
      msg.classList.add("error");
      return;
    }

    msg.textContent = editingMatchId ? "Match updated successfully." : "Match added successfully.";
    msg.classList.add("success");
    exitEditMode();
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

// ---------- Payment Inquiries ----------
async function loadInquiries() {
  const list = document.getElementById("inquiriesList");
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/payment-inquiries`, { headers: authHeaders() });
    if (res.status === 401) return showLogin();
    const data = await res.json();
    const inquiries = data.inquiries || [];

    if (!inquiries.length) {
      list.innerHTML = `<div class="empty-state">No payment inquiries yet.</div>`;
      return;
    }

    list.innerHTML = inquiries
      .map(
        (i) => `
      <div class="admin-list-item" style="align-items:flex-start;">
        <div class="info">
          <div class="title">${i.package} ${i.status === "verified" ? "&middot; <span style=\"color:#2ecc71;\">Verified</span>" : ""}</div>
          <div class="sub">${i.name || "(no name)"} &middot; ${i.phone || "(no phone)"} &middot; ${new Date(i.submittedAt).toLocaleString()}</div>
          <div class="sub" style="margin-top:6px;white-space:pre-wrap;color:var(--text);">${i.message}</div>
        </div>
        <div class="actions" style="flex-direction:column;">
          ${i.status !== "verified" ? `<button onclick="verifyInquiry('${i.id}')">Mark Verified</button>` : ""}
          <button class="delete" onclick="deleteInquiry('${i.id}')">Delete</button>
        </div>
      </div>`
      )
      .join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Could not load payment inquiries.</div>`;
  }
}

async function verifyInquiry(id) {
  try {
    await fetch(`${API_BASE_URL}/api/admin/payment-inquiries/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status: "verified" })
    });
    loadInquiries();
  } catch (err) {
    console.error(err);
    alert("Failed to update inquiry.");
  }
}

async function deleteInquiry(id) {
  if (!confirm("Delete this payment inquiry?")) return;
  try {
    await fetch(`${API_BASE_URL}/api/admin/payment-inquiries/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    loadInquiries();
  } catch (err) {
    console.error(err);
    alert("Failed to delete inquiry.");
  }
}

// ---------- Init ----------
if (adminToken) {
  showDashboard();
} else {
  showLogin();
}
