// =============================================
// VIDEOS KANBAN PAGE
// =============================================

import { store } from '../data/store.js';

const COLUMNS = [
    { id: 'investigando', title: 'Investigando', color: 'var(--blue)' },
    { id: 'guion', title: 'Guion', color: 'var(--yellow)' },
    { id: 'grabar', title: 'Grabar', color: 'var(--danger)' },
    { id: 'editar', title: 'Editar', color: 'var(--purple)' },
    { id: 'miniatura', title: 'Miniatura', color: 'var(--orange)' },
    { id: 'subir', title: 'Subir', color: 'var(--success)' },
];

let draggedItem = null;

export function renderVideos(container) {
    if (!store.settings.videosKanban) {
        store.settings.videosKanban = [];
        store.save();
    }

    const vids = store.settings.videosKanban;

    let html = `
    <div class="panel active animate-fadeIn" style="height: 100%; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-shrink: 0;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; background: rgba(235, 90, 30, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">play_circle</span>
            </div>
            <h1 class="page-title" style="margin: 0;">YouTube Kanban</h1>
          </div>
          <p class="page-sub" style="margin-top: 4px;">Gestiona el flujo de trabajo de tus vídeos</p>
        </div>
        <button id="btn-add-video" class="add-btn" style="display: flex; align-items: center; gap: 4px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">add</span> NUEVO VÍDEO
        </button>
      </div>

      <div class="kanban-board" style="display: flex; gap: 16px; overflow-x: auto; flex: 1; padding-bottom: 8px;">
        ${COLUMNS.map(col => {
        const colVids = vids.filter(v => v.status === col.id);
        return `
            <div class="kanban-column" data-status="${col.id}" style="min-width: 280px; width: 280px; background: var(--bg1); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column;">
              <div style="padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 10px; height: 10px; border-radius: 50%; background: ${col.color};"></div>
                  <h3 style="margin: 0; font-size: 14px; font-weight: 600;">${col.title}</h3>
                </div>
                <span style="font-size: 11px; background: var(--bg2); color: var(--text3); padding: 2px 6px; border-radius: 10px;">${colVids.length}</span>
              </div>
              
              <div class="kanban-cards-container" style="padding: 12px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                ${colVids.map(v => `
                  <div class="kanban-card" draggable="true" data-id="${v.id}" style="background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; cursor: grab;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div style="font-weight: 500; font-size: 14px;">${v.title}</div>
                      <button class="icon-btn btn-delete-vid" data-id="${v.id}" style="color: var(--text3); padding: 2px;">
                        <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
                      </button>
                    </div>
                    ${v.desc ? `<div style="font-size: 12px; color: var(--text2); margin-bottom: 12px; line-height: 1.4;">${v.desc}</div>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-size: 10px; color: var(--text3);">${new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
    }).join('')}
      </div>
    </div>
  `;

    container.innerHTML = html;
    attachKanbanHandlers(container);
}

function attachKanbanHandlers(container) {
    // Drag and drop logic
    const cards = container.querySelectorAll('.kanban-card');
    const columns = container.querySelectorAll('.kanban-column');

    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedItem = card;
            setTimeout(() => card.style.opacity = '0.5', 0);
        });

        card.addEventListener('dragend', () => {
            setTimeout(() => {
                draggedItem.style.opacity = '1';
                draggedItem = null;
            }, 0);
        });
    });

    columns.forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.style.background = 'var(--bg2)';
        });

        col.addEventListener('dragleave', () => {
            col.style.background = 'var(--bg1)';
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.style.background = 'var(--bg1)';

            const newStatus = col.getAttribute('data-status');
            const vidId = draggedItem.getAttribute('data-id');

            // Update store
            const vid = store.settings.videosKanban.find(v => String(v.id) === String(vidId));
            if (vid && vid.status !== newStatus) {
                vid.status = newStatus;
                store.save(); // Save to database
                renderVideos(container); // Re-render to reflect new category correctly
            }
        });
    });

    // Add video button
    container.querySelector('#btn-add-video').addEventListener('click', () => {
        const title = prompt('Título del nuevo vídeo:');
        if (title) {
            store.settings.videosKanban.unshift({
                id: Date.now(),
                title,
                desc: '',
                status: 'investigando',
                createdAt: new Date().toISOString()
            });
            store.save();
            renderVideos(container);
        }
    });

    // Delete video button
    container.querySelectorAll('.btn-delete-vid').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            if (confirm('¿Eliminar este vídeo de la tabla?')) {
                store.settings.videosKanban = store.settings.videosKanban.filter(v => String(v.id) !== String(id));
                store.save();
                renderVideos(container);
            }
        });
    });

    // Double click to edit title/desc placeholder
    container.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dblclick', () => {
            const id = card.getAttribute('data-id');
            const vid = store.settings.videosKanban.find(v => String(v.id) === String(id));
            if (vid) {
                const newDesc = prompt('Descripción / Notas del vídeo:', vid.desc);
                if (newDesc !== null) {
                    vid.desc = newDesc;
                    store.save();
                    renderVideos(container);
                }
            }
        });
    });
}
