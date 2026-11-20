// ==============================================================================
// Multi-User Linux Cloud Desktop - System Settings & Cloud Node Manager
// Provides User Registration, Login, Container Lifecycle, & Telemetry
// ==============================================================================

class SettingsApp {
  open(initialTab = 'cloud') {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="fm-split-pane">
        <!-- SETTINGS SIDEBAR -->
        <div class="fm-sidebar" style="width:210px;">
          <div class="fm-sidebar-group">
            <div class="fm-sidebar-title">Cloud Platform</div>
            <div class="fm-sidebar-item ${initialTab === 'cloud' ? 'active' : ''}" data-tab="cloud">
              <span style="color:var(--parrot-cyan);"><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg></span>
              Cloud Container & VM
            </div>
            <div class="fm-sidebar-item ${initialTab === 'account' ? 'active' : ''}" data-tab="account">
              <span style="color:#56d364;"><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
              User Account & Quota
            </div>
            <div class="fm-sidebar-item ${initialTab === 'capacity' ? 'active' : ''}" data-tab="capacity">
              <span style="color:#e95420;"><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"></rect><rect x="2" y="14" width="20" height="8" rx="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg></span>
              Server Capacity & Limits
            </div>
            <div class="fm-sidebar-title" style="margin-top:12px;">Appearance</div>
            <div class="fm-sidebar-item ${initialTab === 'wallpaper' ? 'active' : ''}" data-tab="wallpaper">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></span>
              Desktop & Wallpaper
            </div>
            <div class="fm-sidebar-item" data-tab="about">
              <span><svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
              About CloudOS
            </div>
          </div>
        </div>

        <!-- SETTINGS MAIN CONTENT -->
        <div class="fm-content-area" style="padding:18px; overflow-y:auto; gap:16px;">
          
          <!-- TAB 1: CLOUD CONTAINER LIFECYCLE -->
          <div id="set-tab-cloud" style="display:${initialTab === 'cloud' ? 'flex' : 'none'}; flex-direction:column; gap:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">Cloud Container Session Manager</div>
              <div id="set-mode-badge" style="font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:4px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#8b949e;">
                MODE: ${window.cloudClient.mode}
              </div>
            </div>

            <!-- Active Container Card -->
            <div style="background:#131a26; border:1px solid rgba(0,229,255,0.2); border-radius:6px; padding:14px; display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:700; color:#ffffff; font-size:13px;">Active Linux Desktop Container</div>
                <div id="set-container-status-badge" style="font-size:11px; font-family:var(--font-mono); color:#56d364;">
                  ${window.cloudClient.activeSession ? 'RUNNING' : 'STANDBY (OFFLINE)'}
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11.5px; color:#8b949e;">
                <div>Allocated OS: <strong id="set-session-os" style="color:#ffffff;">${window.cloudClient.activeSession?.osId?.toUpperCase() || 'UBUNTU 24.04'}</strong></div>
                <div>Memory cgroup: <strong style="color:#ffffff;">2048 MB (2.0 GB)</strong></div>
                <div>CPU Quota: <strong style="color:#ffffff;">1.5 Cores</strong></div>
                <div>Idle Timeout: <strong style="color:#e95420;">15 min (Auto-Stop)</strong></div>
              </div>

              <div style="display:flex; gap:8px; margin-top:6px;">
                <button class="tool-btn primary" id="btn-start-cloud-session">
                  <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Spin Up Cloud Container
                </button>
                <button class="tool-btn danger" id="btn-stop-cloud-session" ${!window.cloudClient.activeSession ? 'disabled' : ''}>
                  <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>
                  Stop Container (Release RAM)
                </button>
              </div>
            </div>

            <!-- WebSocket Gateway Configuration -->
            <div style="background:#131a26; border:1px solid #30363d; border-radius:6px; padding:14px; display:flex; flex-direction:column; gap:8px;">
              <div style="font-weight:600; color:#ffffff;">Backend REST & WebSocket Endpoint</div>
              <div style="font-size:11.5px; color:#8b949e;">Hostname of the Ubuntu server running Node.js, Caddy, & guacd:</div>
              <div style="display:flex; gap:8px;">
                <input type="text" class="nmap-input" id="set-api-endpoint" value="${window.cloudClient.apiBase}" style="flex:1;" />
                <button class="tool-btn secondary" id="btn-save-api-endpoint">Save Endpoint</button>
              </div>
            </div>
          </div>

          <!-- TAB 2: USER ACCOUNT & AUTHENTICATION -->
          <div id="set-tab-account" style="display:${initialTab === 'account' ? 'flex' : 'none'}; flex-direction:column; gap:14px;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">User Account & Session Authentication</div>

            <div id="set-auth-profile-box" style="display:${window.cloudClient.user ? 'flex' : 'none'}; flex-direction:column; gap:12px; background:#131a26; border:1px solid rgba(0,229,255,0.2); border-radius:6px; padding:14px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:44px; height:44px; border-radius:50%; background:rgba(0,229,255,0.15); border:1px solid var(--parrot-cyan); display:flex; align-items:center; justify-content:center; color:var(--parrot-cyan);">
                  <svg style="width:22px;height:22px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div style="font-size:14px; font-weight:700; color:#ffffff;" id="set-profile-username">${window.cloudClient.user?.username || 'User'}</div>
                  <div style="font-size:11px; color:#8b949e;" id="set-profile-email">${window.cloudClient.user?.email || ''}</div>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:11.5px; color:#8b949e; margin-top:4px;">
                <div>Account Role: <strong style="color:#56d364;">${window.cloudClient.user?.role || 'user'}</strong></div>
                <div>Persistent Disk Quota: <strong style="color:#ffffff;">5,120 MB (5 GB)</strong></div>
                <div>Concurrent Limit: <strong style="color:#ffffff;">1 Active Container</strong></div>
                <div>Storage Location: <code style="color:#79c0ff;">/data/users/user_${window.cloudClient.user?.id}/home</code></div>
              </div>
              <button class="tool-btn danger" id="btn-logout-user" style="width:max-content; margin-top:8px;">Sign Out</button>
            </div>

            <!-- Login / Register Form (when logged out) -->
            <div id="set-auth-form-box" style="display:${!window.cloudClient.user ? 'flex' : 'none'}; flex-direction:column; gap:12px; background:#131a26; border:1px solid #30363d; border-radius:6px; padding:14px;">
              <div style="display:flex; gap:8px; border-bottom:1px solid #30363d; padding-bottom:8px;">
                <button class="tool-btn primary" id="btn-toggle-login-mode" style="font-size:11.5px;">Sign In</button>
                <button class="tool-btn secondary" id="btn-toggle-reg-mode" style="font-size:11.5px;">Create Free Account</button>
              </div>

              <div style="display:flex; flex-direction:column; gap:8px;">
                <div>
                  <label style="font-size:11px; color:#8b949e; display:block; margin-bottom:4px;">Username</label>
                  <input type="text" class="nmap-input" id="auth-input-username" placeholder="Enter username..." style="width:100%;" />
                </div>
                <div id="auth-email-field" style="display:none;">
                  <label style="font-size:11px; color:#8b949e; display:block; margin-bottom:4px;">Email Address</label>
                  <input type="email" class="nmap-input" id="auth-input-email" placeholder="user@example.com" style="width:100%;" />
                </div>
                <div>
                  <label style="font-size:11px; color:#8b949e; display:block; margin-bottom:4px;">Password</label>
                  <input type="password" class="nmap-input" id="auth-input-password" placeholder="••••••••" style="width:100%;" />
                </div>
                <button class="tool-btn primary" id="btn-auth-submit" style="margin-top:6px;">Sign In to CloudOS</button>
              </div>
            </div>
          </div>

          <!-- TAB 3: SERVER CAPACITY & RESOURCE QUOTAS -->
          <div id="set-tab-capacity" style="display:${initialTab === 'capacity' ? 'flex' : 'none'}; flex-direction:column; gap:14px;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">Free Server Resource Capacity Model</div>
            <div style="font-size:12px; color:#8b949e; line-height:1.5;">
              This platform runs on an isolated Ubuntu Server ARM64 host with automatic capacity management to prevent Out-Of-Memory (OOM) crashes:
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div style="background:#131a26; border:1px solid #30363d; border-radius:6px; padding:12px;">
                <div style="font-size:11px; color:#8b949e;">Active Container Slots</div>
                <div style="font-size:22px; font-weight:700; color:#56d364;" id="set-cap-active">1 / 8 Slots</div>
              </div>
              <div style="background:#131a26; border:1px solid #30363d; border-radius:6px; padding:12px;">
                <div style="font-size:11px; color:#8b949e;">Idle Container Reaper</div>
                <div style="font-size:22px; font-weight:700; color:#e95420;">15 min</div>
              </div>
            </div>

            <div style="background:#131a26; border:1px solid #30363d; border-radius:6px; padding:12px; font-size:11.5px; color:#c9d1d9; line-height:1.6;">
              <div>• <strong>Host Platform:</strong> Ubuntu 24.04 LTS ARM64 (aarch64)</div>
              <div>• <strong>Host CPU Cores:</strong> 4 OCPU (Ampere Neoverse-N1)</div>
              <div>• <strong>Host Total RAM:</strong> 24 GB LPDDR4</div>
              <div>• <strong>Remote Desktop Protocol:</strong> Apache Guacamole (guacd) over WSS</div>
              <div>• <strong>Reverse Proxy:</strong> Caddy 2 with automated Let's Encrypt TLS</div>
            </div>
          </div>

          <!-- TAB 4: WALLPAPERS (Preserved) -->
          <div id="set-tab-wallpaper" style="display:${initialTab === 'wallpaper' ? 'flex' : 'none'}; flex-direction:column; gap:16px;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">Desktop Wallpaper & Theme</div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
              <div class="wallpaper-card" data-bg="parrot-cyber" style="cursor:pointer; border:1px solid var(--parrot-cyan); border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:90px; background:radial-gradient(circle at 50% 50%, #00363d 0%, #070e17 100%); display:flex; align-items:center; justify-content:center; color:var(--parrot-cyan); font-weight:700;">
                  Parrot Cyber
                </div>
                <div style="padding:5px; font-size:11px; text-align:center; color:#c9d1d9;">Electric Cyan Mesh</div>
              </div>

              <div class="wallpaper-card" data-bg="ubuntu-orange" style="cursor:pointer; border:1px solid #30363d; border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:90px; background:radial-gradient(circle at 50% 50%, #5e2750 0%, #2c001e 100%); display:flex; align-items:center; justify-content:center; color:#E95420; font-weight:700;">
                  Ubuntu Noble
                </div>
                <div style="padding:5px; font-size:11px; text-align:center; color:#c9d1d9;">Aubergine & Orange</div>
              </div>

              <div class="wallpaper-card" data-bg="kali-dragon" style="cursor:pointer; border:1px solid #30363d; border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:90px; background:radial-gradient(circle at 50% 50%, #152238 0%, #080f1a 100%); display:flex; align-items:center; justify-content:center; color:#2a7fff; font-weight:700;">
                  Kali Blue
                </div>
                <div style="padding:5px; font-size:11px; text-align:center; color:#c9d1d9;">Electric Blue</div>
              </div>

              <div class="wallpaper-card" data-bg="mint-green" style="cursor:pointer; border:1px solid #30363d; border-radius:6px; overflow:hidden; background:#080d14;">
                <div style="height:90px; background:radial-gradient(circle at 50% 50%, #1a3320 0%, #0a170d 100%); display:flex; align-items:center; justify-content:center; color:#87CF3E; font-weight:700;">
                  Linux Mint
                </div>
                <div style="padding:5px; font-size:11px; text-align:center; color:#c9d1d9;">Cinnamon Green</div>
              </div>
            </div>
          </div>

          <!-- TAB 5: ABOUT CLOUDOS -->
          <div id="set-tab-about" style="display:${initialTab === 'about' ? 'flex' : 'none'}; flex-direction:column; gap:12px; font-size:12px; line-height:1.6;">
            <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">About Multi-User CloudOS Platform</div>
            <div style="color:#c9d1d9;">
              <strong>Multi-User Linux Cloud Desktop Platform v2.0.0</strong> is a real Linux workspace providing isolated, container-backed desktop and terminal sessions inside web browsers. Designed for resource-constrained cloud servers with automated idle reapers, cgroup limits, and Apache Guacamole streaming.
            </div>
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'settings',
      title: 'Settings - Multi-User CloudOS Control Panel',
      icon: iconSvg,
      width: 760,
      height: 480,
      content: container
    });

    // Wire sidebar navigation
    container.querySelectorAll('.fm-sidebar-item').forEach(item => {
      item.onclick = () => {
        container.querySelectorAll('.fm-sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        container.querySelector('#set-tab-cloud').style.display = tab === 'cloud' ? 'flex' : 'none';
        container.querySelector('#set-tab-account').style.display = tab === 'account' ? 'flex' : 'none';
        container.querySelector('#set-tab-capacity').style.display = tab === 'capacity' ? 'flex' : 'none';
        container.querySelector('#set-tab-wallpaper').style.display = tab === 'wallpaper' ? 'flex' : 'none';
        container.querySelector('#set-tab-about').style.display = tab === 'about' ? 'flex' : 'none';
      };
    });

    // Wire Auth Form Toggles
    let isRegisterMode = false;
    const btnToggleLogin = container.querySelector('#btn-toggle-login-mode');
    const btnToggleReg = container.querySelector('#btn-toggle-reg-mode');
    const emailField = container.querySelector('#auth-email-field');
    const btnAuthSubmit = container.querySelector('#btn-auth-submit');

    if (btnToggleLogin && btnToggleReg) {
      btnToggleLogin.onclick = () => {
        isRegisterMode = false;
        btnToggleLogin.className = 'tool-btn primary';
        btnToggleReg.className = 'tool-btn secondary';
        emailField.style.display = 'none';
        btnAuthSubmit.textContent = 'Sign In to CloudOS';
      };

      btnToggleReg.onclick = () => {
        isRegisterMode = true;
        btnToggleLogin.className = 'tool-btn secondary';
        btnToggleReg.className = 'tool-btn primary';
        emailField.style.display = 'block';
        btnAuthSubmit.textContent = 'Create Free Account';
      };

      btnAuthSubmit.onclick = async () => {
        const u = container.querySelector('#auth-input-username').value.trim();
        const p = container.querySelector('#auth-input-password').value;
        const e = container.querySelector('#auth-input-email').value.trim();

        if (isRegisterMode) {
          await window.cloudClient.register(u, e, p);
        } else {
          await window.cloudClient.login(u, p);
        }

        // Re-render tabs on login
        if (window.cloudClient.user) {
          container.querySelector('#set-auth-profile-box').style.display = 'flex';
          container.querySelector('#set-auth-form-box').style.display = 'none';
          container.querySelector('#set-profile-username').textContent = window.cloudClient.user.username;
          container.querySelector('#set-profile-email').textContent = window.cloudClient.user.email;
        }
      };
    }

    // Wire Logout
    const btnLogout = container.querySelector('#btn-logout-user');
    if (btnLogout) {
      btnLogout.onclick = () => {
        window.cloudClient.logout();
        container.querySelector('#set-auth-profile-box').style.display = 'none';
        container.querySelector('#set-auth-form-box').style.display = 'flex';
      };
    }

    // Wire Container Lifecycle Buttons
    const btnStartSession = container.querySelector('#btn-start-cloud-session');
    const btnStopSession = container.querySelector('#btn-stop-cloud-session');

    if (btnStartSession) {
      btnStartSession.onclick = async () => {
        const activeOs = localStorage.getItem('active_os') || 'ubuntu';
        await window.cloudClient.startCloudSession(activeOs);
        container.querySelector('#btn-stop-cloud-session').removeAttribute('disabled');
      };
    }

    if (btnStopSession) {
      btnStopSession.onclick = async () => {
        await window.cloudClient.stopCloudSession();
        container.querySelector('#btn-stop-cloud-session').setAttribute('disabled', 'true');
      };
    }

    // Wire Endpoint Save
    const btnSaveEndpoint = container.querySelector('#btn-save-api-endpoint');
    if (btnSaveEndpoint) {
      btnSaveEndpoint.onclick = () => {
        const ep = container.querySelector('#set-api-endpoint').value.trim();
        localStorage.setItem('cloudos_api_base', ep);
        window.cloudClient.apiBase = ep;
        window.notifications.show('Endpoint Saved', `API Base set to: ${ep}`, 'info');
      };
    }

    // Wallpaper selection
    const desktop = document.getElementById('desktop');
    container.querySelectorAll('.wallpaper-card').forEach(card => {
      card.onclick = () => {
        container.querySelectorAll('.wallpaper-card').forEach(c => c.style.borderColor = '#30363d');
        card.style.borderColor = 'var(--parrot-cyan)';
        const bg = card.dataset.bg;
        if (bg === 'ubuntu-orange') {
          desktop.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #5e2750 0%, #2c001e 100%)';
        } else if (bg === 'kali-dragon') {
          desktop.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #152238 0%, #080f1a 100%)';
        } else if (bg === 'mint-green') {
          desktop.style.backgroundImage = 'radial-gradient(circle at 50% 50%, #1a3320 0%, #0a170d 100%)';
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
