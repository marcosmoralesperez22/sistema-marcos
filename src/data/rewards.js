// =============================================
// REWARDS ENGINE — Aura + Gamification
// =============================================

import { store } from './store.js';
import { showToast } from '../components/toast.js';
import { launchConfetti, playCheckSound } from '../components/confetti.js';
import { renderSidebar } from '../components/sidebar.js';

// Handle task completion
export function processTaskCompletion(task) {
    // 1. Update streak
    store.updateStreak();

    // 2. Record daily data
    store.recordDailyData();

    // 3. Add to task history
    store.addTaskHistory({
        taskId: task.id,
        name: task.name,
        category: task.category,
        status: 'completed',
    });

    // 4. Activity log
    store.addActivity('task_complete', `Completaste "${task.name}"`, 'task_alt');

    // 5. Play check sound if enabled
    const settings = store.settings || {};
    if (settings.checkSound !== false) {
        playCheckSound();
    }

    // 6. Toast notification with Aura
    showToast('success', '✅ +10 Aura ✨', `"${task.name}"`);

    // 7. Check if ALL tasks for today are completed → confetti
    if (settings.confettiEnabled !== false) {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = store.tasks.filter(t => t.date === today);
        const allDone = todayTasks.length > 0 && todayTasks.every(t => t.status === 'completed');
        if (allDone) {
            setTimeout(() => launchConfetti(200), 300);
            showToast('success', '🎉 ¡Día Perfecto!', 'Todas las tareas completadas');
        }
    }

    // 8. Update sidebar to reflect new Aura
    renderSidebar();

    // 9. Check achievements
    checkAchievementsAfterAction();
}

// Handle task failure
export function processTaskFailure(task) {
    // 1. Record
    store.addTaskHistory({
        taskId: task.id,
        name: task.name,
        category: task.category,
        status: 'failed',
    });

    // 2. Activity log
    store.addActivity('task_failed', `Fallo en "${task.name}"`, 'cancel');

    // 3. Toast
    showToast('error', '❌ -5 Aura', `"${task.name}"`);

    // 4. Update sidebar
    renderSidebar();
}

// Handle task uncompletion
export function processTaskUncompletion(task) {
    // Remove the false completion from history
    store.removeTaskHistory(task.id);

    // Re-record daily data so that total daily percent decrements correctly
    store.recordDailyData();

    // Log the undo action
    store.addActivity('task_uncomplete', `Desmarcaste "${task.name}"`, 'undo');

    // Show toast for feedback
    showToast('info', '-10 Aura', `"${task.name}"`);

    // Update sidebar
    renderSidebar();

    // Recheck achievements progression (it handles going down transparently)
    checkAchievementsAfterAction();
}

// Handle habit completion — gives Aura with streak multiplier
export function processHabitCompletion(habitName, streakDays) {
    let auraGain = 5;
    let multiplierLabel = '';

    // Streak multiplier: >7 days = ×1.5, >30 = ×2, >90 = ×3
    if (streakDays >= 90) {
        auraGain = Math.round(5 * 3);
        multiplierLabel = ' (×3 Maestro)';
    } else if (streakDays >= 30) {
        auraGain = Math.round(5 * 2);
        multiplierLabel = ' (×2 Experto)';
    } else if (streakDays >= 7) {
        auraGain = Math.round(5 * 1.5);
        multiplierLabel = ' (×1.5 Racha)';
    }

    store.updateAura(auraGain);

    const settings = store.settings || {};
    if (settings.checkSound !== false) {
        playCheckSound();
    }

    showToast('success', `✨ +${auraGain} Aura${multiplierLabel}`, `"${habitName}"`);
    renderSidebar();
}

// Handle habit uncompletion
export function processHabitUncompletion(habitName) {
    store.updateAura(-5);
    showToast('info', '-5 Aura', `"${habitName}"`);
    renderSidebar();
}

// Mastery level based on total days completed
export function getMasteryLevel(totalDays) {
    if (totalDays >= 90) return { label: 'Maestro', color: '#ffd700', icon: '👑' };
    if (totalDays >= 60) return { label: 'Experto', color: '#c0c0c0', icon: '⚡' };
    if (totalDays >= 30) return { label: 'Aprendiz', color: '#cd7f32', icon: '🔥' };
    return { label: 'Novato', color: 'var(--text3)', icon: '⭐' };
}

// Achievement checking
function checkAchievementsAfterAction() {
    if (window.__checkAchievements) {
        window.__checkAchievements();
    }
}
