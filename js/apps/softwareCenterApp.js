// ==============================================================================
// Multi-OS Cybersecurity Platform - Software Center (Application Manager)
// Package Management & Security Tool Repository Manager
// ==============================================================================

class SoftwareCenterApp {
  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131a26; justify-content:space-between;">
        <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Software Center & Package Manager</span>
        <span style="color:#56d364; font-size:11px;">● Repositories: Debian Bookworm / Ubuntu Noble / Kali Rolling Synced</span>
      </div>

      <div style="flex:1; overflow-y:auto; padding:16px; background:#080c12;">
        <div style="margin-bottom:14px; font-size:14px; font-weight:700; color:#ffffff;">Installed Security Packages</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:12px;">
          <div class="glass-card" style="padding:12px; background:#141b26;">
            <div style="font-weight:700; color:#56e6ff;">nmap (v7.94)</div>
            <div style="font-size:11px; color:#8b949e; margin:4px 0;">Network exploration and port scanner</div>
            <div style="font-size:10px; color:#56d364;">Status: Installed (Core)</div>
          </div>
          <div class="glass-card" style="padding:12px; background:#141b26;">
            <div style="font-weight:700; color:#56e6ff;">wireshark (v4.2.2)</div>
            <div style="font-size:11px; color:#8b949e; margin:4px 0;">Network packet analysis tool</div>
            <div style="font-size:10px; color:#56d364;">Status: Installed (Core)</div>
          </div>
          <div class="glass-card" style="padding:12px; background:#141b26;">
            <div style="font-weight:700; color:#56e6ff;">burpsuite-community</div>
            <div style="font-size:11px; color:#8b949e; margin:4px 0;">Web vulnerability testing proxy</div>
            <div style="font-size:10px; color:#56d364;">Status: Installed (Core)</div>
          </div>
          <div class="glass-card" style="padding:12px; background:#141b26;">
            <div style="font-weight:700; color:#56e6ff;">ghidra (v11.0.2)</div>
            <div style="font-size:11px; color:#8b949e; margin:4px 0;">Software reverse engineering studio</div>
            <div style="font-size:10px; color:#56d364;">Status: Installed (Core)</div>
          </div>
          <div class="glass-card" style="padding:12px; background:#141b26;">
            <div style="font-weight:700; color:#56e6ff;">zaproxy (v2.14.0)</div>
            <div style="font-size:11px; color:#8b949e; margin:4px 0;">OWASP automated web vulnerability scanner</div>
            <div style="font-size:10px; color:#56d364;">Status: Installed (Core)</div>
          </div>
          <div class="glass-card" style="padding:12px; background:#141b26;">
            <div style="font-weight:700; color:#56e6ff;">gcc & python3</div>
            <div style="font-size:11px; color:#8b949e; margin:4px 0;">C compiler and Python runtime toolchains</div>
            <div style="font-size:10px; color:#56d364;">Status: Installed (Core)</div>
          </div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'software-center',
      title: 'Software Center & Package Manager',
      icon: iconSvg,
      width: 760,
      height: 480,
      content: container
    });
  }
}

window.softwareCenterApp = new SoftwareCenterApp();
window.openSoftwareCenterApp = () => window.softwareCenterApp.open();
