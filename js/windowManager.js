// ==============================================================================
// ParrotCloud OS - Window Manager (MATE / XFCE Multi-Window Architecture)
// Dragging, 8-Handle Resizing, Edge Snapping, Z-Stacking, Taskbar Synchronization
// ==============================================================================

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.activeWindow = null;
    this.baseZIndex = 100;
    this.currentZIndex = 100;
    this.snapPreview = document.getElementById('snap-preview');
    this.panelTasks = document.getElementById('panel-tasks');

    this.initGlobalEvents();
  }

  initGlobalEvents() {
    // Window snapping preview element
    if (!this.snapPreview) {
      this.snapPreview = document.createElement('div');
      this.snapPreview.id = 'snap-preview';
      document.body.appendChild(this.snapPreview);
    }
  }

  createWindow({ id, title, icon, width = 760, height = 480, content, onFocus, onClose }) {
    // If window already exists, bring to front
    if (this.windows.has(id)) {
      const existing = this.windows.get(id);
      this.restoreWindow(id);
      this.focusWindow(id);
      return existing;
    }

    const desktop = document.getElementById('desktop');
    const win = document.createElement('div');
    win.className = 'os-window';
    win.id = `win-${id}`;

    // Cascade positioning
    const offset = (this.windows.size * 26) % 200;
    const initialLeft = Math.max(20, Math.min(window.innerWidth - width - 20, 80 + offset));
    const initialTop = Math.max(10, Math.min(window.innerHeight - height - 60, 40 + offset));

    win.style.left = `${initialLeft}px`;
    win.style.top = `${initialTop}px`;
    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
    win.style.zIndex = ++this.currentZIndex;

    win.innerHTML = `
      <div class="window-titlebar" id="titlebar-${id}">
        <div class="window-title-group">
          <div class="window-icon">${icon || ''}</div>
          <div class="window-title">${title}</div>
        </div>
        <div class="window-controls">
          <button class="win-btn minimize" title="Minimize" id="min-${id}">_</button>
          <button class="win-btn maximize" title="Maximize" id="max-${id}">□</button>
          <button class="win-btn close" title="Close" id="close-${id}">×</button>
        </div>
      </div>
      <div class="window-content" id="content-${id}"></div>
      <!-- 8 Resizing Handles -->
      <div class="win-resize-handle win-resize-n" data-dir="n"></div>
      <div class="win-resize-handle win-resize-s" data-dir="s"></div>
      <div class="win-resize-handle win-resize-e" data-dir="e"></div>
      <div class="win-resize-handle win-resize-w" data-dir="w"></div>
      <div class="win-resize-handle win-resize-ne" data-dir="ne"></div>
      <div class="win-resize-handle win-resize-nw" data-dir="nw"></div>
      <div class="win-resize-handle win-resize-se" data-dir="se"></div>
      <div class="win-resize-handle win-resize-sw" data-dir="sw"></div>
    `;

    desktop.appendChild(win);

    // Mount content
    const contentContainer = win.querySelector(`#content-${id}`);
    if (typeof content === 'string') {
      contentContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      contentContainer.appendChild(content);
    }

    const winData = {
      id,
      title,
      icon,
      element: win,
      contentEl: contentContainer,
      isMaximized: false,
      isMinimized: false,
      workspace: window.osManager ? window.osManager.currentWorkspace : 1,
      preMaximizeRect: null,
      onFocus,
      onClose
    };

    this.windows.set(id, winData);

    // Setup interactions
    this.setupWindowInteractions(winData);
    this.createTaskbarButton(winData);
    this.focusWindow(id);

    return winData;
  }

  setupWindowInteractions(winData) {
    const { id, element } = winData;
    const titlebar = element.querySelector(`#titlebar-${id}`);

    // Click to focus
    element.addEventListener('mousedown', () => this.focusWindow(id));

    // Titlebar dragging
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let winStartX = 0, winStartY = 0;
    let snapTarget = null;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      isDragging = true;
      this.focusWindow(id);

      // If dragging while maximized, restore first
      if (winData.isMaximized) {
        this.toggleMaximize(id);
        winStartX = e.clientX - element.offsetWidth / 2;
        winStartY = e.clientY - 15;
      } else {
        winStartX = element.offsetLeft;
        winStartY = element.offsetTop;
      }

      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const dx = moveEvent.clientX - dragStartX;
        const dy = moveEvent.clientY - dragStartY;
        const newLeft = winStartX + dx;
        const newTop = Math.max(0, winStartY + dy);

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;

        // Edge snapping detection
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const panelH = 36;

        if (moveEvent.clientY <= 8) {
          snapTarget = 'maximize';
          this.showSnapPreview(0, 0, screenW, screenH - panelH);
        } else if (moveEvent.clientX <= 8) {
          snapTarget = 'left';
          this.showSnapPreview(0, 0, screenW / 2, screenH - panelH);
        } else if (moveEvent.clientX >= screenW - 8) {
          snapTarget = 'right';
          this.showSnapPreview(screenW / 2, 0, screenW / 2, screenH - panelH);
        } else {
          snapTarget = null;
          this.hideSnapPreview();
        }
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        this.hideSnapPreview();

        if (snapTarget === 'maximize') {
          this.toggleMaximize(id);
        } else if (snapTarget === 'left') {
          this.snapWindow(id, 0, 0, window.innerWidth / 2, window.innerHeight - 36);
        } else if (snapTarget === 'right') {
          this.snapWindow(id, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight - 36);
        }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // Double click titlebar to maximize/restore
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.window-controls')) return;
      this.toggleMaximize(id);
    });

    // Window controls
    element.querySelector(`#min-${id}`).addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(id);
    });

    element.querySelector(`#max-${id}`).addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize(id);
    });

    element.querySelector(`#close-${id}`).addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(id);
    });

    // Resizing handles (8 directions)
    const handles = element.querySelectorAll('.win-resize-handle');
    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const dir = handle.dataset.dir;
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = element.offsetWidth;
        const startH = element.offsetHeight;
        const startL = element.offsetLeft;
        const startT = element.offsetTop;

        const onResize = (re) => {
          const dx = re.clientX - startX;
          const dy = re.clientY - startY;

          if (dir.includes('e')) element.style.width = `${Math.max(320, startW + dx)}px`;
          if (dir.includes('s')) element.style.height = `${Math.max(200, startH + dy)}px`;
          if (dir.includes('w')) {
            const newW = Math.max(320, startW - dx);
            if (newW > 320) {
              element.style.width = `${newW}px`;
              element.style.left = `${startL + dx}px`;
            }
          }
          if (dir.includes('n')) {
            const newH = Math.max(200, startH - dy);
            if (newH > 200) {
              element.style.height = `${newH}px`;
              element.style.top = `${startT + dy}px`;
            }
          }
        };

        const onResizeEnd = () => {
          document.removeEventListener('mousemove', onResize);
          document.removeEventListener('mouseup', onResizeEnd);
        };

        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', onResizeEnd);
      });
    });
  }

  showSnapPreview(x, y, w, h) {
    if (!this.snapPreview) return;
    this.snapPreview.style.display = 'block';
    this.snapPreview.style.left = `${x}px`;
    this.snapPreview.style.top = `${y}px`;
    this.snapPreview.style.width = `${w}px`;
    this.snapPreview.style.height = `${h}px`;
  }

  hideSnapPreview() {
    if (this.snapPreview) this.snapPreview.style.display = 'none';
  }

  snapWindow(id, x, y, w, h) {
    const winData = this.windows.get(id);
    if (!winData) return;
    winData.isMaximized = false;
    winData.element.classList.remove('maximized');
    winData.element.style.left = `${x}px`;
    winData.element.style.top = `${y}px`;
    winData.element.style.width = `${w}px`;
    winData.element.style.height = `${h}px`;
  }

  focusWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    this.windows.forEach(w => {
      w.element.classList.remove('active');
    });

    winData.element.classList.add('active');
    winData.element.style.zIndex = ++this.currentZIndex;
    this.activeWindow = id;

    // Update taskbar active state
    this.updateTaskbarState();

    if (winData.onFocus) winData.onFocus();
  }

  toggleMaximize(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    if (winData.isMaximized) {
      // Restore previous geometry
      winData.isMaximized = false;
      winData.element.classList.remove('maximized');
      if (winData.preMaximizeRect) {
        winData.element.style.left = winData.preMaximizeRect.left;
        winData.element.style.top = winData.preMaximizeRect.top;
        winData.element.style.width = winData.preMaximizeRect.width;
        winData.element.style.height = winData.preMaximizeRect.height;
      }
    } else {
      // Maximize
      winData.preMaximizeRect = {
        left: winData.element.style.left,
        top: winData.element.style.top,
        width: winData.element.style.width,
        height: winData.element.style.height
      };
      winData.isMaximized = true;
      winData.element.classList.add('maximized');
    }
  }

  minimizeWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    winData.isMinimized = true;
    winData.element.classList.add('minimized');
    winData.element.classList.remove('active');

    // Switch focus to another open window
    const openWins = Array.from(this.windows.values()).filter(w => !w.isMinimized && w.id !== id);
    if (openWins.length > 0) {
      this.focusWindow(openWins[openWins.length - 1].id);
    } else {
      this.activeWindow = null;
    }

    this.updateTaskbarState();
  }

  restoreWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    winData.isMinimized = false;
    winData.element.classList.remove('minimized');
    this.focusWindow(id);
  }

  closeWindow(id) {
    const winData = this.windows.get(id);
    if (!winData) return;

    if (winData.onClose) winData.onClose();

    winData.element.remove();
    this.windows.delete(id);

    // Remove taskbar button
    const taskBtn = document.getElementById(`task-btn-${id}`);
    if (taskBtn) taskBtn.remove();

    // Focus previous window if available
    const openWins = Array.from(this.windows.values()).filter(w => !w.isMinimized);
    if (openWins.length > 0) {
      this.focusWindow(openWins[openWins.length - 1].id);
    } else {
      this.activeWindow = null;
    }
  }

  createTaskbarButton(winData) {
    if (!this.panelTasks) {
      this.panelTasks = document.getElementById('panel-tasks');
      if (!this.panelTasks) return;
    }

    const btn = document.createElement('div');
    btn.className = 'panel-task-item active';
    btn.id = `task-btn-${winData.id}`;
    btn.innerHTML = `
      <span style="display:flex;align-items:center;width:14px;height:14px;">${winData.icon || ''}</span>
      <span>${winData.title}</span>
    `;

    btn.addEventListener('click', () => {
      if (winData.isMinimized) {
        this.restoreWindow(winData.id);
      } else if (this.activeWindow === winData.id) {
        this.minimizeWindow(winData.id);
      } else {
        this.focusWindow(winData.id);
      }
    });

    this.panelTasks.appendChild(btn);
  }

  updateTaskbarState() {
    this.windows.forEach(w => {
      const btn = document.getElementById(`task-btn-${w.id}`);
      if (btn) {
        if (this.activeWindow === w.id && !w.isMinimized) {
          btn.className = 'panel-task-item active';
        } else {
          btn.className = 'panel-task-item';
        }
      }
    });
  }
}

window.windowManager = new WindowManager();
