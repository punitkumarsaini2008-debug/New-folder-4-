// ==============================================================================
// Multi-OS Cybersecurity Platform - OS Manager & Bootloader Controller
// Controls Parrot Security, Ubuntu 24.04, Kali Linux, Linux Mint, & Fedora
// Manages Workspaces, Lock Screen, and Dynamic Desktop Layout Transitions
// ==============================================================================

class OSManager {
  constructor() {
    this.activeOs = localStorage.getItem('active_os') || 'parrot';
    this.currentWorkspace = 1;
    this.totalWorkspaces = 4;
    this.isLocked = false;
    this.init();
  }

  init() {
    // Check if user set a default boot OS
    const defaultOs = localStorage.getItem('default_boot_os');
    const bootloader = document.getElementById('os-bootloader');

    this.renderBootloaderCards();
    this.initKeyboardShortcuts();
    this.initLockScreenEvents();

    if (defaultOs && window.MULTIOS_PROFILES[defaultOs]) {
      this.switchOS(defaultOs, false);
      if (bootloader) bootloader.classList.add('hidden');
    } else {
      // Show OS Selection Bootloader on initial entry
      if (bootloader) bootloader.classList.remove('hidden');
    }
  }

  renderBootloaderCards() {
    const grid = document.getElementById('os-cards-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const profiles = Object.values(window.MULTIOS_PROFILES);

    profiles.forEach(os => {
      const card = document.createElement('div');
      card.className = 'os-card';
      card.style.setProperty('--card-accent', os.accentColor);
      card.style.setProperty('--card-glow', `${os.accentColor}40`);

      card.innerHTML = `
        <div class="os-card-logo-wrap">${this.getOsLogo(os.id)}</div>
        <div class="os-card-name">${os.name}</div>
        <div class="os-card-version">${os.version} • ${os.codename}</div>
        <div class="os-card-desc">${os.subtitle}</div>
        <div class="os-card-features">
          <span class="os-badge">${os.id === 'parrot' ? 'Cyber Arsenal' : os.id === 'ubuntu' ? 'GNOME Dock' : os.id === 'kali' ? 'Pentesting' : os.id === 'mint' ? 'Cinnamon' : 'Forensics'}</span>
          <span class="os-badge">${os.user}@${os.hostname}</span>
          <span class="os-badge">64-bit Core</span>
        </div>
        <button class="os-card-btn" id="btn-launch-${os.id}">
          Launch ${os.name.split(' ')[0]}
        </button>
      `;

      card.addEventListener('click', (e) => {
        const setDefault = document.getElementById('bootloader-set-default')?.checked;
        this.switchOS(os.id, setDefault);
        document.getElementById('os-bootloader')?.classList.add('hidden');
      });

      grid.appendChild(card);
    });
  }

  switchOS(osId, setAsDefault = false) {
    const profile = window.MULTIOS_PROFILES[osId];
    if (!profile) return;

    this.activeOs = osId;
    localStorage.setItem('active_os', osId);
    if (setAsDefault) {
      localStorage.setItem('default_boot_os', osId);
    }

    // Update body theme classes
    document.body.className = `os-theme-${osId}`;

    // Update desktop wallpaper
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.backgroundImage = profile.wallpaper;
    }

    // Update shell engine environment
    if (window.cloudClient && window.cloudClient.localEngine) {
      window.cloudClient.localEngine.setEnvironment(profile);
    }

    // Update panel titles, logo & telemetry
    this.updatePanelAesthetics(profile);

    // Update Desktop icons for the specific OS
    if (window.desktopManager) {
      window.desktopManager.initDesktopIcons();
    }

    window.notifications.show('OS Switcher', `Switched environment to ${profile.name} ${profile.version}`, 'info');
  }

  updatePanelAesthetics(profile) {
    // Update logo in top panel
    const appMenuBtn = document.getElementById('app-menu-btn');
    if (appMenuBtn) {
      const logoSvg = this.getOsLogo(profile.id);
      appMenuBtn.innerHTML = `
        <div style="width:18px;height:18px;display:flex;align-items:center;">${logoSvg}</div>
        <span>${profile.id === 'ubuntu' ? 'Activities' : profile.id === 'mint' ? 'Menu' : 'Applications'}</span>
      `;
    }

    // Update cloud status badge
    const badge = document.getElementById('panel-cloud-status');
    if (badge) {
      const textSpan = badge.querySelector('span:last-child');
      if (textSpan) textSpan.textContent = profile.name.split(' ')[0].toUpperCase();
    }

    // Update Mint Bottom Panel logo
    const mintMenuBtn = document.getElementById('mint-menu-btn');
    if (mintMenuBtn) {
      mintMenuBtn.innerHTML = `
        <div style="width:20px;height:20px;">${this.getOsLogo('mint')}</div>
        <span>Menu</span>
      `;
    }
  }

  // Workspaces Management
  switchWorkspace(num) {
    num = Math.max(1, Math.min(this.totalWorkspaces, num));
    this.currentWorkspace = num;

    // Update UI buttons
    document.querySelectorAll('.workspace-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.ws) === num);
    });

    // Filter open windows by workspace
    if (window.windowManager) {
      window.windowManager.windows.forEach(w => {
        if (!w.workspace) w.workspace = 1;
        if (w.workspace === num && !w.isMinimized) {
          w.element.style.display = 'flex';
        } else {
          w.element.style.display = 'none';
        }
      });
    }

    window.notifications.show('Workspace', `Switched to Workspace ${num}`, 'info', 1500);
  }

  // Lock Screen
  lock() {
    this.isLocked = true;
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
      const profile = window.MULTIOS_PROFILES[this.activeOs];
      const userEl = document.getElementById('lock-user-display');
      if (userEl) userEl.textContent = `${profile.user}@${profile.hostname}`;
      lockScreen.classList.add('active');
      this.updateLockClock();
      document.getElementById('lock-password-input')?.focus();
    }
  }

  unlock() {
    this.isLocked = false;
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) lockScreen.classList.remove('active');
    const pwdInput = document.getElementById('lock-password-input');
    if (pwdInput) pwdInput.value = '';
    window.notifications.show('Security', 'Session unlocked successfully', 'info', 2000);
  }

  updateLockClock() {
    const clockEl = document.getElementById('lock-clock-time');
    const dateEl = document.getElementById('lock-clock-date');
    if (!clockEl || !dateEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  initLockScreenEvents() {
    const unlockBtn = document.getElementById('lock-unlock-btn');
    const pwdInput = document.getElementById('lock-password-input');

    if (unlockBtn) unlockBtn.onclick = () => this.unlock();
    if (pwdInput) {
      pwdInput.onkeydown = (e) => {
        if (e.key === 'Enter') this.unlock();
      };
    }

    setInterval(() => {
      if (this.isLocked) this.updateLockClock();
    }, 1000);
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + Alt + T: Launch Terminal
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        window.openTerminalApp();
      }
      // Ctrl + Alt + L / Super + L: Lock Screen
      else if ((e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') || (e.key.toLowerCase() === 'l' && e.metaKey)) {
        e.preventDefault();
        this.lock();
      }
      // Ctrl + Shift + W: Cycle Workspaces
      else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        const nextWs = (this.currentWorkspace % this.totalWorkspaces) + 1;
        this.switchWorkspace(nextWs);
      }
      // Super / Win Key alone: Toggle Start Menu
      else if (e.key === 'Meta' && !e.ctrlKey && !e.altKey) {
        window.topPanel?.toggleMenu();
      }
    });
  }

  showBootloader() {
    const bootloader = document.getElementById('os-bootloader');
    if (bootloader) bootloader.classList.remove('hidden');
  }

  getOsLogo(osId) {
    switch (osId) {
      case 'parrot':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M7 11l5-5 5 5"></path><path d="M12 6v12"></path></svg>`;
      case 'ubuntu':
        return `<svg viewBox="0 0 24 24" fill="#E95420"><circle cx="12" cy="12" r="10" fill="#E95420"/><circle cx="12" cy="12" r="6" fill="#ffffff"/><circle cx="12" cy="12" r="4" fill="#E95420"/><circle cx="5" cy="12" r="1.5" fill="#ffffff"/><circle cx="16" cy="6" r="1.5" fill="#ffffff"/><circle cx="16" cy="18" r="1.5" fill="#ffffff"/></svg>`;
      case 'kali':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#2a7fff" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`;
      case 'mint':
        return `<svg viewBox="0 0 24 24" fill="#87CF3E"><rect x="3" y="3" width="18" height="18" rx="4" fill="#87CF3E"/><path d="M8 8h2v8H8zm4 0h2v5a1 1 0 0 0 2 0V8h2v5a3 3 0 0 1-6 0z" fill="#ffffff"/></svg>`;
      case 'fedora':
        return `<svg viewBox="0 0 24 24" fill="#3C6EB4"><circle cx="12" cy="12" r="10" fill="#3C6EB4"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0zm4-2v4m-2-2h4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
    }
  }
}

window.osManager = new OSManager();
window.showOsBootloader = () => window.osManager.showBootloader();
