// =============================================
// NAVBAR — Top navigation bar
// =============================================

import { store } from '../data/store.js';
import { getCurrentRoute } from '../router.js';

export function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const player = store.player;
  const route = getCurrentRoute();

  nav.className = 'navbar';
  nav.innerHTML = `
    <a href="#dashboard" class="navbar-brand">
      <div class="navbar-brand-icon">
        <span class="material-symbols-outlined">terminal</span>
      </div>
      <span>MARCOS</span>
    </a>

    <ul class="navbar-links">
      <li><a href="#dashboard" class="${route === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
      <li><a href="#quests" class="${route === 'quests' ? 'active' : ''}">Tareas</a></li>
      <li><a href="#stats" class="${route === 'stats' ? 'active' : ''}">Estadísticas</a></li>
      <li><a href="#calendar" class="${route === 'calendar' ? 'active' : ''}">Calendario</a></li>
      <li><a href="#health" class="${route === 'health' ? 'active' : ''}">Salud</a></li>
      <li><a href="#achievements" class="${route === 'achievements' ? 'active' : ''}">Medallas</a></li>
      <li><a href="#roadmaps" class="${route === 'roadmaps' ? 'active' : ''}">Roadmaps</a></li>
      <li><a href="#pomodoro" class="${route === 'pomodoro' ? 'active' : ''}">Pomodoro</a></li>
      <li><a href="#habits" class="${route === 'habits' ? 'active' : ''}">Hábitos</a></li>
      <li><a href="#settings" class="${route === 'settings' ? 'active' : ''}">Ajustes</a></li>
    </ul>

    <div class="navbar-profile">
      <div style="text-align: right;">
        <div class="navbar-profile-name">${player.name}</div>
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Racha: ${player.streak} 🔥</div>
      </div>
      <div class="navbar-profile-avatar">
        <span class="material-symbols-outlined">person</span>
      </div>
    </div>
  `;
}
