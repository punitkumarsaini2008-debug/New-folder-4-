// ==============================================================================
// ParrotCloud OS - Nmap Network Exploration & Security Scanner (Zenmap Cloud)
// ==============================================================================

class NmapApp {
  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Nmap 7.94 GUI</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#8b949e;">Network Mapper & Port Scanner</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn" id="nmap-quick-192">Target: 192.168.1.100</button>
          <button class="tool-btn" id="nmap-quick-scanme">Target: scanme.nmap.org</button>
        </div>
      </div>

      <div class="nmap-controls-grid">
        <label style="font-weight:600; color:#8b949e; font-size:11.5px;">Target:</label>
        <input type="text" class="nmap-input" id="nmap-target-input" value="192.168.1.100" placeholder="e.g. 192.168.1.100 or scanme.nmap.org" />
        <select class="nmap-select" id="nmap-profile-select">
          <option value="-T4 -A -v">Intense scan (-T4 -A -v)</option>
          <option value="-F">Quick scan (-F)</option>
          <option value="-sV -sC -T4">Service / Script scan (-sV -sC)</option>
          <option value="-sn">Ping scan (-sn)</option>
          <option value="-p 1-65535 -T4">All TCP Ports (-p 1-65535)</option>
        </select>
        <button class="tool-btn primary" id="nmap-run-btn">
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Scan
        </button>
      </div>

      <div class="tool-nav-tabs">
        <div class="tool-nav-tab active" data-tab="output">Nmap Output</div>
        <div class="tool-nav-tab" data-tab="ports">Ports / Hosts (4)</div>
        <div class="tool-nav-tab" data-tab="topology">Topology</div>
      </div>

      <div id="nmap-tab-output" class="nmap-scan-output">
Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-20 08:50:00 UTC
Click "Scan" above to execute an authorized network audit on the selected target...
      </div>

      <div id="nmap-tab-ports" style="display:none; flex:1; overflow-y:auto; padding:10px; background:#080c12;">
        <table class="ws-table">
          <thead>
            <tr>
              <th>Port</th>
              <th>Protocol</th>
              <th>State</th>
              <th>Service</th>
              <th>Version</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody id="nmap-ports-tbody">
            <tr><td colspan="6" style="text-align:center; color:#8b949e; padding:15px;">No scan performed yet.</td></tr>
          </tbody>
        </table>
      </div>

      <div id="nmap-tab-topology" style="display:none; flex:1; display:flex; align-items:center; justify-content:center; background:#070a0f;">
        <div style="text-align:center; color:var(--parrot-cyan); font-family:var(--font-mono); font-size:12px;">
          <div style="margin-bottom:12px; font-size:14px; font-weight:700;">[Network Topology Map]</div>
          <div style="color:#56d364;">[ParrotCloud Gateway: 192.168.1.1]</div>
          <div style="color:#8b949e;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
          <div style="color:#8b949e;">┌───────────┴───────────┐</div>
          <div style="display:flex; justify-content:center; gap:40px; margin-top:8px;">
            <div style="color:#79c0ff;">[Web: 192.168.1.100]<br><span style="font-size:10px; color:#ff7b72;">(Apache/2.4.52)</span></div>
            <div style="color:#79c0ff;">[FTP: 192.168.1.150]<br><span style="font-size:10px; color:#f2cc60;">(vsftpd 2.3.4)</span></div>
            <div style="color:#79c0ff;">[MySQL: 192.168.1.200]<br><span style="font-size:10px; color:#56d364;">(MySQL 5.7)</span></div>
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'nmap',
      title: 'Nmap Network Scanner (Zenmap Cloud)',
      icon: iconSvg,
      width: 760,
      height: 500,
      content: container
    });

    // Wire up events
    const runBtn = container.querySelector('#nmap-run-btn');
    const targetInput = container.querySelector('#nmap-target-input');
    const profileSelect = container.querySelector('#nmap-profile-select');
    const outputEl = container.querySelector('#nmap-tab-output');
    const portsTbody = container.querySelector('#nmap-ports-tbody');

    // Quick target buttons
    container.querySelector('#nmap-quick-192').onclick = () => { targetInput.value = '192.168.1.100'; };
    container.querySelector('#nmap-quick-scanme').onclick = () => { targetInput.value = 'scanme.nmap.org'; };

    // Tabs
    const tabs = container.querySelectorAll('.tool-nav-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#nmap-tab-output').style.display = tab.dataset.tab === 'output' ? 'block' : 'none';
        container.querySelector('#nmap-tab-ports').style.display = tab.dataset.tab === 'ports' ? 'block' : 'none';
        container.querySelector('#nmap-tab-topology').style.display = tab.dataset.tab === 'topology' ? 'flex' : 'none';
      };
    });

    runBtn.onclick = async () => {
      const target = targetInput.value.trim() || '192.168.1.100';
      const flags = profileSelect.value;
      runBtn.disabled = true;
      runBtn.innerHTML = `Scanning...`;
      outputEl.textContent = `Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-20 08:52:10 UTC\nInitiating SYN Stealth Scan against ${target}...\nScanning ${target} [1000 ports]...`;

      window.notifications.show('Nmap Scanner', `Scanning target: ${target}`, 'info');

      setTimeout(async () => {
        const result = await window.cloudClient.localEngine.cmdNmap([target]);
        outputEl.textContent = result;
        runBtn.disabled = false;
        runBtn.innerHTML = `<svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Scan`;

        // Populate ports table
        portsTbody.innerHTML = `
          <tr><td>22</td><td>tcp</td><td><span class="risk-badge risk-info">open</span></td><td>ssh</td><td>OpenSSH 9.2p1 Debian</td><td><span class="risk-badge risk-low">Low</span></td></tr>
          <tr><td>80</td><td>tcp</td><td><span class="risk-badge risk-info">open</span></td><td>http</td><td>Apache httpd 2.4.52</td><td><span class="risk-badge risk-medium">Medium</span></td></tr>
          <tr><td>443</td><td>tcp</td><td><span class="risk-badge risk-info">open</span></td><td>ssl/http</td><td>Apache httpd 2.4.52 (TLSv1.3)</td><td><span class="risk-badge risk-low">Low</span></td></tr>
          <tr><td>3306</td><td>tcp</td><td><span class="risk-badge risk-info">open</span></td><td>mysql</td><td>MySQL 5.7.38-log</td><td><span class="risk-badge risk-high">High</span></td></tr>
        `;
        window.notifications.show('Nmap Scanner', `Scan completed for ${target}. 4 open ports identified.`, 'info');
      }, 1200);
    };
  }
}

window.nmapApp = new NmapApp();
window.openNmapApp = () => window.nmapApp.open();
