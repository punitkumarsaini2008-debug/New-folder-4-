// ==============================================================================
// ParrotCloud OS - System Settings & Cloud Node Infrastructure Manager
// ==============================================================================

class SettingsApp {
  open(initialTab = 'cloud') {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="fm-split-pane">
        <!-- SETTINGS SIDEBAR -->
        <div class="fm-sidebar" style="width:200px;">
          <div class="fm-sidebar-group">
            <div class="fm-sidebar-title">Preferences</div>
            <div class="fm-sidebar-item ${initialTab === 'cloud' ? 'active' : ''}" data-tab="cloud">
              <span style="color:var(--parrot-cyan);"><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg></span>
              Cloud Container & VM
            </div>
            <div class="fm-sidebar-item ${initialTab === 'wallpaper' ? 'active' : ''}" data-tab="wallpaper">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></span>
              Desktop & Wallpaper
            </div>
            <div class="fm-sidebar-item" data-tab="about">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
              About ParrotCloud OS
            </div>
          </div>
        </div>

        <!-- SETTINGS MAIN CONTENT -->
        <div class="fm-content-area" style="padding:18px; overflow-y:auto; gap:16px;">
          <!-- CLOUD TAB -->
          <div id="set-tab-cloud" style="display:${initialTab === 'cloud' ? 'flex' : 'none'}; flex-direction:column; gap:16px;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">Cloud Infrastructure & Docker Sandbox</div>
            
            <div style="background:#131a26; border:1px solid rgba(0,229,255,0.15); border-radius:6px; padding:14px; display:flex; flex-direction:column; gap:10px;">
              <div style="font-weight:600; color:#ffffff;">WebSocket Gateway Endpoint</div>
              <div style="font-size:11.5px; color:#8b949e;">Connect to your remote or local Docker daemon for live, unsimulated Linux bash execution:</div>
              <div style="display:flex; gap:8px;">
                <input type="text" class="nmap-input" id="set-ws-endpoint" value="${window.cloudClient.endpoint}" style="flex:1;" />
                <button class="tool-btn primary" id="set-ws-save">Connect Node</button>
              </div>
            </div>

            <div style="background:#131a26; border:1px solid rgba(0,229,255,0.15); border-radius:6px; padding:14px; display:flex; flex-direction:column; gap:8px;">
              <div style="font-weight:600; color:#ffffff;">Container Resource Limits (cgroup v2)</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:11.5px; color:#8b949e;">
                <div>CPU Quota: <strong style="color:#ffffff;">2.0 vCPU Cores</strong></div>
                <div>Memory Limit: <strong style="color:#ffffff;">2048 MB (RAM)</strong></div>
                <div>Swap Limit: <strong style="color:#ffffff;">512 MB</strong></div>
                <div>Network Isolation: <strong style="color:#56d364;">Bridge (parrot-net)</strong></div>
              </div>
            </div>
          </div>

          <!-- WALLPAPER TAB -->
          <div id="set-tab-wallpaper" style="display:${initialTab === 'wallpaper' ? 'flex' : 'none'}; flex-direction:column; gap:16px;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">Desktop Wallpaper & Theme</div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
              <div class="wallpaper-card" data-bg="parrot-cyber" style="cursor:pointer; border:1px solid var(--parrot-cyan); border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:100px; background:radial-gradient(circle at 50% 50%, #00363d 0%, #070e17 100%); display:flex; align-items:center; justify-content:center; color:var(--parrot-cyan); font-weight:700;">
                  Parrot Cyber Bloom (Default)
                </div>
                <div style="padding:6px; font-size:11px; text-align:center; color:#c9d1d9;">Electric Cyan Mesh</div>
              </div>

              <div class="wallpaper-card" data-bg="toxic-green" style="cursor:pointer; border:1px solid #30363d; border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:100px; background:radial-gradient(circle at 50% 50%, #004d25 0%, #06110a 100%); display:flex; align-items:center; justify-content:center; color:#05d550; font-weight:700;">
                  Toxic Matrix
                </div>
                <div style="padding:6px; font-size:11px; text-align:center; color:#c9d1d9;">Neon Green Glow</div>
              </div>

              <div class="wallpaper-card" data-bg="cyber-night" style="cursor:pointer; border:1px solid #30363d; border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:100px; background:radial-gradient(circle at 50% 50%, #2a0b38 0%, #0c0512 100%); display:flex; align-items:center; justify-content:center; color:#bb86fc; font-weight:700;">
                  Cyberpunk Night
                </div>
                <div style="padding:6px; font-size:11px; text-align:center; color:#c9d1d9;">Deep Purple & Magenta</div>
              </div>

              <div class="wallpaper-card" data-bg="deep-void" style="cursor:pointer; border:1px solid #30363d; border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:100px; background:#05070a; display:flex; align-items:center; justify-content:center; color:#8b949e; font-weight:700;">
                  Minimalist Void
                </div>
                <div style="padding:6px; font-size:11px; text-align:center; color:#c9d1d9;">Pure Dark Slate</div>
              </div>
            </div>
          </div>

          <!-- ABOUT TAB -->
          <div id="set-tab-about" style="display:${initialTab === 'about' ? 'flex' : 'none'}; flex-direction:column; gap:12px; font-size:12px; line-height:1.6;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">About ParrotCloud OS</div>
            <div style="color:#c9d1d9;">
              <strong>ParrotCloud OS 6.0 (Lrz)</strong> is an enterprise-grade, browser-based Linux cybersecurity environment inspired by Parrot Security OS and Kali Linux. Designed for ethical hacking, network forensics, reverse engineering, and hands-on laboratory education.
            </div>
            <div style="background:#131a26; border:1px solid rgba(0,229,255,0.15); border-radius:6px; padding:12px; font-family:var(--font-mono); font-size:11.5px; color:#79c0ff;">
              <div>OS Edition: Parrot Security Cloud Edition (Browser Access)</div>
              <div>Base System: Debian 12 (Bookworm) AMD64</div>
              <div>Kernel: Linux parrotcloud 6.5.0-parrot1-amd64</div>
              <div>Container Runtime: Docker Engine / containerd</div>
              <div>Web Terminal: WebSocket PTY Stream + xterm-256color</div>
              <div>X11 Remote Access: TigerVNC + noVNC + WebSockets</div>
            </div>
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'settings',
      title: 'Settings - ParrotCloud OS Control Panel',
      icon: iconSvg,
      width: 740,
      height: 460,
      content: container
    });

    // Wire sidebar navigation
    container.querySelectorAll('.fm-sidebar-item').forEach(item => {
      item.onclick = () => {
        container.querySelectorAll('.fm-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        container.querySelector('#set-tab-cloud').style.display = tab === 'cloud' ? 'flex' : 'none';
        container.querySelector('#set-tab-wallpaper').style.display = tab === 'wallpaper' ? 'flex' : 'none';
        container.querySelector('#set-tab-about').style.display = tab === 'about' ? 'flex' : 'none';
      };
    });

    // Save WebSocket endpoint
    container.querySelector('#set-ws-save').onclick = () => {
      const ep = container.querySelector('#set-ws-endpoint').value.trim();
      localStorage.setItem('parrot_cloud_ws', ep);
      window.cloudClient.endpoint = ep;
      window.cloudClient.connect();
      window.notifications.show('Cloud Node', `Connecting to WebSocket endpoint: ${ep}`, 'info');
    };

    // Wallpaper selection
    const desktop = document.getElementById('desktop');
    container.querySelectorAll('.wallpaper-card').forEach(card => {
      card.onclick = () => {
        container.querySelectorAll('.wallpaper-card').forEach(c => c.style.borderColor = '#30363d');
        card.style.borderColor = 'var(--parrot-cyan)';
        const bg = card.dataset.bg;
        if (bg === 'toxic-green') {
          desktop.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #004d25 0%, #06110a 100%)';
        } else if (bg === 'cyber-night') {
          desktop.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #2a0b38 0%, #0c0512 100%)';
        } else if (bg === 'deep-void') {
          desktop.style.backgroundImage = 'none';
          desktop.style.backgroundColor = '#05070a';
        } else {
          desktop.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #00363d 0%, #070e17 100%)';
        }
        window.notifications.show('Appearance', 'Desktop wallpaper updated', 'info');
      };
    });
  }
}

window.settingsApp = new SettingsApp();
window.openSettingsApp = (tab) => window.settingsApp.open(tab);
