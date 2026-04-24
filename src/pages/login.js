// =============================================
// LOGIN PAGE — Premium Glassmorphic Aesthetic
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

  // Create login overlay
  let loginEl = document.getElementById('login-screen');
  if (!loginEl) {
    loginEl = document.createElement('div');
    loginEl.id = 'login-screen';
    app.appendChild(loginEl);
  }

  // Premium glass overlay styling
  loginEl.className = 'login-overlay animate-fadeIn';
  loginEl.innerHTML = `
    <!-- Animated background gradient container -->
    <div style="position: absolute; inset: 0; z-index: -1; overflow: hidden; background: #0a0a0f;">
       <div style="position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(235,90,30,0.15) 0%, transparent 70%); border-radius: 50%; filter: blur(80px); animation: float1 15s ease-in-out infinite alternate;"></div>
       <div style="position: absolute; bottom: -20%; right: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(50,150,255,0.1) 0%, transparent 70%); border-radius: 50%; filter: blur(100px); animation: float2 20s ease-in-out infinite alternate;"></div>
    </div>
    
    <style>
      @keyframes float1 { 0% { transform: translate(0, 0); } 100% { transform: translate(10%, 10%); } }
      @keyframes float2 { 0% { transform: translate(0, 0); } 100% { transform: translate(-10%, -10%); } }
      .glass-card {
         background: rgba(20, 20, 25, 0.4);
         backdrop-filter: blur(24px);
         -webkit-backdrop-filter: blur(24px);
         border: 1px solid rgba(255, 255, 255, 0.08);
         border-radius: 20px;
         box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
         padding: 40px;
         width: 100%;
         max-width: 380px;
         display: flex;
         flex-direction: column;
         align-items: center;
         transform: translateY(20px);
         animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .glass-input {
         background: rgba(255, 255, 255, 0.03);
         border: 1px solid rgba(255, 255, 255, 0.08);
         color: #fff;
         padding: 14px 16px;
         border-radius: 12px;
         font-family: inherit;
         outline: none;
         transition: all 0.2s ease;
         font-size: 14px;
         width: 100%;
         box-sizing: border-box;
      }
      .glass-input:focus {
         background: rgba(255, 255, 255, 0.06);
         border-color: rgba(235, 90, 30, 0.5);
         box-shadow: 0 0 0 3px rgba(235, 90, 30, 0.15);
      }
      .glass-btn {
         background: linear-gradient(135deg, #FF6B2B 0%, #E55216 100%);
         color: white;
         border: none;
         padding: 14px;
         border-radius: 12px;
         font-weight: 600;
         font-size: 15px;
         cursor: pointer;
         transition: transform 0.1s, box-shadow 0.2s;
         width: 100%;
         margin-top: 16px;
         box-shadow: 0 8px 20px rgba(235, 90, 30, 0.3);
      }
      .glass-btn:hover {
         transform: translateY(-1px);
         box-shadow: 0 12px 24px rgba(235, 90, 30, 0.4);
      }
      .glass-btn:active {
         transform: translateY(1px);
         box-shadow: 0 4px 10px rgba(235, 90, 30, 0.3);
      }
      .glass-btn:disabled {
         background: rgba(255, 255, 255, 0.1);
         color: rgba(255, 255, 255, 0.4);
         box-shadow: none;
         cursor: not-allowed;
         transform: none;
      }
      @keyframes slideUpFade { to { transform: translateY(0); opacity: 1; } }
    </style>

    <div class="glass-card" style="opacity: 0;">
      <div style="margin-bottom: 32px; text-align: center;">
        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(235,90,30,0.2) 0%, rgba(235,90,30,0.05) 100%); border: 1px solid rgba(235,90,30,0.3); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
          <span class="material-symbols-outlined" style="font-size: 28px; color: #FF6B2B;">terminal</span>
        </div>
        <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.03em; margin: 0 0 6px 0; color: #fff;">Sistema MARCOS</h1>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0;">Acceso autorizado requerido</p>
      </div>

      <form id="login-form" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
        <div>
          <label style="font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.05em;">Usuario</label>
          <input type="text" id="login-user" class="glass-input" placeholder="Nombre de usuario" />
        </div>
        <div>
          <label style="font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.6); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.05em;">Contraseña</label>
          <input type="password" id="login-pass" class="glass-input" placeholder="••••••••" />
        </div>
        <div id="login-error" style="color: #ff5e5e; font-size: 13px; height: 16px; text-align: center; font-weight: 500;"></div>
        <button type="submit" class="glass-btn">Entrar al Sistema</button>
      </form>

      <div style="margin-top: 32px; text-align: center; color: rgba(255,255,255,0.3); font-size: 11px; letter-spacing: 0.02em;">
        MARCOS_SYS v3.0 &copy; 2026
      </div>
    </div>
  `;

  // Apply basic center positioning
  Object.assign(loginEl.style, {
    position: 'fixed',
    top: '0', left: '0', right: '0', bottom: '0',
    backgroundColor: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '2000'
  });

  // Handle form submit
  loginEl.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginEl.querySelector('#login-user').value.trim();
    const password = loginEl.querySelector('#login-pass').value;
    const errorEl = loginEl.querySelector('#login-error');
    const btn = loginEl.querySelector('button');

    if (!username || !password) {
      errorEl.textContent = 'Introduce usuario y contraseña';
      loginEl.querySelector('.glass-card').style.animation = 'none';
      void loginEl.querySelector('.glass-card').offsetWidth; // Trigger reflow
      loginEl.querySelector('.glass-card').style.animation = 'shake 0.4s ease-in-out';

      // Inline shake animation if not defined class
      if (!document.getElementById('shake-style')) {
        const style = document.createElement('style');
        style.id = 'shake-style';
        style.innerHTML = `@keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-5px);} 75% {transform: translateX(5px);} }`;
        document.head.appendChild(style);
      }
      return;
    }

    btn.textContent = 'Autenticando...';
    btn.disabled = true;

    try {
      await api.login(username, password);
      // Success
      loginEl.style.opacity = '0';
      loginEl.style.transition = 'opacity 0.4s ease';
      loginEl.querySelector('.glass-card').style.transform = 'translateY(-20px)';
      loginEl.querySelector('.glass-card').style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      loginEl.querySelector('.glass-card').style.opacity = '0';

      setTimeout(() => {
        loginEl.remove();
        if (topbar) topbar.style.display = '';
        if (layout) layout.style.display = '';
        if (notif) notif.style.display = '';
        onSuccess();
      }, 400);
    } catch (err) {
      errorEl.textContent = 'Credenciales no válidas';
      btn.textContent = 'Entrar al Sistema';
      btn.disabled = false;

      loginEl.querySelector('.glass-card').style.animation = 'none';
      void loginEl.querySelector('.glass-card').offsetWidth;
      loginEl.querySelector('.glass-card').style.animation = 'shake 0.4s ease-in-out';
    }
  });
}
