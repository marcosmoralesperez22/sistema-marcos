// =============================================
// ROUTER — Hash-based SPA routing
// =============================================

const routes = {};
let currentRoute = null;
const routeListeners = [];

export function registerRoute(hash, renderFn) {
    routes[hash] = renderFn;
}

export function navigate(hash) {
    window.location.hash = hash;
}

export function getCurrentRoute() {
    return currentRoute || 'dashboard';
}

export function onRouteChanged(listener) {
    routeListeners.push(listener);
}

function handleRoute() {
    let hash = window.location.hash.replace('#', '');
    // Ignore query params for the base route key, if any
    const baseHash = hash.split('?')[0] || 'dashboard';
    currentRoute = baseHash;

    const container = document.getElementById('main');
    if (!container) return;

    // Page transition
    container.style.opacity = '0';
    container.style.transform = 'translateY(8px)';

    setTimeout(() => {
        if (routes[baseHash]) {
            container.innerHTML = '';
            routes[baseHash](container);
        } else if (routes['dashboard']) {
            container.innerHTML = '';
            routes['dashboard'](container);
        }

        // Notify listeners
        routeListeners.forEach(listener => listener(baseHash));

        // Fade in
        requestAnimationFrame(() => {
            container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });
    }, 150);
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    // Initial route
    handleRoute();
}
