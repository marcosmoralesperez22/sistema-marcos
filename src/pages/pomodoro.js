// =============================================
// POMODORO PAGE
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';

const POMODORO_PROFILES = [
  { id: 'classic', name: 'Clásico', work: 25, break: 5, emoji: '🍅' },
  { id: 'short', name: 'Rápido', work: 15, break: 3, emoji: '⚡' },
  { id: 'medium', name: 'Equilibrado', work: 30, break: 5, emoji: '⚖️' },
  { id: 'long', name: 'Extendido', work: 45, break: 10, emoji: '🧠' },
  { id: 'study', name: 'Estudio', work: 50, break: 10, emoji: '📚' },
  { id: 'deep', name: 'Trabajo Profundo', work: 60, break: 15, emoji: '🧘' },
  { id: 'marathon', name: 'Maratón', work: 90, break: 20, emoji: '🏃' },
  { id: 'hyper', name: 'Hiper-Foco', work: 120, break: 30, emoji: '🔥' },
  { id: 'sprint', name: 'Sprint', work: 10, break: 2, emoji: '⏱️' },
  { id: 'relax', name: 'Suave', work: 20, break: 10, emoji: '☕' }
];

let currentProfile = POMODORO_PROFILES[0];
let timerInterval = null;
let timeLeft = currentProfile.work * 60;
let isRunning = false;
let mode = 'work'; // 'work' or 'break'
let sessionCount = 0;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function renderPomodoro(container) {
  renderNavbar();

  // Reset state if coming from another page and not running
  if (!timerInterval && !isRunning) {
    timeLeft = currentProfile.work * 60;
    mode = 'work';
  }

  const todayTasks = store.getTodayTasks ? store.getTodayTasks().filter(t => t.status !== 'completed') : store.tasks.filter(t => t.date === new Date().toISOString().split('T')[0] && t.status !== 'completed');

  container.innerHTML = `
    <div class="page-header animate-fadeIn">
      <h1 class="page-title">Pomodoro</h1>
      <p class="page-subtitle">Concéntrate al máximo. Elige tu ritmo.</p>
    </div>

    <div class="pomodoro-container animate-fadeIn" style="display: flex; flex-direction: row; gap: 48px; margin-top: 32px; flex-wrap: wrap; justify-content: center; align-items: flex-start;">
      
      <!-- Timer Column -->
      <div style="display: flex; flex-direction: column; align-items: center; background: var(--bg-secondary); padding: 40px; border-radius: 24px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <div class="pomodoro-modes" style="display: flex; gap: 8px; margin-bottom: 32px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <button id="btn-work" class="tab ${mode === 'work' ? 'active' : ''}" style="border: none; border-radius: 8px; padding: 8px 16px;">Trabajo (${currentProfile.work}m)</button>
          <button id="btn-break" class="tab ${mode === 'break' ? 'active' : ''}" style="border: none; border-radius: 8px; padding: 8px 16px;">Descanso (${currentProfile.break}m)</button>
        </div>

        <div class="pomodoro-circle" style="position: relative; width: 320px; height: 320px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: conic-gradient(var(--accent) 100%, #1a1a1a 0); box-shadow: 0 0 50px rgba(236, 91, 19, 0.15);">
          <div style="position: absolute; width: 290px; height: 290px; background: var(--bg-secondary); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid var(--bg-primary);">
            <div id="pomodoro-time" style="font-size: 72px; font-weight: 800; tabular-nums; letter-spacing: -2px; color: var(--text-primary); text-shadow: 0 4px 12px rgba(0,0,0,0.5);">${formatTime(timeLeft)}</div>
            <div style="color: var(--text-muted); font-size: 14px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; margin-top: -4px;">${mode === 'work' ? 'Enfoque' : 'Relajación'}</div>
          </div>
        </div>

        <div class="pomodoro-controls" style="display: flex; gap: 16px; margin-top: 48px;">
          <button id="btn-start-pause" class="btn btn-primary" style="width: 140px; font-size: 16px; padding: 12px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 12px rgba(236, 91, 19, 0.3);">
            ${isRunning ? 'Pausar' : 'Comenzar'}
          </button>
          <button id="btn-reset" class="btn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); width: 140px; font-size: 16px; padding: 12px; font-weight: 600; border-radius: 12px;">
            Reiniciar
          </button>
        </div>
        
        <div style="margin-top: 32px; color: var(--text-muted); font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="font-size: 18px; color: var(--accent);">workspace_premium</span>
          Sesiones completadas hoy: <strong style="color: var(--text-primary);">${sessionCount}</strong>
        </div>
      </div>

      <!-- Settings & Extras Column -->
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px; width: 100%;">
        
        <div class="card" style="padding: 24px; border-radius: 20px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: var(--accent);">tune</span> Perfil de Trabajo
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="profile-buttons">
            ${POMODORO_PROFILES.map(p => `
              <button class="btn btn-sm profile-btn ${currentProfile.id === p.id ? 'btn-primary' : ''}" data-id="${p.id}" style="${currentProfile.id === p.id ? 'box-shadow: 0 2px 8px rgba(236,91,19,0.3);' : 'background: rgba(255,255,255,0.05); border-color: transparent;'}; border-radius: 10px; padding: 8px 12px;">
                ${p.emoji} ${p.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="card" style="padding: 24px; border-radius: 20px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="font-size: 20px; color: var(--accent);">target</span> Objetivo Actual
          </h3>
          <select id="focus-task-select" class="input" style="width: 100%; padding: 12px; border-radius: 10px; font-size: 14px;">
            <option value="">-- Sin tarea específica --</option>
            ${todayTasks.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 12px; line-height: 1.5;">Selecciona una tarea en la que enfocarte. Al terminar el tiempo de trabajo, te recordaremos marcarla.</p>
        </div>

      </div>
    </div>
  `;

  // UI Elements
  const btnStartPause = container.querySelector('#btn-start-pause');
  const btnReset = container.querySelector('#btn-reset');
  const btnWork = container.querySelector('#btn-work');
  const btnBreak = container.querySelector('#btn-break');
  const timeDisplay = container.querySelector('#pomodoro-time');
  const circle = container.querySelector('.pomodoro-circle');
  const profileSelect = container.querySelector('#pomodoro-profile');

  function updateCircle() {
    const total = (mode === 'work' ? currentProfile.work : currentProfile.break) * 60;
    const pct = (timeLeft / total) * 100;
    const color = mode === 'work' ? 'var(--accent)' : 'var(--success)';
    circle.style.background = `conic-gradient(${color} ${pct}%, #262626 0)`;
  }

  updateCircle();

  function setMode(newMode) {
    if (isRunning) toggleTimer();
    mode = newMode;
    timeLeft = (mode === 'work' ? currentProfile.work : currentProfile.break) * 60;

    // Update active classes
    btnWork.classList.toggle('active', mode === 'work');
    btnBreak.classList.toggle('active', mode === 'break');

    // Update label
    const label = container.querySelector('.pomodoro-circle > div > div:nth-child(2)');
    if (label) label.textContent = mode === 'work' ? 'Enfoque' : 'Relajación';

    // Update colors
    const color = mode === 'work' ? 'var(--accent)' : 'var(--success)';
    circle.style.boxShadow = `0 0 40px ${mode === 'work' ? 'rgba(236, 91, 19, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`;

    timeDisplay.textContent = formatTime(timeLeft);
    updateCircle();
  }

  container.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = e.target.closest('.profile-btn').getAttribute('data-id');
      const p = POMODORO_PROFILES.find(x => x.id === val);
      if (p) {
        currentProfile = p;
        btnWork.textContent = `Trabajo (${p.work}m)`;
        btnBreak.textContent = `Descanso (${p.break}m)`;

        // Update UI visuals for buttons
        container.querySelectorAll('.profile-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.style.background = 'rgba(255,255,255,0.05)';
          b.style.borderColor = 'transparent';
          b.style.boxShadow = 'none';
        });

        const targetBtn = e.target.closest('.profile-btn');
        targetBtn.classList.add('btn-primary');
        targetBtn.style.background = '';
        targetBtn.style.boxShadow = '0 2px 8px rgba(236,91,19,0.3)';

        setMode('work');
      }
    });
  });

  function tick() {
    if (timeLeft > 0) {
      timeLeft--;
      timeDisplay.textContent = formatTime(timeLeft);
      updateCircle();
    } else {
      // Finished
      toggleTimer();
      if (mode === 'work') {
        sessionCount++;
        store.addActivity('pomodoro', `Completada sesión Pomodoro (${currentProfile.name})`, currentProfile.emoji);
        // Auto-switch to break
        setMode('break');
      } else {
        // Auto-switch to work
        setMode('work');
      }

      // Play sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      } catch (e) { }
    }
  }

  function toggleTimer() {
    if (isRunning) {
      clearInterval(timerInterval);
      btnStartPause.textContent = 'Reanudar';
    } else {
      timerInterval = setInterval(tick, 1000);
      btnStartPause.textContent = 'Pausar';
    }
    isRunning = !isRunning;
  }

  function resetTimer() {
    if (isRunning) toggleTimer();
    setMode(mode);
    btnStartPause.textContent = 'Comenzar';
  }

  btnStartPause.addEventListener('click', toggleTimer);
  btnReset.addEventListener('click', resetTimer);
  btnWork.addEventListener('click', () => setMode('work'));
  btnBreak.addEventListener('click', () => setMode('break'));
}
