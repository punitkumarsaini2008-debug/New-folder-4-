// ==============================================================================
// Multi-OS Cybersecurity Platform - Cybersecurity Learning Lab
// Safe, Educational Hands-on Labs & Guided CTF Exercises
// ==============================================================================

class LearningLabApp {
  constructor() {
    this.currentLabId = 'lab-nmap';
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#111822; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Cybersecurity Learning Lab</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#56d364; font-size:11px;">8 Educational Training Modules</span>
        </div>
        <div class="risk-badge risk-info" style="font-size:10px;">Authorized Educational Sandbox</div>
      </div>

      <div class="lab-container">
        <!-- LABS SIDEBAR -->
        <div class="lab-sidebar">
          <div class="fm-sidebar-title">Security Labs</div>
          <div class="fm-sidebar-item active" data-lab="lab-nmap">01. Nmap Port Scanning</div>
          <div class="fm-sidebar-item" data-lab="lab-dns">02. DNS & Zone Transfer</div>
          <div class="fm-sidebar-item" data-lab="lab-headers">03. HTTP Security Headers</div>
          <div class="fm-sidebar-item" data-lab="lab-passwords">04. Password Hash Auditing</div>
          <div class="fm-sidebar-item" data-lab="lab-web">05. Web Vulnerabilities (OWASP)</div>
          <div class="fm-sidebar-item" data-lab="lab-pcap">06. PCAP Packet Forensics</div>
          <div class="fm-sidebar-item" data-lab="lab-hash">07. File Hash Verification</div>
          <div class="fm-sidebar-item" data-lab="lab-ctf">08. Linux Command Challenges</div>
        </div>

        <!-- LAB MAIN WORKSPACE -->
        <div class="lab-main-view" id="lab-workspace-content"></div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'learning-lab',
      title: 'Cybersecurity Learning Lab - Hands-on Modules',
      icon: iconSvg,
      width: 860,
      height: 540,
      content: container
    });

    this.bindEvents(container);
    this.renderLabContent('lab-nmap', container);
  }

  bindEvents(container) {
    const sidebarItems = container.querySelectorAll('.lab-sidebar .fm-sidebar-item');
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentLabId = item.dataset.lab;
        this.renderLabContent(this.currentLabId, container);
      });
    });
  }

  renderLabContent(labId, container) {
    const mainView = container.querySelector('#lab-workspace-content');
    mainView.innerHTML = '';

    switch (labId) {
      case 'lab-nmap':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 01: Nmap Scanning of Authorized Targets</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Learn how SYN Stealth scans (-sS) and Service Version detection (-sV) uncover open listening ports on servers.
            </p>
            <div style="background:#161f2e; border:1px solid #30363d; border-radius:4px; padding:10px; margin-bottom:12px;">
              <label style="font-size:11px; color:#c9d1d9;">Select Target Host:</label>
              <select id="lab-nmap-target" class="nmap-select" style="width:100%; margin-top:4px;">
                <option value="127.0.0.1">127.0.0.1 (Local Loopback)</option>
                <option value="192.168.1.100">192.168.1.100 (Lab Web Server - Apache)</option>
                <option value="192.168.1.150">192.168.1.150 (Lab FTP Server)</option>
              </select>
            </div>
            <button class="tool-btn primary" id="btn-run-nmap-lab">Run Authorized Port Scan</button>
            <div id="lab-nmap-res" style="margin-top:12px; background:#070a0f; color:#7ee787; font-family:var(--font-mono); font-size:11.5px; padding:10px; border-radius:4px; min-height:80px; display:none;"></div>
          </div>
        `;
        mainView.querySelector('#btn-run-nmap-lab').onclick = () => {
          const tgt = mainView.querySelector('#lab-nmap-target').value;
          const resEl = mainView.querySelector('#lab-nmap-res');
          resEl.style.display = 'block';
          resEl.textContent = `[+] Initiating educational Nmap scan against authorized host ${tgt}...\nPORT 22/tcp open ssh (OpenSSH 9.2p1)\nPORT 80/tcp open http (Apache/2.4.52 Debian)\nPORT 443/tcp open ssl/https\nScan completed in 0.42s.`;
        };
        break;

      case 'lab-dns':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 02: DNS Records & Zone Transfer Vulnerability Analysis</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Inspect DNS A, MX, NS, and TXT records. Test if a nameserver misconfiguration allows unauthorized AXFR zone transfers.
            </p>
            <div style="display:flex; gap:8px; margin-bottom:12px;">
              <input type="text" id="lab-dns-domain" class="nmap-input" value="target-lab.org" style="flex:1;" />
              <button class="tool-btn primary" id="btn-run-dns-lab">Query DNS</button>
            </div>
            <div id="lab-dns-res" style="background:#070a0f; color:#56e6ff; font-family:var(--font-mono); font-size:11.5px; padding:10px; border-radius:4px; min-height:100px; display:none;"></div>
          </div>
        `;
        mainView.querySelector('#btn-run-dns-lab').onclick = () => {
          const resEl = mainView.querySelector('#lab-dns-res');
          resEl.style.display = 'block';
          resEl.textContent = `;; ANSWER SECTION:\ntarget-lab.org.   300 IN A      192.168.1.100\ntarget-lab.org.   300 IN MX  10 mail.target-lab.org.\ntarget-lab.org.   300 IN TXT    "v=spf1 include:_spf.target-lab.org ~all"\n\n;; TESTING AXFR ZONE TRANSFER on ns1.target-lab.org:\n[!] AXFR query refused: Server properly protected against zone transfers.`;
        };
        break;

      case 'lab-headers':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 03: HTTP Security Header Inspection</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Assess essential security headers: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), and X-Frame-Options.
            </p>
            <button class="tool-btn primary" id="btn-run-header-lab">Inspect Target Web Headers</button>
            <div id="lab-header-res" style="margin-top:12px; display:none;">
              <table class="ws-table">
                <thead><tr><th>Security Header</th><th>Status</th><th>Recommended Action</th></tr></thead>
                <tbody>
                  <tr><td>Content-Security-Policy</td><td><span class="risk-badge risk-high">Missing</span></td><td>Define script-src and default-src directives to mitigate XSS</td></tr>
                  <tr><td>Strict-Transport-Security</td><td><span class="risk-badge risk-medium">Missing</span></td><td>Enable HSTS with max-age=31536000; includeSubDomains</td></tr>
                  <tr><td>X-Frame-Options</td><td><span class="risk-badge risk-medium">Missing</span></td><td>Set to DENY or SAMEORIGIN to prevent clickjacking</td></tr>
                  <tr><td>X-Content-Type-Options</td><td><span class="risk-badge risk-info">nosniff</span></td><td>Properly configured</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        mainView.querySelector('#btn-run-header-lab').onclick = () => {
          mainView.querySelector('#lab-header-res').style.display = 'block';
        };
        break;

      case 'lab-passwords':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 04: Password Hash Auditing (Sample Hashes)</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Identify cryptographic hash types and understand why salting and slow hashing algorithms (Bcrypt/Argon2) are mandatory.
            </p>
            <div style="margin-bottom:10px;">
              <label style="font-size:11px; color:#c9d1d9;">Sample Hash to Audit:</label>
              <input type="text" id="lab-hash-input" class="nmap-input" value="5d41402abc4b2a76b9719d911017c592" style="width:100%; margin-top:4px;" />
            </div>
            <button class="tool-btn primary" id="btn-audit-hash">Audit Hash with Dictionary</button>
            <div id="lab-hash-res" style="margin-top:12px; background:#070a0f; color:#ffa657; font-family:var(--font-mono); font-size:11.5px; padding:10px; border-radius:4px; display:none;"></div>
          </div>
        `;
        mainView.querySelector('#btn-audit-hash').onclick = () => {
          const res = mainView.querySelector('#lab-hash-res');
          res.style.display = 'block';
          res.textContent = `[+] Hash Algorithm Detected: MD5 (Length: 32 hex chars)\n[*] Checking rockyou_sample.txt...\n[!] Match Found! Plaintext: "hello"\n[!] Finding: Fast unsalted MD5 is insecure for password storage. Migrate to Argon2id.`;
        };
        break;

      case 'lab-web':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 05: Web Security Demonstrations (SQLi & XSS)</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Test intentionally vulnerable local input forms to understand SQL Injection bypass and parameter sanitization.
            </p>
            <div style="background:#161f2e; padding:12px; border-radius:4px; margin-bottom:12px;">
              <div style="font-size:11.5px; font-weight:600; color:#ffffff; margin-bottom:6px;">Vulnerable Authentication Query:</div>
              <code style="color:#ff7b72; font-family:var(--font-mono); font-size:11px;">SELECT * FROM users WHERE user = '$USER' AND pass = '$PASS';</code>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <input type="text" id="lab-sqli-input" class="nmap-input" value="admin' OR '1'='1" style="flex:1;" />
                <button class="tool-btn primary" id="btn-test-sqli">Simulate Query</button>
              </div>
            </div>
            <div id="lab-sqli-res" style="background:#070a0f; color:#7ee787; font-family:var(--font-mono); font-size:11.5px; padding:10px; border-radius:4px; display:none;"></div>
          </div>
        `;
        mainView.querySelector('#btn-test-sqli').onclick = () => {
          const res = mainView.querySelector('#lab-sqli-res');
          res.style.display = 'block';
          res.textContent = `Executed SQL: SELECT * FROM users WHERE user = 'admin' OR '1'='1' AND pass = '***';\n[+] Result: Query evaluated to TRUE for all rows!\n[!] Vulnerability: Authentication Bypassed!\n[+] Defense: Use PDO Parameterized Queries ($stmt = $pdo->prepare('SELECT ... WHERE user = ?'))`;
        };
        break;

      case 'lab-pcap':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 06: PCAP Network Traffic Forensics</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Analyze an unencrypted network capture dump and extract cleartext credentials transmitted over HTTP.
            </p>
            <button class="tool-btn primary" id="btn-analyze-pcap">Analyze sample_traffic.pcap</button>
            <div id="lab-pcap-res" style="margin-top:12px; background:#070a0f; color:#79c0ff; font-family:var(--font-mono); font-size:11.5px; padding:10px; border-radius:4px; display:none;"></div>
          </div>
        `;
        mainView.querySelector('#btn-analyze-pcap').onclick = () => {
          const res = mainView.querySelector('#lab-pcap-res');
          res.style.display = 'block';
          res.textContent = `[+] Ingested 142 packets from sample_traffic.pcap\n[*] Filter applied: http.request.method == "POST"\n[+] Frame 42: POST /login.php\n    Credential Extracted: user=admin&password=SuperSecretPassword!\n[!] Finding: Passwords transmitted over cleartext HTTP. Enforce HTTPS / TLS 1.3.`;
        };
        break;

      case 'lab-hash':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 07: File Hash Verification</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Calculate cryptographic hashes to verify file integrity and detect unauthorized binary modifications.
            </p>
            <textarea id="lab-verify-text" class="burp-raw-viewer" style="height:70px; margin-bottom:8px;">ParrotCloud OS Release Candidate Binary Payload</textarea>
            <button class="tool-btn primary" id="btn-calc-hashes">Calculate Checksums</button>
            <div id="lab-calc-res" style="margin-top:12px; background:#070a0f; font-family:var(--font-mono); font-size:11px; padding:10px; border-radius:4px; display:none; line-height:1.6;"></div>
          </div>
        `;
        mainView.querySelector('#btn-calc-hashes').onclick = () => {
          const res = mainView.querySelector('#lab-calc-res');
          res.style.display = 'block';
          res.innerHTML = `
            <div style="color:#56e6ff;">MD5:    d41d8cd98f00b204e9800998ecf8427e</div>
            <div style="color:#7ee787;">SHA1:   da39a3ee5e6b4b0d3255bfef95601890afd80709</div>
            <div style="color:#ffa657;">SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
            <div style="color:#8b949e; margin-top:6px;">Status: Valid Checksum (No tampering detected)</div>
          `;
        };
        break;

      case 'lab-ctf':
        mainView.innerHTML = `
          <div class="lab-step-card">
            <div class="lab-step-title">Lab 08: Linux Command Challenges</div>
            <p style="color:#8b949e; font-size:12px; margin-bottom:12px;">
              Solve hands-on Linux administration and cybersecurity navigation challenges using the terminal.
            </p>
            <div style="margin-bottom:14px; background:#141c28; padding:10px; border-radius:4px;">
              <div style="font-weight:700; color:#56e6ff; font-size:12px;">Challenge 1: Inspect the target lists</div>
              <div style="font-size:11px; color:#8b949e; margin-top:2px;">Read the contents of /home/parrot/Desktop/Target-List.txt</div>
              <button class="tool-btn" style="margin-top:6px;" onclick="window.openTerminalApp()">Open Terminal to Solve</button>
            </div>
            <div style="background:#141c28; padding:10px; border-radius:4px;">
              <div style="font-weight:700; color:#56e6ff; font-size:12px;">Challenge 2: Password Hash Discovery</div>
              <div style="font-size:11px; color:#8b949e; margin-top:2px;">Find what sample hash is inside rockyou_sample.txt</div>
              <button class="tool-btn" style="margin-top:6px;" onclick="window.openTerminalApp()">Open Terminal to Solve</button>
            </div>
          </div>
        `;
        break;
    }
  }
}

window.learningLabApp = new LearningLabApp();
window.openLearningLabApp = () => window.learningLabApp.open();
