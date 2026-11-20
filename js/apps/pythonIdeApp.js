// ==============================================================================
// Multi-OS Cybersecurity Platform - Python Programming IDE
// Interactive Python Code Editor, Sample Security Scripts, & Console Output
// ==============================================================================

class PythonIdeApp {
  constructor() {
    this.samples = {
      scanner: `#!/usr/bin/env python3
# Port Scanner Script
import socket

target = "192.168.1.100"
ports = [21, 22, 80, 443, 3306]

print(f"[*] Starting educational TCP port scan against {target}...")
for p in ports:
    # Simulated socket check
    status = "OPEN" if p in [22, 80, 443] else "CLOSED"
    print(f"[+] Port {p:4d}/tcp : {status}")

print("[*] Scan complete.")`,

      headers: `#!/usr/bin/env python3
# HTTP Header Security Checker
import urllib.request

target_url = "http://192.168.1.100"
print(f"[*] Fetching HTTP response headers for {target_url}...")

headers = {
    "Server": "Apache/2.4.52 (Debian)",
    "Content-Type": "text/html; charset=UTF-8",
    "X-Powered-By": "PHP/8.1.2"
}

for k, v in headers.items():
    print(f"  {k}: {v}")

print("\\n[!] Security Assessment:")
if "Content-Security-Policy" not in headers:
    print("  [-] Missing Content-Security-Policy (CSP)")
if "X-Frame-Options" not in headers:
    print("  [-] Missing X-Frame-Options (Clickjacking Risk)")`,

      hasher: `#!/usr/bin/env python3
# Password Hash Generator
import hashlib

words = ["admin", "password", "parrot2026", "secret"]
print(f"{'WORD':<12} | {'MD5':<32}")
print("-" * 48)

for w in words:
    h = hashlib.md5(w.encode()).hexdigest()
    print(f"{w:<12} | {h}")`
    };
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131a26; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">Python 3.12 IDE</span>
          <span style="color:#8b949e;">|</span>
          <select id="py-samples" class="nmap-select" style="font-size:11px; padding:2px 6px;">
            <option value="scanner">Sample: Port Scanner</option>
            <option value="headers">Sample: HTTP Header Checker</option>
            <option value="hasher">Sample: Hash Generator</option>
          </select>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn primary" id="py-run-btn" style="background:#56d364; color:#000; font-weight:700;">
            ▶ Run Script
          </button>
          <button class="tool-btn" id="py-clear-btn">Clear Output</button>
        </div>
      </div>

      <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <textarea id="py-code-editor" class="nano-textarea" style="flex:1; font-family:var(--font-mono); font-size:12.5px; padding:12px; line-height:1.45; background:#080c12; color:#e6edf3; border:none; outline:none; resize:none;" spellcheck="false">${this.samples.scanner}</textarea>
        <div style="height:150px; background:#05080c; border-top:1px solid rgba(0,229,255,0.2); display:flex; flex-direction:column;">
          <div style="padding:4px 10px; background:#111722; font-size:10.5px; font-weight:700; color:#8b949e; display:flex; justify-content:space-between;">
            <span>Interactive Python Console Output</span>
            <span style="color:#56d364;">CPython 3.12 (Sandbox Runtime)</span>
          </div>
          <div id="py-output" style="flex:1; padding:10px; font-family:var(--font-mono); font-size:11.5px; color:#7ee787; overflow-y:auto; white-space:pre-wrap;">Press "Run Script" to execute Python code.</div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'python-ide',
      title: 'Python 3 Development & Scripting IDE',
      icon: iconSvg,
      width: 780,
      height: 500,
      content: container
    });

    const editor = container.querySelector('#py-code-editor');
    const output = container.querySelector('#py-output');
    const samplesSelect = container.querySelector('#py-samples');

    samplesSelect.onchange = () => {
      editor.value = this.samples[samplesSelect.value] || '';
    };

    container.querySelector('#py-run-btn').onclick = () => {
      output.textContent = `[Executing script in isolated Python sandbox...]\n`;
      setTimeout(() => {
        const val = samplesSelect.value;
        if (val === 'scanner') {
          output.textContent += `[*] Starting educational TCP port scan against 192.168.1.100...\n[+] Port   21/tcp : CLOSED\n[+] Port   22/tcp : OPEN\n[+] Port   80/tcp : OPEN\n[+] Port  443/tcp : OPEN\n[+] Port 3306/tcp : CLOSED\n[*] Scan complete.\n[Process exited with return code 0]`;
        } else if (val === 'headers') {
          output.textContent += `[*] Fetching HTTP response headers for http://192.168.1.100...\n  Server: Apache/2.4.52 (Debian)\n  Content-Type: text/html; charset=UTF-8\n  X-Powered-By: PHP/8.1.2\n\n[!] Security Assessment:\n  [-] Missing Content-Security-Policy (CSP)\n  [-] Missing X-Frame-Options (Clickjacking Risk)\n[Process exited with return code 0]`;
        } else {
          output.textContent += `WORD         | MD5                             \n------------------------------------------------\nadmin        | 21232f297a57a5a743894a0e4a801fc3\npassword     | 5f4dcc3b5aa765d61d8327deb882cf99\nparrot2026   | 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d\nsecret       | 5ebe2294ecd0e0f08eab7690d2a6ee69\n[Process exited with return code 0]`;
        }
      }, 400);
    };

    container.querySelector('#py-clear-btn').onclick = () => {
      output.textContent = '';
    };
  }
}

window.pythonIdeApp = new PythonIdeApp();
window.openPythonIdeApp = () => window.pythonIdeApp.open();
