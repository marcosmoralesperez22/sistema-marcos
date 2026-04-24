// =============================================
// MAIN — Application entry point
// =============================================

import './styles/index.css';
import { registerRoute, initRouter, onRouteChanged } from './router.js';
import { renderTopbar } from './components/topbar.js';
import { renderSidebar } from './components/sidebar.js';
import { renderRightPanel } from './components/rightPanel.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderQuests } from './pages/quests.js';
import { renderAchievements } from './pages/achievements.js';
import { renderStats } from './pages/stats.js';
import { renderSettings } from './pages/settings.js';
import { renderLogin } from './pages/login.js';
import { showSplash } from './pages/splash.js';
import { renderPomodoro } from './pages/pomodoro.js';
import { renderHabits } from './pages/habits.js';
import { renderGoals } from './pages/goals.js';
import { renderCalendar } from './pages/calendar.js';
import { renderHealth } from './pages/health.js';
import { renderRoadmaps } from './pages/roadmaps.js';
import { renderVideos } from './pages/videos.js';
import { store } from './data/store.js';
import { api } from './data/api.js';
import { checkAllAchievements } from './data/achievements.js';

// Global login redirect hook
window.__showLogin = () => renderLogin(bootApp);

async function bootApp() {
    // Load state from API
    await store.loadFromAPI();
    await store.initDailyTasks();

    // Register routes
    registerRoute('dashboard', renderDashboard);
    registerRoute('quests', renderQuests);
    registerRoute('achievements', renderAchievements);
    registerRoute('health', renderHealth);
    registerRoute('roadmaps', renderRoadmaps);
    registerRoute('stats', renderStats);
    registerRoute('settings', renderSettings);
    registerRoute('pomodoro', renderPomodoro);
    registerRoute('habits', renderHabits);
    registerRoute('goals', renderGoals);
    registerRoute('calendar', renderCalendar);
    registerRoute('videos', renderVideos);

    // Setup UI updates on route change
    onRouteChanged(() => {
        renderTopbar();
        renderSidebar();
        renderRightPanel();
    });

    // Render initial layout and start router
    initRouter();

    // Check achievements
    setTimeout(() => checkAllAchievements(), 1000);

    // Auto-refresh tasks every 5 minutes (for Google Calendar sync)
    setInterval(() => {
        store.initDailyTasks();
        store.fetchGoogleEvents();
    }, 5 * 60 * 1000);

    // Auto-refresh when returning to the tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            store.initDailyTasks();
            store.fetchGoogleEvents();
        }
    });

    console.log('✅ MARCOS Dashboard initialized!');
}

// Entry flow: Splash → Auth check → Login or App
async function init() {
    // Show splash animation
    await showSplash();

    // Check if already authenticated
    try {
        await api.me();
        // Authenticated — boot app
        bootApp();
    } catch {
        // Not authenticated — show login
        renderLogin(bootApp);
    }
}

document.addEventListener('DOMContentLoaded', init);
