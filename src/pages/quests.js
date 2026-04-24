// =============================================
// QUESTS PAGE — Task management MarcosOS Style
// =============================================

import { store } from '../data/store.js';
import { CATEGORIES, CATEGORY_LIST } from '../data/defaultTasks.js';
import { processTaskCompletion, processTaskFailure } from '../data/rewards.js';

let currentFilter = 'all';
let selectedDate = new Date().toISOString().split('T')[0];
let searchQuery = '';

export async function renderQuests(container) {
  await store.initDailyTasks();
  renderQuestsLayout(container);
}

function renderQuestsLayout(container) {
  const allTasks = store.tasks;
  const todayList = store.tasks.filter(t => t.date === selectedDate);
  const totalMinutes = todayList.reduce((acc, t) => acc + (t.timeEst || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeWarning = totalMinutes > 240 ? `<span style="color:var(--orange); font-weight:500; font-size:12px; margin-left:10px;">⚠️ Carga alta (>4h)</span>` : '';

  container.innerHTML = `
    <div id="p-tasks" class="panel active">
      <div class="page-title" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
           Tareas <span style="font-size:14px; color:var(--text2); margin-left:10px;">∑ ${hours}h ${minutes}m</span> ${timeWarning}
        </div>
        <input type="date" id="t-date-picker" class="mini-select" value="${selectedDate}">
      </div>

      <div class="section">
        <div class="task-compose" style="flex-direction:column; gap:10px;">
          <div style="display:flex; gap:10px; width:100%;">
            <input class="task-compose-input" id="t-input" placeholder="Nueva tarea — verbo + resultado..." style="flex:1;">
            <button class="add-btn" id="btn-add-task">Añadir</button>
          </div>
          <div class="compose-selects" style="display:flex; gap:10px; flex-wrap:wrap;">
            <select class="mini-select" id="t-area">
              <option value="inbox">Inbox</option>
              <option value="university">Universidad</option>
              <option value="youtube">YouTube</option>
              <option value="tech">Empresa</option>
              <option value="health">Salud</option>
              <option value="life">Personal</option>
            </select>
            <select class="mini-select" id="t-pri">
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="low">Baja</option>
            </select>
            <select class="mini-select" id="t-recurring">
              <option value="none">Una vez</option>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
            <input type="number" id="t-time" class="mini-select" placeholder="Mins (ej. 30)" style="width:100px;" min="0">
            <input type="text" id="t-tags" class="mini-select" placeholder="Tags (coma)" style="width:120px;">
          </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; flex-wrap:wrap; gap:10px;">
           <div class="filter-pills" id="task-filters">
             <button class="pill ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todas</button>
             <button class="pill ${currentFilter === 'open' ? 'active' : ''}" data-filter="open">Abiertas</button>
             <button class="pill ${currentFilter === 'done' ? 'active' : ''}" data-filter="done">Completadas</button>
             <button class="pill ${currentFilter === 'university' ? 'active' : ''}" data-filter="university">Universidad</button>
             <button class="pill ${currentFilter === 'youtube' ? 'active' : ''}" data-filter="youtube">YouTube</button>
             <button class="pill ${currentFilter === 'tech' ? 'active' : ''}" data-filter="tech">Empresa</button>
             <button class="pill ${currentFilter === 'health' ? 'active' : ''}" data-filter="health">Salud</button>
             <button class="pill ${currentFilter === 'inbox' ? 'active' : ''}" data-filter="inbox">Inbox</button>
           </div>
           
           <input type="text" id="t-search" class="mini-select" placeholder="🔍 Buscar tareas..." value="${searchQuery}" style="width:180px;">
        </div>
        
        <div id="task-list-main">
          ${renderTaskListHTML()}
        </div>
      </div>
    </div>
  `;

  attachHandlers(container);
}

function renderTaskListHTML() {
  let list = store.tasks.filter(t => t.date === selectedDate || (t.status === 'pending' && t.date < selectedDate));

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(t =>
      (t.name || t.title || '').toLowerCase().includes(q) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  // Categories & state filter
  if (currentFilter === 'open') list = list.filter(t => !t.completed && t.status !== 'completed');
  else if (currentFilter === 'done') list = list.filter(t => t.completed || t.status === 'completed');
  else if (currentFilter === 'high') list = list.filter(t => t.priority === 'high' && !t.completed && t.status !== 'completed');
  else if (['university', 'youtube', 'tech', 'health', 'life', 'inbox'].includes(currentFilter)) {
    list = list.filter(t => t.category === currentFilter);
  }

  // Sort by sortOrder, then id
  list.sort((a, b) => {
    if ((a.status === 'completed') !== (b.status === 'completed')) return (a.status === 'completed') ? 1 : -1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  if (!list.length) {
    return '<div class="empty"><div class="empty-icon">○</div>Sin tareas aquí</div>';
  }

  return list.map(t => {
    const isCompleted = t.completed || t.status === 'completed';
    const chipClass = 'chip-' + (t.category || 'inbox');
    const categoryLabel = CATEGORY_LIST.find(c => c.id === t.category)?.name || 'Inbox';
    let priClass = 'chip-' + (t.priority || 'medium');
    let priLabel = { high: 'Alta', medium: 'Media', low: 'Baja' }[t.priority || 'medium'];

    // Subtasks HTML
    let subtasksHTML = '';
    const subs = t.subtasks || [];
    if (subs.length > 0) {
      const completedSubs = subs.filter(s => s.done).length;
      const subList = subs.map(s => `
                    <div class="subtask-row ${s.done ? 'is-done' : ''}" style="display:flex; align-items:center; gap:8px; margin-bottom:4px; cursor:pointer;" data-task-id="${t.id}" data-subtask-id="${s.id}">
                        <div class="t-check sub-chk ${s.done ? 'chk' : ''}" style="width:12px; height:12px; min-width:12px; border-radius:3px; border:1px solid ${s.done ? 'var(--orange)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center;">
                           ${s.done ? '<div style="width:6px; height:6px; background:var(--orange); border-radius:1px;"></div>' : ''}
                        </div>
                        <div style="text-decoration: ${s.done ? 'line-through' : 'none'}; color: ${s.done ? 'var(--text3)' : 'var(--text)'}; pointer-events:none; flex:1;">${s.title}</div>
                        <button class="btn-del-subtask" style="background:transparent; border:none; color:var(--text3); cursor:pointer; padding:2px;" data-task-id="${t.id}" data-subtask-id="${s.id}">✕</button>
                    </div>
                `).join('');

      subtasksHTML = `
            <div class="t-subtasks" style="margin-top: 8px; font-size:12px; border-left: 2px solid var(--border); padding-left: 10px; width: 100%;">
                <div style="color:var(--text2); margin-bottom:4px; font-weight:500;">Subtareas (${completedSubs}/${subs.length})</div>
                ${subList}
            </div>
        `;
    }

    const timeLabel = t.timeEst ? `<span class="t-chip chip-inbox" style="background:transparent; border:1px solid var(--border);">⏱️ ${t.timeEst}m</span>` : '';
    const tagsHTML = (t.tags || []).map(tag => `<span class="t-chip chip-inbox" style="opacity:0.8;">#${tag}</span>`).join('');

    // Add Subtask input HTML (hidden by default)
    const addSubtaskHTML = `
        <div class="add-subtask-container" style="display:none; margin-top:8px; display:flex; gap:5px; width:100%;" id="add-sub-${t.id}">
            <input type="text" class="mini-select new-subtask-input" placeholder="Nueva subtarea..." style="flex:1;" data-task-id="${t.id}">
            <button class="btn-add-subtask" data-task-id="${t.id}" style="background:var(--border); color:var(--text); border:none; border-radius:4px; padding:0 8px; cursor:pointer;">+</button>
        </div>
    `;

    return `
      <div class="task-row ${isCompleted ? 'is-done' : ''}" draggable="${!isCompleted}" data-task-id="${t.id}" style="display:flex; flex-direction:column; align-items:flex-start;">
        
        <div style="display:flex; width:100%; align-items:center; gap: 12px;">
            <div style="opacity:0.3; cursor:grab; padding: 4px; font-size:10px;" class="drag-handle" data-task-id="${t.id}">⠿</div>
            <div class="t-check ${isCompleted ? 'chk' : ''}" data-task-id="${t.id}"></div>
            <div class="t-body" style="flex:1;">
                <div class="t-name">${t.title || t.name}</div>
                <div class="t-meta" style="margin-top:4px;">
                    <span class="t-chip ${chipClass}">${categoryLabel}</span>
                    <span class="t-chip ${priClass}">${priLabel}</span>
                    ${timeLabel}
                    ${tagsHTML}
                </div>
            </div>
            
            <button class="t-toggle-sub" data-task-id="${t.id}" title="Añadir subtarea" style="background:transparent; border:none; color:var(--text2); cursor:pointer; font-size:14px; padding: 4px;">✚</button>
            <button class="t-del" data-task-id="${t.id}" style="padding: 4px;">✕</button>
        </div>
        
        ${subtasksHTML}
        ${addSubtaskHTML}
        
      </div>
    `;
  }).join('');
}


function attachHandlers(container) {
  // === SEARCH ===
  const searchEl = container.querySelector('#t-search');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      const listContainer = container.querySelector('#task-list-main');
      if (listContainer) {
        listContainer.innerHTML = renderTaskListHTML();
        attachListHandlers(container);
      }
    });
  }

  // === ADD TASK ===
  const btnAdd = container.querySelector('#btn-add-task');
  const inputEl = container.querySelector('#t-input');

  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnAdd.click();
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', async () => {
      const input = container.querySelector('#t-input');
      const title = input.value.trim();
      if (!title) return;
      const category = container.querySelector('#t-area').value;
      const priority = container.querySelector('#t-pri').value;
      const recurring = container.querySelector('#t-recurring').value;
      const timeEst = parseInt(container.querySelector('#t-time').value) || 0;
      const tagsRaw = container.querySelector('#t-tags').value;
      const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(s => s) : [];

      await store.addTask({
        title,
        name: title,
        category,
        priority,
        recurring,
        timeEst,
        tags,
        date: selectedDate,
        scheduled_date: selectedDate,
        subtasks: [],
        sortOrder: store.tasks.filter(t => t.date === selectedDate).length
      });
      renderQuestsLayout(container);
    });
  }

  // === FILTERS ===
  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      currentFilter = e.target.getAttribute('data-filter');
      renderQuestsLayout(container);
    });
  });

  // === DATE PICKER ===
  const dp = container.querySelector('#t-date-picker');
  if (dp) {
    dp.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      renderQuestsLayout(container);
    });
  }

  // === LIST INTERACTIONS ===
  attachListHandlers(container);
}

function attachListHandlers(container) {
  const listContainer = container.querySelector('#task-list-main');
  if (!listContainer) return;

  const clone = listContainer.cloneNode(true);
  listContainer.parentNode.replaceChild(clone, listContainer);

  clone.addEventListener('click', async (e) => {
    // Toggle Task
    if (e.target.classList.contains('t-check') && !e.target.classList.contains('sub-chk')) {
      const id = e.target.getAttribute('data-task-id');
      const task = store.tasks.find(t => String(t.id) === String(id) || String(t.taskId) === String(id));
      if (!task) return;

      if (task.completed || task.status === 'completed') {
        store.uncompleteTask(id);
      } else {
        const t = store.completeTask(id);
        if (t) processTaskCompletion(t);
      }
      renderQuestsLayout(container);
    }

    // Delete Task
    if (e.target.classList.contains('t-del')) {
      const id = e.target.getAttribute('data-task-id');
      if (confirm('¿Eliminar esta tarea?')) {
        store.deleteTask(id);
        renderQuestsLayout(container);
      }
    }

    // Toggle Add Subtask UI
    if (e.target.classList.contains('t-toggle-sub')) {
      const id = e.target.getAttribute('data-task-id');
      const subContainer = container.querySelector(`#add-sub-${id}`);
      if (subContainer) {
        subContainer.style.display = subContainer.style.display === 'none' ? 'flex' : 'none';
        if (subContainer.style.display === 'flex') {
          subContainer.querySelector('input').focus();
        }
      }
    }

    // Add Subtask Action
    if (e.target.classList.contains('btn-add-subtask')) {
      const id = e.target.getAttribute('data-task-id');
      const input = container.querySelector(`.new-subtask-input[data-task-id="${id}"]`);
      if (input) {
        const title = input.value.trim();
        if (title) {
          const task = store.tasks.find(t => String(t.id) === String(id) || String(t.taskId) === String(id));
          if (task) {
            const subs = task.subtasks || [];
            subs.push({ id: Date.now().toString(), title, done: false });
            store.updateTask(id, { subtasks: subs });
            renderQuestsLayout(container);
          }
        }
      }
    }

    // Toggle Subtask Check
    const subtaskRow = e.target.closest('.subtask-row');
    if (subtaskRow && !e.target.classList.contains('btn-del-subtask')) {
      const taskId = subtaskRow.getAttribute('data-task-id');
      const subtaskId = subtaskRow.getAttribute('data-subtask-id');
      store.toggleSubtask(taskId, subtaskId);

      const task = store.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
      if (task && task.status === 'completed') {
        processTaskCompletion(task);
      }
      renderQuestsLayout(container);
    }

    // Delete Subtask
    if (e.target.classList.contains('btn-del-subtask')) {
      const taskId = e.target.getAttribute('data-task-id');
      const subtaskId = e.target.getAttribute('data-subtask-id');
      const task = store.tasks.find(t => String(t.id) === String(taskId) || String(t.taskId) === String(taskId));
      if (task) {
        const subs = task.subtasks || [];
        const updatedSubs = subs.filter(s => String(s.id) !== String(subtaskId));
        store.updateTask(taskId, { subtasks: updatedSubs });
        renderQuestsLayout(container);
      }
    }
  });

  // Enter key for new subtask
  clone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('new-subtask-input')) {
      const id = e.target.getAttribute('data-task-id');
      const btn = clone.querySelector(`.btn-add-subtask[data-task-id="${id}"]`);
      if (btn) btn.click();
    }
  });

  // === HTML5 DRAG AND DROP ===
  let draggedRow = null;
  let placeholder = document.createElement('div');
  placeholder.className = 'task-row placeholder';
  placeholder.style.height = '60px';
  placeholder.style.border = '1px dashed var(--orange)';
  placeholder.style.background = 'transparent';

  clone.querySelectorAll('.task-row').forEach(row => {
    if (row.getAttribute('draggable') !== 'true') return;

    row.addEventListener('dragstart', function (e) {
      if (!e.target.classList.contains('task-row')) return;
      draggedRow = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', this.getAttribute('data-task-id'));

      setTimeout(() => {
        this.style.display = 'none';
        if (this.parentNode) this.parentNode.insertBefore(placeholder, this.nextSibling);
      }, 0);
    });

    row.addEventListener('dragend', function () {
      draggedRow.style.display = 'flex';
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      draggedRow = null;

      const newOrder = [];
      clone.querySelectorAll('.task-row:not(.placeholder)').forEach(r => {
        const id = r.getAttribute('data-task-id');
        if (id) newOrder.push(id);
      });

      // Only reorder if changed
      store.reorderTasks(newOrder);
      renderQuestsLayout(container);
    });

    row.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (this === draggedRow || !draggedRow) return;

      const rect = this.getBoundingClientRect();
      const relY = e.clientY - rect.top;

      if (relY < rect.height / 2) {
        this.parentNode.insertBefore(placeholder, this);
      } else {
        this.parentNode.insertBefore(placeholder, this.nextSibling);
      }
    });

    row.addEventListener('drop', function (e) {
      e.preventDefault();
      if (this === draggedRow || !draggedRow) return;

      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(draggedRow, placeholder);
      }
    });
  });
}
