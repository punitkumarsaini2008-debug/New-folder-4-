// ==============================================================================
// ParrotCloud OS - Top Panel Bar (MATE Desktop Architecture)
// Applications Menu, Quick Launch, System Telemetry, Clock & Notifications
// ==============================================================================

class TopPanel {
  constructor() {
    this.menuOpen = false;
    this.menuBtn = document.getElementById('app-menu-btn');
    this.menuDropdown = document.getElementById('app-menu-dropdown');
    this.searchInput = document.getElementById('menu-search-input');
    this.clockEl = document.getElementById('panel-clock');

    this.init();
  }

  init() {
    // Toggle Applications menu
    if (this.menuBtn) {
      this.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // Close menu on click outside
    document.addEventListener('click', (e) => {
      if (this.menuOpen && !e.target.closest('#app-menu-dropdown') && !e.target.closest('#app-menu-btn')) {
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

    // Quick launch shortcuts
    this.bindQuickLaunch();

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
    const qTerminal = document.getElementById('ql-terminal');
    const qFiles = document.getElementById('ql-files');
    const qWireshark = document.getElementById('ql-wireshark');
    const qBurp = document.getElementById('ql-burp');
    const qNmap = document.getElementById('ql-nmap');

    if (qTerminal) qTerminal.addEventListener('click', () => window.openTerminalApp());
    if (qFiles) qFiles.addEventListener('click', () => window.openFileManagerApp());
    if (qWireshark) qWireshark.addEventListener('click', () => window.openWiresharkApp());
    if (qBurp) qBurp.addEventListener('click', () => window.openBurpSuiteApp());
    if (qNmap) qNmap.addEventListener('click', () => window.openNmapApp());
  }

  updateClock() {
    if (!this.clockEl) return;
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    this.clockEl.textContent = `${day} ${date} ${month}  ${hours}:${minutes}:${seconds}`;
  }
}

window.topPanel = new TopPanel();
