// bet-of-the-day.js

function valueRowHtml(m) {
  const pickOdds = m.pickOdds ? ` <span class="odds">(${m.pickOdds})</span>` : "";
  return `
    <div class="value-row" onclick="window.location.href='match.html?id=${m.id}'">
      <div class="match-info">
        <div class="time">${m.time}</div>
        <div class="teams"><span>${m.home}</span><span style="margin-left:16px;">${m.away}</span></div>
      </div>
      <div class="pick-cell">${m.pick}${pickOdds}</div>
    </div>`;
}

function renderSection(containerId, groups) {
  const container = document.getElementById(containerId);

  if (!groups || groups.length === 0) {
    container.innerHTML = `<div class="empty-state">No tips available right now.</div>`;
    return;
  }

  let html = "";
  groups.forEach((group) => {
    html += `<div class="league-row">${group.flag || ""} ${group.league}</div>`;
    group.matches.forEach((m) => {
      html += valueRowHtml(m);
    });
  });

  container.innerHTML = html;
}

async function loadBetOfTheDay() {
  const valueContainer = document.getElementById("valueBetsContainer");
  const bankerContainer = document.getElementById("bankersContainer");

  try {
    const response = await fetch(`${API_BASE_URL}/api/bet-of-the-day`);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    renderSection("valueBetsContainer", data.valueBets);
    renderSection("bankersContainer", data.bankers);
  } catch (err) {
    console.error("Failed to load bet of the day:", err);
    const errorHtml = `<div class="empty-state">
      Could not connect to the backend.<br>
      Make sure your Render backend is running and API_BASE_URL in config.js is correct.
    </div>`;
    valueContainer.innerHTML = errorHtml;
    bankerContainer.innerHTML = "";
  }
}

loadBetOfTheDay();
