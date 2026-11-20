// ==============================================================================
// ParrotCloud OS - Caja Linux File Manager
// Linux Directory Browsing, File Creation, Upload/Download, Permissions
// ==============================================================================

class FileManagerApp {
  constructor() {
    this.currentPath = '/home/parrot';
    this.selectedItem = null;
  }

  open(initialPath) {
    if (initialPath) this.currentPath = initialPath;
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar">
        <button class="tool-btn" id="fm-btn-up" title="Parent Directory">
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          Up
        </button>
        <button class="tool-btn" id="fm-btn-newfolder">+ New Folder</button>
        <button class="tool-btn" id="fm-btn-newfile">+ New File</button>
        <button class="tool-btn" id="fm-btn-upload">Upload</button>
        <button class="tool-btn" id="fm-btn-download">Download</button>
        <button class="tool-btn danger" id="fm-btn-delete">Delete</button>
        <input type="file" id="fm-file-input" style="display:none;" />
      </div>

      <div class="fm-address-bar">
        <span style="color:#8b949e; font-weight:600; font-size:11px;">Location:</span>
        <input type="text" class="fm-path-input" id="fm-path-input" value="${this.currentPath}" />
        <button class="tool-btn" id="fm-btn-go">Go</button>
      </div>

      <div class="fm-split-pane">
        <!-- SIDEBAR PLACES -->
        <div class="fm-sidebar">
          <div class="fm-sidebar-group">
            <div class="fm-sidebar-title">Places</div>
            <div class="fm-sidebar-item active" data-path="/home/parrot">
              <span style="color:var(--parrot-cyan);"><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></span>
              Home
            </div>
            <div class="fm-sidebar-item" data-path="/home/parrot/Desktop">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></span>
              Desktop
            </div>
            <div class="fm-sidebar-item" data-path="/home/parrot/Labs">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
              Security Labs
            </div>
            <div class="fm-sidebar-item" data-path="/etc">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle></svg></span>
              /etc
            </div>
            <div class="fm-sidebar-item" data-path="/var/log">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg></span>
              /var/log
            </div>
            <div class="fm-sidebar-item" data-path="/">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"></rect></svg></span>
              File System (/)
            </div>
          </div>
        </div>

        <!-- MAIN FILE GRID -->
        <div class="fm-content-area">
          <div class="fm-file-grid" id="fm-grid"></div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'file-manager',
      title: `Files - ${this.currentPath}`,
      icon: iconSvg,
      width: 760,
      height: 480,
      content: container
    });

    this.bindEvents(container);
    this.renderFolder(this.currentPath, container);
  }

  bindEvents(container) {
    const pathInput = container.querySelector('#fm-path-input');
    const btnGo = container.querySelector('#fm-btn-go');
    const btnUp = container.querySelector('#fm-btn-up');
    const btnNewFolder = container.querySelector('#fm-btn-newfolder');
    const btnNewFile = container.querySelector('#fm-btn-newfile');
    const btnUpload = container.querySelector('#fm-btn-upload');
    const btnDownload = container.querySelector('#fm-btn-download');
    const btnDelete = container.querySelector('#fm-btn-delete');
    const fileInput = container.querySelector('#fm-file-input');

    // Go button
    btnGo.onclick = () => this.navigate(pathInput.value.trim(), container);
    pathInput.onkeydown = (e) => { if (e.key === 'Enter') this.navigate(pathInput.value.trim(), container); };

    // Parent directory
    btnUp.onclick = () => {
      if (this.currentPath === '/') return;
      const parent = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
      this.navigate(parent, container);
    };

    // Sidebar items
    container.querySelectorAll('.fm-sidebar-item').forEach(item => {
      item.onclick = () => {
        container.querySelectorAll('.fm-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.navigate(item.dataset.path, container);
      };
    });

    // Create New Folder
    btnNewFolder.onclick = () => {
      const name = prompt('Enter folder name:', 'New_Lab');
      if (name) {
        window.cloudClient.localEngine.cmdMkdir([`${this.currentPath}/${name}`]);
        this.renderFolder(this.currentPath, container);
        window.notifications.show('File Manager', `Created directory: ${name}`, 'info');
      }
    };

    // Create New File
    btnNewFile.onclick = () => {
      const name = prompt('Enter file name:', 'script.py');
      if (name) {
        window.cloudClient.localEngine.cmdTouch([`${this.currentPath}/${name}`]);
        this.renderFolder(this.currentPath, container);
        window.notifications.show('File Manager', `Created file: ${name}`, 'info');
      }
    };

    // Upload real file into VFS
    btnUpload.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const fullPath = `${this.currentPath}/${file.name}`;
          window.cloudClient.localEngine.vfs[fullPath] = {
            type: 'file',
            perms: 'rw-r--r--',
            owner: 'parrot',
            group: 'parrot',
            content: content
          };
          const parentNode = window.cloudClient.localEngine.vfs[this.currentPath];
          if (parentNode && !parentNode.children.includes(file.name)) {
            parentNode.children.push(file.name);
          }
          this.renderFolder(this.currentPath, container);
          window.notifications.show('File Manager', `Uploaded ${file.name} to ${this.currentPath}`, 'info');
        };
        reader.readAsText(file);
      }
    };

    // Download file
    btnDownload.onclick = () => {
      if (!this.selectedItem) {
        alert('Please select a file to download.');
        return;
      }
      const node = window.cloudClient.localEngine.vfs[this.selectedItem];
      if (node && node.type === 'file') {
        const blob = new Blob([node.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.selectedItem.substring(this.selectedItem.lastIndexOf('/') + 1);
        a.click();
        URL.revokeObjectURL(url);
      }
    };

    // Delete file
    btnDelete.onclick = () => {
      if (!this.selectedItem) return;
      if (confirm(`Are you sure you want to delete ${this.selectedItem}?`)) {
        window.cloudClient.localEngine.cmdRm([this.selectedItem]);
        this.selectedItem = null;
        this.renderFolder(this.currentPath, container);
        window.notifications.show('File Manager', 'Item removed', 'warning');
      }
    };
  }

  navigate(path, container) {
    const node = window.cloudClient.localEngine.vfs[path];
    if (node && node.type === 'dir') {
      this.currentPath = path;
      container.querySelector('#fm-path-input').value = path;
      const win = window.windowManager.windows.get('file-manager');
      if (win) {
        win.element.querySelector('.window-title').textContent = `Files - ${path}`;
      }
      this.renderFolder(path, container);
    } else {
      alert(`Directory does not exist: ${path}`);
    }
  }

  renderFolder(path, container) {
    const grid = container.querySelector('#fm-grid');
    grid.innerHTML = '';
    const node = window.cloudClient.localEngine.vfs[path];
    if (!node || node.type !== 'dir') return;

    node.children.forEach(childName => {
      const childPath = path === '/' ? `/${childName}` : `${path}/${childName}`;
      const childNode = window.cloudClient.localEngine.vfs[childPath];
      const isDir = childNode && childNode.type === 'dir';

      const itemEl = document.createElement('div');
      itemEl.className = 'fm-item';
      itemEl.innerHTML = `
        <div class="fm-item-icon" style="display:flex;align-items:center;justify-content:center;color:${isDir ? 'var(--parrot-cyan)' : '#8b949e'};">
          ${isDir 
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:36px;height:36px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:36px;height:36px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
          }
        </div>
        <div class="fm-item-name">${childName}</div>
      `;

      itemEl.onclick = () => {
        container.querySelectorAll('.fm-item').forEach(i => i.classList.remove('selected'));
        itemEl.classList.add('selected');
        this.selectedItem = childPath;
      };

      itemEl.ondblclick = () => {
        if (isDir) {
          this.navigate(childPath, container);
        } else {
          // Open text editor
          window.openTextEditorApp(childPath);
        }
      };

      grid.appendChild(itemEl);
    });
  }
}

window.fileManagerApp = new FileManagerApp();
window.openFileManagerApp = (path) => window.fileManagerApp.open(path);
