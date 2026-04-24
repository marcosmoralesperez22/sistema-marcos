// =============================================
// CALENDAR PAGE — Weekly / Monthly View MarcosOS Style
// =============================================

import { store } from '../data/store.js';

let currentDate = new Date();
let viewMode = 'week'; // 'week' or 'month'
let syncInterval = null;

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  return new Date(d.setDate(diff));
}

// Function to handle automatic background fetching
function setupBackgroundSync(container) {
  if (syncInterval) clearInterval(syncInterval);

  // Fetch every 60 seconds
  syncInterval = setInterval(() => {
    store.fetchGoogleEvents().then(() => {
      if (document.getElementById('p-calendar')) {
        renderCalendarLayout(container);
      }
    });
  }, 60000);

  // Also fetch immediately when window gets focus
  const onFocus = () => {
    store.fetchGoogleEvents().then(() => {
      if (document.getElementById('p-calendar')) {
        renderCalendarLayout(container);
      }
    });
  };

  window.addEventListener('focus', onFocus);

  // We need to clean up events somehow if nav leaves calendar, but since it's a SPA it's fine 
  // to just keep syncing or clean it up if calendar isn't there anymore.
  // We will check inside interval if #p-calendar still exists.
}

export async function renderCalendar(container) {
  await store.initDailyTasks(); // ensure state is loaded
  if (!store.settings.calendarEvents) {
    store.settings.calendarEvents = [];
  }

  // Initial Fetch Google Events when the calendar opens
  store.fetchGoogleEvents().then(() => {
    if (container.querySelector('#p-calendar')) {
      renderCalendarLayout(container);
    }
  });

  setupBackgroundSync(container);

  renderCalendarLayout(container);
}

function renderCalendarLayout(container) {
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  let displayTitle = '';
  if (viewMode === 'week') {
    const start = getStartOfWeek(currentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    if (start.getMonth() === end.getMonth()) {
      displayTitle = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    } else {
      displayTitle = `${monthNames[start.getMonth()]} - ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
    }
  } else {
    displayTitle = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }

  let html = `
    <div id="p-calendar" class="panel active animate-fadeIn">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="page-title">Horario</h1>
          <p class="page-sub">Organiza tu tiempo por horas o meses</p>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="display: flex; gap: 4px;">
            <button id="view-week" class="pill ${viewMode === 'week' ? 'active' : ''}">Semana</button>
            <button id="view-month" class="pill ${viewMode === 'month' ? 'active' : ''}">Mes</button>
          </div>
          <button id="btn-add-event" class="add-btn" style="display: flex; align-items: center; gap: 4px; margin-left: 12px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">add</span> EVENTO
          </button>
        </div>
      </div>
      
      <div class="section" style="margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div style="display: flex; gap: 8px; align-items: center;">
              <button id="cal-today" class="pill" style="padding: 4px 12px;">Hoy</button>
              <button id="cal-prev" class="pill" style="padding: 4px 8px;"><span class="material-symbols-outlined" style="font-size: 18px;">chevron_left</span></button>
              <button id="cal-next" class="pill" style="padding: 4px 8px;"><span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span></button>
          </div>
          <h2 style="margin: 0; min-width: 200px; text-align: center; font-size: 18px; font-weight: 500;">${displayTitle}</h2>
          <div style="width: 150px;"></div> <!-- Spacer for balancing -->
        </div>
        
        <div class="stat-card" style="padding: 0; overflow-x: auto; background: var(--bg1); border-color: var(--border);">
          ${viewMode === 'week' ? renderWeekView() : renderMonthView()}
        </div>
      </div>
      
      <!-- Event Modal -->
      <div id="event-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div style="background: var(--bg1); border: 1px solid var(--border); border-radius: 12px; width: 100%; max-width: 400px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          <h3 id="ev-modal-title" style="margin: 0 0 20px 0; font-weight: 500; font-size: 18px;">Añadir Evento</h3>
          <form id="event-form" style="display: flex; flex-direction: column; gap: 16px;">
            <input type="hidden" id="ev-id" value="" />
            <input type="text" id="ev-title" style="background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: 8px; font-family: var(--font); outline: none;" placeholder="Título del evento" required />
            <div style="display: flex; gap: 12px;">
                <input type="date" id="ev-date" style="flex: 1; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: 8px; font-family: var(--font); outline: none;" required />
                <input type="color" id="ev-color" value="#d4713a" style="width: 50px; padding: 2px; height: 42px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;" />
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <input type="time" id="ev-start" style="flex: 1; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: 8px; font-family: var(--font); outline: none;" required />
                <span style="color: var(--text3);">-</span>
                <input type="time" id="ev-end" style="flex: 1; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: 8px; font-family: var(--font); outline: none;" required />
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <button type="button" id="btn-delete-event" class="pill" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3); display: none;">Eliminar</button>
                <div style="display: flex; gap: 12px; margin-left: auto;">
                    <button type="button" id="close-event-modal" class="pill">Cerrar</button>
                    <button type="submit" class="add-btn">Guardar</button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

  container.innerHTML = html;
  attachHandlers(container);
}

function renderWeekView() {
  const start = getStartOfWeek(currentDate);
  const todayStr = new Date().toISOString().split('T')[0];

  let html = `<div style="display: grid; grid-template-columns: 60px repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--border); overflow: hidden; min-width: 800px; border-radius: 12px;">`;

  // Header
  html += `<div style="background: var(--bg1); padding: 12px 8px; text-align: center; color: var(--text3); font-size: 11px;">GMT+1</div>`;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const isToday = dStr === todayStr;

    html += `<div style="background: var(--bg1); padding: 12px 8px; text-align: center; border-bottom: 2px solid ${isToday ? 'var(--orange)' : 'transparent'};">
            <div style="font-size: 11px; color: var(--text3); letter-spacing: 0.05em; text-transform: uppercase;">${dayNames[d.getDay()]}</div>
            <div style="font-size: 18px; font-weight: ${isToday ? '500' : 'normal'}; color: ${isToday ? 'var(--orange)' : 'var(--text)'}; margin-top: 4px;">${d.getDate()}</div>
        </div>`;
  }

  // Grid (0-23 hours)
  for (let h = 0; h < 24; h++) {
    // Time column
    html += `<div style="background: var(--bg1); padding: 8px 6px; text-align: right; font-size: 11px; color: var(--text3); border-right: 1px solid var(--border); border-top: 1px solid var(--border);">
            ${h === 0 ? '' : `${h}:00`}
        </div>`;

    // Day columns
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split('T')[0];

      // Find events strictly starting in this hour (Simple rendering)
      const eventsInfo = renderEventsForCell(dStr, h);

      html += `<div class="cal-time-cell" data-date="${dStr}" data-hour="${h}" style="background: var(--bg); border-top: 1px solid var(--border2); border-right: 1px solid var(--border2); position: relative; min-height: 54px; padding: 2px; cursor: pointer; transition: background 0.1s;">
                ${eventsInfo}
            </div>`;
    }
  }
  html += `</div>`;
  return html;
}

function renderMonthView() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startingDay = firstDay.getDay() - 1; // 0 is Monday
  if (startingDay === -1) startingDay = 6;

  let html = `
        <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); grid-auto-rows: 120px; gap: 1px; background: var(--border); overflow: hidden; min-width: 600px; border-radius: 12px;">
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Lun</div>
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Mar</div>
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Mié</div>
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Jue</div>
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Vie</div>
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Sáb</div>
          <div style="background: var(--bg1); padding: 12px; height: 100%; text-align: center; font-weight: 500; color: var(--text2); font-size: 13px;">Dom</div>
    `;

  // Pad empty days
  for (let i = 0; i < startingDay; i++) {
    html += `<div style="background: var(--bg2); height: 100%;"></div>`;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Fill actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isToday = dStr === todayStr;

    // Find events and tasks for day
    const allEvents = [
      ...(store.settings.calendarEvents || []),
      ...(store.googleEvents || [])
    ];
    const dayEvents = allEvents.filter(e => e.date === dStr);
    const dayTasks = store.tasks.filter(t => t.date === dStr);

    let itemsHtml = '';
    dayEvents.forEach(e => {
      const rgbMatches = e.color.match(/\w\w/g) || ['ff', 'ff', 'ff'];
      const r = parseInt(rgbMatches[0], 16), g = parseInt(rgbMatches[1], 16), b = parseInt(rgbMatches[2], 16);
      const bgColor = `rgba(${r},${g},${b},0.15)`;

      itemsHtml += `<div class="ev-item" data-id="${e.id}" style="font-size: 11px; font-weight: 500; background: ${bgColor}; color: ${e.color}; border-left: 2px solid ${e.color}; padding: 3px 6px; border-radius: 4px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${e.title}">${e.start} ${e.title}</div>`;
    });

    if (dayTasks.length > 0) {
      itemsHtml += `<div style="margin-top: 4px; border-top: 1px solid var(--border); padding-top: 4px;">`;
      dayTasks.forEach((t) => {
        const isDone = t.status === 'completed';
        const color = isDone ? 'var(--text-muted)' : 'var(--text)';
        const textDec = isDone ? 'line-through' : 'none';

        itemsHtml += `<div class="ev-item" style="font-size: 11px; background: transparent; color: ${color}; text-decoration: ${textDec}; padding: 2px 0px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px;" title="${t.name}">
           <span class="material-symbols-outlined" style="font-size: 12px; color: ${isDone ? 'var(--success)' : 'var(--text3)'};">${isDone ? 'task_alt' : 'radio_button_unchecked'}</span> 
           ${t.name}
        </div>`;
      });
      itemsHtml += `</div>`;
    }

    html += `
          <div class="cal-day-cell ${isToday ? 'today' : ''}" data-date="${dStr}" style="height: 100%; background: var(--bg); padding: 8px; display: flex; flex-direction: column; cursor: pointer; border: 1px solid ${isToday ? 'var(--orange)' : 'transparent'}; transition: background 0.15s; overflow: hidden;">
            <div style="font-weight: ${isToday ? '500' : 'normal'}; color: ${isToday ? 'var(--orange)' : 'var(--text)'}; font-size: 14px; margin-bottom: 4px; text-align: right;">${i}</div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; overflow-y: auto;">
              ${itemsHtml}
            </div>
          </div>
        `;
  }

  html += `</div>`;
  return html;
}

function renderEventsForCell(dateStr, hourNum) {
  const allEvents = [
    ...(store.settings.calendarEvents || []),
    ...(store.googleEvents || [])
  ];

  const events = allEvents.filter(e => {
    if (e.date !== dateStr) return false;
    const sh = parseInt(e.start.split(':')[0], 10);
    return sh === hourNum;
  });

  // Try to slot tasks at logical hours or generally spread them out for week view.
  if (hourNum === 10) {
    const tasks = store.tasks.filter(t => t.date === dateStr);
    tasks.forEach((t) => {
      const isDone = t.status === 'completed';
      events.push({ title: t.name, color: isDone ? 'var(--success)' : 'var(--text3)', isTask: true, done: isDone });
    });
  }

  return events.map(e => {
    let bgColor = '';
    if (e.isTask) {
      const textDec = e.done ? 'line-through' : 'none';
      const textColor = e.done ? 'var(--text-muted)' : 'var(--text)';
      return `
      <div class="ev-item" style="position: relative; margin-bottom: 2px; font-size: 11px; font-weight: 400; background: transparent; color: ${textColor}; text-decoration: ${textDec}; padding: 2px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px; z-index: 10;" title="${e.title}">
          <span class="material-symbols-outlined" style="font-size: 10px; color: ${e.done ? 'var(--success)' : 'var(--text3)'};">${e.done ? 'task_alt' : 'radio_button_unchecked'}</span> 
          ${e.title}
      </div>
      `;
    } else if (e.color.startsWith('var')) {
      bgColor = 'var(--orange-bg)';
    } else {
      const rgbMatches = e.color.match(/\w\w/g) || ['ff', 'ff', 'ff'];
      const r = parseInt(rgbMatches[0], 16), g = parseInt(rgbMatches[1], 16), b = parseInt(rgbMatches[2], 16);
      bgColor = `rgba(${r},${g},${b},0.15)`;
    }

    const textDec = e.done ? 'line-through' : 'none';
    const textColor = e.color;

    return `
        <div class="ev-item" data-id="${e.id}" style="position: relative; margin-bottom: 2px; font-size: 11px; font-weight: 500; background: ${bgColor}; border-left: 3px solid ${e.color}; color: ${textColor}; text-decoration: ${textDec}; padding: 4px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; z-index: 10; cursor: pointer;" title="${e.title}">
            ${e.start ? e.start + ' ' : ''}${e.title}
        </div>
        `;
  }).join('');
}

function attachHandlers(container) {
  container.querySelector('#cal-prev').addEventListener('click', () => {
    if (viewMode === 'week') {
      currentDate.setDate(currentDate.getDate() - 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    renderCalendarLayout(container);
  });

  container.querySelector('#cal-next').addEventListener('click', () => {
    if (viewMode === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    renderCalendarLayout(container);
  });

  container.querySelector('#cal-today').addEventListener('click', () => {
    currentDate = new Date();
    renderCalendarLayout(container);
  });

  container.querySelector('#view-week').addEventListener('click', () => {
    viewMode = 'week';
    renderCalendarLayout(container);
  });

  container.querySelector('#view-month').addEventListener('click', () => {
    viewMode = 'month';
    renderCalendarLayout(container);
  });

  // Modals
  const modal = container.querySelector('#event-modal');
  container.querySelector('#btn-add-event').addEventListener('click', () => {
    container.querySelector('#ev-id').value = '';
    container.querySelector('#btn-delete-event').style.display = 'none';
    container.querySelector('#ev-modal-title').textContent = 'Añadir Evento';
    container.querySelector('#event-form').reset();
    container.querySelector('#ev-date').value = new Date().toISOString().split('T')[0];
    container.querySelector('#ev-color').value = '#d4713a';
    modal.style.display = 'flex';
  });

  container.querySelector('#close-event-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  container.querySelector('#event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = container.querySelector('#ev-id').value;
    const title = container.querySelector('#ev-title').value;
    const date = container.querySelector('#ev-date').value;
    const color = container.querySelector('#ev-color').value;
    const start = container.querySelector('#ev-start').value;
    const end = container.querySelector('#ev-end').value;

    if (!store.settings.calendarEvents) store.settings.calendarEvents = [];

    if (id) {
      // Edit existing
      const evIndex = store.settings.calendarEvents.findIndex(ev => String(ev.id) === String(id));
      if (evIndex !== -1) {
        store.settings.calendarEvents[evIndex] = { ...store.settings.calendarEvents[evIndex], title, date, color, start, end };
      }
    } else {
      // Create new
      store.settings.calendarEvents.push({ id: Date.now(), title, date, color, start, end });
    }

    store.save();

    modal.style.display = 'none';
    renderCalendarLayout(container);
  });

  container.querySelector('#btn-delete-event').addEventListener('click', () => {
    const id = container.querySelector('#ev-id').value;
    if (id && confirm('¿Eliminar este evento?')) {
      store.settings.calendarEvents = store.settings.calendarEvents.filter(ev => String(ev.id) !== String(id));
      store.save();
      modal.style.display = 'none';
      renderCalendarLayout(container);
    }
  });

  // Allow clicking on time cell to add event at that hour or clicking an event to edit
  container.querySelectorAll('.cal-time-cell, .cal-day-cell, .ev-item').forEach(cell => {
    cell.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent triggering parent cells

      const evItem = e.target.closest('.ev-item');
      if (evItem && evItem.hasAttribute('data-id')) {
        // Editing event
        const id = evItem.getAttribute('data-id');
        if (String(id).startsWith('gcal-')) {
          alert('Los eventos de Google Calendar no se pueden editar aquí. Modifícalos desde Google.');
          return;
        }

        const ev = store.settings.calendarEvents.find(ev => String(ev.id) === String(id));
        if (ev) {
          container.querySelector('#ev-id').value = ev.id;
          container.querySelector('#ev-title').value = ev.title;
          container.querySelector('#ev-date').value = ev.date;
          container.querySelector('#ev-color').value = ev.color;
          container.querySelector('#ev-start').value = ev.start;
          container.querySelector('#ev-end').value = ev.end;
          container.querySelector('#btn-delete-event').style.display = 'block';
          container.querySelector('#ev-modal-title').textContent = 'Editar Evento';
          modal.style.display = 'flex';
          return;
        }
      }

      if (e.target.closest('.ev-item')) return; // Ignore task event clicks

      const d = cell.getAttribute('data-date');

      container.querySelector('#ev-id').value = '';
      container.querySelector('#ev-modal-title').textContent = 'Añadir Evento';
      container.querySelector('#btn-delete-event').style.display = 'none';
      container.querySelector('#ev-title').value = '';
      container.querySelector('#ev-color').value = '#d4713a';
      container.querySelector('#ev-date').value = d;

      if (cell.classList.contains('cal-time-cell')) {
        const h = String(cell.getAttribute('data-hour')).padStart(2, '0');
        container.querySelector('#ev-start').value = `${h}:00`;
        container.querySelector('#ev-end').value = `${h}:45`;
      } else {
        container.querySelector('#ev-start').value = `12:00`;
        container.querySelector('#ev-end').value = `13:00`;
      }
      modal.style.display = 'flex';
    });
  });
}
