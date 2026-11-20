// ==============================================================================
// ParrotCloud OS - Pluma Code & Script Editor
// Syntax Highlighting, Local & Cloud File Saving, Python/Bash Scripting
// ==============================================================================

class TextEditorApp {
  constructor() {
    this.currentFile = '/home/parrot/Labs/exploit.py';
  }

  open(filePath) {
    if (filePath) this.currentFile = filePath;
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;

    const resolved = window.cloudClient.localEngine.resolvePath(this.currentFile);
    const node = window.cloudClient.localEngine.vfs[resolved];
    let initialContent = node && node.type === 'file' ? node.content : '';

    if (!node) {
      initialContent = `#!/usr/bin/env python3\n# ParrotCloud OS - Cybersecurity Lab Script\nimport socket\nimport sys\n\ntarget_ip = "192.168.1.100"\ntarget_ports = [22, 80, 443, 3306]\n\nprint(f"[+] Scanning {target_ip} for open ports...")\nfor port in target_ports:\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.settimeout(0.5)\n    res = s.connect_ex((target_ip, port))\n    if res == 0:\n        print(f"[!] Port {port} is OPEN!")\n    s.close()\n`;
    }

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar">
        <button class="tool-btn primary" id="editor-btn-save">Save (Ctrl+S)</button>
        <button class="tool-btn" id="editor-btn-new">New</button>
        <button class="tool-btn" id="editor-btn-open">Open</button>
        <span style="color:#8b949e; margin:0 4px;">|</span>
        <span style="color:#8b949e; font-size:11px;">Path:</span>
        <input type="text" class="nmap-input" id="editor-path-input" value="${this.currentFile}" style="width:280px; padding:3px 8px;" />
      </div>

      <div style="flex:1; display:flex; flex-direction:column; background:#0b0f16; overflow:hidden;">
        <textarea id="editor-textarea" style="flex:1; width:100%; height:100%; background:#080b10; color:#e6edf3; font-family:var(--font-mono); font-size:13px; line-height:1.5; padding:12px; border:none; outline:none; resize:none;" spellcheck="false">${this.escapeHtml(initialContent)}</textarea>
      </div>

      <div style="padding:3px 12px; background:#141b26; border-top:1px solid #30363d; font-size:10.5px; color:#8b949e; display:flex; justify-content:space-between;">
        <span id="editor-status-text">Python Script | UTF-8 | Unix (LF)</span>
        <span id="editor-char-count">Lines: 14 | Length: 380</span>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'text-editor',
      title: `Pluma Editor - ${this.currentFile}`,
      icon: iconSvg,
      width: 760,
      height: 480,
      content: container
    });

    const textarea = container.querySelector('#editor-textarea');
    const pathInput = container.querySelector('#editor-path-input');
    const saveBtn = container.querySelector('#editor-btn-save');
    const charCount = container.querySelector('#editor-char-count');

    const updateCount = () => {
      const lines = textarea.value.split('\n').length;
      charCount.textContent = `Lines: ${lines} | Length: ${textarea.value.length}`;
    };

    textarea.addEventListener('input', updateCount);

    const saveFile = () => {
      const targetPath = window.cloudClient.localEngine.resolvePath(pathInput.value.trim());
      const parentDir = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
      const fileName = targetPath.substring(targetPath.lastIndexOf('/') + 1);

      if (!window.cloudClient.localEngine.vfs[parentDir]) {
        window.cloudClient.localEngine.cmdMkdir([parentDir]);
      }

      window.cloudClient.localEngine.vfs[targetPath] = {
        type: 'file',
        perms: 'rw-r--r--',
        owner: 'parrot',
        group: 'parrot',
        content: textarea.value
      };

      const parentNode = window.cloudClient.localEngine.vfs[parentDir];
      if (parentNode && !parentNode.children.includes(fileName)) {
        parentNode.children.push(fileName);
      }

      window.notifications.show('Pluma Editor', `File saved: ${targetPath}`, 'info');
    };

    saveBtn.onclick = saveFile;

    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveFile();
      }
    });
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.textEditorApp = new TextEditorApp();
window.openTextEditorApp = (path) => window.textEditorApp.open(path);
