// =============================================
// NOTES PAGE
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';

export function renderNotes(container) {
    renderNavbar();

    // Ensure notes exists in settings
    if (!store.settings.notes) {
        store.updateSettings({ notes: '' });
    }

    container.innerHTML = `
    <div class="page-header animate-fadeIn">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="page-title">Notas Rápidas</h1>
          <p class="page-subtitle">Un espacio para capturar ideas, recordatorios o pensamientos.</p>
        </div>
        <div id="save-indicator" style="font-size: 12px; color: var(--success); opacity: 0; transition: opacity 0.3s; display: flex; align-items: center; gap: 4px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span> Guardado
        </div>
      </div>
    </div>

    <div class="notes-container animate-fadeIn" style="height: calc(100vh - 240px); display: flex; flex-direction: column;">
      <textarea 
        id="quick-notes" 
        class="input" 
        style="flex: 1; resize: none; font-family: 'Consolas', 'Monaco', monospace; font-size: 15px; line-height: 1.6; padding: 24px; border-radius: var(--radius-lg); background: var(--bg-secondary);"
        placeholder="Escribe aquí tus ideas... (Se guarda automáticamente)"
      >${store.settings.notes || ''}</textarea>
    </div>
  `;

    const textarea = container.querySelector('#quick-notes');
    const indicator = container.querySelector('#save-indicator');
    let timeout = null;

    textarea.addEventListener('input', (e) => {
        // Hide indicator while typing
        indicator.style.opacity = '0';

        // Clear existing timeout
        if (timeout) clearTimeout(timeout);

        // Auto-save after 1 second of inactivity
        timeout = setTimeout(() => {
            store.updateSettings({ notes: e.target.value });
            indicator.style.opacity = '1';

            // Hide indicator after 2 seconds
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 2000);
        }, 1000);
    });
}
