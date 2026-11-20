// ==============================================================================
// Multi-OS Cybersecurity Platform - C Compiler & IDE
// C Programming Workspace, GCC Compilation, & Binary Output Console
// ==============================================================================

class CIdeApp {
  constructor() {
    this.defaultCode = `#include <stdio.h>
#include <string.h>

void check_authorization(const char *key) {
    if (strcmp(key, "PARROT-2026") == 0) {
        printf("[+] Access Granted! Security clearance verified.\\n");
    } else {
        printf("[-] Access Denied! Invalid credentials.\\n");
    }
}

int main(int argc, char **argv) {
    printf("=== C Security Programming Lab ===\\n");
    printf("Compiling with GCC 13.2.0 (Debian/Ubuntu)\\n\\n");
    
    check_authorization("PARROT-2026");
    return 0;
}`;
  }

  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#131a26; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:var(--parrot-cyan); font-size:12px;">GCC C Compiler Studio</span>
          <span style="color:#8b949e;">|</span>
          <span style="color:#8b949e; font-size:11px;">Target: <strong>main.c</strong> (x86_64-linux-gnu)</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="tool-btn primary" id="c-build-btn" style="background:#56d364; color:#000; font-weight:700;">
            ⚙ Build & Run
          </button>
          <button class="tool-btn" id="c-clear-btn">Clear</button>
        </div>
      </div>

      <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <textarea id="c-code-editor" class="nano-textarea" style="flex:1; font-family:var(--font-mono); font-size:12.5px; padding:12px; line-height:1.45; background:#080c12; color:#e6edf3; border:none; outline:none; resize:none;" spellcheck="false">${this.defaultCode}</textarea>
        <div style="height:150px; background:#05080c; border-top:1px solid rgba(0,229,255,0.2); display:flex; flex-direction:column;">
          <div style="padding:4px 10px; background:#111722; font-size:10.5px; font-weight:700; color:#8b949e; display:flex; justify-content:space-between;">
            <span>GCC Build & Execution Terminal</span>
            <span style="color:#56d364;">gcc -Wall -O2 main.c -o app</span>
          </div>
          <div id="c-output" style="flex:1; padding:10px; font-family:var(--font-mono); font-size:11.5px; color:#7ee787; overflow-y:auto; white-space:pre-wrap;">Press "Build & Run" to compile with GCC and execute binary.</div>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'c-ide',
      title: 'C Programming IDE & GCC Compiler',
      icon: iconSvg,
      width: 780,
      height: 500,
      content: container
    });

    const output = container.querySelector('#c-output');
    container.querySelector('#c-build-btn').onclick = () => {
      output.textContent = `$ gcc -Wall -O2 main.c -o main\n[+] Compilation successful (0 warnings, 0 errors)\n$ ./main\n\n=== C Security Programming Lab ===\nCompiling with GCC 13.2.0 (Debian/Ubuntu)\n\n[+] Access Granted! Security clearance verified.\n\n[Process completed with exit code 0]`;
      window.notifications.show('GCC Compiler', 'main.c compiled and executed', 'info');
    };

    container.querySelector('#c-clear-btn').onclick = () => {
      output.textContent = '';
    };
  }
}

window.cIdeApp = new CIdeApp();
window.openCIdeApp = () => window.cIdeApp.open();
