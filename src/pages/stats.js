// =============================================
// STATS PAGE — Analytics dashboard MarcosOS Style
// =============================================

import { store } from '../data/store.js';
import { CATEGORY_LIST } from '../data/defaultTasks.js';
import { drawBarChart, drawLineChart, drawDonutChart } from '../components/charts.js';

export async function renderStats(container) {
  // Always fetch latest data before showing stats
  await store.loadFromAPI();
  const player = store.player;

  // Generate last 7 days array
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  // Compute category stats from task history
  const catCounts = {};
  CATEGORY_LIST.forEach(c => { catCounts[c.id] = 0; });
  store.taskHistory.filter(h => h.status === 'completed').forEach(h => {
    if (catCounts[h.category] !== undefined) catCounts[h.category]++;
  });

  // Weekly data (last 7 days)
  const weekLabels = [];
  const weekValues = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  days.forEach(ds => {
    const d = new Date(ds);
    weekLabels.push(dayNames[d.getDay()]);
    weekValues.push(store.dailyData[ds]?.tasksCompleted || 0);
  });

  // Streak history (last 14 entries from daily data)
  const streakLabels = [];
  const streakValues = [];
  const dailyKeys = Object.keys(store.dailyData).sort().slice(-14);
  dailyKeys.forEach(k => {
    streakLabels.push(k.slice(5));
    streakValues.push(store.dailyData[k]?.tasksCompleted || 0);
  });

  // Heatmap data
  const heatmapHTML = buildHeatmap();

  container.innerHTML = `
    <div id="p-stats" class="panel active animate-fadeIn">
      <div class="page-header" style="margin-bottom: 24px;">
          <h1 class="page-title">Estadísticas</h1>
          <p class="page-sub">Analiza tu rendimiento y tendencias de productividad</p>
      </div>

      <!-- Key Metrics -->
      <div class="stat-row">
        <div class="stat-card">
          <div class="stat-n">${player.totalTasksCompleted}</div>
          <div class="stat-l">Tareas Completadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-n">${player.streak} <span style="font-size: 14px; color: var(--text3); font-weight: normal;">días</span></div>
          <div class="stat-l">Racha Actual</div>
        </div>
        <div class="stat-card">
          <div class="stat-n">${player.bestStreak} <span style="font-size: 14px; color: var(--text3); font-weight: normal;">días</span></div>
          <div class="stat-l">Mejor Racha</div>
        </div>
        <div class="stat-card">
          <div class="stat-n orange">${store.getTodayProgress().pct}%</div>
          <div class="stat-l">Eficiencia Hoy</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-top: 24px;">
        <div class="stat-card">
          <div style="font-weight: 500; margin-bottom: 16px; color: var(--text); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">bar_chart</span> Tareas (Últimos 7 días)</div>
          <div class="chart-container" style="height: 240px; position: relative;"><canvas id="chart-weekly" width="500" height="240"></canvas></div>
        </div>
        <div class="stat-card">
          <div style="font-weight: 500; margin-bottom: 16px; color: var(--text); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">show_chart</span> Evolución de Productividad</div>
          <div class="chart-container" style="height: 240px; position: relative;"><canvas id="chart-streak" width="500" height="240"></canvas></div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-top: 24px;">
        <div class="stat-card">
          <div style="font-weight: 500; margin-bottom: 16px; color: var(--text); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">pie_chart</span> Distribución por Categoría</div>
          <div class="chart-container" style="display: flex; justify-content: center; height: 300px;"><canvas id="chart-donut" width="300" height="300"></canvas></div>
        </div>
        <div class="stat-card">
          <div style="font-weight: 500; margin-bottom: 16px; color: var(--text); display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">calendar_month</span> Consistencia Anual</div>
          <div class="heatmap" style="overflow-x: auto; padding: 8px 0;">${heatmapHTML}</div>
          <div style="display: flex; align-items: center; gap: 6px; justify-content: flex-end; margin-top: 16px; font-size: 11px; color: var(--text3);">
            <span>Menos</span>
            <div style="width: 12px; height: 12px; background: var(--bg3); border-radius: 3px;"></div>
            <div style="width: 12px; height: 12px; background: var(--orange-bg2); border-radius: 3px;"></div>
            <div style="width: 12px; height: 12px; background: var(--orange-bg); border-radius: 3px;"></div>
            <div style="width: 12px; height: 12px; background: var(--orange2); border-radius: 3px;"></div>
            <div style="width: 12px; height: 12px; background: var(--orange); border-radius: 3px;"></div>
            <span>Más</span>
          </div>
        </div>
      </div>

      <!-- Category breakdown / Detailed Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-top: 24px;">
          <!-- Health Trends -->
          <div class="stat-card">
            <div style="font-weight: 500; margin-bottom: 16px; color: var(--text); display: flex; align-items: center; gap: 8px;">
              <span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">health_and_safety</span>
              Tendencias de Salud (Últimos 7 días)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 20px;">
              <div style="text-align: center; padding: 16px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border);">
                 <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Pasos</div>
                 <div style="font-size: 22px; font-weight: 500; color: #10b981; margin: 6px 0; font-family: var(--font);">
                   ${Math.round(weekLabels.reduce((acc, _, i) => acc + (store.dailyData[days[6 - i]]?.steps || 0), 0) / 7)}
                 </div>
                 <div style="font-size: 10px; color: var(--text3);">Media diaria</div>
              </div>
              <div style="text-align: center; padding: 16px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border);">
                 <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Calorías</div>
                 <div style="font-size: 22px; font-weight: 500; color: #ff8800; margin: 6px 0; font-family: var(--font);">
                   ${Math.round(weekLabels.reduce((acc, _, i) => acc + (store.dailyData[days[6 - i]]?.calories || 0), 0) / 7)}
                 </div>
                 <div style="font-size: 10px; color: var(--text3);">Media diaria</div>
              </div>
              <div style="text-align: center; padding: 16px; border-radius: 12px; background: var(--bg2); border: 1px solid var(--border);">
                 <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Sueño</div>
                 <div style="font-size: 22px; font-weight: 500; color: #7a5cff; margin: 6px 0; font-family: var(--font);">
                   ${Math.round(weekLabels.reduce((acc, _, i) => acc + (store.dailyData[days[6 - i]]?.sleepScore || 0), 0) / 7)}
                 </div>
                 <div style="font-size: 10px; color: var(--text3);">Media score</div>
              </div>
            </div>
            
            <div style="margin-top: 24px; height: 180px; width: 100%;">
              <!-- Simple custom SVG for 7-day health trends -->
              ${generateHealthSVG(days)}
            </div>
          </div>

      <!-- Category breakdown -->
          <div class="stat-card">
            <div style="font-weight: 500; margin-bottom: 24px; color: var(--text); display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">list_alt</span> Rendimiento por Área
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${CATEGORY_LIST.sort((a, b) => (catCounts[b.id] || 0) - (catCounts[a.id] || 0)).map(cat => {
    const count = catCounts[cat.id] || 0;
    const maxCount = Math.max(...Object.values(catCounts), 1);
    const pct = Math.round((count / maxCount) * 100);
    return `
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <span class="material-symbols-outlined" style="font-size: 24px; width: 32px; text-align: center; color: ${cat.color};">${cat.emoji}</span>
                    <span style="min-width: 120px; font-size: 14px; font-weight: 500; color: var(--text);">${cat.name}</span>
                    <div style="flex: 1; height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden;">
                      <div style="width: ${pct}%; height: 100%; background: ${cat.color}; border-radius: 3px; opacity: 0.9;"></div>
                    </div>
                    <span style="font-size: 14px; font-weight: 500; min-width: 40px; text-align: right; font-family: var(--font); color: var(--text3);">${count}</span>
                  </div>`;
  }).join('')}
            </div>
          </div>
      </div>
      
      <!-- Pomodoro History -->
      <div class="stat-card" style="margin-top: 24px;">
        <div style="font-weight: 500; margin-bottom: 24px; color: var(--text); display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">history</span> Historial de Foco (Últimos 10)
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${store.data.pomodoroHistory && store.data.pomodoroHistory.length > 0
      ? store.data.pomodoroHistory.slice(0, 10).map(p => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg2); border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px;">
                   <span style="font-size: 20px;">${p.emoji}</span>
                   <div>
                     <div style="font-weight: 500; font-size: 14px;">${p.modeName} (${p.durationMinutes}m)</div>
                     <div style="font-size: 12px; color: var(--text3);">${p.taskName || 'Enfoque libre'}</div>
                   </div>
                </div>
                <div style="font-size: 12px; color: var(--text3); font-family: var(--font);">
                   ${new Date(p.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>`).join('')
      : '<div style="color: var(--text3); font-size: 14px; text-align: center; padding: 20px;">No hay sesiones de foco registradas aún.</div>'}
        </div>
      </div>
      
    </div>`;

  // Render charts after DOM is ready
  requestAnimationFrame(() => {
    // Note: The chart.js config in charts.js might need to be adjusted for var(--orange) instead of hardcoded hex colors,
    // but we can pass 'var(--orange)' for bar/line charts if charts.js supports it.

    // We update the colors to correctly utilize MarcosOS colors or solid hex strings corresponding to them if Canvas needs it.
    // var(--orange) is roughly #d4713a
    const rawOrange = '#d4713a';

    const weeklyCanvas = document.getElementById('chart-weekly');
    if (weeklyCanvas) {
      drawBarChart(weeklyCanvas, { labels: weekLabels, values: weekValues, colors: weekValues.map(() => rawOrange) });
    }
    const streakCanvas = document.getElementById('chart-streak');
    if (streakCanvas) {
      drawLineChart(streakCanvas, { labels: streakLabels.length ? streakLabels : weekLabels, values: streakValues.length ? streakValues : weekValues });
    }
    const donutCanvas = document.getElementById('chart-donut');
    if (donutCanvas) {
      drawDonutChart(donutCanvas, {
        labels: CATEGORY_LIST.map(c => c.name),
        values: CATEGORY_LIST.map(c => catCounts[c.id] || 0),
        colors: CATEGORY_LIST.map(c => c.color)
      });
    }
  });
}

function buildHeatmap() {
  const weeks = 24;
  const today = new Date();
  let html = '<div style="display: flex; gap: 4px;">';
  for (let w = weeks - 1; w >= 0; w--) {
    html += '<div style="display: flex; flex-direction: column; gap: 4px;">';
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (6 - d)));
      const ds = date.toISOString().split('T')[0];
      const dd = store.dailyData[ds];

      let bgStyle = 'background: var(--bg3);';
      if (dd) {
        const t = dd.tasksCompleted || 0;
        if (t >= 8) bgStyle = 'background: var(--orange);';
        else if (t >= 5) bgStyle = 'background: var(--orange2);';
        else if (t >= 3) bgStyle = 'background: var(--orange-bg);';
        else if (t >= 1) bgStyle = 'background: var(--orange-bg2);';
      }
      html += `<div style="width: 12px; height: 12px; ${bgStyle} border-radius: 3px;" title="${ds}: ${dd?.tasksCompleted || 0} tareas"></div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function generateHealthSVG(days) {
  const width = 600; // Will be scaled by viewBox
  const height = 180;
  const paddingX = 40;
  const stepX = (width - paddingX * 2) / 6;

  // Max values for scaling
  const maxSteps = Math.max(...days.map(d => store.dailyData[d]?.steps || 0), 1000);
  const maxCal = Math.max(...days.map(d => store.dailyData[d]?.calories || 0), 100);

  const getPoints = (key, max) => {
    return days.map((d, i) => ({
      x: paddingX + i * stepX,
      y: height - 25 - (((store.dailyData[d]?.[key] || 0) / max) * (height - 45))
    }));
  };

  const stepPoints = getPoints('steps', maxSteps);
  const calPoints = getPoints('calories', maxCal);
  const sleepPoints = getPoints('sleepScore', 100);

  const drawLine = (pts, color) => `<polyline points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;

  return `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow:visible;" preserveAspectRatio="xMidYMid meet">
      ${drawLine(stepPoints, '#10b981')}
      ${drawLine(calPoints, '#ff8800')}
      ${drawLine(sleepPoints, '#7a5cff')}
      ${days.map((d, i) => `
        <text x="${paddingX + i * stepX}" y="${height - 5}" fill="var(--text3)" font-size="12" font-family="var(--font)" text-anchor="middle">${d.split('-')[2]}</text>
      `).join('')}
    </svg>`;
}
