// ==============================================================================
// ParrotCloud OS - Desktop Environment & Icon Manager
// Drag-and-drop icon arrangement, selection marquee, & context menus
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
      { id: 'terminal', title: 'Bash Terminal', icon: this.getIconSvg('terminal'), action: () => window.openTerminalApp() },
      { id: 'files', title: 'File Manager', icon: this.getIconSvg('folder'), action: () => window.openFileManagerApp() },
      { id: 'nmap', title: 'Nmap Scanner', icon: this.getIconSvg('radar'), action: () => window.openNmapApp() },
      { id: 'wireshark', title: 'Wireshark', icon: this.getIconSvg('shark'), action: () => window.openWiresharkApp() },
      { id: 'burp', title: 'Burp Suite', icon: this.getIconSvg('shield'), action: () => window.openBurpSuiteApp() },
      { id: 'ghidra', title: 'Ghidra Disasm', icon: this.getIconSvg('cpu'), action: () => window.openGhidraApp() },
      { id: 'zap', title: 'OWASP ZAP', icon: this.getIconSvg('zap'), action: () => window.openOwaspZapApp() },
      { id: 'sysmon', title: 'System Monitor', icon: this.getIconSvg('activity'), action: () => window.openSystemMonitorApp() },
      { id: 'novnc', title: 'noVNC Desktop', icon: this.getIconSvg('monitor'), action: () => window.openNoVNCApp() },
      { id: 'editor', title: 'Text Editor', icon: this.getIconSvg('edit'), action: () => window.openTextEditorApp() },
      { id: 'settings', title: 'Cloud Settings', icon: this.getIconSvg('settings'), action: () => window.openSettingsApp() }
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

      // Selection on click
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!e.ctrlKey) this.clearSelection();
        this.selectIcon(el);
      });

      // Launch on double-click
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        item.action();
      });

      this.container.appendChild(el);
    });

    // Deselect on desktop click
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
      startY = e.clientY - 36; // Adjust for top panel

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

        // Highlight intersected icons
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
      width: 200px;
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
      <div class="menu-item" onclick="window.openTerminalApp()">
        <span class="menu-item-icon">${this.getIconSvg('terminal')}</span> Open Bash Terminal
      </div>
      <div class="menu-item" onclick="window.openFileManagerApp()">
        <span class="menu-item-icon">${this.getIconSvg('folder')}</span> Open Files
      </div>
      <div style="height:1px; background:rgba(0,229,255,0.12); margin:4px 0;"></div>
      <div class="menu-item" onclick="window.openNmapApp()">
        <span class="menu-item-icon">${this.getIconSvg('radar')}</span> Launch Nmap
      </div>
      <div class="menu-item" onclick="window.openWiresharkApp()">
        <span class="menu-item-icon">${this.getIconSvg('shark')}</span> Launch Wireshark
      </div>
      <div class="menu-item" onclick="window.openBurpSuiteApp()">
        <span class="menu-item-icon">${this.getIconSvg('shield')}</span> Launch Burp Suite
      </div>
      <div style="height:1px; background:rgba(0,229,255,0.12); margin:4px 0;"></div>
      <div class="menu-item" onclick="window.openSettingsApp('wallpaper')">
        <span class="menu-item-icon">${this.getIconSvg('image')}</span> Change Wallpaper
      </div>
      <div class="menu-item" onclick="window.openSettingsApp('cloud')">
        <span class="menu-item-icon">${this.getIconSvg('settings')}</span> Cloud VM Settings
      </div>
    `;

    this.contextMenu.style.display = 'block';
    this.contextMenu.style.left = `${Math.min(x, window.innerWidth - 210)}px`;
    this.contextMenu.style.top = `${Math.min(y, window.innerHeight - 280)}px`;
  }

  getIconSvg(type) {
    const svgs = {
      terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
      folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
      radar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>`,
      shark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c4 0 6-4 10-4 5 0 8 4 10 4-2 0-5 4-10 4-4 0-6-4-10-4z"></path><circle cx="15" cy="11" r="1"></circle></svg>`,
      shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
      zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
      monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
      edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
      settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
      image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
    };
    return svgs[type] || svgs.terminal;
  }
}

window.desktopManager = new DesktopManager();
