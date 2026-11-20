// ==============================================================================
// ParrotCloud OS - System Monitor & Process Task Manager (Htop GUI)
// Real-Time CPU/RAM Live Canvas Graphs & Process Termination
// ==============================================================================

class SystemMonitorApp {
  constructor() {
    this.timer = null;
    this.cpuHistory = new Array(40).fill(15);
    this.memHistory = new Array(40).fill(32);
    this.processes = [
      { pid: 1, user: 'root', cpu: '0.0', mem: '0.1', cmd: '/sbin/init splash' },
      { pid: 142, user: 'root', cpu: '0.0', mem: '0.2', cmd: '/usr/sbin/sshd -D' },
      { pid: 310, user: 'root', cpu: '0.0', mem: '0.1', cmd: '/usr/sbin/cron -f' },
      { pid: 420, user: 'parrot', cpu: '0.2', mem: '0.6', cmd: '-bash (pts/0)' },
      { pid: 512, user: 'parrot', cpu: '0.4', mem: '1.2', cmd: 'node /app/server/index.js' },
      { pid: 680, user: 'parrot', cpu: '2.1', mem: '2.8', cmd: 'python3 /home/parrot/Labs/scanner.py' },
      { pid: 720, user: 'root', cpu: '0.0', mem: '0.4', cmd: 'dockerd --containerd=/run/containerd' }
    ];
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">System Resource Monitor</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#8b949e; font-size:11px;">Container cgroup Limits: <strong>2 vCPU / 2048 MB RAM</strong></span>
        </div>
        <button class="tool-btn danger" id="sysmon-kill-btn">End Process</button>
      </div>

      <div class="sysmon-graphs-grid">
        <div class="sysmon-chart-card">
          <div class="sysmon-chart-header">
            <span>CPU History (AMD EPYC 4 Cores)</span>
            <span id="sysmon-cpu-val" style="color:var(--parrot-cyan);">18%</span>
          </div>
          <canvas class="sysmon-canvas" id="sysmon-cpu-canvas" width="340" height="90"></canvas>
        </div>

        <div class="sysmon-chart-card">
          <div class="sysmon-chart-header">
            <span>Memory & Swap History (2.4 GB / 8.0 GB)</span>
            <span id="sysmon-mem-val" style="color:var(--parrot-green);">32%</span>
          </div>
          <canvas class="sysmon-canvas" id="sysmon-mem-canvas" width="340" height="90"></canvas>
        </div>
      </div>

      <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <div style="padding:6px 10px; background:#141c28; border-bottom:1px solid #30363d; font-size:11px; font-weight:600; color:#8b949e;">
          Active Process List (${this.processes.length} Processes)
        </div>
        <div style="flex:1; overflow-y:auto;">
          <table class="ws-table">
            <thead>
              <tr>
                <th style="width:60px;">PID</th>
                <th style="width:75px;">User</th>
                <th style="width:70px;">%CPU</th>
                <th style="width:70px;">%MEM</th>
                <th>Command</th>
              </tr>
            </thead>
            <tbody id="sysmon-proc-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'sysmon',
      title: 'Task Manager & System Resource Monitor',
      icon: iconSvg,
      width: 760,
      height: 480,
      content: container,
      onClose: () => {
        clearInterval(this.timer);
      }
    });

    this.renderProcesses(container);
    this.startChartLoop(container);

    // Kill Process button
    container.querySelector('#sysmon-kill-btn').onclick = () => {
      const selected = container.querySelector('#sysmon-proc-tbody .selected');
      if (selected) {
        const pid = parseInt(selected.dataset.pid);
        this.processes = this.processes.filter(p => p.pid !== pid);
        this.renderProcesses(container);
        window.notifications.show('System Monitor', `SIGKILL dispatched to PID ${pid}`, 'warning');
      } else {
        alert('Please select a process from the table first.');
      }
    };
  }

  renderProcesses(container) {
    const tbody = container.querySelector('#sysmon-proc-tbody');
    tbody.innerHTML = '';
    this.processes.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = 'ws-row';
      tr.dataset.pid = p.pid;
      tr.innerHTML = `
        <td><strong style="color:var(--parrot-cyan);">${p.pid}</strong></td>
        <td>${p.user}</td>
        <td>${p.cpu}%</td>
        <td>${p.mem}%</td>
        <td style="font-family:var(--font-mono); font-size:11px;">${p.cmd}</td>
      `;

      tr.onclick = () => {
        container.querySelectorAll('#sysmon-proc-tbody .ws-row').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
      };

      tbody.appendChild(tr);
    });
  }

  startChartLoop(container) {
    const cpuCanvas = container.querySelector('#sysmon-cpu-canvas');
    const memCanvas = container.querySelector('#sysmon-mem-canvas');
    const cpuValEl = container.querySelector('#sysmon-cpu-val');
    const memValEl = container.querySelector('#sysmon-mem-val');

    clearInterval(this.timer);
    this.timer = setInterval(() => {
      // Simulate slight fluctuations or sync with cloudClient metrics
      const newCpu = Math.floor(Math.random() * 10 + (window.cloudClient.metrics.cpu || 15));
      const newMem = Math.floor(Math.random() * 4 + (window.cloudClient.metrics.memory || 32));

      this.cpuHistory.push(newCpu);
      this.cpuHistory.shift();

      this.memHistory.push(newMem);
      this.memHistory.shift();

      if (cpuValEl) cpuValEl.textContent = `${newCpu}%`;
      if (memValEl) memValEl.textContent = `${newMem}%`;

      this.drawWave(cpuCanvas, this.cpuHistory, '#00e5ff');
      this.drawWave(memCanvas, this.memHistory, '#05d550');
    }, 1000);
  }

  drawWave(canvas, data, color) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 15; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw filled curve
    ctx.beginPath();
    ctx.moveTo(0, h);

    const step = w / (data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = h - (data[i] / 100) * (h - 10);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    ctx.fillStyle = color === '#00e5ff' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(5, 213, 80, 0.15)';
    ctx.fill();

    // Draw stroke line
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = h - (data[i] / 100) * (h - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

window.systemMonitorApp = new SystemMonitorApp();
window.openSystemMonitorApp = () => window.systemMonitorApp.open();
