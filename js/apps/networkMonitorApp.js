// ==============================================================================
// Multi-OS Cybersecurity Platform - Network Monitor
// Real-Time Interface Traffic, Active Sockets, & Connectivity Diagnostics
// ==============================================================================

class NetworkMonitorApp {
  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131a26; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Network Interface Monitor</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#56d364; font-size:11px;">Active vNIC: <strong>eth0 (192.168.1.105/24)</strong></span>
        </div>
        <button class="tool-btn primary" id="netmon-ping-btn">Ping Gateway (192.168.1.1)</button>
      </div>

      <div style="padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#080c12;">
        <div class="sysmon-chart-card">
          <div class="sysmon-chart-header">
            <span>Inbound Traffic (Rx: 142.4 KB/s)</span>
            <span style="color:#00e5ff;">eth0 Rx</span>
          </div>
          <div style="font-family:var(--font-mono); font-size:11px; color:#8b949e; line-height:1.6; padding:6px;">
            Packets Received: 4,120 pkts<br>
            Bytes Inbound: 3.42 MB<br>
            Errors: 0 | Dropped: 0
          </div>
        </div>
        <div class="sysmon-chart-card">
          <div class="sysmon-chart-header">
            <span>Outbound Traffic (Tx: 84.1 KB/s)</span>
            <span style="color:#05d550;">eth0 Tx</span>
          </div>
          <div style="font-family:var(--font-mono); font-size:11px; color:#8b949e; line-height:1.6; padding:6px;">
            Packets Transmitted: 3,890 pkts<br>
            Bytes Outbound: 2.18 MB<br>
            Collisions: 0 | Carrier: 0
          </div>
        </div>
      </div>

      <div style="flex:1; display:flex; flex-direction:column; background:#080c12; overflow:hidden;">
        <div style="padding:6px 12px; background:#141c28; font-size:11px; font-weight:700; color:#8b949e; border-top:1px solid #30363d;">
          Active Sockets & Established Network Connections
        </div>
        <div style="flex:1; overflow-y:auto; padding:8px;">
          <table class="ws-table">
            <thead>
              <tr><th>Proto</th><th>Local Address</th><th>Foreign Address</th><th>State</th><th>PID/Program</th></tr>
            </thead>
            <tbody>
              <tr><td>tcp</td><td>192.168.1.105:54286</td><td>192.168.1.100:80</td><td><span class="risk-badge risk-info">ESTABLISHED</span></td><td>420/curl</td></tr>
              <tr><td>tcp</td><td>0.0.0.0:22</td><td>0.0.0.0:*</td><td><span class="risk-badge risk-info">LISTEN</span></td><td>142/sshd</td></tr>
              <tr><td>tcp</td><td>127.0.0.1:3000</td><td>0.0.0.0:*</td><td><span class="risk-badge risk-info">LISTEN</span></td><td>512/node</td></tr>
              <tr><td>tcp</td><td>127.0.0.1:8080</td><td>0.0.0.0:*</td><td><span class="risk-badge risk-info">LISTEN</span></td><td>890/burp</td></tr>
              <tr><td>udp</td><td>192.168.1.105:68</td><td>192.168.1.1:67</td><td><span class="risk-badge risk-low">UNCONN</span></td><td>310/dhclient</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'network-monitor',
      title: 'Network Monitor - Interfaces & Connections',
      icon: iconSvg,
      width: 760,
      height: 480,
      content: container
    });

    container.querySelector('#netmon-ping-btn').onclick = () => {
      window.notifications.show('Network Monitor', 'Ping to gateway 192.168.1.1 successful (RTT: 0.28ms)', 'info');
    };
  }
}

window.networkMonitorApp = new NetworkMonitorApp();
window.openNetworkMonitorApp = () => window.networkMonitorApp.open();
