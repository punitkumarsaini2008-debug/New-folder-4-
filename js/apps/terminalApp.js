// ==============================================================================
// ParrotCloud OS - Bash Terminal Application (xterm-compatible)
// Real Bash Execution, Interactive In-Terminal Nano Editor, Multi-Tab Support
// ==============================================================================

class TerminalApp {
  constructor() {
    this.tabCounter = 1;
    this.activeTabId = 'tab-1';
    this.tabs = new Map();
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;

    const container = document.createElement('div');
    container.className = 'terminal-wrapper';
    container.innerHTML = `
      <div class="terminal-tabs-bar">
        <div class="terminal-tab active" data-tab="tab-1">
          <span>bash #1</span>
          <span class="terminal-tab-close" data-close="tab-1">&times;</span>
        </div>
        <button class="terminal-add-tab" id="term-add-tab" title="New Terminal Tab">+</button>
      </div>
      <div class="terminal-status-strip">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span id="term-conn-status">CLUSTERING: Debian 12 (Bookworm) / Parrot Core [pts/0]</span>
        </div>
        <div>UTF-8 | 80x24</div>
      </div>
      <div id="term-tab-contents" style="flex:1; display:flex; flex-direction:column; overflow:hidden;"></div>
    `;

    const winData = window.windowManager.createWindow({
      id: 'terminal',
      title: 'parrot@parrotcloud: ~ (bash)',
      icon: iconSvg,
      width: 780,
      height: 480,
      content: container,
      onFocus: () => {
        const activeTab = this.tabs.get(this.activeTabId);
        if (activeTab && activeTab.inputEl) activeTab.inputEl.focus();
      }
    });

    // Add Tab Button
    container.querySelector('#term-add-tab').addEventListener('click', () => {
      this.addNewTab(container);
    });

    // Initialize first tab
    this.initTab('tab-1', container);
  }

  addNewTab(container) {
    this.tabCounter++;
    const tabId = `tab-${this.tabCounter}`;
    const tabsBar = container.querySelector('.terminal-tabs-bar');
    const addBtn = container.querySelector('#term-add-tab');

    // Deactivate previous tabs
    container.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));

    const tabEl = document.createElement('div');
    tabEl.className = 'terminal-tab active';
    tabEl.dataset.tab = tabId;
    tabEl.innerHTML = `
      <span>bash #${this.tabCounter}</span>
      <span class="terminal-tab-close" data-close="${tabId}">&times;</span>
    `;

    tabsBar.insertBefore(tabEl, addBtn);
    this.initTab(tabId, container);
  }

  initTab(tabId, container) {
    const contentsArea = container.querySelector('#term-tab-contents');

    // Hide other tab screens
    contentsArea.querySelectorAll('.terminal-screen-wrapper').forEach(w => w.style.display = 'none');

    const screenWrap = document.createElement('div');
    screenWrap.className = 'terminal-screen-wrapper';
    screenWrap.id = `screen-${tabId}`;
    screenWrap.style.cssText = 'flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative;';

    screenWrap.innerHTML = `
      <div class="terminal-screen" id="output-${tabId}"></div>
      <div class="term-input-row" style="padding: 4px 14px 10px 14px;">
        <div class="term-prompt" id="prompt-${tabId}">
          <span class="term-prompt-user">parrot</span><span class="term-prompt-at">@</span><span class="term-prompt-host">parrotcloud</span><span class="term-prompt-colon">:</span><span class="term-prompt-path">~</span><span class="term-prompt-symbol">$ </span>
        </div>
        <div class="term-input-wrapper">
          <input type="text" class="term-input" id="input-${tabId}" autocomplete="off" spellcheck="false" />
        </div>
      </div>
      <!-- In-Terminal Nano Visual Editor Container -->
      <div class="nano-editor-view" id="nano-${tabId}" style="display:none;"></div>
    `;

    contentsArea.appendChild(screenWrap);

    const outputEl = screenWrap.querySelector(`#output-${tabId}`);
    const inputEl = screenWrap.querySelector(`#input-${tabId}`);
    const promptEl = screenWrap.querySelector(`#prompt-${tabId}`);
    const nanoEl = screenWrap.querySelector(`#nano-${tabId}`);

    const tabData = {
      id: tabId,
      outputEl,
      inputEl,
      promptEl,
      nanoEl,
      history: [],
      historyIndex: -1
    };

    this.tabs.set(tabId, tabData);
    this.activeTabId = tabId;

    // Tab switching
    container.querySelectorAll('.terminal-tab').forEach(tab => {
      tab.onclick = (e) => {
        if (e.target.classList.contains('terminal-tab-close')) {
          this.closeTab(tab.dataset.tab, container);
          return;
        }
        container.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.switchTab(tab.dataset.tab, container);
      };
    });

    // Display welcome banner
    this.printBanner(outputEl);

    // Setup input events
    this.setupInput(tabData);

    // Focus input
    setTimeout(() => inputEl.focus(), 100);
  }

  switchTab(tabId, container) {
    this.activeTabId = tabId;
    const contentsArea = container.querySelector('#term-tab-contents');
    contentsArea.querySelectorAll('.terminal-screen-wrapper').forEach(w => w.style.display = 'none');
    const targetScreen = container.querySelector(`#screen-${tabId}`);
    if (targetScreen) {
      targetScreen.style.display = 'flex';
      const tabData = this.tabs.get(tabId);
      if (tabData && tabData.inputEl) tabData.inputEl.focus();
    }
  }

  closeTab(tabId, container) {
    if (this.tabs.size <= 1) {
      window.windowManager.closeWindow('terminal');
      return;
    }
    const tabEl = container.querySelector(`.terminal-tab[data-tab="${tabId}"]`);
    const screenEl = container.querySelector(`#screen-${tabId}`);
    if (tabEl) tabEl.remove();
    if (screenEl) screenEl.remove();
    this.tabs.delete(tabId);

    // Switch to first remaining tab
    const firstRemaining = this.tabs.keys().next().value;
    if (firstRemaining) {
      const remainingTabEl = container.querySelector(`.terminal-tab[data-tab="${firstRemaining}"]`);
      if (remainingTabEl) remainingTabEl.classList.add('active');
      this.switchTab(firstRemaining, container);
    }
  }

  printBanner(outputEl) {
    const banner = document.createElement('div');
    banner.className = 'term-line';
    banner.innerHTML = `
      <span class="ansi-cyan ansi-bold"> ____                             _    ____ _                 _    ___  ____  </span><br>
      <span class="ansi-cyan ansi-bold">|  _ \\ __ _ _ __ _ __ ___  _   _ / |  / ___| | ___  _   _  __| |  / _ \\/ ___| </span><br>
      <span class="ansi-cyan ansi-bold">| |_) / _\` | '__| '__/ _ \\| | | || | | |   | |/ _ \\| | | |/ _\` | | | | \\___ \\ </span><br>
      <span class="ansi-cyan ansi-bold">|  __/ (_| | |  | | | (_) | |_| || | | |___| | (_) | |_| | (_| | | |_| |___) |</span><br>
      <span class="ansi-cyan ansi-bold">|_|   \\__,_|_|  |_|  \\___/ \\__,_||_|  \\____|_|\\___/ \\__,_|\\__,_|  \\___/|____/ </span><br>
      <span class="ansi-green ansi-bold">[+] ParrotCloud OS 6.0 (Debian 12 Bookworm Core) - Online Cybersecurity Workspace</span><br>
      <span class="ansi-yellow">[*] Bash 5.2.15 initialized. Type 'help' for cybersecurity tools and system commands.</span><br><br>
    `;
    outputEl.appendChild(banner);
  }

  setupInput(tabData) {
    const { inputEl, outputEl, promptEl, nanoEl } = tabData;

    inputEl.addEventListener('keydown', async (e) => {
      // Command history navigation (Up / Down)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (tabData.history.length > 0) {
          if (tabData.historyIndex === -1) tabData.historyIndex = tabData.history.length;
          tabData.historyIndex = Math.max(0, tabData.historyIndex - 1);
          inputEl.value = tabData.history[tabData.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (tabData.history.length > 0 && tabData.historyIndex !== -1) {
          tabData.historyIndex = Math.min(tabData.history.length, tabData.historyIndex + 1);
          inputEl.value = tabData.history[tabData.historyIndex] || '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Simple autocomplete for commands and filenames
        const val = inputEl.value;
        const available = ['nmap', 'nikto', 'wireshark', 'burpsuite', 'ghidra', 'clear', 'help', 'neofetch', 'pwd', 'whoami', 'uname', 'cat', 'nano', 'ls'];
        const match = available.find(a => a.startsWith(val));
        if (match) inputEl.value = match + ' ';
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmdLine = inputEl.value;
        inputEl.value = '';

        if (cmdLine.trim()) {
          tabData.history.push(cmdLine);
          tabData.historyIndex = -1;
        }

        // Echo command line
        const echoLine = document.createElement('div');
        echoLine.className = 'term-line';
        echoLine.innerHTML = `${promptEl.innerHTML}<span style="color:#ffffff;">${this.escapeHtml(cmdLine)}</span>`;
        outputEl.appendChild(echoLine);

        // Special handling for interactive nano editor
        if (cmdLine.trim().startsWith('nano')) {
          const parts = cmdLine.trim().split(' ');
          const targetFile = parts[1] || 'untitled.txt';
          this.launchNano(tabData, targetFile);
          return;
        }

        // Special handling for clear
        if (cmdLine.trim() === 'clear') {
          outputEl.innerHTML = '';
          return;
        }

        // Execute command via cloudClient (cloud container WebSocket or local engine)
        const output = await window.cloudClient.executeCommand(cmdLine);
        if (output) {
          const outEl = document.createElement('div');
          outEl.className = 'term-line';
          outEl.innerHTML = this.ansiToHtml(output);
          outputEl.appendChild(outEl);
        }

        // Update prompt path if cd was executed
        if (cmdLine.trim().startsWith('cd')) {
          const cwd = window.cloudClient.localEngine.cwd;
          const displayPath = cwd.startsWith('/home/parrot') ? '~' + cwd.substring(12) : cwd;
          promptEl.querySelector('.term-prompt-path').textContent = displayPath || '/';
        }

        outputEl.scrollTop = outputEl.scrollHeight;
      }
    });

    // Click anywhere on terminal focuses input
    outputEl.addEventListener('click', () => inputEl.focus());
  }

  launchNano(tabData, filename) {
    const { nanoEl, inputEl } = tabData;
    const resolvedPath = window.cloudClient.localEngine.resolvePath(filename);
    const existingNode = window.cloudClient.localEngine.vfs[resolvedPath];
    const initialContent = existingNode && existingNode.type === 'file' ? existingNode.content : '';

    nanoEl.innerHTML = `
      <div class="nano-header">
        <span>GNU nano 7.2</span>
        <span>File: ${filename}</span>
        <span>[Modified]</span>
      </div>
      <textarea class="nano-textarea" id="nano-text-${tabData.id}">${this.escapeHtml(initialContent)}</textarea>
      <div class="nano-footer">
        <div class="nano-shortcuts-grid">
          <div class="nano-shortcut-item"><span class="nano-shortcut-key">^G</span>Help</div>
          <div class="nano-shortcut-item"><span class="nano-shortcut-key">^O</span>WriteOut</div>
          <div class="nano-shortcut-item"><span class="nano-shortcut-key">^R</span>Read File</div>
          <div class="nano-shortcut-item"><span class="nano-shortcut-key">^Y</span>Prev Page</div>
          <div class="nano-shortcut-item"><span class="nano-shortcut-key">^K</span>Cut Text</div>
          <div class="nano-shortcut-item" id="nano-exit-btn" style="cursor:pointer;"><span class="nano-shortcut-key" style="background:#ff3366; color:#fff;">^X</span>Exit</div>
        </div>
      </div>
    `;

    nanoEl.style.display = 'flex';
    const textarea = nanoEl.querySelector(`#nano-text-${tabData.id}`);
    textarea.focus();

    // Handle Ctrl+O (Save) and Ctrl+X (Exit)
    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        this.saveNano(resolvedPath, textarea.value);
        window.notifications.show('GNU nano', `Saved ${filename} to disk`, 'info');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        this.saveNano(resolvedPath, textarea.value);
        nanoEl.style.display = 'none';
        inputEl.focus();
      }
    });

    nanoEl.querySelector('#nano-exit-btn').onclick = () => {
      this.saveNano(resolvedPath, textarea.value);
      nanoEl.style.display = 'none';
      inputEl.focus();
    };
  }

  saveNano(path, content) {
    const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    if (!window.cloudClient.localEngine.vfs[parentDir]) {
      window.cloudClient.localEngine.cmdMkdir([parentDir]);
    }
    window.cloudClient.localEngine.vfs[path] = {
      type: 'file',
      perms: 'rw-r--r--',
      owner: 'parrot',
      group: 'parrot',
      content: content
    };
    if (!window.cloudClient.localEngine.vfs[parentDir].children.includes(fileName)) {
      window.cloudClient.localEngine.vfs[parentDir].children.push(fileName);
    }
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  ansiToHtml(str) {
    if (!str) return '';
    let html = this.escapeHtml(str);
    // Replace ANSI color escape sequences
    html = html.replace(/\u001b\[1;36m/g, '<span class="ansi-cyan ansi-bold">')
               .replace(/\u001b\[1;32m/g, '<span class="ansi-green ansi-bold">')
               .replace(/\u001b\[1;34m/g, '<span class="ansi-blue ansi-bold">')
               .replace(/\u001b\[1;33m/g, '<span class="ansi-yellow ansi-bold">')
               .replace(/\u001b\[1;31m/g, '<span class="ansi-red ansi-bold">')
               .replace(/\u001b\[0m/g, '</span>');
    return html.replace(/\n/g, '<br>');
  }
}

window.terminalApp = new TerminalApp();
window.openTerminalApp = () => window.terminalApp.open();
