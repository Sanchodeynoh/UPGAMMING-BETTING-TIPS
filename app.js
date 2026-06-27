const API_KEY = 'upgamming_tips_v1';

// Demo data - you will replace this with backend later
const DEMO_TIPS = [
  {id:1, title:"Man City vs Arsenal", sport:"Football", odds:2.10, date:"2026-05-10", desc:"Man City home form is strong. 5 wins in a row. Tip: Over 2.5 Goals. Both teams score often at Etihad.", premium:0, views:120},
  {id:2, title:"Lakers vs Celtics", sport:"Basketball", odds:1.85, date:"2026-05-11", desc:"High pace game expected. Lakers rest advantage. Tip: Lakers -4.5 Handicap.", premium:0, views:98},
  {id:3, title:"El Clasico: Barca vs Real", sport:"Football", odds:3.20, date:"2026-05-12", desc:"Tight game, both defenses missing key players. Tip: BTTS Yes.", premium:1, views:540},
  {id:4, title:"Warriors vs Suns", sport:"Basketball", odds:1.90, date:"2026-05-13", desc:"Steph is hot from 3. Suns weak on perimeter. Tip: Over 228.5 Points.", premium:1, views:310}
];

// Save to localStorage once
if(!localStorage.getItem(API_KEY)) {
  localStorage.setItem(API_KEY, JSON.stringify(DEMO_TIPS));
}
const getTips = () => JSON.parse(localStorage.getItem(API_KEY) || '[]');
const saveTips = (arr) => localStorage.setItem(API_KEY, JSON.stringify(arr));

// 1. Load Featured 3 on Homepage
function loadFeatured() {
  const wrap = document.getElementById('featured');
  if(!wrap) return;
  const tips = getTips().filter(t=>t.premium===0).slice(0,3);
  wrap.innerHTML = tips.map(t=>`
    <div class="card">
      <h3>${t.title}</h3>
      <p class="tip-meta">${t.sport} | Odds: ${t.odds} | ${t.date}</p>
      <p>${t.desc.slice(0,80)}...</p>
      <a href="match.html?id=${t.id}">Read full tip →</a>
    </div>
  `).join('');
}

// 2. Load Tips Page with filters
function loadTipsList(pageType='free') {
  const wrap = document.getElementById('tipsList');
  if(!wrap) return;
  
  const sport = document.getElementById('sport')?.value || '';
  const sort = document.getElementById('sort')?.value || 'latest';
  
  let tips = getTips().filter(t => pageType==='premium' ? t.premium===1 : t.premium===0);
  if(sport) tips = tips.filter(t => t.sport.toLowerCase().includes(sport.toLowerCase()));
  if(sort==='popular') tips.sort((a,b)=>b.views-a.views);
  else tips.sort((a,b)=> new Date(b.date) - new Date(a.date));

  wrap.innerHTML = tips.map(t=>`
    <div class="card">
      <button class="tip-btn" onclick="location.href='match.html?id=${t.id}'">
        <h3>${t.title}</h3>
        <p class="tip-meta">${t.sport} | Odds: ${t.odds} | ${t.date} | Views: ${t.views}</p>
      </button>
    </div>
  `).join('');
}

// 3. Load single match page
function loadMatch() {
  const id = new URLSearchParams(location.search).get('id');
  if(!id) return;
  const tips = getTips();
  const t = tips.find(x=>x.id==id);
  if(!t) { document.getElementById('matchBody').innerHTML = '<p>Match not found</p>'; return; }

  // +1 view
  t.views += 1;
  saveTips(tips);

  document.getElementById('matchTitle').innerText = t.title;
  const body = document.getElementById('matchBody');
  
  if(t.premium===1 && !localStorage.getItem('upgamming_paid')) {
    body.innerHTML = `
      <div class="paywall">
        <h3>🔒 Premium Tip Locked</h3>
        <p>Pay to unlock this analysis + exact tip.</p>
        <button class="btn" onclick="alert('Demo: In real site, pay here.')">Unlock for $5</button>
      </div>
      <div class="card locked"><p>${t.desc}</p></div>
    `;
  } else {
    body.innerHTML = `
      <p><b>Sport:</b> ${t.sport}</p>
      <p><b>Odds:</b> ${t.odds}</p>
      <p><b>Date:</b> ${t.date}</p>
      <p><b>Analysis + Tip:</b> ${t.desc}</p>
    `;
  }
}

// 4. Contact form - just shows your info + mailto/whatsapp
function initContact() {
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = e.target.name.value;
    const msg = e.target.msg.value;
    const subject = encodeURIComponent('Message from ' + name);
    const body = encodeURIComponent(msg);
    window.location.href = `mailto:upgammingbettingtips@gmail.com?subject=${subject}&body=${body}`;
  });
    }
