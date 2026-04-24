// =============================================
// HEALTH MODULE — Zepp Sync & Gym Tracking
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';

export async function renderHealth(container) {
    renderNavbar();

    const today = new Date().toISOString().split('T')[0];
    const dayData = store.dailyData[today] || {};

    if (!store.player.gymWeights) {
        store.player.gymWeights = {};
    }

    // Calculate workout days this week (based on 'ejercicio' habit or generic logic)
    const isWorkoutDay = hasDoneExercise(today);

    container.innerHTML = `
    <div class="animate-fadeIn" style="max-width: 1200px; margin: 0 auto; width: 100%;">
      <div class="page-header">
        <h1 class="page-title">Salud & Fitness</h1>
        <p class="page-subtitle">Sincronización de Zepp y progreso en el gimnasio</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px;">
        
        <!-- LEFT: Zepp Data -->
        <div class="card" style="border-left: 4px solid #7A5CFF;">
            <div class="card-title" style="display:flex; align-items:center; gap:8px;">
              <span class="material-symbols-outlined" style="color: #7A5CFF; font-size: 24px;">watch</span> 
              Datos de Zepp (Hoy)
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 24px; margin-top: 24px;">
               <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2);">
                  <div style="display: flex; align-items: center; gap: 16px;">
                     <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); display: flex; align-items: center; justify-content: center;">
                        <span class="material-symbols-outlined" style="color: var(--success); font-size: 28px;">directions_walk</span>
                     </div>
                     <div>
                        <div style="font-size: 14px; color: var(--text-muted);">Pasos</div>
                        <div style="font-size: 28px; font-weight: bold; color: var(--text-primary);">${dayData.steps || 0}</div>
                     </div>
                  </div>
               </div>
               
               <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(239, 68, 68, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                  <div style="display: flex; align-items: center; gap: 16px;">
                     <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center;">
                        <span class="material-symbols-outlined" style="color: #ef4444; font-size: 28px;">local_fire_department</span>
                     </div>
                     <div>
                        <div style="font-size: 14px; color: var(--text-muted);">Calorías Quemadas</div>
                        <div style="font-size: 28px; font-weight: bold; color: var(--text-primary);">${dayData.calories || 0}</div>
                     </div>
                  </div>
               </div>

               <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(122, 92, 255, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(122, 92, 255, 0.2);">
                  <div style="display: flex; align-items: center; gap: 16px;">
                     <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(122, 92, 255, 0.2); display: flex; align-items: center; justify-content: center;">
                        <span class="material-symbols-outlined" style="color: #7A5CFF; font-size: 28px;">bedtime</span>
                     </div>
                     <div>
                        <div style="font-size: 14px; color: var(--text-muted);">Calidad del Sueño</div>
                        <div style="font-size: 28px; font-weight: bold; color: var(--text-primary);">${dayData.sleepScore || 0} <span style="font-size: 16px; color: var(--text-muted);">/100</span></div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div style="margin-top: 24px; text-align: center;">
               <p style="font-size: 13px; color: var(--text-muted);">Los datos se envían automáticamente desde la app de tu reloj Amazfit Active 2.</p>
            </div>
        </div>

        <!-- RIGHT: Gym tracking -->
        <div style="display: flex; flex-direction: column; gap: 32px;">
            <div class="card" style="border-left: 4px solid var(--accent);">
                <div class="card-title" style="display:flex; align-items:center; gap:8px;">
                  <span class="material-symbols-outlined" style="color: var(--accent); font-size: 24px;">fitness_center</span> 
                  Progreso en Gimnasio
                </div>
                
                <div style="margin-top: 16px; display: flex; align-items: center; gap: 12px; padding: 16px; background: ${isWorkoutDay ? 'rgba(236, 91, 19, 0.1)' : 'var(--bg-secondary)'}; border-radius: 12px; border: 1px solid ${isWorkoutDay ? 'var(--accent)' : '#333'};">
                   <span class="material-symbols-outlined" style="font-size: 32px; color: ${isWorkoutDay ? 'var(--accent)' : 'var(--text-muted)'};">${isWorkoutDay ? 'check_circle' : 'radio_button_unchecked'}</span>
                   <div>
                      <div style="font-size: 16px; font-weight: bold; color: ${isWorkoutDay ? 'var(--accent)' : 'var(--text-primary)'};">${isWorkoutDay ? '¡Entrenamiento completado!' : 'No has entrenado hoy'}</div>
                      <div style="font-size: 13px; color: var(--text-muted);">Basado en tus hábitos diarios.</div>
                   </div>
                </div>

                <div style="margin-top: 32px;">
                    <h3 style="font-size: 16px; margin-bottom: 16px;">Registro de Pesos (kg)</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;" id="weights-container">
                        ${renderWeights()}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  `;

    attachHandlers(container);
}

function hasDoneExercise(dateStr) {
    // If we have habits data, we could check for an 'ejercicio' habit here.
    return false; // placeholder for now
}

function renderWeights() {
    const exercises = [
        { id: 'bench_press', name: 'Press de Banca' },
        { id: 'squat', name: 'Sentadilla' },
        { id: 'deadlift', name: 'Peso Muerto' },
        { id: 'pullup', name: 'Dominadas (Lastre)' }
    ];

    if (!store.player.gymWeights) store.player.gymWeights = {};

    return exercises.map(ex => {
        const val = store.player.gymWeights[ex.id] || 0;
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 12px 16px; border-radius: 8px;">
                <div style="font-weight: 500;">${ex.name}</div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="btn btn-sm btn-weight-dec" data-id="${ex.id}" style="padding: 4px 8px; font-size: 16px; font-weight: bold; line-height: 1;">-</button>
                    <div style="width: 60px; text-align: center; font-size: 18px; font-weight: bold; color: var(--accent);">${val}</div>
                    <button class="btn btn-sm btn-weight-inc" data-id="${ex.id}" style="padding: 4px 8px; font-size: 16px; font-weight: bold; line-height: 1;">+</button>
                </div>
            </div>
        `;
    }).join('');
}

function attachHandlers(container) {
    container.querySelectorAll('.btn-weight-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            store.player.gymWeights[id] = (store.player.gymWeights[id] || 0) + 2.5;
            store.save();
            renderHealth(container);
        });
    });

    container.querySelectorAll('.btn-weight-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            store.player.gymWeights[id] = Math.max(0, (store.player.gymWeights[id] || 0) - 2.5);
            store.save();
            renderHealth(container);
        });
    });
}
