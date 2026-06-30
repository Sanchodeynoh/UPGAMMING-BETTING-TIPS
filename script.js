// script.js (home page)

function formBadge(letter) {
  return `<span class="${letter}">${letter}</span>`;
}

function matchRowHtml(m) {
  return `
    <div class="match-row" onclick="window.location.href='match.html?id=${m.id}'">
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
        <div>${m.odds.home}</div>
        <div>${m.odds.draw}</div>
        <div>${m.odds.away}</div>
        <div class="pick">${m.pick}</div>
        <div>${m.goals}<br><span style="color:var(--muted);font-size:0.85em;">${m.score}</span></div>
      </div>
    </div>`;
}

function renderGroups(groups, dateStr) {
  const container = document.getElementById("results");

  if (!groups || groups.length === 0) {
    container.innerHTML = `<div class="empty-state">No matches found for ${dateStr}.</div>`;
    return;
  }

  let html = "";
  groups.forEach((group) => {
    html += `<div class="league-row">${group.flag || ""} ${group.league}</div>`;
    group.matches.forEach((m) => {
      html += matchRowHtml(m);
    });
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

    const data = await response.json();
    renderGroups(data.groups, dateStr);
  } catch (err) {
    console.error("Failed to load matches:", err);
    container.innerHTML = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
  }
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const input = document.getElementById("matchDate");
input.value = getTodayDateString();
loadMatches(input.value);

input.addEventListener("change", () => loadMatches(input.value));
