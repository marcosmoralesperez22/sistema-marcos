// =============================================
// HABITS DATA — Logic and Defaults
// =============================================

export const DEFAULT_HABITS = [
    { id: 'h1', name: 'Beber agua', icon: 'water_drop', color: '#d4713a' },
    { id: 'h2', name: 'Estudiar', icon: 'auto_stories', color: '#e8884f' },
    { id: 'h7', name: 'Chino', icon: 'language', color: '#f0a070' },
    { id: 'h3', name: 'Dormir 7-8 horas', icon: 'bed', color: '#a09080' },
    { id: 'h8', name: 'Leer 30 paginas', icon: 'book', color: '#d4713a' },
    { id: 'h9', name: 'Discord', icon: 'forum', color: '#5a5048' },
    { id: 'h10', name: 'pg', icon: 'code', color: '#e8884f' },
    { id: 'h11', name: 'Obsidian', icon: 'edit_note', color: '#a09080' },
    { id: 'h12', name: 'tasks', icon: 'checklist', color: '#d4713a' },
    { id: 'h6', name: 'Dieta', icon: 'egg_alt', color: '#f0a070' },
    { id: 'h4', name: 'Ejercicio', icon: 'directions_run', color: '#e8884f' },
    { id: 'h5', name: 'YouTube', icon: 'bolt', color: '#a09080' }
];

/**
 * Auto-checks habits based on health metrics (Zepp Sync)
 */
export function processZeppHabits(store) {
    const habitsData = { ...store.settings.habitsData } || {};
    let changed = false;

    Object.keys(store.dailyData).forEach(date => {
        const data = store.dailyData[date];

        // 1. Auto-check 'Ejercicio' (h4) if steps > 7000
        if (data.steps >= 7000) {
            if (!habitsData['h4']) habitsData['h4'] = {};
            if (!habitsData['h4'][date]) {
                habitsData['h4'][date] = true;
                changed = true;
            }
        }

        // 2. Auto-check 'Dormir' (h3) if sleepScore > 70
        if (data.sleepScore >= 70) {
            if (!habitsData['h3']) habitsData['h3'] = {};
            if (!habitsData['h3'][date]) {
                habitsData['h3'][date] = true;
                changed = true;
            }
        }
    });

    if (changed) {
        store.updateSettings({ habitsData });
    }

    return changed;
}

/**
 * Generates an insightful message based on habit performance
 */
export function generateSmartHabitMessage(store) {
    const habitsData = store.settings.habitsData || {};
    const habitsList = store.settings.habitsList || [];
    if (habitsList.length === 0) return "Añade hábitos para recibir consejos personalizados.";

    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const todayStr = days[6];
    let todayCount = 0;
    let weekCount = 0;

    // Calculate stats
    days.forEach(d => {
        habitsList.forEach(h => {
            if (habitsData[h.id] && habitsData[h.id][d]) {
                weekCount++;
                if (d === todayStr) todayCount++;
            }
        });
    });

    const totalPossible = days.length * habitsList.length;
    const completionRate = weekCount / (totalPossible || 1);

    // Day messages
    if (todayCount >= habitsList.length && habitsList.length > 2) {
        const msgs = ["Día completo: esto es lo que pasa cuando mandas tú.", "Día potente: cuando alineas energía + estructura, el tablero se llena.", "Hoy fue ejecución pura; guarda este día como 'plantilla'.", "No fue motivación, fue sistema."];
        return msgs[Math.floor(Math.random() * msgs.length)];
    } else if (todayCount > 1) {
        const msgs = ["Día decente: has cumplido lo esencial; mantener esto ya es ganar.", "Día estable: sin épica, pero con consistencia.", "Día correcto: lo importante es que no se cayó el ritmo."];
        return msgs[Math.floor(Math.random() * msgs.length)];
    } else if (todayCount === 1) {
        const msgs = ["Aunque hoy solo hubiera un check, si fue el hábito clave, el día cuenta.", "Buen enfoque: cuando aseguras el hábito principal, el resto cae con más facilidad."];
        return msgs[Math.floor(Math.random() * msgs.length)];
    } else if (todayCount === 0) {
        if (completionRate > 0.6) {
            return "Día mínimo: no pasa nada; mañana lo hacemos fácil y corto para recuperar inercia.";
        }
    }

    // Week messages
    if (completionRate > 0.8) {
        const msgs = ["Semana sólida: has mantenido el sistema vivo y eso es lo que crea progreso real.", "Buena semana: más que perfección, lo que te está haciendo avanzar es la repetición constante.", "Sin picos, sin dramas: esto es lo que se sostiene meses."];
        return msgs[Math.floor(Math.random() * msgs.length)];
    } else if (completionRate > 0.5) {
        const msgs = ["Semana 'de base': aunque no haya sido perfecta, has dejado señales claras de constancia.", "Semana estable: no fue extrema, fue sostenible; eso escala."];
        return msgs[Math.floor(Math.random() * msgs.length)];
    } else if (completionRate > 0.2) {
        const msgs = ["Semana irregular, pero útil: ya se ve qué hábitos entran fácil y cuáles necesitan ajuste.", "Semana de construcción: estás poniendo ladrillos, ahora toca hacerla más automática con rutina."];
        return msgs[Math.floor(Math.random() * msgs.length)];
    } else {
        return "Poco, pero repetible; esto construye identidad. Empieza por hacer el hábito más pequeño mañana.";
    }
}
