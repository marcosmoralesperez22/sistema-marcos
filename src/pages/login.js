// =============================================
// LOGIN PAGE - MarcosOS Access
// =============================================

import { api } from '../data/api.js';

export function renderLogin(onSuccess) {
  const app = document.body;
  const topbar = document.getElementById('topbar');
  const layout = document.getElementById('layout');
  const notif = document.getElementById('notif');

  if (topbar) topbar.style.display = 'none';
  if (layout) layout.style.display = 'none';
  if (notif) notif.style.display = 'none';

  let loginEl = document.getElementById('login-screen');
  if (!loginEl) {
    loginEl = document.createElement('div');
    loginEl.id = 'login-screen';
    app.appendChild(loginEl);
  }

  loginEl.className = 'login-overlay animate-fadeIn';
  loginEl.innerHTML = `
    <div class="login-bg" aria-hidden="true">
      <div class="login-grid"></div>
      <div class="login-scanline"></div>
      <div class="login-particles">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>

    <main class="login-shell">
      <section class="login-hero" aria-label="Sistema MARCOS">
        <div class="login-brand-row">
          <div class="login-logo" aria-hidden="true">
            <span class="login-logo-mark">M</span>
            <span class="login-logo-pulse"></span>
          </div>
          <div>
            <p class="login-kicker">MarcosOS</p>
            <h1>Sistema MARCOS</h1>
          </div>
        </div>

        <p class="login-copy">
          Panel personal de misiones, habitos, salud y foco. Tu partida diaria empieza aqui.
        </p>

        <div class="login-status-grid">
          <div>
            <span>Estado</span>
            <strong>Online</strong>
          </div>
          <div>
            <span>Modo</span>
            <strong>Life RPG</strong>
          </div>
          <div>
            <span>Acceso</span>
            <strong>Local</strong>
          </div>
        </div>
      </section>

      <section class="login-card">
        <div class="login-card-head">
          <div>
            <p class="login-kicker">Acceso autorizado</p>
            <h2>Iniciar sesion</h2>
          </div>
          <span class="material-symbols-outlined" aria-hidden="true">lock_open</span>
        </div>

        <form id="login-form" class="login-form">
          <label class="login-field">
            <span>Usuario</span>
            <input type="text" id="login-user" class="login-input" autocomplete="username" />
          </label>
          <label class="login-field">
            <span>Contrasena</span>
            <div class="login-password-row">
              <input type="password" id="login-pass" class="login-input" autocomplete="current-password" />
              <button type="button" id="login-toggle-pass" class="login-icon-btn" aria-label="Mostrar contrasena">
                <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
              </button>
            </div>
          </label>
          <div id="login-error" class="login-error" role="status" aria-live="polite"></div>
          <button type="submit" class="login-submit">
            <span class="material-symbols-outlined" aria-hidden="true">login</span>
            Entrar al sistema
          </button>
        </form>

        <div class="login-footer">
          <span>MARCOS_SYS v3.0</span>
          <span>2026</span>
        </div>
      </section>
    </main>
  `;

  Object.assign(loginEl.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: '#15120f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '2000'
  });

  const userInput = loginEl.querySelector('#login-user');
  const passInput = loginEl.querySelector('#login-pass');
  const card = loginEl.querySelector('.login-card');

  loginEl.querySelector('#login-toggle-pass').addEventListener('click', (e) => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    e.currentTarget.setAttribute('aria-label', isHidden ? 'Ocultar contrasena' : 'Mostrar contrasena');
    e.currentTarget.querySelector('.material-symbols-outlined').textContent = isHidden ? 'visibility_off' : 'visibility';
  });

  loginEl.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = userInput.value.trim();
    const password = passInput.value;
    const errorEl = loginEl.querySelector('#login-error');
    const btn = loginEl.querySelector('.login-submit');

    if (!username || !password) {
      errorEl.textContent = 'Introduce usuario y contrasena';
      card.classList.remove('is-shaking');
      void card.offsetWidth;
      card.classList.add('is-shaking');
      return;
    }

    btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">progress_activity</span> Autenticando...';
    btn.disabled = true;

    try {
      await api.login(username, password);
      loginEl.classList.add('is-leaving');
      card.classList.add('is-success');

      setTimeout(() => {
        loginEl.remove();
        if (topbar) topbar.style.display = '';
        if (layout) layout.style.display = '';
        if (notif) notif.style.display = '';
        onSuccess();
      }, 420);
    } catch (err) {
      errorEl.textContent = 'Credenciales no validas';
      btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">login</span> Entrar al sistema';
      btn.disabled = false;
      card.classList.remove('is-shaking');
      void card.offsetWidth;
      card.classList.add('is-shaking');
    }
  });
}
