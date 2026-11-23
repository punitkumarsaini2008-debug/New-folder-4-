// ==============================================================================
// Multi-OS Cybersecurity Platform - Desktop Environment & Icon Manager
// Supports Parrot, Ubuntu, Kali, Linux Mint, & Fedora desktops
// ==============================================================================

class DesktopManager {
  constructor() {
    this.container = document.getElementById('desktop-icons-container');
    this.selectionBox = document.getElementById('selection-box');
    this.desktop = document.getElementById('desktop');
    this.selectedIcons = new Set();
    this.contextMenu = null;

    this.initDesktopIcons();
    this.initSelectionMarquee();
    this.initContextMenu();
  }

  initDesktopIcons() {
    if (!this.container) return;

    const icons = [
      { id: 'practicelabs', title: '500 Cyber Labs', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`, action: () => window.openPracticeLabsApp() },
      { id: 'cyberlab', title: 'Cyber Lab', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#05d550" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`, action: () => window.openCyberLabApp() },
      { id: 'toolcenter', title: 'Tool Center', icon: this.getIconSvg('grid'), action: () => window.openToolCenterApp() },
      { id: 'learninglab', title: 'Security Labs', icon: this.getIconSvg('book'), action: () => window.openLearningLabApp() },
      { id: 'reports', title: 'Report Center', icon: this.getIconSvg('report'), action: () => window.openReportCenterApp() },
      { id: 'terminal', title: 'Terminal', icon: this.getIconSvg('terminal'), action: () => window.openTerminalApp() },
      { id: 'files', title: 'Files', icon: this.getIconSvg('folder'), action: () => window.openFileManagerApp() },
      { id: 'browser', title: 'Web Browser', icon: this.getIconSvg('browser'), action: () => window.openBrowserApp() },
      { id: 'pythonide', title: 'Python IDE', icon: this.getIconSvg('code'), action: () => window.openPythonIdeApp() },
      { id: 'cide', title: 'C Compiler', icon: this.getIconSvg('cpu'), action: () => window.openCIdeApp() },
      { id: 'nmap', title: 'Nmap Scanner', icon: this.getIconSvg('radar'), action: () => window.openNmapApp() },
      { id: 'wireshark', title: 'Wireshark', icon: this.getIconSvg('shark'), action: () => window.openWiresharkApp() },
      { id: 'burp', title: 'Burp Suite', icon: this.getIconSvg('shield'), action: () => window.openBurpSuiteApp() },
      { id: 'ghidra', title: 'Ghidra', icon: this.getIconSvg('cpu'), action: () => window.openGhidraApp() },
      { id: 'calculator', title: 'Calculator', icon: this.getIconSvg('calc'), action: () => window.openCalculatorApp() },
      { id: 'netmon', title: 'Network Monitor', icon: this.getIconSvg('network'), action: () => window.openNetworkMonitorApp() },
      { id: 'sysmon', title: 'System Monitor', icon: this.getIconSvg('activity'), action: () => window.openSystemMonitorApp() },
      { id: 'software', title: 'Software Center', icon: this.getIconSvg('package'), action: () => window.openSoftwareCenterApp() },
      { id: 'pdf', title: 'Lab Manual PDF', icon: this.getIconSvg('pdf'), action: () => window.openPdfReaderApp() },
      { id: 'novnc', title: 'noVNC Remote', icon: this.getIconSvg('monitor'), action: () => window.openNoVNCApp() },
      { id: 'settings', title: 'Settings', icon: this.getIconSvg('settings'), action: () => window.openSettingsApp() },
      { id: 'switchos', title: 'Switch OS', icon: this.getIconSvg('refresh'), action: () => window.showOsBootloader() }
    ];

    this.container.innerHTML = '';

    icons.forEach(item => {
      const el = document.createElement('div');
      el.className = 'desktop-icon';
      el.id = `dicon-${item.id}`;
      el.innerHTML = `
        <div class="desktop-icon-img-wrap">${item.icon}</div>
        <div class="desktop-icon-title">${item.title}</div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!e.ctrlKey) this.clearSelection();
        this.selectIcon(el);
      });

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        item.action();
      });

      this.container.appendChild(el);
    });

    this.desktop.addEventListener('click', (e) => {
      if (!e.target.closest('.desktop-icon')) {
        this.clearSelection();
      }
    });
  }

  selectIcon(el) {
    el.classList.add('selected');
    this.selectedIcons.add(el);
  }

  clearSelection() {
    this.selectedIcons.forEach(el => el.classList.remove('selected'));
    this.selectedIcons.clear();
  }

  initSelectionMarquee() {
    if (!this.desktop || !this.selectionBox) return;

    let isSelecting = false;
    let startX = 0, startY = 0;

    this.desktop.addEventListener('mousedown', (e) => {
      if (e.target.closest('.os-window') || e.target.closest('.desktop-icon') || e.button !== 0) return;
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY - 36;

      this.selectionBox.style.display = 'block';
      this.selectionBox.style.left = `${startX}px`;
      this.selectionBox.style.top = `${startY}px`;
      this.selectionBox.style.width = '0px';
      this.selectionBox.style.height = '0px';

      const onMouseMove = (moveEvent) => {
        if (!isSelecting) return;
        const currentX = moveEvent.clientX;
        const currentY = moveEvent.clientY - 36;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        this.selectionBox.style.left = `${left}px`;
        this.selectionBox.style.top = `${top}px`;
        this.selectionBox.style.width = `${width}px`;
        this.selectionBox.style.height = `${height}px`;

        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
          const rect = icon.getBoundingClientRect();
          const iconTop = rect.top - 36;
          const intersect = !(
            rect.right < left ||
            rect.left > left + width ||
            iconTop + rect.height < top ||
            iconTop > top + height
          );
          if (intersect) {
            icon.classList.add('selected');
            this.selectedIcons.add(icon);
          } else if (!moveEvent.ctrlKey) {
            icon.classList.remove('selected');
            this.selectedIcons.delete(icon);
          }
        });
      };

      const onMouseUp = () => {
        isSelecting = false;
        this.selectionBox.style.display = 'none';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  initContextMenu() {
    this.contextMenu = document.createElement('div');
    this.contextMenu.id = 'desktop-context-menu';
    this.contextMenu.style.cssText = `
      position: fixed;
      display: none;
      background: #141c28;
      border: 1px solid rgba(0, 229, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 229, 255, 0.2);
      border-radius: var(--radius-sm);
      padding: 6px 0;
      z-index: var(--z-contextmenu);
      width: 220px;
      backdrop-filter: blur(12px);
    `;

    document.body.appendChild(this.contextMenu);

    this.desktop.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => {
      this.contextMenu.style.display = 'none';
    });
  }

  showContextMenu(x, y) {
    this.contextMenu.innerHTML = `
      <div class="menu-item" onclick="window.showOsBootloader()">
        <span class="menu-item-icon">${this.getIconSvg('refresh')}</span> Switch Operating System
      </div>
      <div style="height:1px; background:rgba(0,229,255,0.12); margin:4px 0;"></div>
      <div class="menu-item" onclick="window.openToolCenterApp()">
        <span class="menu-item-icon">${this.getIconSvg('grid')}</span> Tool Center (34 Tools)
      </div>
      <div class="menu-item" onclick="window.openLearningLabApp()">
        <span class="menu-item-icon">${this.getIconSvg('book')}</span> Cybersecurity Labs
      </div>
      <div class="menu-item" onclick="window.openReportCenterApp()">
        <span class="menu-item-icon">${this.getIconSvg('report')}</span> Report Center (PDF/CSV)
      </div>
      <div style="height:1px; background:rgba(0,229,255,0.12); margin:4px 0;"></div>
      <div class="menu-item" onclick="window.openTerminalApp()">
        <span class="menu-item-icon">${this.getIconSvg('terminal')}</span> Open Terminal
      </div>
      <div class="menu-item" onclick="window.openFileManagerApp()">
        <span class="menu-item-icon">${this.getIconSvg('folder')}</span> Open Files
      </div>
      <div class="menu-item" onclick="window.openPythonIdeApp()">
        <span class="menu-item-icon">${this.getIconSvg('code')}</span> Python 3 IDE
      </div>
      <div style="height:1px; background:rgba(0,229,255,0.12); margin:4px 0;"></div>
      <div class="menu-item" onclick="window.osManager.lock()">
        <span class="menu-item-icon">${this.getIconSvg('lock')}</span> Lock Session (Ctrl+Alt+L)
      </div>
      <div class="menu-item" onclick="window.openSettingsApp('wallpaper')">
        <span class="menu-item-icon">${this.getIconSvg('image')}</span> Change Wallpaper
      </div>
    `;

    this.contextMenu.style.display = 'block';
    this.contextMenu.style.left = `${Math.min(x, window.innerWidth - 230)}px`;
    this.contextMenu.style.top = `${Math.min(y, window.innerHeight - 340)}px`;
  }

  getIconSvg(type) {
    const svgs = {
      grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      report: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
      terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
      folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
      browser: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      radar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>`,
      shark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c4 0 6-4 10-4 5 0 8 4 10 4-2 0-5 4-10 4-4 0-6-4-10-4z"></path><circle cx="15" cy="11" r="1"></circle></svg>`,
      shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>`,
      calc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line></svg>`,
      network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="6" height="6" rx="1"></rect><rect x="16" y="2" width="6" height="6" rx="1"></rect><rect x="9" y="16" width="6" height="6" rx="1"></rect><path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"></path><line x1="12" y1="13" x2="12" y2="16"></line></svg>`,
      activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
      package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
      pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
      monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
      settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
      lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
      image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
    };
    return svgs[type] || svgs.terminal;
  }
}

window.desktopManager = new DesktopManager();
