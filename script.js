// script.js

function formBadge(letter) {
  return `<span class="${letter}">${letter}</span>`;
}

function renderMatches(day, dateStr) {
  const container = document.getElementById("results");

  if (!day || !day.matches) {
    container.innerHTML = `<div class="empty-state">No matches found for ${dateStr}.</div>`;
    return;
  }

  let html = `<div class="league-row">${day.flag || ""} ${day.league}</div>`;

  day.matches.forEach((m) => {
    html += `
      <div class="match-row">
        <div class="match-info">
          <div class="time">${m.time}</div>
          <div class="team-pair">
            <div>
              <div class="teams"><span>${m.home}</span></div>
              <div class="form">${m.homeForm.split("").map(formBadge).join("")}</div>
            </div>
            <div>
              <div class="teams"><span>${m.away}</span></div>
              <div class="form">${m.awayForm.split("").map(formBadge).join("")}</div>
            </div>
          </div>
        </div>
        <div class="odds-tips">
          <div>${m.odds[0]}</div>
          <div>${m.odds[1]}</div>
          <div>${m.odds[2]}</div>
          <div class="pick">${m.pick}</div>
          <div>${m.goals}<br><span style="color:var(--muted);font-size:0.85em;">${m.score}</span></div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

async function loadMatches(dateStr) {
  const container = document.getElementById("results");
  container.innerHTML = `<div class="empty-state">Loading...</div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/matches/${dateStr}`);

    if (response.status === 404) {
      container.innerHTML = `<div class="empty-state">No matches found for ${dateStr}.</div>`;
      return;
    }

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const day = await response.json();
    renderMatches(day, dateStr);
  } catch (err) {
    console.error("Failed to load matches:", err);
    container.innerHTML = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
  }
}

const input = document.getElementById("matchDate");
input.value = "2026-06-28";
loadMatches(input.value);

input.addEventListener("change", () => loadMatches(input.value));
