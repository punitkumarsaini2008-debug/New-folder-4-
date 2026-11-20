// ==============================================================================
// ParrotCloud OS - OWASP ZAP (Zed Attack Proxy) Vulnerability Scanner
// Automated Spider Crawler, Active Vulnerability Scanner, & Alert Remediation
// ==============================================================================

class OwaspZapApp {
  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131822; border-bottom:1px solid rgba(88,166,255,0.3);">
        <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">OWASP ZAP 2.14.0</span>
        <span style="color:#8b949e;">|</span>
        <span style="color:#8b949e; font-size:11px;">Automated Web Application Security Scanner</span>
      </div>

      <div style="display:flex; align-items:center; gap:8px; padding:8px 10px; background:#182232; border-bottom:1px solid rgba(0,229,255,0.15);">
        <label style="font-weight:600; color:#8b949e; font-size:11.5px;">URL to Attack:</label>
        <input type="text" class="nmap-input" id="zap-target-input" value="http://192.168.1.100" style="flex:1;" />
        <button class="tool-btn primary" id="zap-scan-btn">
          <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Attack / Scan
        </button>
      </div>

      <div class="tool-nav-tabs">
        <div class="tool-nav-tab active" data-tab="alerts">Alerts (5 Issues Identified)</div>
        <div class="tool-nav-tab" data-tab="spider">Spider Tree</div>
        <div class="tool-nav-tab" data-tab="history">Scan Progress</div>
      </div>

      <div class="burp-split-pane">
        <!-- ALERTS LIST -->
        <div class="burp-left-list" id="zap-alerts-list">
          <div class="zap-alert-item" data-id="1">
            <span class="risk-badge risk-high">High</span>
            <div>
              <div style="font-weight:600; color:#ffffff;">SQL Injection</div>
              <div style="font-size:10px; color:#8b949e;">/admin/auth.php (param: username)</div>
            </div>
          </div>
          <div class="zap-alert-item" data-id="2">
            <span class="risk-badge risk-medium">Medium</span>
            <div>
              <div style="font-weight:600; color:#ffffff;">Cross-Site Scripting (Reflected XSS)</div>
              <div style="font-size:10px; color:#8b949e;">/search.php (param: q)</div>
            </div>
          </div>
          <div class="zap-alert-item" data-id="3">
            <span class="risk-badge risk-medium">Medium</span>
            <div>
              <div style="font-weight:600; color:#ffffff;">Missing Anti-CSRF Tokens</div>
              <div style="font-size:10px; color:#8b949e;">/profile/update.php</div>
            </div>
          </div>
          <div class="zap-alert-item" data-id="4">
            <span class="risk-badge risk-low">Low</span>
            <div>
              <div style="font-weight:600; color:#ffffff;">X-Frame-Options Header Missing</div>
              <div style="font-size:10px; color:#8b949e;">/ (Clickjacking vulnerability)</div>
            </div>
          </div>
          <div class="zap-alert-item" data-id="5">
            <span class="risk-badge risk-info">Info</span>
            <div>
              <div style="font-weight:600; color:#ffffff;">Web Server Banner Disclosure</div>
              <div style="font-size:10px; color:#8b949e;">Apache/2.4.52 (Debian)</div>
            </div>
          </div>
        </div>

        <!-- ALERT DETAILS & REMEDIATION -->
        <div class="burp-right-inspect" id="zap-alert-detail" style="padding:14px; overflow-y:auto; font-size:12px; line-height:1.6;">
          <div style="font-size:15px; font-weight:700; color:#ff7b72; margin-bottom:8px;">SQL Injection (High Severity)</div>
          <div style="color:#8b949e; margin-bottom:12px;"><strong>CWE:</strong> CWE-89: SQL Injection | <strong>WASC:</strong> WASC-19</div>
          <div style="font-weight:600; color:var(--parrot-cyan); margin-bottom:4px;">Description:</div>
          <div style="color:#c9d1d9; margin-bottom:12px;">
            SQL injection may be possible through parameter 'username' on page '/admin/auth.php'. The input was evaluated directly into the database query without parameterization.
          </div>
          <div style="font-weight:600; color:var(--parrot-cyan); margin-bottom:4px;">Attack Vector:</div>
          <div style="background:#090d14; border:1px solid #30363d; border-radius:4px; padding:6px 10px; font-family:var(--font-mono); color:#ffa657; margin-bottom:12px;">
            POST /admin/auth.php HTTP/1.1<br>
            username=admin' OR 1=1--&password=foo
          </div>
          <div style="font-weight:600; color:var(--parrot-green); margin-bottom:4px;">Solution / Remediation:</div>
          <div style="color:#7ee787;">
            Rewrite database queries using prepared statements and parameterized queries (e.g. PDO in PHP with bound parameters). Never concatenate raw user input into SQL syntax strings.
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'owasp-zap',
      title: 'OWASP ZAP - Automated Web Vulnerability Scanner',
      icon: iconSvg,
      width: 800,
      height: 500,
      content: container
    });

    container.querySelector('#zap-scan-btn').onclick = () => {
      window.notifications.show('OWASP ZAP', 'Active scan launched against http://192.168.1.100', 'warning');
    };
  }
}

window.owaspZapApp = new OwaspZapApp();
window.openOwaspZapApp = () => window.owaspZapApp.open();
