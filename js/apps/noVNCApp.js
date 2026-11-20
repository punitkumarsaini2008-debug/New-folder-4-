// ==============================================================================
// ParrotCloud OS - noVNC / Apache Guacamole Graphical Desktop Access
// Connects to TigerVNC / X11 Xfce Display for Full Graphical Cybersecurity Labs
// ==============================================================================

class NoVNCApp {
  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

    const container = document.createElement('div');
    container.className = 'novnc-container';
    container.innerHTML = `
      <div class="novnc-toolbar">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan);">noVNC WebSockets Stream</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#56d364; font-size:11px;">● Display :1 (1920x1080 RFB 003.008)</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn" id="novnc-send-cad">Ctrl+Alt+Del</button>
          <button class="tool-btn" id="novnc-fullscreen">Full Screen</button>
          <button class="tool-btn" id="novnc-reconnect">Reconnect</button>
        </div>
      </div>

      <div class="novnc-display-viewport">
        <!-- SIMULATED GRAPHICAL X11 STREAM CANVAS -->
        <canvas id="novnc-canvas" class="novnc-screen-canvas" width="800" height="460"></canvas>
        <div style="position:absolute; bottom:14px; left:14px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:4px; font-family:var(--font-mono); font-size:10px; color:var(--parrot-cyan); border:1px solid rgba(0,229,255,0.2);">
          [Stream: RFB Encrypted TightVNC | Host: ws://localhost:6080/websockify]
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'novnc',
      title: 'ParrotCloud OS - Graphical Desktop (noVNC / Guacamole X11)',
      icon: iconSvg,
      width: 820,
      height: 520,
      content: container
    });

    this.renderGraphicalDesktop(container);

    container.querySelector('#novnc-send-cad').onclick = () => {
      window.notifications.show('noVNC Client', 'Dispatched Ctrl+Alt+Del signal to X11 server', 'info');
    };

    container.querySelector('#novnc-reconnect').onclick = () => {
      window.notifications.show('noVNC Client', 'Reconnecting to websockify bridge...', 'info');
      this.renderGraphicalDesktop(container);
    };
  }

  renderGraphicalDesktop(container) {
    const canvas = container.querySelector('#novnc-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw deep dark background
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, w, h);

    // Draw cyber grid
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

    // Draw Parrot OS Logo & Text in center
    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Parrot Security OS (X11 Virtual Display)', w / 2, h / 2 - 20);

    ctx.fillStyle = '#8b949e';
    ctx.font = '13px monospace';
    ctx.fillText('TigerVNC Server + noVNC WebSockets Bridge', w / 2, h / 2 + 10);
    ctx.fillText('Isolated Docker Container GUI Workspace Active', w / 2, h / 2 + 32);

    // Draw mini simulated terminal window in graphical session
    ctx.fillStyle = '#0a0e14';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1.5;
    const mx = w / 2 - 180;
    const my = h / 2 + 60;
    ctx.fillRect(mx, my, 360, 110);
    ctx.strokeRect(mx, my, 360, 110);

    ctx.fillStyle = '#182230';
    ctx.fillRect(mx, my, 360, 22);

    ctx.fillStyle = '#00e5ff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('parrot@parrotcloud: ~/Labs (bash)', mx + 10, my + 15);

    ctx.fillStyle = '#56d364';
    ctx.fillText('$ whoami', mx + 10, my + 45);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('parrot', mx + 10, my + 62);
    ctx.fillStyle = '#56d364';
    ctx.fillText('$ nmap -F 192.168.1.100', mx + 10, my + 82);
    ctx.fillStyle = '#79c0ff';
    ctx.fillText('PORT 80/tcp open http (Apache/2.4.52)', mx + 10, my + 98);
  }
}

window.noVNCApp = new NoVNCApp();
window.openNoVNCApp = () => window.noVNCApp.open();
