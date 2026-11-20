// ==============================================================================
// ParrotCloud OS - Ghidra Software Reverse Engineering Framework
// Binary Disassembler, Hex Inspector, Decompiled C Pseudo-Code Studio
// ==============================================================================

class GhidraApp {
  open() {
    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`;

    const container = document.createElement('div');
    container.className = 'tool-container';
    container.innerHTML = `
      <div class="tool-toolbar" style="background:#15121b; border-bottom:1px solid rgba(187,134,252,0.3);">
        <span style="font-weight:700; color:#bb86fc; font-size:12px;">Ghidra v11.0.2 - SRE Studio</span>
        <span style="color:#8b949e;">|</span>
        <span style="color:#8b949e; font-size:11px;">Target Binary: <strong style="color:#56e6ff;">/home/parrot/Labs/crackme_v1.elf</strong> [ELF 64-bit LSB x86-64]</span>
        <button class="tool-btn" id="ghidra-decompile-btn" style="margin-left:auto; border-color:#bb86fc; color:#bb86fc;">Re-Decompile</button>
      </div>

      <div class="ghidra-workspace">
        <!-- SYMBOL TREE PANE -->
        <div class="ghidra-symbols-pane">
          <div style="font-size:11px; font-weight:700; color:#bb86fc; margin-bottom:8px;">Symbol Tree</div>
          <div style="color:#56d364; font-size:11px; margin-bottom:4px;">▼ Functions (Exports)</div>
          <div style="padding-left:14px; font-family:var(--font-mono); font-size:11px;">
            <div class="fm-sidebar-item active" style="padding:3px 6px;">_start</div>
            <div class="fm-sidebar-item" style="padding:3px 6px;">main</div>
            <div class="fm-sidebar-item" style="padding:3px 6px;">verify_license_key</div>
            <div class="fm-sidebar-item" style="padding:3px 6px;">decrypt_xor_payload</div>
            <div class="fm-sidebar-item" style="padding:3px 6px;">vulnerable_strcpy</div>
          </div>
          <div style="color:#ffa657; font-size:11px; margin:8px 0 4px 0;">▼ Imports / Libraries</div>
          <div style="padding-left:14px; font-family:var(--font-mono); font-size:11px; color:#8b949e;">
            <div>libc.so.6</div>
            <div>printf</div>
            <div>strcmp</div>
            <div>malloc</div>
          </div>
        </div>

        <!-- DISASSEMBLY LISTING PANE -->
        <div class="ghidra-disasm-pane">
          <div style="color:#8b949e; border-bottom:1px solid #30363d; padding-bottom:4px; margin-bottom:8px;">
            ADDRESS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; OPCODES &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; INSTRUCTION
          </div>
          <div style="line-height:1.6;">
            <div><span style="color:#79c0ff;">00401142</span> &nbsp; <span style="color:#6e7681;">55</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">push</span> &nbsp;&nbsp; rbp</div>
            <div><span style="color:#79c0ff;">00401143</span> &nbsp; <span style="color:#6e7681;">48 89 e5</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">mov</span> &nbsp;&nbsp;&nbsp; rbp, rsp</div>
            <div><span style="color:#79c0ff;">00401146</span> &nbsp; <span style="color:#6e7681;">48 83 ec 20</span> &nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">sub</span> &nbsp;&nbsp;&nbsp; rsp, 0x20</div>
            <div><span style="color:#79c0ff;">0040114a</span> &nbsp; <span style="color:#6e7681;">48 8d 3d 12</span> &nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">lea</span> &nbsp;&nbsp;&nbsp; rdi, [str.LicenseKey]</div>
            <div><span style="color:#79c0ff;">00401151</span> &nbsp; <span style="color:#6e7681;">e8 da fe ff ff</span> &nbsp; <span style="color:#ffa657;">call</span> &nbsp;&nbsp; <span style="color:#56d364;">sym.verify_license_key</span></div>
            <div><span style="color:#79c0ff;">00401156</span> &nbsp; <span style="color:#6e7681;">85 c0</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">test</span> &nbsp;&nbsp; eax, eax</div>
            <div><span style="color:#79c0ff;">00401158</span> &nbsp; <span style="color:#6e7681;">74 14</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ff7b72;">jz</span> &nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ff7b72;">0040116e</span> (Key Invalid)</div>
            <div><span style="color:#79c0ff;">0040115a</span> &nbsp; <span style="color:#6e7681;">48 8d 3d 30</span> &nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">lea</span> &nbsp;&nbsp;&nbsp; rdi, [str.AccessGranted]</div>
            <div><span style="color:#79c0ff;">00401161</span> &nbsp; <span style="color:#6e7681;">e8 ca fe ff ff</span> &nbsp; <span style="color:#ffa657;">call</span> &nbsp;&nbsp; <span style="color:#56d364;">sym.imp.puts</span></div>
            <div><span style="color:#79c0ff;">00401166</span> &nbsp; <span style="color:#6e7681;">b8 00 00 00 00</span> &nbsp; <span style="color:#ffa657;">mov</span> &nbsp;&nbsp;&nbsp; eax, 0x0</div>
            <div><span style="color:#79c0ff;">0040116b</span> &nbsp; <span style="color:#6e7681;">c9</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">leave</span></div>
            <div><span style="color:#79c0ff;">0040116c</span> &nbsp; <span style="color:#6e7681;">c3</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">ret</span></div>
            <div><span style="color:#79c0ff;">0040116e</span> &nbsp; <span style="color:#6e7681;">48 8d 3d 48</span> &nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">lea</span> &nbsp;&nbsp;&nbsp; rdi, [str.AccessDenied]</div>
            <div><span style="color:#79c0ff;">00401175</span> &nbsp; <span style="color:#6e7681;">e8 b6 fe ff ff</span> &nbsp; <span style="color:#ffa657;">call</span> &nbsp;&nbsp; <span style="color:#56d364;">sym.imp.puts</span></div>
            <div><span style="color:#79c0ff;">0040117a</span> &nbsp; <span style="color:#6e7681;">b8 01 00 00 00</span> &nbsp; <span style="color:#ffa657;">mov</span> &nbsp;&nbsp;&nbsp; eax, 0x1</div>
            <div><span style="color:#79c0ff;">0040117f</span> &nbsp; <span style="color:#6e7681;">c9</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">leave</span></div>
            <div><span style="color:#79c0ff;">00401180</span> &nbsp; <span style="color:#6e7681;">c3</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style="color:#ffa657;">ret</span></div>
          </div>
        </div>

        <!-- DECOMPILER C PSEUDO-CODE PANE -->
        <div class="ghidra-decompile-pane">
          <div style="color:#8b949e; border-bottom:1px solid #30363d; padding-bottom:4px; margin-bottom:8px;">
            DECOMPILER: <span style="color:#bb86fc;">main()</span> (Reconstructed C Source)
          </div>
          <pre style="line-height:1.5; font-family:var(--font-mono); color:#e6edf3;">
<span style="color:#ffa657;">int</span> <span style="color:#56d364;">main</span>(<span style="color:#ffa657;">int</span> argc, <span style="color:#ffa657;">char</span> **argv) {
    <span style="color:#ffa657;">int</span> is_valid;
    <span style="color:#ffa657;">char</span> buffer[32];

    <span style="color:#6e7681;">// Buffer overflow vulnerability in input handling</span>
    <span style="color:#56d364;">printf</span>(<span style="color:#79c0ff;">"Enter ParrotCloud License Key: "</span>);
    <span style="color:#56d364;">gets</span>(buffer); 

    <span style="color:#6e7681;">// Validation logic</span>
    is_valid = <span style="color:#56d364;">verify_license_key</span>(buffer);
    
    <span style="color:#ffa657;">if</span> (is_valid == 1) {
        <span style="color:#56d364;">puts</span>(<span style="color:#79c0ff;">"[+] Access Granted! Flag: PARROT{GHIDRA_DISASM_WIN}"</span>);
        <span style="color:#ffa657;">return</span> 0;
    } <span style="color:#ffa657;">else</span> {
        <span style="color:#56d364;">puts</span>(<span style="color:#79c0ff;">"[-] Access Denied. Invalid key."</span>);
        <span style="color:#ffa657;">return</span> 1;
    }
}
          </pre>
        </div>
      </div>
    `;

    window.windowManager.createWindow({
      id: 'ghidra',
      title: 'Ghidra Software Reverse Engineering Studio',
      icon: iconSvg,
      width: 840,
      height: 520,
      content: container
    });

    container.querySelector('#ghidra-decompile-btn').onclick = () => {
      window.notifications.show('Ghidra Decompiler', 'Binary re-analyzed in 0.42 seconds', 'info');
    };
  }
}

window.ghidraApp = new GhidraApp();
window.openGhidraApp = () => window.ghidraApp.open();
