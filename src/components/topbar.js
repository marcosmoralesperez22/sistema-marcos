import { store } from '../data/store.js';
import { getCurrentRoute, navigate } from '../router.js';

let timerInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;
let currentDuration = 25; // Default 25m

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function renderTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const route = getCurrentRoute();

  topbar.innerHTML = `
    <a href="#dashboard" class="logo">
      <div class="logo-dot"></div>MarcosOS
    </a>
    <div class="top-center">
      <button class="top-tab ${route === 'dashboard' ? 'active' : ''}" onclick="window.location.hash='#dashboard'">Inicio</button>
      <button class="top-tab ${route === 'quests' ? 'active' : ''}" onclick="window.location.hash='#quests'">Tareas</button>
      <button class="top-tab ${route === 'roadmaps' ? 'active' : ''}" onclick="window.location.hash='#roadmaps'">Proyectos</button>
      <button class="top-tab ${route === 'habits' ? 'active' : ''}" onclick="window.location.hash='#habits'">Hábitos</button>
      <button class="top-tab ${route === 'calendar' ? 'active' : ''}" onclick="window.location.hash='#calendar'">Horario</button>
      <button class="top-tab ${route === 'stats' ? 'active' : ''}" onclick="window.location.hash='#stats'">Stats</button>
      <button class="top-tab ${route === 'settings' ? 'active' : ''}" onclick="window.location.hash='#settings'">Log</button>
    </div>
    <div class="top-right">
      <span id="top-clock" class="top-time">--:--</span>
      <button class="section-action" id="btn-focus-top">${isRunning ? '⏱ ' + formatTime(timeLeft) : '⏱ Foco'}</button>
    </div>
  `;

  // Start topbar clock
  if (!window._topbarClockInterval) {
    window._topbarClockInterval = setInterval(() => {
      const clockEl = document.getElementById('top-clock');
      if (clockEl) {
        clockEl.textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      }
    }, 1000);
  }

  // Setup focus mode logic
  const btnFocus = document.getElementById('btn-focus-top');
  if (btnFocus) {
    btnFocus.addEventListener('click', () => {
      const overlay = document.getElementById('focus-overlay');
      overlay.classList.add('on');

      // Populate tasks dropdown if it's empty or needs refresh
      const selectEl = document.getElementById('fo-task-select');
      if (selectEl && selectEl.options.length <= 1) {
        const openTasks = store.getTodayTasks().filter(t => !t.completed && t.status !== 'completed');
        selectEl.innerHTML = '<option value="">-- Sin tarea activa --</option>' + openTasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
      }
    });
  }

  // Timer functionality
  const btnToggle = document.getElementById('fo-toggle');
  const btnReset = document.getElementById('fo-reset');
  const timeDisplay = document.getElementById('fo-time');
  const modesContainer = document.getElementById('fo-modes');

  // Bind Modes
  if (modesContainer && !modesContainer.dataset.bound) {
    modesContainer.dataset.bound = 'true';
    modesContainer.querySelectorAll('.fo-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (isRunning) return; // Cant change while running
        modesContainer.querySelectorAll('.fo-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentDuration = parseInt(e.target.getAttribute('data-time'), 10);
        timeLeft = currentDuration * 60;
        if (timeDisplay) timeDisplay.textContent = formatTime(timeLeft);
      });
    });
  }

  function tick() {
    if (timeLeft > 0) {
      timeLeft--;
      if (timeDisplay) timeDisplay.textContent = formatTime(timeLeft);
      const btnFocusTop = document.getElementById('btn-focus-top');
      if (btnFocusTop) btnFocusTop.textContent = '⏱ ' + formatTime(timeLeft);
    } else {
      // Timer complete
      clearInterval(timerInterval);
      isRunning = false;

      if (btnToggle) btnToggle.textContent = 'Iniciar';
      const btnFocusTop = document.getElementById('btn-focus-top');
      if (btnFocusTop) btnFocusTop.textContent = '⏱ Foco';

      // Play sound and record session
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch (e) { }

      let emoji = currentDuration === 25 ? '🍅' : (currentDuration === 50 ? '🧠' : '🔥');
      let mName = currentDuration === 25 ? 'Pomodoro' : (currentDuration === 50 ? 'Foco' : 'Sesión');

      const selectEl = document.getElementById('fo-task-select');
      let taskId = null, taskName = null;
      if (selectEl && selectEl.value) {
        taskId = selectEl.value;
        const opt = selectEl.options[selectEl.selectedIndex];
        taskName = opt.text;
        store.addActivity('pomodoro', `Completaste ${currentDuration}m enfocados en: ${taskName}`, emoji);
      } else {
        store.addActivity('pomodoro', `Completaste ${currentDuration}m de enfoque libre`, emoji);
      }

      store.addPomodoro({
        durationMinutes: currentDuration,
        modeName: mName,
        emoji,
        taskId,
        taskName
      });

      timeLeft = currentDuration * 60;
      if (timeDisplay) timeDisplay.textContent = formatTime(timeLeft);
    }
  }

  if (btnToggle && !btnToggle.dataset.bound) {
    btnToggle.dataset.bound = 'true';
    btnToggle.addEventListener('click', () => {
      if (isRunning) {
        clearInterval(timerInterval);
        btnToggle.textContent = 'Reanudar';
      } else {
        timerInterval = setInterval(tick, 1000);
        btnToggle.textContent = 'Pausar';
      }
      isRunning = !isRunning;
    });
  }

  if (btnReset && !btnReset.dataset.bound) {
    btnReset.dataset.bound = 'true';
    btnReset.addEventListener('click', () => {
      clearInterval(timerInterval);
      isRunning = false;
      timeLeft = currentDuration * 60;
      if (timeDisplay) timeDisplay.textContent = formatTime(timeLeft);
      if (btnToggle) btnToggle.textContent = 'Iniciar';
      const btnFocusTop = document.getElementById('btn-focus-top');
      if (btnFocusTop) btnFocusTop.textContent = '⏱ Foco';
    });
  }

  // Bind close buttons for focus overlay
  const btnClose = document.getElementById('fo-close');
  if (btnClose && !btnClose.dataset.bound) {
    btnClose.dataset.bound = 'true';
    btnClose.addEventListener('click', () => {
      document.getElementById('focus-overlay').classList.remove('on');
    });
  }
}
