// ==============================================================================
// ParrotCloud OS - Cybersecurity Alerts & System Notifications
// ==============================================================================

class NotificationManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'notifications-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: var(--z-notifications);
      pointer-events: none;
      max-width: 360px;
    `;
    document.body.appendChild(this.container);
  }

  show(title, message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `notification-toast toast-${type}`;
    toast.style.cssText = `
      pointer-events: auto;
      background: rgba(18, 25, 36, 0.95);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-left: 4px solid ${type === 'danger' ? '#ff3366' : type === 'warning' ? '#ffcc00' : '#00e5ff'};
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 229, 255, 0.2);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: #e6edf3;
      font-size: 12px;
      backdrop-filter: blur(12px);
      animation: toastSlideIn 0.25s ease-out;
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    toast.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; color:${type === 'danger' ? '#ff3366' : type === 'warning' ? '#ffcc00' : '#00e5ff'}; font-size:12px; letter-spacing:0.5px;">${title}</span>
        <button style="color:#8b949e; cursor:pointer; font-size:14px; line-height:1;" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
      <div style="color:#8b949e; font-size:11px; line-height:1.4;">${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'toastSlideOut 0.2s ease-in forwards';
        setTimeout(() => toast.remove(), 200);
      }
    }, duration);
  }
}

// Global instance
window.notifications = new NotificationManager();
