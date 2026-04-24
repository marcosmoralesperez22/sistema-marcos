import { store } from '../data/store.js';

export function renderRightPanel() {
  const right = document.getElementById('right');
  if (!right) return;

  // Let's create a placeholder mini calendar
  const renderMiniCal = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const td = now.getDate();
    const fd = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const offset = fd === 0 ? 6 : fd - 1;
    const dows = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    let html = dows.map(d => `<div class="mc-dow">${d}</div>`).join('');
    html += Array(offset).fill('<div class="mc-d empty">0</div>').join('');
    html += Array.from({ length: dim }, (_, i) => {
      const day = i + 1;
      const isT = day === td;
      return `<div class="mc-d ${isT ? 'today-d' : ''}">${day}</div>`;
    }).join('');
    return html;
  };

  const currentMonthName = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  right.innerHTML = `
    <div class="rp-block">
      <div class="rp-label">${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)}</div>
      <div class="mini-cal" id="mini-cal">
        ${renderMiniCal()}
      </div>
    </div>
    <div class="rp-block">
      <div class="rp-label">Áreas</div>
      <div id="rp-prog">
        <div class="rp-prog-row"><div class="rp-prog-label">Universidad</div><div class="rp-prog-bar"><div class="rp-prog-fill" style="width:40%"></div></div><div class="rp-prog-val">40%</div></div>
        <div class="rp-prog-row"><div class="rp-prog-label">Salud</div><div class="rp-prog-bar"><div class="rp-prog-fill" style="width:70%"></div></div><div class="rp-prog-val">70%</div></div>
        <div class="rp-prog-row"><div class="rp-prog-label">Personal</div><div class="rp-prog-bar"><div class="rp-prog-fill" style="width:20%"></div></div><div class="rp-prog-val">20%</div></div>
      </div>
    </div>
    <div class="rp-block">
      <div class="rp-label">Aura Hoy</div>
      <div style="display:flex; align-items:center; gap:8px; padding:8px 0;">
        <span style="font-size:20px;">✨</span>
        <span id="rp-aura-today" style="font-size:18px; font-weight:600; color:var(--orange);">${(() => { const t = new Date().toISOString().split('T')[0]; return store.dailyData?.[t]?.auraEarned || 0; })()}</span>
        <span style="font-size:12px; color:var(--text3);">ganada hoy</span>
      </div>
      <div id="rp-aura-total" style="font-size:11px; color:var(--text3);">Total: ✨ ${store.player?.aura || 0}</div>
    </div>
    <div class="rp-block">
      <div class="rp-label">Regla del día</div>
      <div class="rp-rule" id="rp-rule">
        Un solo inbox — todo pasa por Google Tasks antes de cualquier otra cosa.
      </div>
    </div>
  `;

  // Real-time Aura UI update logic (Subscribe once)
  if (!window._rpAuraSubscribed) {
    store.subscribe(() => {
      const elToday = document.getElementById('rp-aura-today');
      const elTotal = document.getElementById('rp-aura-total');
      if (elToday && elTotal) {
        const t = new Date().toISOString().split('T')[0];
        elToday.textContent = store.dailyData?.[t]?.auraEarned || 0;
        elTotal.textContent = `Total: ✨ ${store.player?.aura || 0}`;
      }
    });
    window._rpAuraSubscribed = true;
  }
}
