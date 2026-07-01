// match.js

function formBadge(letter) {
  return `<span class="${letter}">${letter}</span>`;
}

function renderMatch(m) {
  const container = document.getElementById("matchContainer");

  container.innerHTML = `
    <div class="detail-card">
      <div class="league-strip">${m.flag || ""} ${m.league}</div>
      <div class="teams-block">
        <div class="vs">
          <span>${m.home}</span>
          <span class="sep">vs</span>
          <span>${m.away}</span>
        </div>
        <div class="meta">${m.date} &middot; ${m.time}${m.venue ? " &middot; " + m.venue : ""}</div>
      </div>
      <div class="forms-block">
        <div class="team-form">
          <div class="name">${m.home}</div>
          <div class="form">${m.homeForm.split("").map(formBadge).join("")}</div>
        </div>
        <div class="team-form">
          <div class="name">${m.away}</div>
          <div class="form">${m.awayForm.split("").map(formBadge).join("")}</div>
        </div>
      </div>
      <div class="odds-block">
        <div>
          <div class="label">Home (1)</div>
          <div class="value">${m.odds.home}</div>
        </div>
        <div>
          <div class="label">Draw (X)</div>
          <div class="value">${m.odds.draw}</div>
        </div>
        <div>
          <div class="label">Away (2)</div>
          <div class="value">${m.odds.away}</div>
        </div>
      </div>
      <div class="tip-banner">Tip: ${m.pick}${m.pickOdds ? " (" + m.pickOdds + ")" : ""}</div>
    </div>

    <div class="analysis-block">
      <h3>Match Analysis</h3>
      <p>${m.analysis || "No analysis available for this match yet."}</p>
      ${m.goals && m.goals !== "-" ? `<p>Goals tip: <strong>${m.goals}</strong></p>` : ""}
      ${m.score ? `<p>Predicted score: <strong>${m.score}</strong></p>` : ""}
    </div>
  `;
}

async function loadMatch() {
  const container = document.getElementById("matchContainer");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = `<div class="empty-state">No match specified.</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/match/${id}`);

    if (response.status === 404) {
      container.innerHTML = `<div class="empty-state">Match not found.</div>`;
      return;
    }

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const match = await response.json();
    renderMatch(match);
  } catch (err) {
    console.error("Failed to load match:", err);
    container.innerHTML = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
  }
}

loadMatch();
