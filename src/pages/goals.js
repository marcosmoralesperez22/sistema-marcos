// =============================================
// GOALS PAGE
// =============================================

import { store } from '../data/store.js';
import { renderNavbar } from '../components/navbar.js';

const GOALS_DATA = [
  {
    category: 'Redes sociales',
    icon: 'share',
    color: '#3b82f6',
    items: [
      { id: 'g_rs_1', text: '10 videos en youtube' },
      { id: 'g_rs_2', text: '50 suscriptores' },
      { id: 'g_rs_3', text: 'Establecer un buen nicho y disfrutarlo' },
      { id: 'g_rs_4', text: 'Mejorar calidad de photoshop y premiere' },
      { id: 'g_rs_5', text: 'Abrirme tiktok' },
      { id: 'g_rs_6', text: 'Abrirme Instagram' },
      { id: 'g_rs_7', text: 'Vlogs en canal secundario (por amor al arte)' },
      { id: 'g_rs_8', text: 'Mejorar guiones y manera de hablar' },
      { id: 'g_rs_9', text: '10000 visitas en total' },
      { id: 'g_rs_10', text: '10 comentarios' },
      { id: 'g_rs_11', text: 'Crecion sistema con ideas, competidores y mucho más' },
      { id: 'g_rs_12', text: 'Que la gente cercana me termine diciendo que le gustan mis videos' }
    ]
  },
  {
    category: 'Aprendizaje',
    icon: 'school',
    color: '#8b5cf6',
    items: [
      { id: 'g_ap_1', text: 'ArquitecturaComputadores APROBADA', defaultDone: true },
      { id: 'g_ap_2', text: 'Ir al dia con la uni este segundo cuatrimestre (2 horas diarias)', defaultDone: true },
      { id: 'g_ap_3', text: 'Aprender cada semana una nueva habilidad o mejora en cierto campo' },
      { id: 'g_ap_4', text: 'Chino Seccion 1', defaultDone: true },
      { id: 'g_ap_5', text: 'Chino seccion 2' },
      { id: 'g_ap_6', text: 'Ingles meterme tambien a repasarlo y estudiarlo y a hablarlo mejor' },
      { id: 'g_ap_7', text: 'Aprender bien todo este mundo de la Inteligencia Artificial' },
      { id: 'g_ap_8', text: 'Aprender a diseñar bien' },
      { id: 'g_ap_9', text: 'Meterme en el mundo de las empresas y negocios y empezar a entenderlo y como funciona' },
      { id: 'g_ap_10', text: 'Encontrar mi pasion y mis ganas de aprender en algo que me vaya a durar toda la vida' },
      { id: 'g_ap_11', text: 'Hacer apuntes de libros y post e historias que encuentre y sacarles partido' },
      { id: 'g_ap_12', text: 'Mejorar linkedin y empezar a llevar gente ahí' },
      { id: 'g_ap_13', text: 'Encontrar prácticas para verano y empezar a progresar en mi campo' }
    ]
  },
  {
    category: 'Economia y productos',
    icon: 'attach_money',
    color: '#10b981',
    items: [
      { id: 'g_ec_1', text: 'Empiezo con 490 euros. Minimo terminar en abril con 800-900 euros.' },
      { id: 'g_ec_2', text: 'Tener ingresos recurrentes aunque sean de 50 euros pero algo recurrente mensual' },
      { id: 'g_ec_3', text: 'Comprarme ropa nueva y empezar a vestir mejor' },
      { id: 'g_ec_4', text: 'Comprarme algo que quiera y que me venga bien' },
      { id: 'g_ec_5', text: 'Ahorrar mucho, empezar a meterlo en algun sitio y abrirlo ese ultimo dia' },
      { id: 'g_ec_6', text: 'Vender por wallapop para sacarme un dinero' },
      { id: 'g_ec_7', text: 'Irme un dia solo a comer' },
      { id: 'g_ec_8', text: 'Dejar de ir a tantos sushis y dejar de comprar en temu' },
      { id: 'g_ec_9', text: 'No gastar tanto en gasolina' },
      { id: 'g_ec_10', text: 'Si gastar en comida, bono transporte y cosas personales utiles' },
      { id: 'g_ec_11', text: 'Dejar de jugar tanto, este pc tiene que aguantar' }
    ]
  },
  {
    category: 'Familia y amigos',
    icon: 'group',
    color: '#f59e0b',
    items: [
      { id: 'g_fa_1', text: 'Establecer un limite semanal en discord', defaultDone: true },
      { id: 'g_fa_2', text: 'No salir tanto y establecer limites con mis amigos', defaultDone: true },
      { id: 'g_fa_3', text: 'Restringir el grupo de whatshapp y asi no leerlo tanto' },
      { id: 'g_fa_4', text: 'Hacer mas cosas en casa' },
      { id: 'g_fa_5', text: 'Rocio san valentin sushi y unos bombones', defaultDone: true },
      { id: 'g_fa_6', text: 'No reaccionar a cuando se meten conmigo' },
      { id: 'g_fa_7', text: 'Dejar de contar mis cosas antes de hacerlo' },
      { id: 'g_fa_8', text: 'Ir cada semana a casa de abuelos antes de ir a la uni' },
      { id: 'g_fa_9', text: 'Preguntarles a los abuelos cual es el mejor consejo en la vida' },
      { id: 'g_fa_10', text: 'No contestar tanto a mis padres', defaultDone: true }
    ]
  },
  {
    category: 'Salud y hábitos',
    icon: 'favorite',
    color: '#ef4444',
    items: [
      { id: 'g_sa_1', text: 'Ir al gimnasio de una vez' },
      { id: 'g_sa_2', text: 'Leer mas, llegar a 5 libros' },
      { id: 'g_sa_3', text: 'Ir al gimnasio 5 veces por semana' },
      { id: 'g_sa_4', text: 'Hacer pierna' },
      { id: 'g_sa_5', text: 'Salir a correr, hacer 5 km', defaultDone: true },
      { id: 'g_sa_6', text: 'Salir a andar y hacer 10km' },
      { id: 'g_sa_7', text: 'Cuidar un poco mas lo que como' },
      { id: 'g_sa_8', text: 'Seguir con la dieta volver a pesarme y bajar un kilo' },
      { id: 'g_sa_9', text: 'Cuidarme mas la cara', defaultDone: true },
      { id: 'g_sa_10', text: 'No morder uñas', defaultDone: true },
      { id: 'g_sa_11', text: 'Revisarme lo del medico', defaultDone: true },
      { id: 'g_sa_12', text: 'Analisis de sangre', defaultDone: true },
      { id: 'g_sa_13', text: 'Beber 2 litros durante una semana', defaultDone: true },
      { id: 'g_sa_14', text: 'Establecer rutinas', defaultDone: true },
      { id: 'g_sa_15', text: 'Establecer dias de idiomas', defaultDone: true },
      { id: 'g_sa_16', text: 'Establecer rutina de youtube' },
      { id: 'g_sa_17', text: 'Empezar a entrenar la cara' },
      { id: 'g_sa_18', text: 'Llegar a 1 hora en la bici estatica' },
      { id: 'g_sa_19', text: 'Levantarme 7 am todos los dias durante una semana' },
      { id: 'g_sa_20', text: 'Rutina de sueño perfecta una semana' }
    ]
  }
];

export function renderGoals(container) {
  renderNavbar();

  // Ensure state exists
  if (!store.settings.goalsCompleted) {
    const defaults = {};
    GOALS_DATA.forEach(cat => {
      cat.items.forEach(i => {
        if (i.defaultDone) defaults[i.id] = true;
      });
    });
    store.updateSettings({ goalsCompleted: defaults });
  }

  const completed = store.settings.goalsCompleted || {};

  container.innerHTML = `
    <div class="page-header animate-fadeIn">
      <h1 class="page-title">Metas: Hasta Semana Santa 2026</h1>
      <p class="page-subtitle">Rastrea tus objetivos a largo plazo divididos por categorías.</p>
    </div>

    <div class="goals-grid animate-fadeIn" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
      ${GOALS_DATA.map(group => {
    const total = group.items.length;
    const done = group.items.filter(i => completed[i.id]).length;
    const pct = Math.round((done / total) * 100);

    return `
          <div class="card" style="display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: ${group.color}20; color: ${group.color}; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined">${group.icon}</span>
              </div>
              <div style="flex: 1;">
                <h3 style="font-size: 16px; font-weight: 600;">${group.category}</h3>
                <div style="font-size: 12px; color: var(--text-muted);">${done} / ${total} completadas</div>
              </div>
              <div style="font-size: 14px; font-weight: 700; color: ${group.color};">${pct}%</div>
            </div>
            
            <div class="progress-bar" style="margin-top: 0; margin-bottom: 20px;">
              <div class="progress-bar-fill" style="width: ${pct}%; background: ${group.color};"></div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; flex: 1; overflow-y: auto; max-height: 400px; padding-right: 4px; padding-bottom: 8px;">
              ${group.items.map(item => `
                <div class="goal-item" style="width: calc(50% - 5px); background: #1a1a1a; padding: 16px; border: 1px solid ${completed[item.id] ? group.color : '#262626'}; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: all 0.2s; position: relative;" data-id="${item.id}">
                  ${completed[item.id] ? `<div style="position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; border-radius: 50%; background: ${group.color}; box-shadow: 0 0 6px ${group.color};"></div>` : ''}
                  <div style="display: flex; justify-content: center; margin-bottom: 12px;">
                    <span class="material-symbols-outlined" style="font-size: 24px; color: ${completed[item.id] ? group.color : '#404040'};">${group.icon}</span>
                  </div>
                  <div style="font-size: 13px; line-height: 1.4; text-align: center; color: ${completed[item.id] ? 'var(--text-muted)' : 'var(--text-primary)'}; font-weight: 500;">
                    ${item.text}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;

  // Handlers
  container.querySelectorAll('.goal-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-id');
      const state = store.data.settings.goalsCompleted || {};

      // Toggle
      state[id] = !state[id];
      store.updateSettings({ goalsCompleted: state });

      // Re-render
      renderGoals(container);
    });
  });
}
