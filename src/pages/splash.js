// =============================================
// SPLASH SCREEN — Professional Reveal
// =============================================

export function showSplash() {
  return new Promise((resolve) => {
    const app = document.body;

    const splash = document.createElement('div');
    splash.id = 'splash-screen';

    Object.assign(splash.style, {
      position: 'fixed',
      top: '0', left: '0', right: '0', bottom: '0',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '3000',
      transition: 'opacity 0.6s ease'
    });

    splash.innerHTML = `
      <div style="text-align: center;" class="animate-fadeIn">
        <div class="navbar-brand-icon" style="width: 48px; height: 48px; margin: 0 auto 24px;">
          <span class="material-symbols-outlined" style="font-size: 32px;">terminal</span>
        </div>
        <div style="font-size: 20px; font-weight: 700; letter-spacing: 0.1em; color: white;">MARCOS_SYS</div>
        <div style="width: 140px; height: 1px; background: #262626; margin: 24px auto; position: relative; overflow: hidden;">
            <div id="splash-loader" style="position: absolute; left: -100%; top: 0; width: 100%; height: 100%; background: var(--accent); transition: left 1.5s ease-in-out;"></div>
        </div>
      </div>
    `;

    app.prepend(splash);

    // Animate loader
    setTimeout(() => {
      const loader = splash.querySelector('#splash-loader');
      if (loader) loader.style.left = '0%';
    }, 100);

    // Exit
    setTimeout(() => {
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.remove();
        resolve();
      }, 600);
    }, 2000);
  });
}
