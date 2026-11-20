# Multi-OS Cybersecurity Platform – Online Operating System

[![OS Matrix](https://img.shields.io/badge/OS%20Matrix-Parrot%20|%20Ubuntu%20|%20Kali%20|%20Mint%20|%20Fedora-00e5ff?style=for-the-badge&logo=linux&logoColor=white)](https://github.com)
[![Tools](https://img.shields.io/badge/Security%20Tools-34%20Arsenal%20Tools-05d550?style=for-the-badge&logo=kalilinux&logoColor=white)](https://github.com)
[![Labs](https://img.shields.io/badge/Learning%20Labs-8%20Interactive%20CTFs-e95420?style=for-the-badge&logo=hackthebox&logoColor=white)](https://github.com)
[![Deploy](https://img.shields.io/badge/Netlify-Static%20Deployable-00ad9f?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)
[![License](https://img.shields.io/badge/License-MIT-3c6eb4?style=for-the-badge)](LICENSE)

An enterprise-grade, browser-based **Multi-Operating-System Cybersecurity Platform** designed for penetration testers, security researchers, ethical hackers, students, and system administrators. Features **5 independent operating system environments**, a **34-tool Cybersecurity Center**, an **Advanced Multi-Tab Bash Terminal**, **12 System Applications**, **8 Interactive Educational Labs**, and a **Security Assessment Report Center** with PDF and CSV export.

---

## 🖥️ Section 1: Five Independent Operating Systems

Switch seamlessly between 5 fully themed and independent operating systems on-the-fly, or set your preferred default bootloader environment:

| Operating System | Codename / Base | Desktop Layout | Primary Focus & Custom Accents |
| :--- | :--- | :--- | :--- |
| **Parrot Security OS 6.0** | *Lrz* (Debian 12) | MATE Top Panel + Telemetry HUD | Cyber Arsenal, Privacy & Forensics (`#00e5ff`, `#05d550`) |
| **Ubuntu 24.04 LTS** | *Noble Numbat* | GNOME 46 Left Dash Dock + Top Bar | Software Center, Nautilus, Python/C Dev (`#E95420`, `#77216F`) |
| **Kali Linux 2024.3** | *Kali Rolling* | XFCE Top Panel + Dragon Branding | Penetration Testing & Offensive Toolkit (`#2a7fff`, `#1f2229`) |
| **Linux Mint 22** | *Wilma* | Cinnamon Bottom Taskbar + Mint Menu | Classic Desktop Workflow, Nemo, Dev Apps (`#87CF3E`, `#20242c`) |
| **Fedora Security Lab 41** | *Fedora Spin* | Clean Modern Top Panel | Digital Forensics, Diagnostics & Analysis (`#3C6EB4`, `#0B1E33`) |

### Features of the OS Selection Bootloader:
- 5 custom interactive cards with SVG brand logos, codenames, and feature tags.
- One-click instant desktop adaptation (wallpapers, panel arrangements, taskbars, and prompts update synchronously).
- "Remember selection as default boot OS" option saved to `localStorage`.

---

## 🛡️ Section 2: Centralized Cybersecurity Tool Center (34 Tools)

The platform includes a dedicated Cyber Tool Center (`window.openToolCenterApp()`) categorizing 34 industry-standard tools:

1. **Network Tools**:
   - `Nmap`: Port scanner, OS detection, service versioning (GUI & CLI runner).
   - `Masscan`: High-speed asynchronous TCP port scanner.
   - `Netcat`: Swiss army knife for TCP/UDP port listening and raw socket streams.
   - `Wireshark`: Real-time packet analyzer with protocol decode trees and hex view.
   - `Traceroute`: ICMP / UDP route packet hop inspection.
   - `Ping`: ICMP round-trip latency and echo diagnostic.

2. **Web Application Security**:
   - `Burp Suite`: Intercept proxy, request repeater, and encoding/decoding suite.
   - `OWASP ZAP`: Dynamic vulnerability scanner with risk rating alerts and remediation.
   - `Nikto`: Web server misconfiguration and outdated software scanner.
   - `Gobuster`: Directory, DNS subdomain, and virtual host brute-forcer.
   - `WhatWeb`: Web technologies, CMS, server header, and framework fingerprinting.
   - `Wapiti`: Black-box web security auditor for XSS, SQLi, and SSRF.

3. **OSINT (Open Source Intelligence)**:
   - `WHOIS`: Domain registration, registrar, and IP allocation lookups.
   - `theHarvester`: Emails, names, subdomains, IPs, and URLs harvester.
   - `Sherlock`: Cross-platform social media account hunter.
   - `Amass`: In-depth network mapping and external asset discovery.
   - `Subfinder`: Fast passive subdomain enumeration tool.
   - `DNSenum`: Comprehensive DNS record scraper and zone transfer tester.

4. **Password Auditing**:
   - `John the Ripper`: Offline dictionary and rule-based hash cracker.
   - `Hashcat`: High-throughput rule and mask password recovery simulation.
   - `Hydra`: Network logon cracker supporting SSH, FTP, HTTP, and SMTP.
   - `Hash Identifier`: Automated cryptographic hash classifier (MD5, SHA1, NTLM, etc.).
   - `Password Analyzer`: Entropy, character set diversity, and zxcvbn evaluation.

5. **Digital Forensics**:
   - `Autopsy`: Digital forensics platform and disk image analyzer.
   - `ExifTool`: Comprehensive metadata reader/writer for EXIF, IPTC, and XMP.
   - `Binwalk`: Firmware analysis and embedded filesystem extraction tool.
   - `Foremost`: Header/footer data carving utility for deleted files.
   - `Volatility`: Advanced memory forensics and RAM dump analysis framework.

6. **Development & Reverse Engineering**:
   - `Python 3.12 IDE`: Code editor with cybersecurity script templates and live execution.
   - `C / GCC IDE`: C compiler sandbox for low-level exploit development.
   - `Git Manager`: Version control interface for managing repositories.
   - `Docker Lab`: Container lifecycle, volume, and Dockerfile learning simulator.
   - `SQLMap`: Automated SQL injection testing tool.
   - `Metasploit Simulator`: Exploit framework simulation with interactive msfconsole.

*Each tool features real usage instructions, syntax examples, installation status, external documentation links, and an interactive CLI test runner.*

---

## 💻 Section 3: Advanced Multi-Tab Bash Terminal

- **Tabs Management**: Open multiple simultaneous terminal tabs with persistent history.
- **Client & Cloud Execution**:
  - Direct connection to live Docker / Debian 12 containers via WebSocket (`/terminal`).
  - High-fidelity **POSIX Shell Engine** in client-side JavaScript for offline environments.
  - **Transparent Simulation Labeling**: In client mode, simulated command outputs clearly display `[SIMULATED ENVIRONMENT - Educational Sandbox]` badges.
- **POSIX Shell Command Suite**: `pwd`, `ls -la`, `cd`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `cat`, `echo`, `grep`, `find`, `whoami`, `date`, `uname -a`, `ip addr`, `ping`, `nmap`, `nikto`, `sudo`, `history`, `clear`, `neofetch`, pipes (`|`), and output redirection (`>`).
- **Interactive Visual Nano**: Full in-terminal text editor with <kbd>Ctrl+O</kbd> (WriteOut) and <kbd>Ctrl+X</kbd> (Exit).
- **Interactive Autocomplete & History**: <kbd>Tab</kbd> completion for commands and file paths; <kbd>Up</kbd> / <kbd>Down</kbd> arrow command history.
- **Terminal Themes**: Switch instantly between *Parrot Cyan*, *Ubuntu Aubergine*, *Kali Electric Blue*, *Mint Matrix*, and *Monochrome*.
- **Linux Command Cheat Sheet**: Slide-out tutorial drawer with categorized commands and syntax explanations.

---

## 🗔 Section 4: Desktop Environment & Window Management

- **Window Architecture**:
  - Movable titlebars with window boundary constraints.
  - 8-Handle bidirectional resizing (N, S, E, W, NE, NW, SE, SW).
  - Half-screen and quarter-screen edge snapping with visual ghost overlay.
  - Minimize, Maximize/Restore, and Close with automatic taskbar synchronization.
- **Multiple Workspaces**: 4 virtual desktop workspaces with quick switching via top panel or <kbd>Ctrl+Shift+W</kbd>.
- **Adaptive Taskbars & Docks**:
  - **MATE Top Panel** (Parrot, Kali, Fedora): Applications dropdown, quick launch, task buttons, telemetry, workspaces, and system clock.
  - **Ubuntu Left Dock** (Ubuntu): GNOME Dash to Dock with running app indicators and fast app launchers.
  - **Cinnamon Bottom Panel** (Linux Mint): Classic bottom taskbar with Mint Menu, active window buttons, workspaces, and tray clock.
- **Desktop Marquee & Shortcuts**: Drag selection box across desktop icons; double-click icon launch; right-click desktop context menu.
- **Lock Screen**: Fullscreen security lock (<kbd>Ctrl+Alt+L</kbd> or <kbd>Super+L</kbd>) with dynamic clock, date, username, and unlock authentication.

---

## 📦 Section 5: System Applications (12 Core Utilities)

1. **File Manager**: Directory explorer for the virtual file system, create folders, upload files, download files, view file properties.
2. **Text Editor (Pluma/Gedit)**: Syntax highlighted editor for Python, Shell, C, and Markdown documents.
3. **Scientific & Hex Calculator**: Standard decimal calculation alongside Programmer Mode (Hexadecimal, Binary, Octal).
4. **Firefox-Style Web Browser**: Browser simulator with security bookmarks, CVE vulnerability search, and URL navigation.
5. **Python 3.12 IDE**: Interactive Python development environment with security script templates (Port scanner, HTTP requester, Hash cracker).
6. **C / GCC 13.2 IDE**: C coding environment with simulated compilation, execution, and exploit analysis.
7. **System Resource Monitor (Htop)**: Real-time Canvas telemetry graphs for CPU/RAM and interactive process table with `kill` signals.
8. **Network Activity Monitor**: Interface inspector (`eth0`, `lo`, `wlan0`), Rx/Tx bandwidth meters, and active socket table.
9. **Settings Center**: Personalization (wallpapers, themes, font sizing), cloud node configuration, and container memory limits.
10. **Software Center**: Package management catalog to inspect installed security tools and install new packages.
11. **Cybersecurity SOP & Lab Manual (PDF Reader)**: Interactive documentation viewer for cybersecurity procedures and standard operating guidelines.
12. **Image Viewer (Eye of MATE)**: Image gallery and wallpaper previewer with "Set as Wallpaper" functionality.

---

## 🧪 Section 6: Cybersecurity Learning Labs (8 Modules)

Safe, educational hands-on CTF exercises:
1. **Nmap Target Scanning**: Learn port scanning, flag usage, and service identification on authorized loopback targets.
2. **DNS & Zone Transfers**: Query A, MX, NS, and TXT records, and analyze DNS cache poisoning mitigations.
3. **HTTP Header & Security Flags**: Audit `Content-Security-Policy`, `HSTS`, `X-Frame-Options`, and cookie security flags.
4. **Password Auditing & Hashes**: Crack MD5, SHA-256, and NTLM password hashes using rainbow dictionary attacks.
5. **Web Vulnerability Demonstrations**: Exploit and patch simulated SQL Injection, Cross-Site Scripting (XSS), and Command Injection.
6. **PCAP Network Forensics**: Extract plaintext credentials, DNS queries, and suspicious beacons from captured PCAP files.
7. **Cryptographic File Hash Verification**: Calculate and verify MD5, SHA-1, and SHA-256 checksums to detect file tampering.
8. **Linux Terminal CTF Challenges**: Solve 5 progressive command-line challenges finding hidden flags in directories.

---

## 📊 Section 7: Security Assessment Report Center

- **Automated Report Generation**: Generate executive summary reports of security scans with vulnerability severity breakdowns (Critical, High, Medium, Low).
- **Print & PDF Export**: One-click printable view formatted for executive presentation and browser PDF export (`window.print()`).
- **CSV Data Export**: Download raw finding logs and scan metadata as `.csv` spreadsheets.
- **Audit Log History**: Persistent record of all executed scans with timestamps and target metadata.
- **Verification Badging**: Explicitly distinguishes between `[SIMULATED - Educational Sandbox]` and `[REAL CONTAINER EXECUTION]` scan outputs.

---

## 🚀 Deployment & Installation

### Option A: Static Deployment (Netlify, GitHub Pages, Vercel)
This platform is **100% functional client-side** with zero backend requirement.
1. Fork or clone the repository:
   ```bash
   git clone https://github.com/your-username/multios-cybersecurity-platform.git
   cd multios-cybersecurity-platform
   ```
2. Deploy directly via **Netlify Drop**:
   - Visit [Netlify Drop](https://app.netlify.com/drop).
   - Drag and drop this project directory.
   - Your multi-OS platform is live instantly!
3. Or deploy via Netlify CLI:
   ```bash
   npx netlify deploy --prod --dir=.
   ```

### Option B: Local Node.js Development Server
```bash
npm install
npm start
# Open http://localhost:3000 in your browser
```

### Option C: Isolated Docker Container Backend
For real Linux terminal execution (`ws://localhost:4000/terminal`):
```bash
docker compose up -d
# The Debian 12 container boots with resource limits (2.0 vCPU, 2048 MB RAM)
```

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd> | Open New Bash Terminal |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>L</kbd> / <kbd>Super</kbd> + <kbd>L</kbd> | Lock Screen |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> | Cycle Virtual Workspaces (1–4) |
| <kbd>Super</kbd> / <kbd>Windows</kbd> Key | Toggle Applications Menu |
| <kbd>Tab</kbd> | Autocomplete Terminal Commands |
| <kbd>Ctrl</kbd> + <kbd>O</kbd> / <kbd>Ctrl</kbd> + <kbd>X</kbd> | Save / Exit in Visual Nano |

---

## 📜 Ethical & Educational Disclosure
This platform is created strictly for **authorized educational research, security testing, and cyber defense training**. Tools simulated or provided must only be used against systems you own or have explicit written authorization to evaluate. Always practice responsible and ethical disclosure.
