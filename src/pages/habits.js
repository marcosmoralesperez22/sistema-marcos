// =============================================
// HABITS PAGE MarcosOS Style
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';
import { DEFAULT_HABITS, processZeppHabits } from '../data/habits.js';
import { processHabitCompletion, processHabitUncompletion, getMasteryLevel } from '../data/rewards.js';

export async function renderHabits(container) {
  // Always try to load fresh data from API to get the latest Zepp syncs
  await store.loadFromAPI();

  // Initialize habits in settings if not exists
  const currentHabits = store.settings.habitsList || [];
  const missingHabits = DEFAULT_HABITS.filter(h => !currentHabits.some(ch => ch.id === h.id || ch.name === h.name));

  if (missingHabits.length > 0) {
    const updatedHabits = [...currentHabits, ...missingHabits];
    store.updateSettings({ habitsList: updatedHabits });
  }

  if (!store.settings.habitsData) {
    store.updateSettings({ habitsData: {} });
  }

  const habits = store.settings.habitsList || DEFAULT_HABITS;
  const habitsData = store.settings.habitsData || {};

  // --- Zepp Integration: Auto-check based on health data ---
  processZeppHabits(store);

  // Generate last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  function getDayName(dateStr) {
    const d = new Date(dateStr);
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return names[d.getDay()];
  }

  container.innerHTML = `
    <div id="p-habits" class="panel active animate-fadeIn">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 class="page-title">Hábitos</h1>
          <p class="page-sub">Construye consistencia a través de pequeñas repeticiones.</p>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <button id="btn-tab-grid" class="pill active">Cuadrícula</button>
            <button id="btn-tab-chart" class="pill">Gráfica</button>
            <button id="btn-tab-heatmap" class="pill">Mapa Anual</button>
            <button id="btn-add-habit" class="add-btn" style="display: flex; gap: 4px; align-items: center; margin-left: 12px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">add</span> NUEVO
            </button>
        </div>
      </div>

      <div class="section">
        <div id="habits-grid-view" style="display: block; overflow-x: auto;">
          <div class="habit-grid" style="min-width: 600px;">
            <div class="hg-row hg-header">
              <div class="hg-cell hg-title" style="flex: 2;">Hábito</div>
              ${days.map(d => `
                <div class="hg-cell" style="width: 64px; flex: 1;">
                  <div style="font-size: 11px; color: var(--text3);">${getDayName(d)}</div>
                  <div style="font-size: 13px; font-family: var(--font); color: ${d === days[6] ? 'var(--orange)' : 'var(--text)'};">${d.split('-')[2]}</div>
                </div>
              `).join('')}
            </div>
            <div id="habits-tbody" style="display: flex; flex-direction: column;">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

        <div id="habits-chart-view" class="stat-card" style="display: none;">
          <h3 style="margin-bottom: 24px; font-weight: 500;">Cumplimiento últimos 7 días</h3>
          <div style="display: flex; align-items: flex-end; gap: 16px; height: 250px; padding-bottom: 30px; border-bottom: 1px solid var(--border); position: relative;">
            <!-- Chart injected here -->
          </div>
        </div>

        <div id="habits-heatmap-view" class="stat-card" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
             <h3 style="font-weight: 500;">Consistencia Anual</h3>
             <select id="heatmap-sel-habit" class="mini-select" style="background:var(--bg2);">
                <option value="all">Ver Todos (Global)</option>
                ${(store.settings.habitsList || []).map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
             </select>
          </div>
          <div id="heatmap-container" style="overflow-x: auto; padding-bottom: 20px;">
             <!-- Heatmap SVG injected here -->
          </div>
        </div>
      </div>
      
      <!-- Popover for habit editing / quick notes -->
      <div id="habit-popover" style="display: none; position: absolute; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.5); width: 220px;">
         <div style="font-size: 12px; color: var(--text3); margin-bottom: 8px;" id="hp-title">Fecha</div>
         <textarea id="hp-note" placeholder="Nota opcional..." style="width: 100%; height: 50px; background: var(--bg1); border: 1px solid var(--border); border-radius: 4px; color: var(--text); padding: 4px; font-family: var(--font); font-size: 12px; margin-bottom: 8px; resize: none;"></textarea>
         <button id="hp-save" class="pill" style="width: 100%; justify-content: center; background: var(--orange); color: var(--bg);">Guardar nota</button>
      </div>

      </div>
    </div>
  `;

  function drawChart() {
    const chartContainer = container.querySelector('#habits-chart-view > div');
    const width = chartContainer.clientWidth || 600;
    const height = 220; // reserve space for labels

    let maxDone = 0;
    const data = days.map(d => {
      const dn = habits.filter(h => habitsData[h.id] && habitsData[h.id][d]).length;
      if (dn > maxDone) maxDone = dn;
      return { date: d, count: dn };
    });

    const heightScale = Math.max(maxDone, 1);
    const paddingX = 40;
    const paddingY = 40;
    const chartW = width - (paddingX * 2);
    const chartH = height - (paddingY * 2);

    const stepX = chartW / Math.max(1, (data.length - 1));

    let pointsStr = '';
    const pointsData = data.map((d, i) => {
      const x = paddingX + (i * stepX);
      const y = height - paddingY - ((d.count / heightScale) * chartH);
      pointsStr += `${x},${y} `;
      return { x, y, ...d };
    });

    // Generate Curved Path (Catmull-Rom to Cubic Bezier roughly equivalent logic)
    // Points are (p.x, p.y)
    let pathD = `M ${pointsData[0].x},${pointsData[0].y}`;
    for (let i = 0; i < pointsData.length - 1; i++) {
      const p0 = i > 0 ? pointsData[i - 1] : pointsData[0];
      const p1 = pointsData[i];
      const p2 = pointsData[i + 1];
      const p3 = i !== pointsData.length - 2 ? pointsData[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }

    // Area path for gradient fill
    const areaPathD = pathD + ` L ${pointsData[pointsData.length - 1].x},${height - paddingY} L ${pointsData[0].x},${height - paddingY} Z`;

    // Create SVG
    let svgHTML = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <!-- Gradient -->
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--orange)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--orange)" stop-opacity="0" />
        </linearGradient>
      </defs>
      
      <!-- Area Fill -->
      <path d="${areaPathD}" fill="url(#lineGrad)" />

      <!-- The Line -->
      <path d="${pathD}" fill="none" stroke="var(--orange)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    `;

    // Data points & Labels
    pointsData.forEach(p => {
      svgHTML += `
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="var(--bg1)" stroke="var(--orange)" stroke-width="2" />
        <text x="${p.x}" y="${p.y - 15}" fill="var(--text)" font-size="12px" font-weight="500" font-family="var(--font)" text-anchor="middle">${p.count}</text>
        <text x="${p.x}" y="${height - 10}" fill="var(--text3)" font-size="11px" text-anchor="middle">${getDayName(p.date)}</text>
        <text x="${p.x}" y="${height + 5}" fill="var(--text2)" font-size="10px" text-anchor="middle">${p.date.split('-')[2]}</text>
      `;
    });

    svgHTML += '</svg>';
    chartContainer.innerHTML = svgHTML;
  }

  function calculateStreak(habitId) {
    let currentStreak = 0;
    let maxStreak = store.settings.habitsData?.[habitId]?.maxStreak || 0;
    let isNewRecord = false;

    // Create an array of all days looking backwards from today up to 365 days
    // to find the current active streak.
    const hd = store.settings.habitsData?.[habitId] || {};
    const excludeDays = store.settings.habitsList?.find(h => h.id === habitId)?.excludedDays || []; // e.g [0, 6] meaning Sun, Sat

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 365; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0(Sun) - 6(Sat)

      if (excludeDays.includes(dayOfWeek)) {
        // It's a rest day. Don't break streak, but also don't increment it, just skip.
        // Wait, if they do it on a rest day, it counts!
        if (hd[ds] && hd[ds].done) currentStreak++;
        continue;
      }

      if (hd[ds] && hd[ds].done) {
        currentStreak++;
      } else if (i === 0) {
        // missing today doesn't break the streak immediately (they have time)
      } else {
        // missing a past required day breaks it
        break;
      }
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
      isNewRecord = true;
    }

    return { currentStreak, maxStreak, isNewRecord };
  }

  function renderTable() {
    const tbody = container.querySelector('#habits-tbody');

    // Sort by priority (high first)
    const priOrder = { high: 0, medium: 1, low: 2 };
    const sortedHabits = [...habits].sort((a, b) => (priOrder[a.priority || 'medium'] || 1) - (priOrder[b.priority || 'medium'] || 1));

    tbody.innerHTML = sortedHabits.map(habit => {
      const st = calculateStreak(habit.id);
      const excludeDays = habit.excludedDays || [];

      // Count total days completed for mastery
      const hd = store.settings.habitsData?.[habit.id] || {};
      const totalDone = Object.keys(hd).filter(k => k !== 'maxStreak' && hd[k]?.done).length;
      const mastery = getMasteryLevel(totalDone);

      // Priority indicator
      const priColors = { high: '#ef5350', medium: '#ffa726', low: '#66bb6a' };
      const priDot = `<span style="width:6px;height:6px;border-radius:50%;background:${priColors[habit.priority || 'medium']};display:inline-block;"></span>`;

      // Area badge
      const areaBadge = habit.area ? `<span style="font-size:9px;color:var(--text3);background:var(--bg3);padding:1px 4px;border-radius:3px;">${habit.area}</span>` : '';

      return `
      <div class="hg-row">
        <div class="hg-cell hg-title" style="flex: 2; position: relative; padding-right: 5px;">
          <span class="material-symbols-outlined" style="color: ${habit.color || 'var(--orange)'}; font-size: 20px;">${habit.icon || 'star'}</span>
          <div style="display: flex; flex-direction: column;">
            <div style="font-weight: 500; display:flex; gap: 4px; align-items: center; flex-wrap:wrap;">
              ${priDot} ${habit.name}
              <span style="font-size:10px;color:${mastery.color};" title="${mastery.label}: ${totalDone} días">${mastery.icon}</span>
              ${areaBadge}
              <button class="edit-habit-btn" data-id="${habit.id}" style="background: none; border: none; cursor: pointer; color: var(--text3); display: flex;"><span class="material-symbols-outlined" style="font-size: 14px;">edit</span></button>
            </div>
            <div style="font-size: 10px; color: var(--text3); margin-top: 2px;">
              🔥 ${st.currentStreak} ${st.isNewRecord && st.currentStreak > 1 ? '<span style="color:var(--orange2); background:var(--orange-bg); padding:1px 4px; border-radius:4px;">🏆 Récord</span>' : `(Max: ${st.maxStreak})`}
              ${habit.isNegative ? '<span style="font-size:9px;color:#ef5350;">⛔ Romper hábito</span>' : ''}
            </div>
          </div>
        </div>
        ${days.map(d => {
        const dt = new Date(d);
        const isRest = excludeDays.includes(dt.getDay());
        const hDay = (habitsData[habit.id] && habitsData[habit.id][d]) || {};
        const isDone = hDay.done;
        const hasNote = hDay.note && hDay.note.trim().length > 0;

        return `
            <div class="hg-cell" style="flex: 1; position: relative; ${isRest && !isDone ? 'opacity: 0.3;' : ''}" title="${isRest ? 'Día de descanso programado' : d}">
              <div class="hab-chip ${isDone ? 'on' : ''}" data-id="${habit.id}" data-date="${d}" data-rest="${isRest}" style="${hasNote ? 'border-bottom: 2px solid var(--orange2);' : ''}"></div>
              <button class="hab-note-btn" data-id="${habit.id}" data-date="${d}" style="position: absolute; top: 0; right: 0; background: none; border: none; font-size: 10px; cursor: pointer; color: var(--text3);">...</button>
            </div>
          `;
      }).join('')}
      </div>
    `;
    }).join('');

    // Add event listeners setup for table
    setupListeners();
  }

  function setupListeners() {
    container.querySelectorAll('.hab-chip').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.getAttribute('data-id');
        const date = el.getAttribute('data-date');
        const habit = habits.find(h => h.id === id);

        if (!store.settings.habitsData) store.settings.habitsData = {};
        if (!store.settings.habitsData[id]) store.settings.habitsData[id] = {};

        // Convert legacy boolean to object format: { done: true, note: "" }
        if (typeof store.settings.habitsData[id][date] === 'boolean') {
          store.settings.habitsData[id][date] = { done: store.settings.habitsData[id][date], note: "" };
        }

        const currentDayStr = store.settings.habitsData[id][date];
        let wasDone = false;
        if (currentDayStr && currentDayStr.done !== undefined) wasDone = currentDayStr.done;

        const newDone = !wasDone;
        store.settings.habitsData[id][date] = {
          ...(currentDayStr || {}),
          done: newDone
        };

        // Update Max Streak cache if needed
        const st = calculateStreak(id);
        if (st.isNewRecord) {
          store.settings.habitsData[id].maxStreak = st.maxStreak;
        }

        store.updateSettings({ habitsData: store.settings.habitsData });

        // Aura reward for habit toggle
        if (newDone) {
          processHabitCompletion(habit?.name || id, st.currentStreak);
        } else {
          processHabitUncompletion(habit?.name || id);
        }

        el.style.transform = 'scale(0.8)';
        setTimeout(() => {
          renderTable();
          drawChart();
          drawHeatmap();
        }, 150);
      });
    });

    // Notes Popover Logic
    const popover = container.querySelector('#habit-popover');
    let activeNoteCb = null;
    let activeId = null, activeDate = null;

    container.querySelectorAll('.hab-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const date = btn.getAttribute('data-date');
        activeId = id; activeDate = date;

        const rect = btn.getBoundingClientRect();
        popover.style.display = 'block';
        popover.style.top = (e.pageY + 15) + 'px';
        popover.style.left = (e.pageX - popover.offsetWidth / 2) + 'px';

        container.querySelector('#hp-title').textContent = 'Anotación - ' + date;

        const hd = store.settings.habitsData?.[id]?.[date];
        container.querySelector('#hp-note').value = hd?.note || '';
      });
    });

    container.querySelector('#hp-save').addEventListener('click', () => {
      if (!activeId || !activeDate) return;
      if (!store.settings.habitsData) store.settings.habitsData = {};
      if (!store.settings.habitsData[activeId]) store.settings.habitsData[activeId] = {};

      const note = container.querySelector('#hp-note').value;
      const hd = store.settings.habitsData[activeId][activeDate];
      const done = hd?.done || false;

      store.settings.habitsData[activeId][activeDate] = { done, note };
      store.updateSettings({ habitsData: store.settings.habitsData });

      popover.style.display = 'none';
      renderTable();
    });

    // Edit Habit — Rich Modal
    container.querySelectorAll('.edit-habit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const hab = habits.find(h => h.id === id);
        if (!hab) return;
        showHabitEditModal(hab, () => {
          store.updateSettings({ habitsList: habits });
          renderTable();
          drawChart();
          drawHeatmap();
        });
      });
    });

    container.querySelector('#btn-tab-grid').addEventListener('click', () => {
      container.querySelector('#habits-grid-view').style.display = 'block';
      container.querySelector('#habits-chart-view').style.display = 'none';
      container.querySelector('#habits-heatmap-view').style.display = 'none';
      container.querySelector('#btn-tab-grid').classList.add('active');
      container.querySelector('#btn-tab-chart').classList.remove('active');
      container.querySelector('#btn-tab-heatmap').classList.remove('active');
    });

    container.querySelector('#btn-tab-chart').addEventListener('click', () => {
      container.querySelector('#habits-grid-view').style.display = 'none';
      container.querySelector('#habits-chart-view').style.display = 'block';
      container.querySelector('#habits-heatmap-view').style.display = 'none';
      container.querySelector('#btn-tab-chart').classList.add('active');
      container.querySelector('#btn-tab-grid').classList.remove('active');
      container.querySelector('#btn-tab-heatmap').classList.remove('active');
      drawChart();
    });

    container.querySelector('#btn-tab-heatmap').addEventListener('click', () => {
      container.querySelector('#habits-grid-view').style.display = 'none';
      container.querySelector('#habits-chart-view').style.display = 'none';
      container.querySelector('#habits-heatmap-view').style.display = 'block';
      container.querySelector('#btn-tab-heatmap').classList.add('active');
      container.querySelector('#btn-tab-grid').classList.remove('active');
      container.querySelector('#btn-tab-chart').classList.remove('active');
      drawHeatmap();
    });

    const selectHM = container.querySelector('#heatmap-sel-habit');
    if (selectHM && !selectHM.dataset.bound) {
      selectHM.dataset.bound = "true";
      selectHM.addEventListener('change', () => drawHeatmap());
    }
  }

  function drawHeatmap() {
    const hmContainer = container.querySelector('#heatmap-container');
    if (!hmContainer) return;

    const selId = container.querySelector('#heatmap-sel-habit').value;

    const weeks = 52;
    const daysPerWeek = 7;
    let html = '<div style="display: flex; gap: 4px;">';
    const today = new Date();

    for (let w = weeks - 1; w >= 0; w--) {
      html += '<div style="display: flex; flex-direction: column; gap: 4px;">';
      for (let d = 0; d < daysPerWeek; d++) {
        const date = new Date(today);
        // Construct days correctly. 6-d creates Sunday(0) at bottom, Mon(1) above it...
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        const ds = date.toISOString().split('T')[0];
        const isFuture = date > today;

        let bgColor = 'var(--bg3)';
        if (!isFuture) {
          if (selId === 'all') {
            // Global completion
            const doneCount = habits.filter(h => store.settings.habitsData?.[h.id]?.[ds]?.done).length;
            if (doneCount >= 8) bgColor = 'var(--orange)';
            else if (doneCount >= 5) bgColor = 'var(--orange2)';
            else if (doneCount >= 3) bgColor = 'var(--orange-bg)';
            else if (doneCount >= 1) bgColor = 'var(--orange-bg2)';
          } else {
            // Single habit completion
            const done = store.settings.habitsData?.[selId]?.[ds]?.done;
            if (done) bgColor = 'var(--orange)';
            else {
              // Check if it was an excluded day
              const hab = habits.find(h => h.id === selId);
              if (hab && hab.excludedDays && hab.excludedDays.includes(date.getDay())) {
                bgColor = 'var(--bg1)'; // Dimmer for rest days
              }
            }
          }
        } else {
          bgColor = 'transparent'; // Future
        }

        html += '<div style="width: 14px; height: 14px; background: ' + bgColor + '; border-radius: 3px;" title="' + ds + '"></div>';
      }
      html += '</div>';
    }
    html += '</div>';
    hmContainer.innerHTML = html;
  }

  container.querySelector('#btn-add-habit').addEventListener('click', () => {
    const newHabit = { id: 'h' + Date.now(), name: 'Nuevo Hábito', icon: 'star', color: 'var(--orange)', type: 'binary', priority: 'medium', area: '', isNegative: false };
    showHabitEditModal(newHabit, () => {
      habits.push(newHabit);
      store.updateSettings({ habitsList: habits });
      renderTable();
      drawChart();
      drawHeatmap();
    }, true);
  });

  renderTable();
  drawChart();
}

// Rich Edit Modal for Habits
function showHabitEditModal(habit, onSave, isNew = false) {
  // Remove any existing modal
  const old = document.getElementById('habit-edit-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'habit-edit-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';

  const areas = ['Salud', 'Carrera', 'Social', 'Finanzas', 'Personal', 'Educación', 'Creatividad'];

  modal.innerHTML = `
    <div style="background:var(--bg2,#1a1a1a);border:1px solid var(--border,#333);border-radius:12px;padding:24px;width:420px;max-height:85vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:var(--text,#eee);font-size:16px;">${isNew ? '➕ Nuevo Hábito' : '✏️ Editar Hábito'}</h3>
        <button id="hem-close" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:18px;">✕</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Nombre</label>
          <input type="text" id="hem-name" value="${habit.name}" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:var(--font);">
        </div>

        <div style="display:flex;gap:10px;">
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Icono Material</label>
            <input type="text" id="hem-icon" value="${habit.icon || 'star'}" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:var(--font);" placeholder="ej. water_drop">
          </div>
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Color</label>
            <input type="color" id="hem-color" value="${(habit.color || '#d4713a').replace('var(--orange)', '#d4713a')}" style="width:100%;height:36px;background:transparent;border:1px solid var(--border);border-radius:6px;cursor:pointer;">
          </div>
        </div>

        <div style="display:flex;gap:10px;">
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Tipo de Meta</label>
            <select id="hem-type" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;">
              <option value="binary" ${habit.type === 'binary' ? 'selected' : ''}>✅ Binario (Hecho/No)</option>
              <option value="quantitative" ${habit.type === 'quantitative' ? 'selected' : ''}>📊 Cuantitativo (ej. 2L)</option>
              <option value="temporal" ${habit.type === 'temporal' ? 'selected' : ''}>⏱️ Temporal (ej. 30 min)</option>
            </select>
          </div>
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Prioridad</label>
            <select id="hem-priority" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;">
              <option value="high" ${habit.priority === 'high' ? 'selected' : ''}>🔴 Alta</option>
              <option value="medium" ${habit.priority === 'medium' || !habit.priority ? 'selected' : ''}>🟡 Media</option>
              <option value="low" ${habit.priority === 'low' ? 'selected' : ''}>🟢 Baja</option>
            </select>
          </div>
        </div>

        <div style="display:flex;gap:10px;">
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Área de Vida</label>
            <select id="hem-area" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;">
              <option value="">Sin área</option>
              ${areas.map(a => `<option value="${a}" ${habit.area === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Unidad</label>
            <input type="text" id="hem-unit" value="${habit.unit || ''}" placeholder="ej. litros, páginas, mins" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:var(--font);">
          </div>
        </div>

        <div style="display:flex;gap:10px;">
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Meta diaria</label>
            <input type="number" id="hem-target" value="${habit.target || ''}" placeholder="ej. 2" min="0" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:var(--font);">
          </div>
          <div style="flex:1;">
            <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Meta mínima (días difíciles)</label>
            <input type="number" id="hem-mintarget" value="${habit.minTarget || ''}" placeholder="ej. 1" min="0" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-family:var(--font);">
          </div>
        </div>

        <div>
          <label style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;">Días de descanso</label>
          <div style="display:flex;gap:6px;margin-top:6px;">
            ${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => {
    const isExcluded = (habit.excludedDays || []).includes(i);
    return `<button class="hem-day-btn" data-day="${i}" style="width:38px;height:32px;border-radius:6px;border:1px solid ${isExcluded ? 'var(--orange)' : 'var(--border)'};background:${isExcluded ? 'var(--orange)' : 'var(--bg1)'};color:${isExcluded ? 'var(--bg)' : 'var(--text)'};cursor:pointer;font-size:11px;font-weight:500;">${d}</button>`;
  }).join('')}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;">
          <label style="font-size:12px;color:var(--text);cursor:pointer;display:flex;align-items:center;gap:8px;">
            <input type="checkbox" id="hem-negative" ${habit.isNegative ? 'checked' : ''}>
            ⛔ Hábito Negativo (contar días SIN hacerlo)
          </label>
        </div>

        <div style="display:flex;gap:8px;margin-top:4px;">
          <button id="hem-save" style="flex:1;padding:10px;background:var(--orange);color:var(--bg);border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;">💾 Guardar</button>
          ${!isNew ? '<button id="hem-delete" style="padding:10px 16px;background:#ef5350;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;">🗑️</button>' : ''}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Excluded days toggle
  let excludedDays = [...(habit.excludedDays || [])];
  modal.querySelectorAll('.hem-day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = parseInt(btn.getAttribute('data-day'));
      if (excludedDays.includes(day)) {
        excludedDays = excludedDays.filter(d => d !== day);
        btn.style.background = 'var(--bg1)'; btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--text)';
      } else {
        excludedDays.push(day);
        btn.style.background = 'var(--orange)'; btn.style.borderColor = 'var(--orange)'; btn.style.color = 'var(--bg)';
      }
    });
  });

  // Close
  modal.querySelector('#hem-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  // Save
  modal.querySelector('#hem-save').addEventListener('click', () => {
    habit.name = modal.querySelector('#hem-name').value.trim() || habit.name;
    habit.icon = modal.querySelector('#hem-icon').value.trim() || 'star';
    habit.color = modal.querySelector('#hem-color').value;
    habit.type = modal.querySelector('#hem-type').value;
    habit.priority = modal.querySelector('#hem-priority').value;
    habit.area = modal.querySelector('#hem-area').value;
    habit.unit = modal.querySelector('#hem-unit').value.trim();
    habit.target = parseInt(modal.querySelector('#hem-target').value) || null;
    habit.minTarget = parseInt(modal.querySelector('#hem-mintarget').value) || null;
    habit.isNegative = modal.querySelector('#hem-negative').checked;
    habit.excludedDays = excludedDays;
    modal.remove();
    onSave();
  });

  // Delete
  const delBtn = modal.querySelector('#hem-delete');
  if (delBtn) {
    delBtn.addEventListener('click', () => {
      if (confirm('¿Eliminar "' + habit.name + '"?')) {
        const idx = habits.findIndex(h => h.id === habit.id);
        if (idx >= 0) habits.splice(idx, 1);
        modal.remove();
        onSave();
      }
    });
  }
}
