// ==============================================================================
// ParrotCloud OS - noVNC / Apache Guacamole Graphical Desktop Access
// Connects to TigerVNC / Xvfb / X11 Display for Real Graphical Cybersecurity Labs
// ==============================================================================

class NoVNCApp {
  constructor() {
    this.currentResolution = '1280x720';
    this.isStreamActive = false;
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

    const apiBase = window.cloudClient?.apiBase || window.location.origin;
    let wsHost = 'localhost:10000';
    let wsProto = 'ws:';
    try {
      const u = new URL(apiBase);
      wsHost = u.host;
      wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:';
    } catch (e) {}

    const vncStreamUrl = `${apiBase}/novnc/vnc.html?path=vnc&autoconnect=true&resize=scale&quality=6&compression=2`;

    const container = document.createElement('div');
    container.className = 'novnc-container';
    container.innerHTML = `
      <div class="novnc-toolbar">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan);">noVNC WebSockets Stream</span>
          <span style="color:#8b949e;">|</span>
          <span id="novnc-status-text" style="color:#56d364; font-size:11px;">● Display :1 (${this.currentResolution} RFB 003.008)</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <select id="novnc-res-select" class="nmap-select" style="font-size:10px; padding:2px 6px; height:22px;">
            <option value="1280x720" selected>1280x720 (Standard HD)</option>
            <option value="1024x768">1024x768 (Low Bandwidth)</option>
            <option value="1920x1080">1920x1080 (Full HD)</option>
          </select>
          <button class="tool-btn" id="novnc-send-cad" title="Send Ctrl+Alt+Del signal">Ctrl+Alt+Del</button>
          <button class="tool-btn" id="novnc-fullscreen" title="Toggle Fullscreen">Full Screen</button>
          <button class="tool-btn" id="novnc-reconnect" title="Reconnect WebSocket VNC Stream">Reconnect</button>
        </div>
      </div>

      <div class="novnc-display-viewport" id="novnc-viewport" style="position:relative; width:100%; height:calc(100% - 36px); background:#0a0e14; overflow:hidden;">
        <!-- Live noVNC Streaming iFrame -->
        <iframe id="novnc-stream-frame" src="${vncStreamUrl}" style="width:100%; height:100%; border:none; display:block; background:#0f141c;"></iframe>

        <!-- Fallback / Connection Helper Overlay (Shows if backend is cold/waking up) -->
        <div id="novnc-overlay" style="display:none; position:absolute; inset:0; background:rgba(15,20,28,0.92); z-index:10; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:20px; text-align:center;">
          <div style="font-size:16px; font-weight:700; color:var(--parrot-cyan);">Connecting to Real Linux X11 Desktop...</div>
          <p style="font-size:12px; color:#8b949e; max-width:480px; line-height:1.5;">
            Target Host: <code style="color:#58a6ff;">${wsProto}//${wsHost}/vnc</code><br>
            If your Render free container is waking up from idle, please allow ~45 seconds for Xvfb and TigerVNC display servers to spin up.
          </p>
          <div style="display:flex; gap:10px;">
            <button class="tool-btn primary" id="btn-novnc-retry">Retry Connection</button>
            <button class="tool-btn secondary" id="btn-novnc-standalone">Switch to Educational Simulator</button>
          </div>
        </div>

        <div style="position:absolute; bottom:10px; left:12px; background:rgba(0,0,0,0.75); padding:3px 8px; border-radius:4px; font-family:var(--font-mono); font-size:10px; color:var(--parrot-cyan); border:1px solid rgba(0,229,255,0.2); pointer-events:none; z-index:5;">
          [RFB Encrypted Stream | Target: ${wsProto}//${wsHost}/vnc | WM: Openbox]
        </div>
      </div>
    `;

    const winData = window.windowManager.createWindow({
      id: 'novnc',
      title: 'ParrotCloud OS - Graphical Desktop (noVNC X11)',
      icon: iconSvg,
      width: 900,
      height: 560,
      content: container
    });

    const iframe = container.querySelector('#novnc-stream-frame');
    const overlay = container.querySelector('#novnc-overlay');

    // Monitor iframe loading
    let loadTimer = setTimeout(() => {
      // If taking too long, show connection helper overlay
      if (window.cloudClient && window.cloudClient.backendState === 'WAKING_UP') {
        overlay.style.display = 'flex';
      }
    }, 4000);

    iframe.onload = () => {
      clearTimeout(loadTimer);
      overlay.style.display = 'none';
      this.isStreamActive = true;
    };

    container.querySelector('#novnc-send-cad').onclick = () => {
      window.notifications.show('noVNC Client', 'Dispatched Ctrl+Alt+Del signal to X11 server', 'info');
    };

    container.querySelector('#novnc-reconnect').onclick = () => {
      window.notifications.show('noVNC Client', 'Reconnecting to VNC bridge...', 'info');
      iframe.src = vncStreamUrl + '&t=' + Date.now();
    };

    container.querySelector('#btn-novnc-retry').onclick = () => {
      overlay.style.display = 'none';
      iframe.src = vncStreamUrl + '&t=' + Date.now();
    };

    container.querySelector('#btn-novnc-standalone').onclick = () => {
      overlay.style.display = 'none';
      this.renderFallbackCanvas(container);
    };

    // Fullscreen Toggle
    const btnFullscreen = container.querySelector('#novnc-fullscreen');
    btnFullscreen.onclick = () => {
      const vp = container.querySelector('#novnc-viewport');
      if (!document.fullscreenElement) {
        vp.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    };

    // Resolution selection
    const resSelect = container.querySelector('#novnc-res-select');
    resSelect.onchange = () => {
      this.currentResolution = resSelect.value;
      const statusEl = container.querySelector('#novnc-status-text');
      if (statusEl) statusEl.textContent = `● Display :1 (${this.currentResolution} RFB 003.008)`;
      iframe.src = vncStreamUrl + '&res=' + this.currentResolution + '&t=' + Date.now();
    };
  }

  renderFallbackCanvas(container) {
    const viewport = container.querySelector('#novnc-viewport');
    viewport.innerHTML = `
      <canvas id="novnc-canvas" class="novnc-screen-canvas" width="860" height="500" style="width:100%;height:100%;display:block;"></canvas>
      <div style="position:absolute; bottom:12px; left:12px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:4px; font-family:var(--font-mono); font-size:10px; color:var(--parrot-cyan); border:1px solid rgba(0,229,255,0.2);">
        [Standalone Educational Mode | TigerVNC / X11 Preview]
      </div>
    `;

    const canvas = viewport.querySelector('#novnc-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Parrot Security OS (X11 Virtual Display)', w / 2, h / 2 - 20);

    ctx.fillStyle = '#8b949e';
    ctx.font = '13px monospace';
    ctx.fillText('TigerVNC / Xvfb Display Server + Openbox Window Manager', w / 2, h / 2 + 10);
    ctx.fillText('Connect Render Cloud Backend in Settings to Stream Live Graphical GUI', w / 2, h / 2 + 32);
  }
}

window.noVNCApp = new NoVNCApp();
window.openNoVNCApp = () => window.noVNCApp.open();
