// =============================================
// SETTINGS PAGE — Full Configuration
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { launchConfetti } from '../components/confetti.js';

export function renderSettings(container) {
  renderNavbar();
  const player = store.player;
  const s = store.settings;

  // Current values with defaults
  const theme = s.theme || 'dark';
  const accentColor = s.accentColor || '#d4713a';
  const fontSize = s.fontSize || 14;
  const checkSound = s.checkSound !== false;
  const confettiEnabled = s.confettiEnabled !== false;
  const hardcoreMode = s.hardcoreMode || false;
  const graceDays = s.graceDays ?? 2;
  const vacationMode = s.vacationMode || false;
  const dayCloseHour = s.dayCloseHour ?? 0;
  const retroactiveDays = s.retroactiveDays ?? 1;
  const weekStartMonday = s.weekStartMonday !== false;

  container.innerHTML = `
    <div style="max-width:750px;" class="animate-fadeIn">
      <div class="page-header">
        <h1 class="page-title">⚙️ Ajustes</h1>
        <p class="page-subtitle">Configura tu perfil, apariencia y preferencias del sistema</p>
      </div>

      <!-- PERFIL -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title" style="cursor:pointer;" data-collapse="sec-profile">
          👤 Perfil
          <span style="float:right;color:var(--text3);font-size:12px;">▼</span>
        </div>
        <div id="sec-profile">
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
            <div>
              <label class="metric-card-label">Nombre de usuario</label>
              <input type="text" class="input" id="setting-name" value="${player.name}" style="width: 100%;" />
              <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Se muestra en todo el sistema.</p>
            </div>
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
              <div style="flex:1;">
                <label class="metric-card-label">Aura Total</label>
                <div style="font-size:24px; font-weight:600; color:var(--orange);">✨ ${player.aura || 0}</div>
              </div>
              <div style="flex:1;">
                <label class="metric-card-label">Racha Actual</label>
                <div style="font-size:24px; font-weight:600; color:var(--text);">🔥 ${player.streak || 0} días</div>
              </div>
              <div style="flex:1;">
                <label class="metric-card-label">Mejor Racha</label>
                <div style="font-size:24px; font-weight:600; color:var(--text2);">🏆 ${player.bestStreak || 0} días</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- APARIENCIA -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title" style="cursor:pointer;" data-collapse="sec-appearance">
          🎨 Apariencia
          <span style="float:right;color:var(--text3);font-size:12px;">▼</span>
        </div>
        <div id="sec-appearance">
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Tema</div>
                <div style="font-size: 11px; color: var(--text-muted);">Oscuro o claro</div>
              </div>
              <select class="mini-select" id="setting-theme" style="width:130px;">
                <option value="dark" ${theme === 'dark' ? 'selected' : ''}>🌙 Oscuro</option>
                <option value="light" ${theme === 'light' ? 'selected' : ''}>☀️ Claro</option>
              </select>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Color de acento</div>
                <div style="font-size: 11px; color: var(--text-muted);">Color principal del sistema</div>
              </div>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="color" id="setting-accent" value="${accentColor}" style="width:36px; height:36px; border:2px solid var(--border); border-radius:6px; cursor:pointer; background:transparent;" />
                <span style="font-size:11px;color:var(--text3);">${accentColor}</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Tamaño de fuente</div>
                <div style="font-size: 11px; color: var(--text-muted);">Base en px</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <input type="range" id="setting-fontsize" min="12" max="18" value="${fontSize}" style="width:100px;">
                <span style="font-size:12px;color:var(--text2);" id="fontsize-val">${fontSize}px</span>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Inicio de semana</div>
                <div style="font-size: 11px; color: var(--text-muted);">¿Lunes o Domingo?</div>
              </div>
              <select class="mini-select" id="setting-weekstart" style="width:130px;">
                <option value="monday" ${weekStartMonday ? 'selected' : ''}>Lunes</option>
                <option value="sunday" ${!weekStartMonday ? 'selected' : ''}>Domingo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- HÁBITOS -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title" style="cursor:pointer;" data-collapse="sec-habits">
          🔄 Hábitos
          <span style="float:right;color:var(--text3);font-size:12px;">▼</span>
        </div>
        <div id="sec-habits">
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Días de gracia al mes</div>
                <div style="font-size: 11px; color: var(--text-muted);">Fallos permitidos sin romper racha</div>
              </div>
              <input type="number" class="mini-select" id="setting-grace" value="${graceDays}" min="0" max="10" style="width:70px;">
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Modo Vacaciones</div>
                <div style="font-size: 11px; color: var(--text-muted);">Pausa todos los hábitos</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="setting-vacation" ${vacationMode ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Cierre de día</div>
                <div style="font-size: 11px; color: var(--text-muted);">¿A qué hora termina tu día? (para noctámbulos)</div>
              </div>
              <select class="mini-select" id="setting-dayclose" style="width:100px;">
                ${[0, 1, 2, 3, 4, 5].map(h => `<option value="${h}" ${dayCloseHour === h ? 'selected' : ''}>${h === 0 ? '00:00 (Medianoche)' : `${String(h).padStart(2, '0')}:00`}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Recuperación retroactiva</div>
                <div style="font-size: 11px; color: var(--text-muted);">¿Cuántos días atrás puedes marcar?</div>
              </div>
              <input type="number" class="mini-select" id="setting-retro" value="${retroactiveDays}" min="0" max="7" style="width:70px;">
            </div>
          </div>
        </div>
      </div>

      <!-- GAMIFICACIÓN -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title" style="cursor:pointer;" data-collapse="sec-game">
          🎮 Gamificación
          <span style="float:right;color:var(--text3);font-size:12px;">▼</span>
        </div>
        <div id="sec-game">
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Efecto confeti</div>
                <div style="font-size: 11px; color: var(--text-muted);">Partículas al completar todas las tareas</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="setting-confetti" ${confettiEnabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Sonido de check</div>
                <div style="font-size: 11px; color: var(--text-muted);">Sonido satisfactorio al completar</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="setting-checksound" ${checkSound ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Modo Hardcore</div>
                <div style="font-size: 11px; color: var(--text-muted);">Fallo = racha a cero absoluto (sin gracia)</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="setting-hardcore" ${hardcoreMode ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size: 14px; font-weight: 500;">Probar Confeti</div>
                <div style="font-size: 11px; color: var(--text-muted);">¡Click para ver el efecto!</div>
              </div>
              <button class="btn" id="btn-test-confetti" style="font-size:12px;">🎉 Probar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- FITNESS -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title" style="cursor:pointer;" data-collapse="sec-fitness">
          💪 Fitness
          <span style="float:right;color:var(--text3);font-size:12px;">▼</span>
        </div>
        <div id="sec-fitness">
          <div style="margin-top: 12px;">
            <label class="metric-card-label">Fecha de inicio fitness</label>
            <input type="date" class="input" id="setting-fitness-date" value="${s.fitnessStartDate || ''}" style="width: 100%;" />
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Las tareas de fitness se activan a partir de esta fecha.</p>
          </div>
        </div>
      </div>

      <!-- DATOS -->
      <div class="card" style="margin-bottom: 32px;">
        <div class="card-title" style="cursor:pointer;" data-collapse="sec-data">
          💾 Gestión de Datos
          <span style="float:right;color:var(--text3);font-size:12px;">▼</span>
        </div>
        <div id="sec-data">
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 14px; font-weight: 600;">Exportar datos</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Descarga una copia de seguridad local</div>
                </div>
                <button class="btn" id="btn-export">Exportar JSON</button>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 14px; font-weight: 600;">Importar datos</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Restaura datos desde un archivo</div>
                </div>
                <input type="file" accept=".json" id="btn-import" style="font-size: 12px; max-width: 150px;" />
            </div>

            <div style="border-top: 1px solid #262626; padding-top: 16px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--danger);">Resetear sistema</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Borra todos los datos permanentemente</div>
                </div>
                <button class="btn btn-danger" id="btn-reset">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-save" style="width:100%; padding: 14px; font-size: 15px; font-weight: 600;">
        💾 Guardar Cambios
      </button>
    </div>

    <style>
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: var(--bg3, #333);
        transition: 0.3s;
        border-radius: 24px;
      }
      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: var(--text);
        transition: 0.3s;
        border-radius: 50%;
      }
      .toggle-switch input:checked + .toggle-slider {
        background-color: var(--orange, #d4713a);
      }
      .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }
    </style>`;

  // === Event Handlers ===

  // Collapsible sections
  container.querySelectorAll('[data-collapse]').forEach(el => {
    el.addEventListener('click', () => {
      const target = container.querySelector('#' + el.getAttribute('data-collapse'));
      if (target) {
        const isHidden = target.style.display === 'none';
        target.style.display = isHidden ? 'block' : 'none';
        el.querySelector('span').textContent = isHidden ? '▼' : '▶';
      }
    });
  });

  // Font size live preview
  const fontSlider = container.querySelector('#setting-fontsize');
  if (fontSlider) {
    fontSlider.addEventListener('input', (e) => {
      container.querySelector('#fontsize-val').textContent = e.target.value + 'px';
    });
  }

  // Test confetti
  container.querySelector('#btn-test-confetti')?.addEventListener('click', () => {
    launchConfetti(150);
    showToast('success', '🎉 ¡Confeti!', 'Así se ve al completar un día perfecto.');
  });

  // Save
  container.querySelector('#btn-save')?.addEventListener('click', () => {
    const name = container.querySelector('#setting-name').value.trim();
    if (name) store.updatePlayerName(name);

    store.updateSettings({
      fitnessStartDate: container.querySelector('#setting-fitness-date').value,
      theme: container.querySelector('#setting-theme').value,
      accentColor: container.querySelector('#setting-accent').value,
      fontSize: parseInt(container.querySelector('#setting-fontsize').value),
      weekStartMonday: container.querySelector('#setting-weekstart').value === 'monday',
      graceDays: parseInt(container.querySelector('#setting-grace').value),
      vacationMode: container.querySelector('#setting-vacation').checked,
      dayCloseHour: parseInt(container.querySelector('#setting-dayclose').value),
      retroactiveDays: parseInt(container.querySelector('#setting-retro').value),
      confettiEnabled: container.querySelector('#setting-confetti').checked,
      checkSound: container.querySelector('#setting-checksound').checked,
      hardcoreMode: container.querySelector('#setting-hardcore').checked,
    });

    // Apply accent color immediately
    const accent = container.querySelector('#setting-accent').value;
    document.documentElement.style.setProperty('--orange', accent);

    // Apply font size immediately
    const fs = parseInt(container.querySelector('#setting-fontsize').value);
    document.documentElement.style.fontSize = fs + 'px';

    showToast('success', '✅ Guardado', 'Tus ajustes han sido actualizados.');
    renderNavbar();
  });

  // Export
  container.querySelector('#btn-export')?.addEventListener('click', () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'marcos-system-data.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('info', '📥 Exportado', 'Datos descargados correctamente.');
  });

  // Import
  container.querySelector('#btn-import')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (store.importData(ev.target.result)) {
        showToast('success', '📤 Importado', 'Datos restaurados con éxito.');
        setTimeout(() => location.reload(), 1000);
      } else {
        showToast('error', '❌ Error', 'El archivo no es un JSON válido.');
      }
    };
    reader.readAsText(file);
  });

  // Reset
  container.querySelector('#btn-reset')?.addEventListener('click', async () => {
    if (confirm('¿Estás seguro? Se perderán TODOS los datos y el progreso.')) {
      await store.resetAll();
      showToast('error', '🗑️ Sistema Reseteado', 'Todos los datos han sido eliminados.');
      setTimeout(() => location.reload(), 500);
    }
  });
}
