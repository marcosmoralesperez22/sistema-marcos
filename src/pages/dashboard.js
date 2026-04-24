// =============================================
// DASHBOARD PAGE — MarcosOS Style
// =============================================

import { store } from '../data/store.js';
import { CATEGORY_LIST } from '../data/defaultTasks.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Motivational Quotes
const QUOTES = [
  "Lo que haces es lo que importa, no lo que piensas ni lo que dices.",
  "El dolor es temporal, el orgullo es para siempre.",
  "Si crees que puedes, ya estás a medio camino.",
  "Hazlo, y si te da miedo, hazlo con miedo.",
  "Un viaje de mil millas comienza con un solo paso.",
  "La disciplina es el puente entre metas y logros.",
  "No cuentes los días, haz que los días cuenten.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Lo único imposible es aquello que no intentas."
];

function getQuoteOfDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return QUOTES[dayOfYear % QUOTES.length];
}

let weatherData = null;
async function loadWeather(container) {
  const widget = container.querySelector('#weather-widget');
  if (!widget) return;

  if (!weatherData) {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current=temperature_2m,weather_code');
      const data = await res.json();
      const code = data.current.weather_code;
      const temp = Math.round(data.current.temperature_2m);
      let emoji = '🌤️';
      if (code <= 1) emoji = '☀️';
      else if (code <= 3) emoji = '☁️';
      else if (code <= 48) emoji = '🌫️';
      else if (code <= 67) emoji = '🌧️';
      else if (code <= 77) emoji = '❄️';
      else if (code >= 95) emoji = '⛈️';
      weatherData = { temp, emoji };
    } catch (e) {
      weatherData = { error: true };
    }
  }

  if (weatherData && !weatherData.error) {
    widget.innerHTML = `<span style="font-size:24px;">${weatherData.emoji}</span><span style="font-size:16px; font-weight:500;">${weatherData.temp}°C</span> <span style="font-size:12px; color:var(--text2); margin-left:5px;">Madrid</span>`;
  } else {
    widget.innerHTML = `<span style="font-size:12px; color:var(--text2);">Clima no diponible</span>`;
  }
}

export async function renderDashboard(container, skipInit = false) {
  if (!skipInit) await store.initDailyTasks();

  const player = store.player;
  const progress = store.getTodayProgress();
  const todayTasks = store.getTodayTasks();
  const openTasks = store.tasks ? store.tasks.filter(t => !t.completed).length : 0;

  // Custom metrics based on available data
  const streak = player.streak || 0;
  // Let's assume pomodoros is tracked if available or simulated for now
  const pomodoros = store.pomodoros || 0;

  const pctOpen = Math.min(openTasks * 5, 100);
  const pctDone = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const pctStreak = Math.min(streak * 14, 100);
  const pctPom = Math.min(pomodoros * 10, 100);

  // Render HTML
  container.innerHTML = `
    <div id="p-dashboard" class="panel active">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--border); padding-bottom:15px; margin-bottom:20px;">
        <div>
          <div class="page-title" style="margin-bottom:5px;">${getGreeting()}, ${player.name}.</div>
          <div class="page-sub" id="dash-date">${getFormattedDate()}</div>
          <div style="margin-top:10px; font-style:italic; color:var(--text2); font-size:13px;">"${getQuoteOfDay()}"</div>
        </div>
        <div id="weather-widget" style="background:var(--bg2); padding:10px 15px; border-radius:8px; display:flex; align-items:center; gap:10px; min-width:80px; justify-content:center; border:1px solid var(--border);">
            <div style="width:16px;height:16px;border:2px solid var(--border); border-top-color:var(--orange); border-radius:50%; animation:spin 1s linear infinite;"></div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-card">
          <div class="stat-n" id="s-open">${openTasks}</div>
          <div class="stat-l">Tareas abiertas</div>
          <div class="stat-bar"><div class="stat-fill" style="width:${pctOpen}%"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-n orange" id="s-done">${progress.completed}</div>
          <div class="stat-l">Completadas hoy</div>
          <div class="stat-bar"><div class="stat-fill" style="width:${pctDone}%"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-n" id="s-streak">${streak}</div>
          <div class="stat-l">Racha (días)</div>
          <div class="stat-bar"><div class="stat-fill" style="width:${pctStreak}%"></div></div>
        </div>
        <div class="stat-card">
          <div class="stat-n" id="s-pomodoros">${(player.totalProductiveHours || 0).toFixed(1)} <span style="font-size: 14px; color: var(--text3); font-weight: normal;">h</span></div>
          <div class="stat-l">Foco Total</div>
          <div class="stat-bar"><div class="stat-fill" style="width:${Math.min((player.totalProductiveHours || 0) * 5, 100)}%"></div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Añadir tarea</div>
        </div>
        <div class="task-compose">
          <input class="task-compose-input" id="q-input" placeholder="Escribe una tarea rápidas...">
          <div class="compose-selects">
            <select class="mini-select" id="q-area">
              <option value="inbox">Inbox</option>
              <option value="university">Universidad</option>
              <option value="youtube">YouTube</option>
              <option value="tech">Empresa</option>
              <option value="health">Salud</option>
              <option value="life">Personal</option>
            </select>
            <select class="mini-select" id="q-pri">
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="low">Baja</option>
            </select>
          </div>
          <button class="add-btn" id="q-add-btn">Añadir</button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Para hoy</div>
          <a href="#quests" class="section-action">Ver todas</a>
        </div>
        <div class="section-body" id="dash-today-tasks">
        </div>
      </div>
    </div>
  `;

  // Start asynchronous load of weather widget
  loadWeather(container);

  // Render tasks
  const tasksContainer = container.querySelector('#dash-today-tasks');
  const dashTasks = todayTasks.filter(t => !t.completed).slice(0, 6);

  if (dashTasks.length === 0) {
    tasksContainer.innerHTML = '<div class="empty"><div class="empty-icon">○</div>Sin tareas para hoy</div>';
  } else {
    // We map categories to colors
    dashTasks.forEach(t => {
      const chipClass = 'chip-' + (t.category || 'inbox');
      const categoryLabel = CATEGORY_LIST.find(c => c.id === t.category)?.name || 'Inbox';
      let priClass = 'chip-' + (t.priority || 'medium');
      let priLabel = { high: 'Alta', medium: 'Media', low: 'Baja' }[t.priority || 'medium'];

      const row = document.createElement('div');
      row.className = 'task-row ' + (t.completed ? 'is-done' : '');
      row.innerHTML = `
        <div class="t-check ${t.completed ? 'chk' : ''}" style="cursor: default; opacity: 0.7;"></div>
        <div class="t-body" style="cursor: default;">
          <div class="t-name">${t.title}</div>
          <div class="t-meta">
            <span class="t-chip ${chipClass}">${categoryLabel}</span>
            <span class="t-chip ${priClass}">${priLabel}</span>
          </div>
        </div>
        <button class="t-del">✕</button>
      `;

      // Checkbox click removed - Dashboard is view-only for tasks


      // Delete logic if you want
      row.querySelector('.t-del').addEventListener('click', async () => {
        await store.deleteTask(t.id);
        renderDashboard(container, true);
      });

      tasksContainer.appendChild(row);
    });
  }

  // Quick Add Event Listeners
  const input = container.querySelector('#q-input');
  const btn = container.querySelector('#q-add-btn');

  const handleQuickAdd = async () => {
    const title = input.value.trim();
    if (!title) return;
    const cat = container.querySelector('#q-area').value;
    const pri = container.querySelector('#q-pri').value;

    // Default config using the current date
    const today = new Date().toISOString().split('T')[0];

    await store.addTask({
      title,
      category: cat,
      priority: pri,
      difficulty: 'medium', // Default difficulty
      scheduled_date: today,
    });

    // Refresh right away to see the new task
    renderDashboard(container, true);
  };

  btn.addEventListener('click', handleQuickAdd);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQuickAdd();
  });
}
