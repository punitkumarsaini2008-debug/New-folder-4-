// ==============================================================================
// ParrotCloud OS - Wireshark Packet Analyzer & Network Forensics
// ==============================================================================

class WiresharkApp {
  constructor() {
    this.isCapturing = true;
    this.packetId = 1;
    this.packets = [];
    this.filter = '';
    this.captureTimer = null;
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c4 0 6-4 10-4 5 0 8 4 10 4-2 0-5 4-10 4-4 0-6-4-10-4z"></path><circle cx="15" cy="11" r="1"></circle></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar">
        <button class="tool-btn primary" id="ws-start-btn">
          <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Capture
        </button>
        <button class="tool-btn danger" id="ws-stop-btn">
          <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"></rect></svg>
          Stop
        </button>
        <button class="tool-btn" id="ws-restart-btn">Restart</button>
        <span style="color:#8b949e; margin:0 4px;">|</span>
        <span style="color:#8b949e; font-size:11px;">Interface: <strong style="color:var(--parrot-cyan);">eth0</strong> (192.168.1.105)</span>
        <span style="margin-left:auto; color:#8b949e; font-size:11px;" id="ws-packet-count">Packets: 0</span>
      </div>

      <div class="ws-filter-bar">
        <span style="color:var(--parrot-green); font-weight:700; font-size:11.5px;">Filter:</span>
        <input type="text" class="ws-filter-input" id="ws-filter-input" placeholder="Apply a display filter ... e.g. http, tcp.port == 80, dns, ip.addr == 192.168.1.100" />
        <button class="tool-btn" id="ws-filter-apply">Apply</button>
        <button class="tool-btn" id="ws-filter-clear">Clear</button>
      </div>

      <div class="ws-main-split">
        <div class="ws-packet-table-wrapper">
          <table class="ws-table">
            <thead>
              <tr>
                <th style="width:45px;">No.</th>
                <th style="width:75px;">Time</th>
                <th style="width:120px;">Source</th>
                <th style="width:120px;">Destination</th>
                <th style="width:70px;">Protocol</th>
                <th style="width:55px;">Length</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody id="ws-packet-tbody"></tbody>
          </table>
        </div>

        <div class="ws-details-split">
          <div class="ws-tree-pane" id="ws-tree-view">
            <div style="color:#8b949e; padding:10px;">Select a packet above to inspect protocol headers.</div>
          </div>
          <div class="ws-hex-pane" id="ws-hex-view">
0000  02 42 ac 11 00 02 02 42  ac 11 00 03 08 00 45 00   .B.....B ......E.
0010  00 3c 1a 2b 40 00 40 06  e5 84 c0 a8 01 69 c0 a8   .<.+@.@. .....i..
0020  01 64 a3 4e 00 50 2f 12  89 a1 00 00 00 00 a0 02   .d.N.P/. ........
0030  72 10 1a a4 00 00 02 04  05 b4 04 02 08 0a 00 00   r....... ........
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'wireshark',
      title: 'Wireshark Network Protocol Analyzer (eth0)',
      icon: iconSvg,
      width: 820,
      height: 520,
      content: container,
      onClose: () => {
        clearInterval(this.captureTimer);
      }
    });

    this.bindEvents(container);
    this.seedPackets(container);
    this.startStreaming(container);
  }

  bindEvents(container) {
    const startBtn = container.querySelector('#ws-start-btn');
    const stopBtn = container.querySelector('#ws-stop-btn');
    const restartBtn = container.querySelector('#ws-restart-btn');
    const filterInput = container.querySelector('#ws-filter-input');
    const filterApply = container.querySelector('#ws-filter-apply');
    const filterClear = container.querySelector('#ws-filter-clear');

    startBtn.onclick = () => {
      this.isCapturing = true;
      this.startStreaming(container);
      window.notifications.show('Wireshark', 'Packet sniffing active on eth0', 'info');
    };

    stopBtn.onclick = () => {
      this.isCapturing = false;
      clearInterval(this.captureTimer);
      window.notifications.show('Wireshark', 'Capture stopped', 'warning');
    };

    restartBtn.onclick = () => {
      this.packets = [];
      this.packetId = 1;
      container.querySelector('#ws-packet-tbody').innerHTML = '';
      this.isCapturing = true;
      this.seedPackets(container);
      this.startStreaming(container);
    };

    filterApply.onclick = () => {
      this.filter = filterInput.value.toLowerCase().trim();
      this.renderTable(container);
    };

    filterClear.onclick = () => {
      filterInput.value = '';
      this.filter = '';
      this.renderTable(container);
    };
  }

  seedPackets(container) {
    const samplePackets = [
      { id: 1, time: '0.000000', src: '192.168.1.105', dst: '192.168.1.1', proto: 'DNS', len: 74, info: 'Standard query 0x24a1 A parrotsec.org', class: 'proto-dns', details: 'DNS Query: parrotsec.org Type: A Class: IN' },
      { id: 2, time: '0.001420', src: '192.168.1.1', dst: '192.168.1.105', proto: 'DNS', len: 90, info: 'Standard query response 0x24a1 A 185.199.108.153', class: 'proto-dns', details: 'DNS Response: Answers: parrotsec.org A 185.199.108.153' },
      { id: 3, time: '0.012350', src: '192.168.1.105', dst: '192.168.1.100', proto: 'TCP', len: 74, info: '54286 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460', class: 'proto-tcp', details: 'Transmission Control Protocol, Src Port: 54286, Dst Port: 80, Flags: [SYN]' },
      { id: 4, time: '0.012780', src: '192.168.1.100', dst: '192.168.1.105', proto: 'TCP', len: 74, info: '80 → 54286 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0', class: 'proto-tcp', details: 'Transmission Control Protocol, Flags: [SYN, ACK], Seq=0, Ack=1' },
      { id: 5, time: '0.012820', src: '192.168.1.105', dst: '192.168.1.100', proto: 'TCP', len: 66, info: '54286 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0', class: 'proto-tcp', details: 'Transmission Control Protocol, Flags: [ACK], Three-way handshake complete.' },
      { id: 6, time: '0.013500', src: '192.168.1.105', dst: '192.168.1.100', proto: 'HTTP', len: 486, info: 'GET /admin/config.php HTTP/1.1 (Nikto Vulnerability Probe)', class: 'proto-http', details: 'Hypertext Transfer Protocol, GET /admin/config.php HTTP/1.1, User-Agent: Nikto/2.5.0' },
      { id: 7, time: '0.015200', src: '192.168.1.100', dst: '192.168.1.105', proto: 'HTTP', len: 612, info: 'HTTP/1.1 200 OK (text/html) [DB Credentials Exposed in Source]', class: 'proto-http', details: 'HTTP/1.1 200 OK, Content-Type: text/html, Server: Apache/2.4.52 (Debian)' }
    ];

    samplePackets.forEach(p => {
      this.packets.push(p);
      this.packetId = p.id + 1;
    });

    this.renderTable(container);
  }

  startStreaming(container) {
    clearInterval(this.captureTimer);
    this.captureTimer = setInterval(() => {
      if (!this.isCapturing) return;

      const protos = [
        { proto: 'TCP', class: 'proto-tcp', len: 66, info: '443 → 51240 [ACK] Seq=120 Ack=80 Win=64120' },
        { proto: 'TLS', class: 'proto-tls', len: 1420, info: 'Application Data (TLSv1.3 Encrypted Stream)' },
        { proto: 'HTTP', class: 'proto-http', len: 320, info: 'POST /api/v1/auth/login HTTP/1.1 (Payload Test)' },
        { proto: 'ARP', class: 'proto-arp', len: 42, info: 'Who has 192.168.1.150? Tell 192.168.1.105' },
        { proto: 'ICMP', class: 'proto-icmp', len: 98, info: 'Echo (ping) request id=0x0024 seq=5 ttl=64' }
      ];

      const chosen = protos[Math.floor(Math.random() * protos.length)];
      const now = (this.packetId * 0.014).toFixed(6);

      const newPacket = {
        id: this.packetId++,
        time: now,
        src: '192.168.1.105',
        dst: '192.168.1.100',
        proto: chosen.proto,
        len: chosen.len,
        info: chosen.info,
        class: chosen.class,
        details: `Protocol: ${chosen.proto}, Captured on interface eth0, Packet Length: ${chosen.len} bytes.`
      };

      this.packets.push(newPacket);
      if (this.packets.length > 200) this.packets.shift();

      this.renderTable(container);
    }, 2500);
  }

  renderTable(container) {
    const tbody = container.querySelector('#ws-packet-tbody');
    const countEl = container.querySelector('#ws-packet-count');
    if (!tbody) return;

    let filtered = this.packets;
    if (this.filter) {
      filtered = this.packets.filter(p =>
        p.proto.toLowerCase().includes(this.filter) ||
        p.src.includes(this.filter) ||
        p.dst.includes(this.filter) ||
        p.info.toLowerCase().includes(this.filter)
      );
    }

    if (countEl) countEl.textContent = `Packets: ${filtered.length} / ${this.packets.length}`;

    tbody.innerHTML = '';
    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = `ws-row ${p.class}`;
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.time}</td>
        <td>${p.src}</td>
        <td>${p.dst}</td>
        <td><strong>${p.proto}</strong></td>
        <td>${p.len}</td>
        <td>${p.info}</td>
      `;

      tr.onclick = () => {
        container.querySelectorAll('.ws-row').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        this.inspectPacket(p, container);
      };

      tbody.appendChild(tr);
    });

    tbody.parentElement.parentElement.scrollTop = tbody.parentElement.parentElement.scrollHeight;
  }

  inspectPacket(packet, container) {
    const treeView = container.querySelector('#ws-tree-view');
    treeView.innerHTML = `
      <div class="ws-tree-node">
        <div class="ws-tree-summary">▼ Frame ${packet.id}: ${packet.len} bytes on wire (784 bits) on interface eth0</div>
        <div class="ws-tree-content">Arrival Time: Nov 20, 2026 08:52:14 UTC | Protocols in frame: eth:ethertype:ip:${packet.proto.toLowerCase()}</div>
      </div>
      <div class="ws-tree-node">
        <div class="ws-tree-summary">▼ Ethernet II, Src: 02:42:ac:11:00:02, Dst: 02:42:ac:11:00:03</div>
        <div class="ws-tree-content">Type: IPv4 (0x0800)</div>
      </div>
      <div class="ws-tree-node">
        <div class="ws-tree-summary">▼ Internet Protocol Version 4, Src: ${packet.src}, Dst: ${packet.dst}</div>
        <div class="ws-tree-content">Header Length: 20 bytes | Time to Live: 64 | Identification: 0x1a2b</div>
      </div>
      <div class="ws-tree-node">
        <div class="ws-tree-summary">▼ ${packet.proto}: ${packet.info}</div>
        <div class="ws-tree-content">${packet.details}</div>
      </div>
    `;
  }
}

window.wiresharkApp = new WiresharkApp();
window.openWiresharkApp = () => window.wiresharkApp.open();
