// livescore.js
//
// NOTE ON REAL LIVE DATA:
// The matches below come from your own backend's sample data (data/db.json).
// They are NOT pulled from a real sports data provider, so "live" minutes
// here are simulated client-side for demo purposes only and won't match
// real-world games.
//
// To show REAL live scores, you'll need to sign up for a sports data API
// (e.g. api-football.com, sportsdata.io, or similar — most have a free
// tier) and swap the /api/livescores backend route to fetch from that
// provider instead of data/db.json. Ask me when you're ready to wire one
// up and I'll help you integrate it.

let liveTickers = [];

function statusBadge(status) {
  if (status === "live") return `<span style="color:#2ecc71;font-weight:700;">&#9679; LIVE</span>`;
  if (status === "upcoming") return `<span style="color:var(--muted);">Upcoming</span>`;
  return `<span style="color:var(--muted);">Finished</span>`;
}

function matchCardHtml(m) {
  return `
    <div class="match-row" style="cursor:default;" data-id="${m.id}">
      <div class="match-info">
        <div class="time">${m.date} &middot; ${m.time} &middot; ${statusBadge(m.status)}</div>
        <div class="teams" style="margin-top:6px;">
          <span>${m.home}</span>
          <span style="color:var(--gold);font-weight:700;">
            <span class="score-home">${m.homeScore}</span> - <span class="score-away">${m.awayScore}</span>
          </span>
          <span>${m.away}</span>
        </div>
      </div>
      <div style="text-align:center;padding:10px;border-left:1px solid var(--border);">
        ${m.status === "live" ? `<span class="minute-display">${m.minute}'</span>` : (m.status === "upcoming" ? "—" : "FT")}
      </div>
    </div>`;
}

function renderSection(id, title, matches) {
  const container = document.getElementById(id);
  if (!matches.length) {
    container.innerHTML = "";
    return;
  }
  let html = `<div class="league-row">${title}</div>`;
  matches.forEach((m) => {
    html += matchCardHtml(m);
  });
  container.innerHTML = html;
}

function startLiveTicking(liveMatches) {
  liveTickers.forEach(clearInterval);
  liveTickers = [];

  liveMatches.forEach((m) => {
    const row = document.querySelector(`[data-id="${m.id}"]`);
    if (!row) return;
    const minuteEl = row.querySelector(".minute-display");
    let minute = m.minute;

    const interval = setInterval(() => {
      if (minute < 90) {
        minute += 1;
        if (minuteEl) minuteEl.textContent = `${minute}'`;
      } else {
        clearInterval(interval);
      }
    }, 15000); // advance 1 simulated minute every 15 seconds

    liveTickers.push(interval);
  });
}

async function loadLivescores() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/livescores`);
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

    const data = await response.json();
    const matches = data.matches || [];

    const live = matches.filter((m) => m.status === "live");
    const upcoming = matches.filter((m) => m.status === "upcoming");
    const finished = matches.filter((m) => m.status === "finished");

    renderSection("liveSection", "🔴 Live Now", live);
    renderSection("upcomingSection", "🕒 Upcoming Matches", upcoming);
    renderSection("finishedSection", "✅ Finished Matches", finished);

    if (!matches.length) {
      document.getElementById("liveSection").innerHTML =
        `<div class="empty-state">No matches available right now.</div>`;
    }

    startLiveTicking(live);
  } catch (err) {
    console.error("Failed to load livescores:", err);
    document.getElementById("liveSection").innerHTML = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
  }
}

loadLivescores();
// Refresh from the backend every 60 seconds in case the admin updated scores
setInterval(loadLivescores, 60000);
