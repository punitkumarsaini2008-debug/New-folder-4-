// ==============================================================================
// Multi-OS Cybersecurity Platform - Top Panel, Left Dock & Bottom Bar
// Supports Parrot MATE, Ubuntu Dash, Kali XFCE, Mint Cinnamon, & Fedora
// ==============================================================================

class TopPanel {
  constructor() {
    this.menuOpen = false;
    this.menuBtn = document.getElementById('app-menu-btn');
    this.mintMenuBtn = document.getElementById('mint-menu-btn');
    this.menuDropdown = document.getElementById('app-menu-dropdown');
    this.searchInput = document.getElementById('menu-search-input');
    this.clockEl = document.getElementById('panel-clock');
    this.mintClockEl = document.getElementById('mint-clock');

    this.init();
  }

  init() {
    // Toggle Applications menu (Top Panel)
    if (this.menuBtn) {
      this.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // Toggle Menu from Linux Mint bottom bar
    if (this.mintMenuBtn) {
      this.mintMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (this.menuOpen && !e.target.closest('#app-menu-dropdown') && !e.target.closest('#app-menu-btn') && !e.target.closest('#mint-menu-btn')) {
        this.closeMenu();
      }
    });

    // Menu search filter
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('.menu-item');
        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    // Quick launch shortcuts & dock items
    this.bindQuickLaunch();
    this.bindWorkspaces();

    // Clock updater
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Cloud connection status indicator toggle
    const cloudStatusBadge = document.getElementById('panel-cloud-status');
    if (cloudStatusBadge) {
      cloudStatusBadge.addEventListener('click', () => {
        window.openSettingsApp('cloud');
      });
    }

    // Lock button
    const lockBtn = document.getElementById('panel-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => window.osManager?.lock());
    }

    // Cyber Lab Navigation Button
    const navCyberLab = document.getElementById('nav-cyber-lab-btn');
    if (navCyberLab) {
      navCyberLab.addEventListener('click', () => window.openCyberLabApp());
    }

    // 500 Cyber Security Practice Labs Navigation Button
    const navPracticeLabs = document.getElementById('nav-practice-labs-btn');
    if (navPracticeLabs) {
      navPracticeLabs.addEventListener('click', () => window.openPracticeLabsApp());
    }

    // OS Switcher button
    const osSwitcherBtn = document.getElementById('panel-os-btn');
    if (osSwitcherBtn) {
      osSwitcherBtn.addEventListener('click', () => window.showOsBootloader());
    }

    // User Profile / Auth Button
    const panelAuthBtn = document.getElementById('panel-auth-btn');
    if (panelAuthBtn) {
      panelAuthBtn.addEventListener('click', () => {
        if (window.authManager && window.authManager.isAuthenticated()) {
          window.openUserDashboardApp();
        } else {
          window.openAuthApp('login');
        }
      });
    }

    // Sync User Badge with Auth State
    if (window.authManager) {
      const updatePanelUser = (user) => {
        const nameEl = document.getElementById('panel-user-name');
        const roleEl = document.getElementById('panel-user-role');
        const avatarEl = document.getElementById('panel-user-avatar');
        if (user) {
          if (nameEl) nameEl.textContent = user.username || user.name || 'User';
          if (roleEl) {
            const role = (user.role || 'student').toLowerCase();
            roleEl.textContent = role.toUpperCase();
            roleEl.className = `user-role-pill ${role}`;
          }
          if (avatarEl) avatarEl.textContent = (user.username || 'U')[0].toUpperCase();
        } else {
          if (nameEl) nameEl.textContent = 'Sign In';
          if (roleEl) {
            roleEl.textContent = 'GUEST';
            roleEl.className = 'user-role-pill student';
          }
          if (avatarEl) avatarEl.textContent = '👤';
        }
      };

      window.authManager.on('auth:login', updatePanelUser);
      window.authManager.on('auth:logout', () => updatePanelUser(null));
      window.authManager.on('auth:profile_updated', updatePanelUser);

      // Initial state sync
      const currentUser = window.authManager.getCurrentUser();
      if (currentUser) {
        updatePanelUser(currentUser);
      }
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuDropdown) {
      this.menuDropdown.classList.toggle('open', this.menuOpen);
      if (this.menuOpen && this.searchInput) {
        this.searchInput.value = '';
        this.searchInput.focus();
        document.querySelectorAll('.menu-item').forEach(i => i.style.display = 'flex');
      }
    }
    if (this.menuBtn) {
      this.menuBtn.classList.toggle('active', this.menuOpen);
    }
  }

  closeMenu() {
    this.menuOpen = false;
    if (this.menuDropdown) this.menuDropdown.classList.remove('open');
    if (this.menuBtn) this.menuBtn.classList.remove('active');
  }

  bindQuickLaunch() {
    // Top Panel quick launch
    const qPracticeLabs = document.getElementById('ql-practicelabs');
    const qTerminal = document.getElementById('ql-terminal');
    const qCyberLab = document.getElementById('ql-cyberlab');
    const qFiles = document.getElementById('ql-files');
    const qWireshark = document.getElementById('ql-wireshark');
    const qBurp = document.getElementById('ql-burp');
    const qNmap = document.getElementById('ql-nmap');
    const qTools = document.getElementById('ql-tools');

    if (qPracticeLabs) qPracticeLabs.onclick = () => window.openPracticeLabsApp();
    if (qTerminal) qTerminal.onclick = () => window.openTerminalApp();
    if (qCyberLab) qCyberLab.onclick = () => window.openCyberLabApp();
    if (qFiles) qFiles.onclick = () => window.openFileManagerApp();
    if (qWireshark) qWireshark.onclick = () => window.openWiresharkApp();
    if (qBurp) qBurp.onclick = () => window.openBurpSuiteApp();
    if (qNmap) qNmap.onclick = () => window.openNmapApp();
    if (qTools) qTools.onclick = () => window.openToolCenterApp();

    // Ubuntu Left Dock shortcuts
    const dockTerminal = document.getElementById('dock-terminal');
    const dockCyberLab = document.getElementById('dock-cyberlab');
    const dockFiles = document.getElementById('dock-files');
    const dockBrowser = document.getElementById('dock-browser');
    const dockSoftware = document.getElementById('dock-software');
    const dockPython = document.getElementById('dock-python');
    const dockTools = document.getElementById('dock-tools');
    const dockSettings = document.getElementById('dock-settings');
    const dockSwitcher = document.getElementById('dock-switcher');

    if (dockTerminal) dockTerminal.onclick = () => window.openTerminalApp();
    if (dockCyberLab) dockCyberLab.onclick = () => window.openCyberLabApp();
    if (dockFiles) dockFiles.onclick = () => window.openFileManagerApp();
    if (dockBrowser) dockBrowser.onclick = () => window.openBrowserApp();
    if (dockSoftware) dockSoftware.onclick = () => window.openSoftwareCenterApp();
    if (dockPython) dockPython.onclick = () => window.openPythonIdeApp();
    if (dockTools) dockTools.onclick = () => window.openToolCenterApp();
    if (dockSettings) dockSettings.onclick = () => window.openSettingsApp();
    if (dockSwitcher) dockSwitcher.onclick = () => window.showOsBootloader();
  }

  bindWorkspaces() {
    document.querySelectorAll('.workspace-btn').forEach(btn => {
      btn.onclick = () => {
        const wsNum = parseInt(btn.dataset.ws);
        window.osManager?.switchWorkspace(wsNum);
      };
    });
  }

  updateClock() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formatted = `${day} ${date} ${month}  ${hours}:${minutes}:${seconds}`;
    if (this.clockEl) this.clockEl.textContent = formatted;
    if (this.mintClockEl) this.mintClockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

window.topPanel = new TopPanel();
