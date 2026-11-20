// ==============================================================================
// Multi-OS Cybersecurity Platform - Advanced Bash Terminal
// Multi-tab, Autocomplete, History, Themes, Linux Tutorials & Simulation Badges
// Strictly adheres to honest simulation labeling vs real remote Linux execution
// ==============================================================================

class TerminalApp {
  constructor() {
    this.tabCounter = 1;
    this.activeTabId = 'tab-1';
    this.tabs = new Map();
    this.currentTheme = 'parrot';
    this.availableCommands = [
      'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'echo', 
      'grep', 'find', 'whoami', 'date', 'uname', 'history', 'clear', 'ping', 
      'nmap', 'nikto', 'wireshark', 'burpsuite', 'ghidra', 'python3', 'gcc', 
      'netcat', 'traceroute', 'whois', 'hydra', 'john', 'hashcat', 'exiftool', 
      'binwalk', 'foremost', 'volatility', 'sqlmap', 'neofetch', 'help', 'nano', 'curl', 'wget'
    ];
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;

    const container = document.createElement('div');
    container.className = 'terminal-wrapper';
    container.innerHTML = `
      <div class="terminal-tabs-bar" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:2px;" id="term-tabs-list">
          <div class="terminal-tab active" data-tab="tab-1">
            <span>bash #1</span>
            <span class="terminal-tab-close" data-close="tab-1">&times;</span>
          </div>
          <button class="terminal-add-tab" id="term-add-tab" title="New Terminal Tab">+</button>
        </div>
        <div style="display:flex; align-items:center; gap:6px; padding-right:8px;">
          <select id="term-theme-select" class="nmap-select" style="font-size:10px; padding:2px 6px; height:22px;">
            <option value="parrot">Theme: Parrot Cyan</option>
            <option value="ubuntu">Theme: Ubuntu Aubergine</option>
            <option value="kali">Theme: Kali Blue</option>
            <option value="mint">Theme: Mint Green</option>
            <option value="matrix">Theme: Matrix Green</option>
          </select>
          <button class="tool-btn" id="term-tutorial-btn" style="font-size:10px; padding:2px 6px; height:22px;">Tutorials</button>
        </div>
      </div>
      <div class="terminal-status-strip">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span id="term-conn-status">ENVIRONMENT: [SIMULATED CLIENT SANDBOX - Educational Mode]</span>
        </div>
        <div>UTF-8 | 80x24</div>
      </div>
      <div id="term-tab-contents" style="flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative;"></div>
      <!-- Interactive Linux Command Tutorial Drawer -->
      <div id="term-tutorial-drawer" style="display:none; position:absolute; right:0; top:54px; bottom:0; width:280px; background:#121824; border-left:1px solid rgba(0,229,255,0.2); padding:12px; overflow-y:auto; z-index:20; box-shadow:-4px 0 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #30363d; padding-bottom:6px;">
          <strong style="color:var(--parrot-cyan); font-size:12px;">Linux Tutorial & Commands</strong>
          <button id="close-tutorial-btn" style="color:#8b949e; cursor:pointer;">&times;</button>
        </div>
        <div style="font-size:11px; color:#8b949e; line-height:1.5;">
          <div style="color:#56d364; font-weight:700; margin-top:6px;">Navigation</div>
          <code>pwd</code> - Show current folder<br>
          <code>ls -la</code> - List all files with permissions<br>
          <code>cd &lt;dir&gt;</code> - Change directory<br>
          <div style="color:#56d364; font-weight:700; margin-top:8px;">File Operations</div>
          <code>touch file.txt</code> - Create empty file<br>
          <code>cp src dest</code> - Copy file<br>
          <code>mv src dest</code> - Move/rename file<br>
          <code>rm file</code> - Delete file<br>
          <code>cat file</code> - Display file contents<br>
          <code>nano file</code> - Open interactive visual editor<br>
          <div style="color:#56d364; font-weight:700; margin-top:8px;">Security & Recon</div>
          <code>nmap 192.168.1.100</code> - Port scan<br>
          <code>nikto http://target</code> - Web scan<br>
          <code>whoami</code> - Current user<br>
          <code>uname -a</code> - Kernel & OS architecture
        </div>
      </div>
    `;

    const activeProfile = window.MULTIOS_PROFILES ? window.MULTIOS_PROFILES[window.osManager?.activeOs || 'parrot'] : null;
    const title = activeProfile ? `${activeProfile.user}@${activeProfile.hostname}: ~ (bash)` : 'user@cyberplatform: ~ (bash)';

    const winData = window.windowManager.createWindow({
      id: 'terminal',
      title: title,
      icon: iconSvg,
      width: 780,
      height: 480,
      content: container,
      onFocus: () => {
        const activeTab = this.tabs.get(this.activeTabId);
        if (activeTab && activeTab.inputEl) activeTab.inputEl.focus();
      }
    });

    // Theme selector
    const themeSelect = container.querySelector('#term-theme-select');
    themeSelect.onchange = () => {
      this.applyTheme(themeSelect.value, container);
    };

    // Tutorial drawer toggle
    const tutDrawer = container.querySelector('#term-tutorial-drawer');
    container.querySelector('#term-tutorial-btn').onclick = () => {
      tutDrawer.style.display = tutDrawer.style.display === 'none' ? 'block' : 'none';
    };
    container.querySelector('#close-tutorial-btn').onclick = () => {
      tutDrawer.style.display = 'none';
    };

    // Add Tab Button
    container.querySelector('#term-add-tab').addEventListener('click', () => {
      this.addNewTab(container);
    });

    // Initialize first tab
    this.initTab('tab-1', container);
  }

  applyTheme(themeName, container) {
    this.currentTheme = themeName;
    const screens = container.querySelectorAll('.terminal-screen');
    screens.forEach(s => {
      if (themeName === 'ubuntu') {
        s.style.background = '#2c001e';
        s.style.color = '#ffffff';
      } else if (themeName === 'kali') {
        s.style.background = '#0a101d';
        s.style.color = '#79c0ff';
      } else if (themeName === 'mint') {
        s.style.background = '#151d18';
        s.style.color = '#c9d1d9';
      } else if (themeName === 'matrix') {
        s.style.background = '#050a06';
        s.style.color = '#00ff66';
      } else {
        // Parrot default
        s.style.background = '#0b0f14';
        s.style.color = '#e6edf3';
      }
    });
  }

  addNewTab(container) {
    this.tabCounter++;
    const tabId = `tab-${this.tabCounter}`;
    const tabsList = container.querySelector('#term-tabs-list');
    const addBtn = container.querySelector('#term-add-tab');

    container.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));

    const tabEl = document.createElement('div');
    tabEl.className = 'terminal-tab active';
    tabEl.dataset.tab = tabId;
    tabEl.innerHTML = `
      <span>bash #${this.tabCounter}</span>
      <span class="terminal-tab-close" data-close="${tabId}">&times;</span>
    `;

    tabsList.insertBefore(tabEl, addBtn);
    this.initTab(tabId, container);
  }

  initTab(tabId, container) {
    const contentsArea = container.querySelector('#term-tab-contents');
    contentsArea.querySelectorAll('.terminal-screen-wrapper').forEach(w => w.style.display = 'none');

    const screenWrap = document.createElement('div');
    screenWrap.className = 'terminal-screen-wrapper';
    screenWrap.id = `screen-${tabId}`;
    screenWrap.style.cssText = 'flex:1; display:flex; flex-direction:column; overflow:hidden; position:relative;';

    const activeProfile = window.MULTIOS_PROFILES ? window.MULTIOS_PROFILES[window.osManager?.activeOs || 'parrot'] : {
      user: 'parrot',
      hostname: 'parrotcloud',
      terminalPrompt: { userColor: '#00e5ff', hostColor: '#05d550' }
    };

    screenWrap.innerHTML = `
      <div class="terminal-screen" id="output-${tabId}"></div>
      <div class="term-input-row" style="padding: 4px 14px 10px 14px; background:rgba(0,0,0,0.2);">
        <div class="term-prompt" id="prompt-${tabId}">
          <span style="color:${activeProfile.terminalPrompt.userColor};font-weight:700;">${activeProfile.user}</span><span class="term-prompt-at">@</span><span style="color:${activeProfile.terminalPrompt.hostColor};font-weight:700;">${activeProfile.hostname}</span><span class="term-prompt-colon">:</span><span class="term-prompt-path" style="color:#58a6ff;">~</span><span class="term-prompt-symbol">$ </span>
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

    this.printBanner(outputEl, activeProfile);
    this.setupInput(tabData);
    this.applyTheme(this.currentTheme, container);

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

    const firstRemaining = this.tabs.keys().next().value;
    if (firstRemaining) {
      const remainingTabEl = container.querySelector(`.terminal-tab[data-tab="${firstRemaining}"]`);
      if (remainingTabEl) remainingTabEl.classList.add('active');
      this.switchTab(firstRemaining, container);
    }
  }

  printBanner(outputEl, profile) {
    const banner = document.createElement('div');
    banner.className = 'term-line';
    banner.innerHTML = `
      <span class="ansi-cyan ansi-bold">Multi-OS Cybersecurity Platform - [${profile.name} ${profile.version}]</span><br>
      <span class="ansi-yellow ansi-bold">[SIMULATED ENVIRONMENT - Educational Sandbox]</span><br>
      <span style="color:#8b949e; font-size:11px;">Notice: All commands execute inside an in-browser sandbox simulation with POSIX filesystem support.</span><br>
      <span style="color:#8b949e; font-size:11px;">Type 'help' for available commands, or click 'Tutorials' on top right.</span><br><br>
    `;
    outputEl.appendChild(banner);
  }

  setupInput(tabData) {
    const { inputEl, outputEl, promptEl, nanoEl } = tabData;

    inputEl.addEventListener('keydown', async (e) => {
      // Command history (Up / Down)
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
        const val = inputEl.value.trim();
        const match = this.availableCommands.find(a => a.startsWith(val));
        if (match) inputEl.value = match + ' ';
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmdLine = inputEl.value;
        inputEl.value = '';

        if (cmdLine.trim()) {
          tabData.history.push(cmdLine);
          tabData.historyIndex = -1;
        }

        // Echo prompt + command
        const echoLine = document.createElement('div');
        echoLine.className = 'term-line';
        echoLine.innerHTML = `${promptEl.innerHTML}<span style="color:#ffffff;">${this.escapeHtml(cmdLine)}</span>`;
        outputEl.appendChild(echoLine);

        // In-terminal visual nano
        if (cmdLine.trim().startsWith('nano')) {
          const parts = cmdLine.trim().split(' ');
          const targetFile = parts[1] || 'untitled.txt';
          this.launchNano(tabData, targetFile);
          return;
        }

        if (cmdLine.trim() === 'clear') {
          outputEl.innerHTML = '';
          return;
        }

        // Execute command
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
          const activeHome = window.cloudClient.localEngine.env.HOME;
          const displayPath = cwd.startsWith(activeHome) ? '~' + cwd.substring(activeHome.length) : cwd;
          promptEl.querySelector('.term-prompt-path').textContent = displayPath || '/';
        }

        outputEl.scrollTop = outputEl.scrollHeight;
      }
    });

    outputEl.addEventListener('click', () => inputEl.focus());
  }

  launchNano(tabData, filename) {
    const { nanoEl, inputEl } = tabData;
    const resolvedPath = window.cloudClient.localEngine.resolvePath(filename);
    const existingNode = window.cloudClient.localEngine.vfs[resolvedPath];
    const initialContent = existingNode && existingNode.type === 'file' ? existingNode.content : '';

    nanoEl.innerHTML = `
      <div class="nano-header">
        <span>GNU nano 7.2 (Educational Simulation)</span>
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

    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        this.saveNano(resolvedPath, textarea.value);
        window.notifications.show('GNU nano', `Saved ${filename}`, 'info');
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
      owner: window.cloudClient.localEngine.currentUser,
      group: window.cloudClient.localEngine.currentUser,
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
