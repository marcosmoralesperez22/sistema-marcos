// =============================================
// TOAST — Notification component
// =============================================

export function showToast(type = 'info', title = '', description = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    achievement: '🏆',
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-content">
      <div class="toast-title" style="font-weight: 700; font-size: 14px;">${title}</div>
      ${description ? `<div class="toast-desc" style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${description}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  // Auto remove after 4s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
