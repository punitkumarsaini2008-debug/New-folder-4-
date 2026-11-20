// ==============================================================================
// ParrotCloud OS - Burp Suite Community Edition (Web Application Security)
// Proxy Intercept, HTTP History, Repeater Payload Testing, & Decoder Utility
// ==============================================================================

class BurpSuiteApp {
  constructor() {
    this.interceptOn = true;
    this.history = [
      {
        id: 1,
        host: '192.168.1.100',
        method: 'GET',
        url: '/admin/login.php',
        status: 200,
        len: 1240,
        reqHeaders: `GET /admin/login.php HTTP/1.1\nHost: 192.168.1.100\nUser-Agent: Mozilla/5.0 (X11; Linux x86_64; Parrot OS)\nAccept: text/html,application/xhtml+xml\nAccept-Language: en-US,en;q=0.5\nConnection: keep-alive\nUpgrade-Insecure-Requests: 1\n`,
        resHeaders: `HTTP/1.1 200 OK\nDate: Fri, 20 Nov 2026 08:50:00 GMT\nServer: Apache/2.4.52 (Debian)\nSet-Cookie: PHPSESSID=9a8b7c6d5e4f3a2b; path=/\nContent-Type: text/html; charset=UTF-8\nContent-Length: 1240\n\n<form method="POST" action="/admin/auth.php">\n  <input type="text" name="username" placeholder="Username"/>\n  <input type="password" name="password" placeholder="Password"/>\n  <button type="submit">Login</button>\n</form>`
      },
      {
        id: 2,
        host: '192.168.1.100',
        method: 'POST',
        url: '/admin/auth.php',
        status: 302,
        len: 420,
        reqHeaders: `POST /admin/auth.php HTTP/1.1\nHost: 192.168.1.100\nUser-Agent: Mozilla/5.0 (X11; Linux x86_64; Parrot OS)\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 42\nCookie: PHPSESSID=9a8b7c6d5e4f3a2b\n\nusername=admin' OR 1=1--&password=password123`,
        resHeaders: `HTTP/1.1 302 Found\nDate: Fri, 20 Nov 2026 08:50:02 GMT\nServer: Apache/2.4.52 (Debian)\nLocation: /admin/dashboard.php\nSet-Cookie: auth_role=administrator; HttpOnly\nContent-Length: 0\n\n[Redirecting to /admin/dashboard.php - SQL Injection Successful!]`
      }
    ];
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#1b120c; border-bottom:1px solid rgba(255,153,0,0.3);">
        <span style="font-weight:700; color:#ff9900; font-size:12px;">Burp Suite Community v2026.3</span>
        <span style="color:#8b949e;">|</span>
        <span style="color:#8b949e; font-size:11px;">Proxy Listener: <strong style="color:#56d364;">127.0.0.1:8080</strong> [Running]</span>
      </div>

      <div class="tool-nav-tabs" style="border-bottom-color:rgba(255,153,0,0.2);">
        <div class="tool-nav-tab active" data-tab="proxy">Proxy</div>
        <div class="tool-nav-tab" data-tab="repeater">Repeater</div>
        <div class="tool-nav-tab" data-tab="decoder">Decoder</div>
        <div class="tool-nav-tab" data-tab="target">Target Scope</div>
      </div>

      <!-- PROXY TAB -->
      <div id="burp-tab-proxy" class="burp-split-pane">
        <div class="burp-left-list">
          <div style="padding:6px 10px; background:#141b24; border-bottom:1px solid #30363d; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:600; color:#8b949e; font-size:11px;">HTTP History</span>
            <button class="tool-btn" id="burp-clear-history" style="font-size:10px; padding:2px 6px;">Clear</button>
          </div>
          <table class="ws-table">
            <thead>
              <tr><th>#</th><th>Method</th><th>URL</th><th>Status</th></tr>
            </thead>
            <tbody id="burp-history-tbody"></tbody>
          </table>
        </div>

        <div class="burp-right-inspect">
          <div style="padding:6px 10px; background:#141b24; border-bottom:1px solid #30363d; display:flex; align-items:center; gap:8px;">
            <button class="tool-btn ${this.interceptOn ? 'primary' : ''}" id="burp-intercept-toggle" style="background:${this.interceptOn ? '#ff9900' : 'rgba(255,255,255,0.05)'}; color:${this.interceptOn ? '#000' : '#fff'}; font-weight:700;">
              Intercept is ${this.interceptOn ? 'ON' : 'OFF'}
            </button>
            <button class="tool-btn" id="burp-forward-btn">Forward</button>
            <button class="tool-btn danger" id="burp-drop-btn">Drop</button>
            <button class="tool-btn" id="burp-send-repeater">Send to Repeater</button>
          </div>

          <div class="burp-req-res-split">
            <div class="burp-panel-box">
              <div class="burp-panel-header">
                <span>Request Inspector</span>
                <span style="color:#8b949e;">Raw HTTP / Headers</span>
              </div>
              <textarea class="burp-raw-viewer" id="burp-req-view" spellcheck="false"></textarea>
            </div>
            <div class="burp-panel-box">
              <div class="burp-panel-header">
                <span>Response Inspector</span>
                <span style="color:#8b949e;">Raw HTTP / HTML</span>
              </div>
              <div class="burp-raw-viewer" id="burp-res-view"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- REPEATER TAB -->
      <div id="burp-tab-repeater" class="burp-split-pane" style="display:none;">
        <div style="flex:1; display:flex; flex-direction:column; border-right:1px solid rgba(255,153,0,0.2);">
          <div class="burp-panel-header">
            <span>Repeater Request (Editable)</span>
            <button class="tool-btn primary" id="repeater-send-btn" style="background:#ff9900; color:#000; font-weight:700;">Send Request</button>
          </div>
          <textarea class="burp-raw-viewer" id="repeater-req-input" spellcheck="false" style="color:#ffffff;">POST /admin/auth.php HTTP/1.1
Host: 192.168.1.100
User-Agent: Mozilla/5.0 (X11; Linux x86_64; Parrot OS)
Content-Type: application/x-www-form-urlencoded
Content-Length: 43

username=admin' OR '1'='1&password=insecure</textarea>
        </div>
        <div style="flex:1; display:flex; flex-direction:column;">
          <div class="burp-panel-header">
            <span>Repeater Response</span>
            <span id="repeater-status-badge" style="color:#56d364;">HTTP/1.1 200 OK</span>
          </div>
          <div class="burp-raw-viewer" id="repeater-res-output" style="color:#7ee787;">
HTTP/1.1 200 OK
Date: Fri, 20 Nov 2026 08:52:00 GMT
Server: Apache/2.4.52 (Debian)
Content-Type: application/json

{
  "status": "authenticated",
  "user": "administrator",
  "role": "SYSTEM_ROOT",
  "token": "eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "flag": "PARROT_CTF{SQL_INJECTION_BYPASS_SUCCESSFUL}"
}
          </div>
        </div>
      </div>

      <!-- DECODER TAB -->
      <div id="burp-tab-decoder" style="display:none; flex:1; flex-direction:column; padding:12px; gap:10px; background:#0a0e14; overflow-y:auto;">
        <div style="font-weight:700; color:#ff9900; font-size:12px;">Encoder / Decoder / Hasher</div>
        <textarea class="burp-raw-viewer" id="decoder-input" style="height:120px; border:1px solid #30363d; border-radius:4px;" placeholder="Type text or paste payload to encode/decode...">admin' OR 1=1--</textarea>
        <div style="display:flex; gap:8px;">
          <button class="tool-btn" id="decode-url">URL Decode</button>
          <button class="tool-btn" id="encode-url">URL Encode</button>
          <button class="tool-btn" id="encode-b64">Base64 Encode</button>
          <button class="tool-btn" id="decode-b64">Base64 Decode</button>
          <button class="tool-btn" id="hash-md5">MD5 Hash</button>
          <button class="tool-btn" id="hash-sha256">SHA-256 Hash</button>
        </div>
        <div style="font-weight:600; color:#8b949e; font-size:11px;">Output Result:</div>
        <div class="burp-raw-viewer" id="decoder-output" style="flex:1; min-height:100px; border:1px solid #30363d; border-radius:4px; color:#56e6ff;">admin%27%20OR%201%3D1--</div>
      </div>

      <!-- TARGET TAB -->
      <div id="burp-tab-target" style="display:none; flex:1; padding:14px; background:#090d14; font-family:var(--font-mono); font-size:11.5px; color:#c9d1d9;">
        <div style="font-weight:700; color:#ff9900; margin-bottom:10px;">Target Sitemap Scope:</div>
        <div style="color:#56d364;">▼ http://192.168.1.100 (In Scope)</div>
        <div style="padding-left:18px; color:#79c0ff;">├── /admin/login.php (Status 200)</div>
        <div style="padding-left:18px; color:#79c0ff;">├── /admin/auth.php (Status 302 - SQLi Vulnerability)</div>
        <div style="padding-left:18px; color:#79c0ff;">├── /admin/dashboard.php (Status 200 - Protected)</div>
        <div style="padding-left:18px; color:#79c0ff;">├── /admin/config.php (Status 200 - Sensitive File Leak)</div>
        <div style="padding-left:18px; color:#8b949e;">└── /robots.txt (Disallowed: /admin/)</div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'burp',
      title: 'Burp Suite Community Edition - Cloud Web Proxy',
      icon: iconSvg,
      width: 820,
      height: 520,
      content: container
    });

    this.bindEvents(container);
    this.renderHistory(container);
  }

  bindEvents(container) {
    const tabs = container.querySelectorAll('.tool-nav-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#burp-tab-proxy').style.display = tab.dataset.tab === 'proxy' ? 'flex' : 'none';
        container.querySelector('#burp-tab-repeater').style.display = tab.dataset.tab === 'repeater' ? 'flex' : 'none';
        container.querySelector('#burp-tab-decoder').style.display = tab.dataset.tab === 'decoder' ? 'flex' : 'none';
        container.querySelector('#burp-tab-target').style.display = tab.dataset.tab === 'target' ? 'block' : 'none';
      };
    });

    // Intercept button
    const interceptBtn = container.querySelector('#burp-intercept-toggle');
    interceptBtn.onclick = () => {
      this.interceptOn = !this.interceptOn;
      interceptBtn.textContent = `Intercept is ${this.interceptOn ? 'ON' : 'OFF'}`;
      interceptBtn.style.background = this.interceptOn ? '#ff9900' : 'rgba(255,255,255,0.05)';
      interceptBtn.style.color = this.interceptOn ? '#000' : '#fff';
      window.notifications.show('Burp Suite', `Proxy Intercept is now ${this.interceptOn ? 'ON' : 'OFF'}`, 'info');
    };

    // Repeater send button
    const repeaterSendBtn = container.querySelector('#repeater-send-btn');
    repeaterSendBtn.onclick = () => {
      window.notifications.show('Burp Repeater', 'Payload transmitted to target 192.168.1.100', 'info');
    };

    // Decoder utilities
    const decInput = container.querySelector('#decoder-input');
    const decOutput = container.querySelector('#decoder-output');

    container.querySelector('#encode-url').onclick = () => {
      decOutput.textContent = encodeURIComponent(decInput.value);
    };
    container.querySelector('#decode-url').onclick = () => {
      try { decOutput.textContent = decodeURIComponent(decInput.value); } catch(e) { decOutput.textContent = 'Error decoding URL'; }
    };
    container.querySelector('#encode-b64').onclick = () => {
      decOutput.textContent = btoa(decInput.value);
    };
    container.querySelector('#decode-b64').onclick = () => {
      try { decOutput.textContent = atob(decInput.value); } catch(e) { decOutput.textContent = 'Invalid Base64'; }
    };
    container.querySelector('#hash-md5').onclick = () => {
      decOutput.textContent = '098f6bcd4621d373cade4e832627b4f6 (MD5)';
    };
    container.querySelector('#hash-sha256').onclick = () => {
      decOutput.textContent = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e (SHA-256)';
    };
  }

  renderHistory(container) {
    const tbody = container.querySelector('#burp-history-tbody');
    const reqView = container.querySelector('#burp-req-view');
    const resView = container.querySelector('#burp-res-view');

    tbody.innerHTML = '';
    this.history.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.className = `ws-row ${idx === 1 ? 'selected' : ''}`;
      tr.innerHTML = `
        <td>${item.id}</td>
        <td><strong style="color:${item.method === 'POST' ? '#ffa657' : '#79c0ff'};">${item.method}</strong></td>
        <td>${item.url}</td>
        <td><span class="risk-badge risk-${item.status === 200 ? 'info' : 'medium'}">${item.status}</span></td>
      `;

      tr.onclick = () => {
        container.querySelectorAll('#burp-history-tbody .ws-row').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        reqView.value = item.reqHeaders;
        resView.textContent = item.resHeaders;
      };

      tbody.appendChild(tr);
    });

    // Default selection
    if (this.history[1]) {
      reqView.value = this.history[1].reqHeaders;
      resView.textContent = this.history[1].resHeaders;
    }
  }
}

window.burpSuiteApp = new BurpSuiteApp();
window.openBurpSuiteApp = () => window.burpSuiteApp.open();
