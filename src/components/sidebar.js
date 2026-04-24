import { store } from '../data/store.js';
import { getCurrentRoute } from '../router.js';

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const route = getCurrentRoute();

  // Counts
  const openTasks = store.tasks ? store.tasks.filter(t => !t.completed).length : 0;

  const todayTasks = store.tasks ? store.tasks.filter(t => t.scheduled_date && new Date(t.scheduled_date).toDateString() === new Date().toDateString()) : [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const todayTotal = todayTasks.length;
  const todayPct = todayTotal > 0 ? Math.round((completedToday / todayTotal) * 100) : 0;

  sidebar.innerHTML = `
    <div class="sb-group">
      <div class="sb-label">Sistema</div>
      <a href="#dashboard" class="sb-link ${route === 'dashboard' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Dashboard
      </a>
      <a href="#quests" class="sb-link ${route === 'quests' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        Tareas
        <span class="sb-badge" id="sb-open">${openTasks}</span>
      </a>
      <a href="#roadmaps" class="sb-link ${route === 'roadmaps' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Metas
      </a>
      <a href="#habits" class="sb-link ${route === 'habits' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Hábitos
      </a>
      <a href="#calendar" class="sb-link ${route === 'calendar' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Horario
      </a>
    </div>
    
    <div class="sb-divider"></div>

    <div class="sb-group">
      <div class="sb-label">Áreas</div>
      <!-- You can extend routing to filter by area later -->
      <a href="javascript:void(0)" class="sb-link" style="opacity: 0.5; cursor: not-allowed;" title="Próximamente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        Universidad (Próximamente)
      </a>
      <a href="#videos" class="sb-link ${route === 'videos' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        YouTube
      </a>
      <a href="javascript:void(0)" class="sb-link" style="opacity: 0.5; cursor: not-allowed;" title="Próximamente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
        Empresa (Próximamente)
      </a>
      <a href="javascript:void(0)" class="sb-link" style="opacity: 0.5; cursor: not-allowed;" title="Próximamente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
        Salud (Próximamente)
      </a>
      <a href="#pomodoro" class="sb-link ${route === 'pomodoro' ? 'active' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Foco
        <span class="sb-badge" style="background:var(--orange); color:var(--bg);">${store.player?.pomodoros || 0}</span>
      </a>
    </div>

    <div class="sb-divider"></div>

    <div class="sb-group">
      <div class="sb-label">Semana</div>
      <div style="padding: 0 16px;">
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px;">Completadas hoy</div>
        <div style="font-size:22px;font-weight:500;color:var(--text);letter-spacing:-0.02em;" id="sb-done-today">${completedToday} / ${todayTotal}</div>
        <div class="stat-bar" style="margin-top:8px;"><div class="stat-fill" id="sb-bar" style="width:${todayPct}%"></div></div>
      </div>
    </div>

    <div class="sb-divider"></div>

    <div class="sb-group">
      <div class="sb-label">Aura</div>
      <div style="padding: 0 16px;">
        <div style="display:flex;align-items:baseline;gap:6px;">
          <div style="font-size:22px;font-weight:600;color:var(--orange);letter-spacing:-0.02em;" id="sb-aura">✨ ${store.player?.aura || 0}</div>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:4px;">Racha: 🔥 ${store.player?.streak || 0} días</div>
      </div>
    </div>
  `;
}
