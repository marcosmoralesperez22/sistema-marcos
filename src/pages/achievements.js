// =============================================
// ACHIEVEMENTS PAGE — Professional Progress (Medals)
// =============================================

import { store } from '../data/store.js';
import { ACHIEVEMENT_DEFS, ACHIEVEMENT_CATEGORIES, getAchievementState, incrementAchievement, decrementAchievement } from '../data/achievements.js';
import { renderNavbar } from '../components/navbar.js';

export function renderAchievements(container) {
  renderNavbar();

  const allStates = {};
  ACHIEVEMENT_DEFS.forEach(d => {
    allStates[d.id] = getAchievementState(d.id);
  });

  const completed = Object.values(allStates).filter(a => a?.status === 'completed').length;
  const total = ACHIEVEMENT_DEFS.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group achievements by category
  const grouped = {};
  Object.keys(ACHIEVEMENT_CATEGORIES).forEach(cat => {
    grouped[cat] = ACHIEVEMENT_DEFS.filter(d => d.category === cat).map(d => allStates[d.id]);
  });

  const tierNames = { 1: 'Bronce', 2: 'Plata', 3: 'Oro', 4: 'Platino' };
  const tierColors = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700', 4: '#E5E4E2' };

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; height: calc(100vh - 80px); overflow: hidden;" class="animate-fadeIn">
      
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-shrink: 0;">
        <div>
          <h1 class="page-title">Catálogo de Medallas</h1>
          <p class="page-subtitle">Sube de nivel completando hitos. Usa el ratón para moverte y hacer zoom en el árbol.</p>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: 800; color: var(--accent); line-height: 1;">${completed} / ${total}</div>
            <div style="font-size: 14px; color: var(--text-secondary);">Medallas desbloqueadas (${completionRate}%)</div>
            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;">
                <button id="btn-zoom-in" class="btn btn-sm" style="padding: 4px 8px;">+</button>
                <button id="btn-zoom-out" class="btn btn-sm" style="padding: 4px 10px;">-</button>
                <button id="btn-zoom-reset" class="btn btn-sm" style="padding: 4px 8px;">Reset</button>
            </div>
        </div>
      </div>

      <!-- Zoomable Area -->
      <div id="ach-viewport" style="flex: 1; background: var(--bg-secondary); border: 1px solid #333; border-radius: 12px; overflow: hidden; position: relative; cursor: grab; user-select: none;">
        <div id="ach-canvas" style="position: absolute; top: 0; left: 0; transform-origin: 0 0; display: flex; gap: 120px; padding: 100px; min-width: max-content; transition: transform 0.05s linear;">
          
          ${Object.keys(grouped).map(catKey => {
    const catInfo = ACHIEVEMENT_CATEGORIES[catKey];
    const items = grouped[catKey];
    if (!items || items.length === 0) return '';

    const subcats = [...new Set(items.map(i => i.subcategory || 'General'))];
    const compCat = items.filter(i => i.status === 'completed').length;

    return `
              <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                <!-- Category Node -->
                <div style="background: ${catInfo.color}15; border: 2px solid ${catInfo.color}; border-radius: 16px; padding: 16px 32px; text-align: center; margin-bottom: 60px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 10;">
                    <h2 style="margin: 0; color: ${catInfo.color}; font-size: 24px; letter-spacing: 1px;">${catInfo.name}</h2>
                    <div style="color: var(--text-muted); margin-top: 8px; font-weight: bold;">${compCat}/${items.length}</div>
                </div>
                
                <!-- Main Vertical Line -->
                <div style="position: absolute; top: 80px; bottom: 0; left: 50%; width: 4px; background: ${catInfo.color}40; transform: translateX(-50%); z-index: 0;"></div>

                <div style="display: flex; gap: 60px; position: relative;">
                   <!-- Horizontal connector line for subcategories -->
                   ${subcats.length > 1 ? `<div style="position: absolute; top: -30px; left: 20%; right: 20%; height: 4px; background: ${catInfo.color}40; z-index: 0;"></div>` : ''}
                   
                   ${subcats.map((subcat, sIdx) => {
      const subcatItems = items.filter(i => (i.subcategory || 'General') === subcat);
      return `
                        <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                          <!-- Subcategory vertical connector -->
                          <div style="position: absolute; top: -30px; height: 30px; left: 50%; width: 4px; background: ${catInfo.color}40; transform: translateX(-50%); z-index: 0;"></div>
                          
                          <h3 style="margin: 0 0 40px 0; color: ${catInfo.color}; text-align: center; font-size: 14px; font-weight: bold; background: var(--bg-primary); border: 2px solid ${catInfo.color}40; padding: 8px 20px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; z-index: 1;">
                            ${subcat}
                          </h3>
                          
                          <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
                            <!-- Node Vertical Line -->
                            <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: ${catInfo.color}20; transform: translateX(-50%); z-index: 0;"></div>
                            
                            ${subcatItems.sort((a, b) => a.tier - b.tier).map((state, idx, arr) => {
        const isCompleted = state.status === 'completed';
        const tColor = tierColors[state.tier] || '#fff';
        const tName = tierNames[state.tier] || 'Tier ' + state.tier;

        return `
                                  <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; margin-bottom: ${idx < arr.length - 1 ? '60px' : '0'};">
                                      <!-- Mini connector dot -->
                                      <div style="width: 20px; height: 20px; border-radius: 50%; background: ${isCompleted ? tColor : 'var(--bg-secondary)'}; border: 4px solid ${isCompleted ? 'var(--bg-primary)' : catInfo.color + '60'}; margin-bottom: -10px; z-index: 2;"></div>
                                      
                                      <div class="card ach-card ${state.status}" data-id="${state.id}"
                                           style="width: 340px; background: ${isCompleted ? 'var(--bg-secondary)' : 'var(--bg-primary)'}; border: 2px solid ${isCompleted ? tColor : 'rgba(255,255,255,0.08)'}; box-shadow: 0 8px 24px rgba(0,0,0,0.6); position: relative; display: flex; flex-direction: column; margin-top: 10px; cursor: default;">
                                        
                                        <div style="position: absolute; top: 12px; right: 12px; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; background: ${tColor}20; color: ${tColor}; border: 1px solid ${tColor}40;">
                                          ${tName}
                                        </div>
                                        
                                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                                           <div class="material-symbols-outlined" style="font-size: 42px; color: ${isCompleted ? tColor : '#666'};">${state.emoji}</div>
                                           <div style="flex: 1; padding-right: 48px;">
                                             <div style="font-weight: 800; font-size: 18px; color: ${isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)'}; line-height: 1.2; margin-bottom: 4px;">${state.name}</div>
                                           </div>
                                        </div>
                                        
                                        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: ${state.total > 1 ? '24px' : '0'}; line-height: 1.5; flex: 1;">
                                          ${state.description}
                                        </div>
                                        
                                        ${state.total > 1 ? `
                                          <div style="margin-top: auto;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; color: var(--text-muted);">
                                              <span>Progreso</span>
                                              <span style="font-weight: bold; color: ${isCompleted ? tColor : 'var(--text-secondary)'};">${state.progress} / ${state.total}</span>
                                            </div>
                                            <div class="progress-bar" style="height: 10px; margin-bottom: 16px; border-radius: 5px; background: rgba(0,0,0,0.4);">
                                              <div class="progress-bar-fill" style="width: ${state.pct}%; background: ${tColor}; border-radius: 5px;"></div>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; gap: 12px;">
                                              <button class="btn btn-sm btn-dec" data-id="${state.id}" style="flex: 1; padding: 8px; background: rgba(255,255,255,0.05); font-size: 16px;">-</button>
                                              <button class="btn btn-sm btn-inc" data-id="${state.id}" style="flex: 1; padding: 8px; background: ${tColor}20; color: ${tColor}; border-color: ${tColor}40; font-size: 16px; font-weight: bold;">+</button>
                                            </div>
                                          </div>
                                        ` : `
                                          <div style="margin-top: 24px;">
                                            <button class="btn btn-sm ${isCompleted ? 'btn-dec' : 'btn-inc'}" data-id="${state.id}" style="width: 100%; padding: 10px; font-weight: bold; border-color: ${isCompleted ? '#444' : tColor}; color: ${isCompleted ? '#888' : tColor}; background: ${isCompleted ? 'rgba(255,255,255,0.02)' : tColor + '20'};">
                                                ${isCompleted ? 'Desmarcar' : 'Completar Hito'}
                                            </button>
                                          </div>
                                        `}
                                      </div>
                                  </div>
                                `;
      }).join('')}
                          </div>
                        </div>
                      `;
    }).join('')}
                </div>
              </div>
            `;
  }).join('')}
          
        </div>
      </div>
    </div>
  `;

  attachHandlers(container);
  setupPanAndZoom(container);
}

function setupPanAndZoom(container) {
  const viewport = container.querySelector('#ach-viewport');
  const canvas = container.querySelector('#ach-canvas');

  let scale = 0.8;
  let posX = 50;
  let posY = 50;
  let isDragging = false;
  let startX, startY;

  function updateTransform() {
    canvas.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }
  
  updateTransform();

  viewport.addEventListener('mousedown', (e) => {
    // Prevent drag if clicking on buttons
    if (e.target.closest('button')) return;
    
    isDragging = true;
    viewport.style.cursor = 'grabbing';
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
  });

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const oldScale = scale;
    
    if (e.deltaY < 0) {
      scale = Math.min(scale + zoomFactor, 2);
    } else {
      scale = Math.max(scale - zoomFactor, 0.2);
    }
    
    // Zoom toward mouse pointer center
    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    posX = mouseX - (mouseX - posX) * (scale / oldScale);
    posY = mouseY - (mouseY - posY) * (scale / oldScale);
    
    updateTransform();
  });

  container.querySelector('#btn-zoom-in')?.addEventListener('click', () => { scale = Math.min(scale + 0.2, 2); updateTransform(); });
  container.querySelector('#btn-zoom-out')?.addEventListener('click', () => { scale = Math.max(scale - 0.2, 0.2); updateTransform(); });
  container.querySelector('#btn-zoom-reset')?.addEventListener('click', () => { scale = 0.8; posX = 50; posY = 50; updateTransform(); });
}

function attachHandlers(container) {
  container.querySelectorAll('.btn-inc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      incrementAchievement(id);
      renderAchievements(container); 
    });
  });

  container.querySelectorAll('.btn-dec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      decrementAchievement(id);
      renderAchievements(container); 
    });
  });
}
