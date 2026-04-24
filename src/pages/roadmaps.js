// =============================================
// ROADMAPS MODULE — Visual interactive roadmaps MarcosOS Style
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';
import { renderAchievements } from './achievements.js';

// Unused variables for node editor removed.

function initData() {
    if (!store.settings.roadmaps) {
        store.settings.roadmaps = [];
    }
    if (!store.settings.university) {
        store.settings.university = {
            exams: [],
            subjects: []
        };
    }
}

export function renderRoadmaps(container) {
    initData();
    renderList(container);
}

function renderList(container) {
    const list = store.settings.roadmaps || [];
    const uni = store.settings.university || { exams: [], subjects: [] };

    // Calculate GPA
    let totalCredits = 0;
    let totalPoints = 0;
    uni.subjects.forEach(s => {
        if (s.grade && s.credits) {
            totalCredits += parseFloat(s.credits);
            totalPoints += parseFloat(s.grade) * parseFloat(s.credits);
        }
    });
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    // Sort Exams
    const now = new Date();
    const sortedExams = uni.exams.map(ex => {
        const diffDays = Math.ceil((new Date(ex.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let color = 'var(--text)';
        if (diffDays < 0) color = 'var(--text3)';
        else if (diffDays <= 7) color = '#EF4444'; // Red
        else if (diffDays <= 14) color = 'var(--orange)'; // Amber/Orange
        else color = '#10B981'; // Green
        return { ...ex, diffDays, color };
    }).sort((a, b) => a.diffDays - b.diffDays).filter(ex => ex.diffDays >= -7); // Keep recent past ones up to a week

    container.innerHTML = `
      <div id="p-roadmaps" class="panel active">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
          <div>
            <h1 class="page-title">Metas y Universidad</h1>
            <p class="page-sub">Catálogo de Logros y Seguimiento Académico</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-tab-rm" class="pill active">Medallas</button>
            <button id="btn-tab-uni" class="pill">Universidad</button>
          </div>
        </div>

        <!-- Meta (Achievements) View -->
        <div id="rm-view" style="display: block; position: relative;">
            <div id="achievements-container" style="min-height: calc(100vh - 200px);">
                <!-- Achievements will be injected here -->
            </div>
        </div>
        
        <!-- University View -->
        <div id="uni-view" style="display: none;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <!-- Exams -->
                <div class="stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="font-weight: 500; color: var(--text); display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">event_note</span> Exámenes / Entregas
                        </h3>
                        <button id="btn-add-exam" class="pill" style="font-size: 12px;">+ Añadir</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${sortedExams.length === 0 ? '<div style="color:var(--text3); font-size:13px; text-align:center; padding:12px;">No hay fechas próximas.</div>' : ''}
                        ${sortedExams.map(ex => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px;">
                                <div>
                                    <div style="font-weight: 500; font-size: 14px;">${ex.name}</div>
                                    <div style="font-size: 12px; color: var(--text3);">${new Date(ex.date + 'T12:00:00Z').toLocaleDateString('es-ES')}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="font-size: 15px; font-weight: 600; color: ${ex.color};">${ex.diffDays < 0 ? 'Pasado' : (ex.diffDays === 0 ? '¡Hoy!' : ex.diffDays + ' días')}</div>
                                    <button class="uni-del-exam" data-id="${ex.id}" style="background:transparent; border:none; cursor:pointer; color:var(--text3);"><span class="material-symbols-outlined" style="font-size:16px;">close</span></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- GPA -->
                <div class="stat-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="font-weight: 500; color: var(--text); display: flex; align-items: center; gap: 8px;">
                            <span class="material-symbols-outlined" style="color: var(--orange); font-size: 20px;">school</span> Calificaciones
                        </h3>
                        <button id="btn-add-subject" class="pill" style="font-size: 12px;">+ Asignatura</button>
                    </div>
                    
                    <div style="display: flex; gap: 16px; margin-bottom: 20px;">
                        <div style="flex: 1; padding: 16px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Nota Media (GPA)</div>
                            <div style="font-size: 24px; font-weight: 500; color: var(--orange2); margin-top: 4px; font-family: var(--font);">${gpa}</div>
                        </div>
                        <div style="flex: 1; padding: 16px; background: var(--bg2); border: 1px solid var(--border); border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--text3); text-transform: uppercase;">Créditos ECTS</div>
                            <div style="font-size: 24px; font-weight: 500; color: var(--text); margin-top: 4px; font-family: var(--font);">${totalCredits}</div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
                        ${uni.subjects.length === 0 ? '<div style="color:var(--text3); font-size:13px; text-align:center; padding:12px;">No hay asignaturas.</div>' : ''}
                        ${uni.subjects.map(sub => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--bg1); border-bottom: 1px solid var(--border);">
                                <div>
                                    <div style="font-weight: 500; font-size: 13px;">${sub.name}</div>
                                    <div style="font-size: 11px; color: var(--text3);">${sub.credits} ECTS</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="font-size: 14px; font-weight: 500; color: ${sub.grade >= 5 ? '#10B981' : (sub.grade > 0 ? '#EF4444' : 'var(--text3)')};">${sub.grade || '-'}</div>
                                    <button class="uni-del-sub" data-id="${sub.id}" style="background:transparent; border:none; cursor:pointer; color:var(--text3);"><span class="material-symbols-outlined" style="font-size:14px;">close</span></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
      </div>
    `;

    // Initialize achievements module inside the #achievements-container
    const achContainer = container.querySelector('#achievements-container');
    if (achContainer) {
        renderAchievements(achContainer);
        // Achievements page has its own topbar, we just need to make sure it doesn't overlap our tabs
        const achHeader = achContainer.querySelector('.page-header');
        if (achHeader) achHeader.style.display = 'none'; // Hide inner title since we have our own
    }

    // Listeners for Tabs
    container.querySelector('#btn-tab-rm').addEventListener('click', () => {
        container.querySelector('#rm-view').style.display = 'block';
        container.querySelector('#uni-view').style.display = 'none';
        container.querySelector('#btn-tab-rm').classList.add('active');
        container.querySelector('#btn-tab-uni').classList.remove('active');
    });

    container.querySelector('#btn-tab-uni').addEventListener('click', () => {
        container.querySelector('#rm-view').style.display = 'none';
        container.querySelector('#uni-view').style.display = 'block';
        container.querySelector('#btn-tab-rm').classList.remove('active');
        container.querySelector('#btn-tab-uni').classList.add('active');
    });

    // Listeners for Uni View
    const getUni = () => {
        if (!store.settings.university) store.settings.university = { exams: [], subjects: [] };
        return store.settings.university;
    };

    container.querySelector('#btn-add-exam').addEventListener('click', () => {
        const name = prompt('Nombre del examen/entrega:');
        if (!name) return;
        const dateRaw = prompt('Fecha (AAAA-MM-DD):');
        if (!dateRaw || isNaN(new Date(dateRaw).getTime())) { alert('Fecha no válida.'); return; }
        getUni().exams.push({ id: 'ex_' + Date.now(), name, date: dateRaw });
        store.save();
        renderRoadmaps(container);
        setTimeout(() => container.querySelector('#btn-tab-uni').click(), 50); // Keep tab open
    });

    container.querySelector('#btn-add-subject').addEventListener('click', () => {
        const name = prompt('Nombre de la asignatura:');
        if (!name) return;
        const credits = parseFloat(prompt('Créditos ECTS:') || '6');
        const grade = parseFloat(prompt('Nota (0-10) [Dejar en blanco si no tiene]:') || '0');
        getUni().subjects.push({ id: 'sub_' + Date.now(), name, credits, grade });
        store.save();
        renderRoadmaps(container);
        setTimeout(() => container.querySelector('#btn-tab-uni').click(), 50);
    });

    container.querySelectorAll('.uni-del-exam').forEach(btn => {
        btn.onclick = () => {
            const id = btn.getAttribute('data-id');
            const u = getUni();
            u.exams = u.exams.filter(e => e.id !== id);
            store.save();
            renderRoadmaps(container);
            setTimeout(() => container.querySelector('#btn-tab-uni').click(), 50);
        };
    });

    container.querySelectorAll('.uni-del-sub').forEach(btn => {
        btn.onclick = () => {
            const id = btn.getAttribute('data-id');
            const u = getUni();
            u.subjects = u.subjects.filter(s => s.id !== id);
            store.save();
            renderRoadmaps(container);
            setTimeout(() => container.querySelector('#btn-tab-uni').click(), 50);
        };
    });
}
