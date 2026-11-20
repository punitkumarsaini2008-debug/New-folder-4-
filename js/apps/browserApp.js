// ==============================================================================
// Multi-OS Cybersecurity Platform - Web Browser (Firefox-inspired)
// ==============================================================================

class BrowserApp {
  open(url = 'https://search.cybersecurity.local') {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#171d28; gap:6px;">
        <button class="tool-btn" id="br-back" style="padding:4px 8px;">&larr;</button>
        <button class="tool-btn" id="br-forward" style="padding:4px 8px;">&rarr;</button>
        <button class="tool-btn" id="br-reload" style="padding:4px 8px;">&#x21bb;</button>
        <div style="flex:1; display:flex; align-items:center; background:#0a0e16; border:1px solid #30363d; border-radius:var(--radius-sm); padding:2px 8px; gap:6px;">
          <span style="color:#56d364; font-size:12px;">🔒</span>
          <input type="text" id="br-url-input" value="${url}" style="flex:1; background:transparent; border:none; color:#ffffff; font-size:12px; outline:none;" />
        </div>
        <button class="tool-btn primary" id="br-go">Go</button>
      </div>

      <div style="display:flex; gap:8px; padding:4px 10px; background:#10151f; border-bottom:1px solid rgba(255,255,255,0.06); font-size:11px;">
        <span style="color:#8b949e;">Bookmarks:</span>
        <a href="#" class="bm-link" data-url="https://cve.mitre.org" style="color:var(--parrot-cyan); text-decoration:none;">CVE Details</a>
        <span style="color:#30363d;">•</span>
        <a href="#" class="bm-link" data-url="https://owasp.org" style="color:var(--parrot-cyan); text-decoration:none;">OWASP</a>
        <span style="color:#30363d;">•</span>
        <a href="#" class="bm-link" data-url="https://exploit-db.com" style="color:var(--parrot-cyan); text-decoration:none;">Exploit-DB</a>
        <span style="color:#30363d;">•</span>
        <a href="#" class="bm-link" data-url="https://nmap.org" style="color:var(--parrot-cyan); text-decoration:none;">Nmap Docs</a>
      </div>

      <div id="br-viewport" style="flex:1; background:#080c12; overflow-y:auto; padding:24px; color:#e6edf3;">
        <div style="max-width:600px; margin:40px auto; text-align:center;">
          <h2 style="font-size:26px; color:var(--parrot-cyan); margin-bottom:8px;">CyberSearch Secure Browser</h2>
          <p style="color:#8b949e; font-size:13px; margin-bottom:20px;">Isolated Client-Side Sandbox Search Engine</p>
          <div style="display:flex; gap:8px;">
            <input type="text" id="br-search-field" placeholder="Search security advisories, CVEs, or enter URL..." style="flex:1; background:#141b26; border:1px solid rgba(0,229,255,0.3); border-radius:4px; padding:10px 14px; color:#fff; font-size:13px; outline:none;" />
            <button class="tool-btn primary" id="br-search-btn" style="padding:10px 18px;">Search</button>
          </div>
          <div id="br-results" style="margin-top:24px; text-align:left; display:none;"></div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'browser',
      title: 'Firefox Web Browser - CyberSearch',
      icon: iconSvg,
      width: 820,
      height: 520,
      content: container
    });

    const urlInput = container.querySelector('#br-url-input');
    const goBtn = container.querySelector('#br-go');
    const searchField = container.querySelector('#br-search-field');
    const searchBtn = container.querySelector('#br-search-btn');
    const resultsDiv = container.querySelector('#br-results');

    const doSearch = (query) => {
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div style="font-size:12px; color:#8b949e; margin-bottom:12px;">Showing simulated educational intelligence for: <strong>${query}</strong></div>
        <div style="background:#141b26; border:1px solid #30363d; border-radius:4px; padding:12px; margin-bottom:10px;">
          <a href="#" style="color:#79c0ff; font-weight:700; text-decoration:none;">CVE-2024-XXXX: Apache HTTP Server Incomplete Header Sanitization</a>
          <div style="color:#56d364; font-size:11px;">https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-XXXX</div>
          <p style="color:#8b949e; font-size:11.5px; margin-top:4px;">In Apache HTTP Server 2.4.52 and earlier, improper request validation allows request smuggling.</p>
        </div>
        <div style="background:#141b26; border:1px solid #30363d; border-radius:4px; padding:12px;">
          <a href="#" style="color:#79c0ff; font-weight:700; text-decoration:none;">OWASP Top 10 - A03:2021 Injection Prevention Cheat Sheet</a>
          <div style="color:#56d364; font-size:11px;">https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention</div>
          <p style="color:#8b949e; font-size:11.5px; margin-top:4px;">Comprehensive guide to defending against SQL, LDAP, and Command Injections using parameterized queries.</p>
        </div>
      `;
    };

    searchBtn.onclick = () => doSearch(searchField.value || 'CVE Security');
    searchField.onkeydown = (e) => { if (e.key === 'Enter') doSearch(searchField.value); };

    goBtn.onclick = () => {
      urlInput.value = urlInput.value.startsWith('http') ? urlInput.value : 'https://' + urlInput.value;
      doSearch(urlInput.value);
    };

    container.querySelectorAll('.bm-link').forEach(bm => {
      bm.onclick = (e) => {
        e.preventDefault();
        urlInput.value = bm.dataset.url;
        doSearch(bm.dataset.url);
      };
    });
  }
}

window.browserApp = new BrowserApp();
window.openBrowserApp = (url) => window.browserApp.open(url);
