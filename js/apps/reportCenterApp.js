// ==============================================================================
// Multi-OS Cybersecurity Platform - Report Center & Audit Generator
// Generates PDF Printable Reports, Exports CSV, and Manages Audit History
// Strictly separates simulated reports from real remote Linux scan reports
// ==============================================================================

class ReportCenterApp {
  constructor() {
    this.reports = JSON.parse(localStorage.getItem('saved_security_reports') || '[]');
    if (this.reports.length === 0) {
      this.reports = [
        {
          id: 'REP-2026-001',
          title: 'Infrastructure Port Reconnaissance & Vulnerability Assessment',
          target: '192.168.1.100 (Internal Web Server)',
          date: '2026-11-20',
          type: 'simulated', // 'simulated' or 'real'
          os: 'Parrot Security OS',
          highCount: 1,
          medCount: 2,
          lowCount: 1,
          summary: 'Identified 4 open ports. Detected SQL Injection vulnerability on /admin/auth.php and missing security headers.'
        },
        {
          id: 'REP-2026-002',
          title: 'Web Application Security & Header Compliance Audit',
          target: 'http://192.168.1.100',
          date: '2026-11-19',
          type: 'simulated',
          os: 'Kali Linux',
          highCount: 0,
          medCount: 1,
          lowCount: 3,
          summary: 'Missing CSP, HSTS, and X-Frame-Options headers. Reflected XSS parameter detected in search interface.'
        }
      ];
      localStorage.setItem('saved_security_reports', JSON.stringify(this.reports));
    }
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131a26; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Cybersecurity Report Center</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#8b949e; font-size:11px;">Audit Logs & Assessment Exports</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn primary" id="rep-btn-new">Generate New Report</button>
          <button class="tool-btn" id="rep-btn-csv">Export CSV</button>
        </div>
      </div>

      <div class="tool-nav-tabs">
        <div class="tool-nav-tab active" data-tab="list">Saved Reports (${this.reports.length})</div>
        <div class="tool-nav-tab" data-tab="logs">Tool Execution Logs</div>
      </div>

      <div id="rep-tab-list" style="flex:1; overflow-y:auto; padding:12px; background:#080c12;">
        <table class="ws-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Audit Title</th>
              <th>Target</th>
              <th>Date</th>
              <th>Environment Type</th>
              <th>Findings</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="rep-tbody"></tbody>
        </table>
      </div>

      <div id="rep-tab-logs" style="display:none; flex:1; overflow-y:auto; padding:12px; font-family:var(--font-mono); font-size:11.5px; color:#c9d1d9; background:#070a0f;">
        <div style="color:var(--parrot-cyan); font-weight:700; margin-bottom:8px;">Audit Execution Log Stream:</div>
        <div style="color:#8b949e;">[2026-11-20 08:30:12] [SIMULATED] Nmap SYN Stealth scan on 192.168.1.100 (4 ports found)</div>
        <div style="color:#8b949e;">[2026-11-20 08:31:05] [SIMULATED] Nikto web scan executed against http://192.168.1.100</div>
        <div style="color:#8b949e;">[2026-11-20 08:32:44] [SIMULATED] OWASP ZAP active scan discovered SQL Injection in parameter 'username'</div>
        <div style="color:#8b949e;">[2026-11-20 08:35:10] [SIMULATED] Wireshark captured 7 sample educational forensic packets</div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'report-center',
      title: 'Security Report Center & Assessment Generator',
      icon: iconSvg,
      width: 860,
      height: 520,
      content: container
    });

    this.bindEvents(container);
    this.renderReports(container);
  }

  bindEvents(container) {
    const tabs = container.querySelectorAll('.tool-nav-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#rep-tab-list').style.display = tab.dataset.tab === 'list' ? 'block' : 'none';
        container.querySelector('#rep-tab-logs').style.display = tab.dataset.tab === 'logs' ? 'block' : 'none';
      };
    });

    // New report button
    container.querySelector('#rep-btn-new').onclick = () => {
      const title = prompt('Enter Report Title:', 'Penetration Test Executive Summary');
      const target = prompt('Enter Target Domain / IP:', '192.168.1.100');
      if (title && target) {
        const newRep = {
          id: `REP-2026-${String(this.reports.length + 1).padStart(3, '0')}`,
          title: title,
          target: target,
          date: new Date().toISOString().split('T')[0],
          type: 'simulated',
          os: window.MULTIOS_PROFILES[window.osManager?.activeOs || 'parrot'].name,
          highCount: 1,
          medCount: 1,
          lowCount: 2,
          summary: 'Automated vulnerability audit completed in educational sandbox environment.'
        };
        this.reports.unshift(newRep);
        localStorage.setItem('saved_security_reports', JSON.stringify(this.reports));
        this.renderReports(container);
        window.notifications.show('Report Center', `Generated report: ${newRep.id}`, 'info');
      }
    };

    // CSV export button
    container.querySelector('#rep-btn-csv').onclick = () => {
      let csv = 'Report_ID,Title,Target,Date,Environment,High_Risk,Medium_Risk,Low_Risk\n';
      this.reports.forEach(r => {
        csv += `"${r.id}","${r.title}","${r.target}","${r.date}","${r.type}",${r.highCount},${r.medCount},${r.lowCount}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersecurity_audit_reports_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      window.notifications.show('Report Center', 'Exported audit logs to CSV', 'info');
    };
  }

  renderReports(container) {
    const tbody = container.querySelector('#rep-tbody');
    tbody.innerHTML = '';

    this.reports.forEach(rep => {
      const tr = document.createElement('tr');
      tr.className = 'ws-row';
      tr.innerHTML = `
        <td><strong style="color:var(--parrot-cyan);">${rep.id}</strong></td>
        <td>${rep.title}</td>
        <td><code>${rep.target}</code></td>
        <td>${rep.date}</td>
        <td>
          <span class="${rep.type === 'real' ? 'report-badge-real' : 'report-badge-simulated'}">
            ${rep.type === 'real' ? '● Real Remote Linux' : '● Educational Sandbox'}
          </span>
        </td>
        <td>
          <span class="risk-badge risk-high">${rep.highCount} High</span>
          <span class="risk-badge risk-medium">${rep.medCount} Med</span>
          <span class="risk-badge risk-low">${rep.lowCount} Low</span>
        </td>
        <td>
          <button class="tool-btn" id="btn-view-${rep.id}" style="padding:2px 8px; font-size:11px;">View / PDF</button>
        </td>
      `;

      tr.querySelector(`#btn-view-${rep.id}`).onclick = () => {
        this.viewReportModal(rep);
      };

      tbody.appendChild(tr);
    });
  }

  viewReportModal(rep) {
    const winId = `modal-${rep.id}`;
    const container = document.createElement('div');
    container.className = 'tool-container';
    container.style.cssText = 'background:#1a2332; overflow-y:auto; padding:20px;';

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:14px;">
        <div style="display:flex; gap:8px;">
          <button class="tool-btn primary" id="btn-print-${winId}">Print / Save as PDF</button>
        </div>
        <div class="${rep.type === 'real' ? 'report-badge-real' : 'report-badge-simulated'}">
          ${rep.type === 'real' ? 'AUTHENTIC REMOTE LINUX EXECUTION' : 'SIMULATED ENVIRONMENT - EDUCATIONAL AUDIT'}
        </div>
      </div>

      <div class="report-paper" id="printable-report-${winId}">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #00e5ff; padding-bottom:12px; margin-bottom:16px;">
          <div>
            <h1 style="font-size:22px; margin-bottom:4px; color:#0b121e;">CYBERSECURITY ASSESSMENT REPORT</h1>
            <div style="font-size:12px; color:#586069;">Report Identifier: <strong>${rep.id}</strong> | Platform: <strong>${rep.os}</strong></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; color:#586069;">Assessment Date</div>
            <div style="font-size:14px; font-weight:700;">${rep.date}</div>
          </div>
        </div>

        <div style="margin-bottom:18px;">
          <h3 style="font-size:14px; margin-bottom:6px; color:#0b121e;">1. Executive Summary</h3>
          <p style="font-size:12px; color:#333; line-height:1.6;">
            ${rep.summary} All tests were executed in an authorized laboratory scope against target <code>${rep.target}</code>.
          </p>
        </div>

        <div style="margin-bottom:18px;">
          <h3 style="font-size:14px; margin-bottom:6px; color:#0b121e;">2. Target Scope & Methodology</h3>
          <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:6px;">
            <tr style="background:#f4f6fa; border:1px solid #ddd;"><th style="padding:6px; text-align:left;">Target Resource</th><th style="padding:6px; text-align:left;">Assessment Type</th><th style="padding:6px; text-align:left;">Environment Type</th></tr>
            <tr style="border:1px solid #ddd;"><td style="padding:6px;">${rep.target}</td><td style="padding:6px;">Network & Web Audit</td><td style="padding:6px;">${rep.type.toUpperCase()}</td></tr>
          </table>
        </div>

        <div style="margin-bottom:18px;">
          <h3 style="font-size:14px; margin-bottom:6px; color:#0b121e;">3. Categorized Vulnerability Findings</h3>
          <div style="display:flex; gap:10px; margin-bottom:12px;">
            <div style="flex:1; background:#ffeef0; border:1px solid #f97583; padding:10px; border-radius:4px; text-align:center;">
              <div style="font-size:20px; font-weight:700; color:#cb2431;">${rep.highCount}</div>
              <div style="font-size:11px; font-weight:600; color:#cb2431;">HIGH SEVERITY</div>
            </div>
            <div style="flex:1; background:#fff8e6; border:1px solid #f6d88f; padding:10px; border-radius:4px; text-align:center;">
              <div style="font-size:20px; font-weight:700; color:#b08800;">${rep.medCount}</div>
              <div style="font-size:11px; font-weight:600; color:#b08800;">MEDIUM SEVERITY</div>
            </div>
            <div style="flex:1; background:#f1f8ff; border:1px solid #c8e1ff; padding:10px; border-radius:4px; text-align:center;">
              <div style="font-size:20px; font-weight:700; color:#0366d6;">${rep.lowCount}</div>
              <div style="font-size:11px; font-weight:600; color:#0366d6;">LOW / INFO</div>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid #e1e4e8; padding-top:12px; font-size:11px; color:#586069; display:flex; justify-content:space-between;">
          <span>Generated by Multi-OS Cybersecurity Platform</span>
          <span>Confidential Assessment Document</span>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: winId,
      title: `Audit Report Viewer - ${rep.id}`,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>`,
      width: 780,
      height: 560,
      content: container
    });

    container.querySelector(`#btn-print-${winId}`).onclick = () => {
      window.print();
    };
  }
}

window.reportCenterApp = new ReportCenterApp();
window.openReportCenterApp = () => window.reportCenterApp.open();
