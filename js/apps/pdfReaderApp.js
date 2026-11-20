// ==============================================================================
// Multi-OS Cybersecurity Platform - PDF Lab Manual & Document Reader
// ==============================================================================

class PdfReaderApp {
  open(docTitle = 'Cybersecurity_Lab_Manual.pdf') {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#1a1a24; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:#ff7b72;">PDF Document Viewer</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#ffffff; font-size:11px;">${docTitle}</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn" id="pdf-zoom-in">Zoom In (+)</button>
          <button class="tool-btn" id="pdf-zoom-out">Zoom Out (-)</button>
          <button class="tool-btn primary" onclick="window.print()">Print Document</button>
        </div>
      </div>

      <div style="flex:1; background:#2b2f3a; overflow-y:auto; padding:24px; display:flex; justify-content:center;">
        <div class="report-paper" style="max-width:680px; width:100%; min-height:800px; padding:40px;">
          <div style="text-align:center; border-bottom:2px solid #30363d; padding-bottom:18px; margin-bottom:24px;">
            <h1 style="font-size:24px; color:#1a2332; margin-bottom:6px;">ETHICAL HACKING & SECURITY AUDIT MANUAL</h1>
            <div style="color:#6a737d; font-size:12px;">Standard Operating Procedures (SOP) • Release 2026.1</div>
          </div>

          <h3 style="font-size:15px; color:#1a2332; margin-bottom:8px;">Section 1: Scope of Engagement</h3>
          <p style="font-size:12px; color:#444; line-height:1.6; margin-bottom:16px;">
            This manual governs penetration testing and security assessment protocols. Penetration tests must only be conducted against systems where written authorization has been granted. In this platform, all lab modules operate against simulated RFC 5737 test subnets (192.168.1.0/24) or local loopback interfaces.
          </p>

          <h3 style="font-size:15px; color:#1a2332; margin-bottom:8px;">Section 2: Phase Breakdown</h3>
          <ol style="font-size:12px; color:#444; line-height:1.7; padding-left:20px; margin-bottom:16px;">
            <li><strong>Reconnaissance (Passive & Active)</strong>: Subdomain enumeration, WHOIS lookup, DNS zone checks.</li>
            <li><strong>Scanning & Enumeration</strong>: Nmap SYN stealth scans (-sS) and Service detection (-sV).</li>
            <li><strong>Vulnerability Analysis</strong>: Automated scanning with OWASP ZAP and Nikto.</li>
            <li><strong>Exploitation & Verification</strong>: Proof-of-concept validation in Burp Suite Repeater.</li>
            <li><strong>Reporting & Remediation</strong>: Documentation of risk levels (CVSS) and defensive countermeasures.</li>
          </ol>

          <div style="background:#f6f8fa; border:1px solid #d1d5da; border-radius:4px; padding:12px; font-size:11.5px; color:#586069; margin-top:30px;">
            Notice: Certified for educational training on Parrot, Ubuntu, Kali, Mint, and Fedora platforms.
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'pdf-reader',
      title: `Document Viewer - ${docTitle}`,
      icon: iconSvg,
      width: 780,
      height: 540,
      content: container
    });
  }
}

window.pdfReaderApp = new PdfReaderApp();
window.openPdfReaderApp = (title) => window.pdfReaderApp.open(title);
