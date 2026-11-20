// ==============================================================================
// Multi-OS Cybersecurity Platform - System Configuration & Multi-OS VFS Seed
// Supports Parrot Security OS, Ubuntu 24.04, Kali Linux, Linux Mint, & Fedora
// ==============================================================================

const MULTIOS_PROFILES = {
  parrot: {
    id: 'parrot',
    name: 'Parrot Security OS',
    version: '6.0 (Lrz)',
    edition: 'Security & Cloud Pentesting Edition',
    subtitle: 'The Ultimate Cloud Cyber Arsenal',
    codename: 'Parrot MATE',
    user: 'parrot',
    hostname: 'parrotcloud',
    homeDir: '/home/parrot',
    kernel: 'Linux parrotcloud 6.5.0-parrot1-amd64 #1 SMP PREEMPT_DYNAMIC Debian x86_64',
    accentColor: '#00e5ff',
    secondaryColor: '#05d550',
    panelType: 'top', // MATE Top Panel
    wallpaper: 'radial-gradient(circle at 50% 50%, #00363d 0%, #070e17 100%)',
    terminalPrompt: { user: 'parrot', host: 'parrotcloud', userColor: '#00e5ff', hostColor: '#05d550' }
  },
  ubuntu: {
    id: 'ubuntu',
    name: 'Ubuntu OS',
    version: '24.04 LTS',
    edition: 'Noble Numbat Enterprise Workstation',
    subtitle: 'Enterprise Linux & Development Workstation',
    codename: 'Ubuntu GNOME 46',
    user: 'ubuntu',
    hostname: 'noble',
    homeDir: '/home/ubuntu',
    kernel: 'Linux noble 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64',
    accentColor: '#E95420',
    secondaryColor: '#77216F',
    panelType: 'ubuntu-dock', // Left Dash Dock + Top Bar
    wallpaper: 'radial-gradient(circle at 30% 40%, #77216F 0%, #2c001e 50%, #0e0512 100%)',
    terminalPrompt: { user: 'ubuntu', host: 'noble', userColor: '#56d364', hostColor: '#ffffff' }
  },
  kali: {
    id: 'kali',
    name: 'Kali Linux',
    version: '2024.3',
    edition: 'Rolling Offensive Security Edition',
    subtitle: 'Advanced Penetration Testing & Ethical Hacking',
    codename: 'Kali XFCE',
    user: 'kali',
    hostname: 'kali',
    homeDir: '/home/kali',
    kernel: 'Linux kali 6.8.11-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.8.11-1kali2 x86_64',
    accentColor: '#2a7fff',
    secondaryColor: '#00d4aa',
    panelType: 'top', // XFCE Top Panel
    wallpaper: 'radial-gradient(circle at 50% 50%, #0d274c 0%, #08111d 60%, #040910 100%)',
    terminalPrompt: { user: 'kali', host: 'kali', userColor: '#2a7fff', hostColor: '#00d4aa' }
  },
  mint: {
    id: 'mint',
    name: 'Linux Mint',
    version: '22 (Wilma)',
    edition: 'Cinnamon Desktop Edition',
    subtitle: 'Elegance, Productivity & Secure Development',
    codename: 'Cinnamon 6.2',
    user: 'mint',
    hostname: 'cinnamon',
    homeDir: '/home/mint',
    kernel: 'Linux cinnamon 6.8.0-38-generic #38-Ubuntu SMP PREEMPT_DYNAMIC x86_64',
    accentColor: '#87CF3E',
    secondaryColor: '#4f8222',
    panelType: 'bottom', // Cinnamon Bottom Taskbar
    wallpaper: 'radial-gradient(circle at 50% 50%, #173318 0%, #0c180d 60%, #060d07 100%)',
    terminalPrompt: { user: 'mint', host: 'cinnamon', userColor: '#87CF3E', hostColor: '#ffffff' }
  },
  fedora: {
    id: 'fedora',
    name: 'Fedora Security Lab',
    version: '41',
    edition: 'Security Spin & Forensics Laboratory',
    subtitle: 'Cutting-Edge Linux, Security Analysis & Forensics',
    codename: 'Fedora Workstation',
    user: 'fedora',
    hostname: 'security',
    homeDir: '/home/fedora',
    kernel: 'Linux security 6.11.4-301.fc41.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64',
    accentColor: '#3C6EB4',
    secondaryColor: '#1d3e70',
    panelType: 'top', // Fedora Clean Top Bar
    wallpaper: 'radial-gradient(circle at 50% 50%, #152d52 0%, #0d192d 60%, #050a12 100%)',
    terminalPrompt: { user: 'fedora', host: 'security', userColor: '#3C6EB4', hostColor: '#79c0ff' }
  }
};

// Initial Linux Virtual File System Hierarchy
const INITIAL_VFS = {
  '/': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'tmp', 'usr', 'var']
  },
  '/etc': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: ['passwd', 'shadow', 'hostname', 'hosts', 'issue', 'os-release', 'resolv.conf']
  },
  '/etc/os-release': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'root',
    group: 'root',
    content: `NAME="Multi-OS Cybersecurity Platform"\nVERSION="2026.1"\nSUPPORTED_OS="Parrot Security, Ubuntu 24.04, Kali Linux, Linux Mint, Fedora Security"\n`
  },
  '/etc/hostname': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'root',
    group: 'root',
    content: 'cyberplatform\n'
  },
  '/etc/passwd': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'root',
    group: 'root',
    content: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nparrot:x:1000:1000:Parrot User,,,:/home/parrot:/bin/bash\nubuntu:x:1001:1001:Ubuntu User,,,:/home/ubuntu:/bin/bash\nkali:x:1002:1002:Kali User,,,:/home/kali:/bin/bash\nmint:x:1003:1003:Mint User,,,:/home/mint:/bin/bash\nfedora:x:1004:1004:Fedora User,,,:/home/fedora:/bin/bash\n`
  },
  '/etc/shadow': {
    type: 'file',
    perms: 'rw-r-----',
    owner: 'root',
    group: 'shadow',
    content: `root:$6$rounds=50000$salt$HASH...:19600:0:99999:7:::\nparrot:$6$rounds=50000$salt$HASH...:19600:0:99999:7:::\n`
  },
  '/home': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: ['parrot', 'ubuntu', 'kali', 'mint', 'fedora']
  },

  // 1. PARROT SECURITY HOME
  '/home/parrot': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'parrot',
    group: 'parrot',
    children: ['Desktop', 'Documents', 'Downloads', 'Labs', 'Tools', 'README.txt', '.bashrc']
  },
  '/home/parrot/Desktop': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'parrot',
    group: 'parrot',
    children: ['QuickStart.txt', 'Target-List.txt']
  },
  '/home/parrot/Desktop/QuickStart.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'parrot',
    group: 'parrot',
    content: `[Parrot Security OS - Quick Start Guide]\n\n1. Centralized Tools Center: Over 34 authorized security utilities ready to audit.\n2. Multi-OS Switcher: Toggle between Parrot, Ubuntu, Kali, Mint, and Fedora anytime.\n3. Educational Labs: Safe hands-on challenges for network recon, web auditing & hash inspection.\n`
  },
  '/home/parrot/Desktop/Target-List.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'parrot',
    group: 'parrot',
    content: `# Educational Authorized Lab Targets (RFC 5737 Test Subnets)\n192.168.1.1      Gateway Router (OpenWRT)\n192.168.1.100    Web Server (Apache/2.4.52 - Vulnerable)\n192.168.1.150    FTP Server (vsftpd 2.3.4)\n192.168.1.200    Database (MySQL 5.7)\nscanme.nmap.org  Authorized Public Recon Target\n`
  },
  '/home/parrot/Labs': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'parrot',
    group: 'parrot',
    children: ['Lab-01-Recon', 'Lab-02-WebExploit', 'Lab-03-ReverseEng']
  },
  '/home/parrot/Labs/Lab-01-Recon': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'parrot',
    group: 'parrot',
    children: ['notes.md', 'scan_script.sh']
  },
  '/home/parrot/Labs/Lab-01-Recon/notes.md': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'parrot',
    group: 'parrot',
    content: `# Lab 01 - Network Reconnaissance\nGoal: Identify open ports on target 192.168.1.100.\nCommand: nmap -sV -sC -T4 192.168.1.100\nExpected findings: Port 80 (HTTP), Port 22 (SSH), Port 443 (HTTPS).\n`
  },
  '/home/parrot/Labs/Lab-01-Recon/scan_script.sh': {
    type: 'file',
    perms: 'rwxr-xr-x',
    owner: 'parrot',
    group: 'parrot',
    content: `#!/bin/bash\necho "[+] Starting automated scan on target 192.168.1.100..."\nnmap -sV 192.168.1.100\n`
  },
  '/home/parrot/README.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'parrot',
    group: 'parrot',
    content: `Welcome to Parrot Security OS Cloud Environment.\nType 'help' in terminal for available commands.\n`
  },

  // 2. UBUNTU HOME
  '/home/ubuntu': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'ubuntu',
    group: 'ubuntu',
    children: ['Desktop', 'Documents', 'Projects', 'welcome.txt']
  },
  '/home/ubuntu/Desktop': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'ubuntu',
    group: 'ubuntu',
    children: ['getting_started.txt']
  },
  '/home/ubuntu/Desktop/getting_started.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'ubuntu',
    group: 'ubuntu',
    content: `Welcome to Ubuntu 24.04 LTS (Noble Numbat).\nUse the left Dash dock to access software, browser, and development IDEs.\n`
  },
  '/home/ubuntu/Projects': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'ubuntu',
    group: 'ubuntu',
    children: ['server.py', 'main.c']
  },
  '/home/ubuntu/Projects/server.py': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'ubuntu',
    group: 'ubuntu',
    content: `#!/usr/bin/env python3\nimport http.server\nimport socketserver\n\nPORT = 8000\nHandler = http.server.SimpleHTTPRequestHandler\n\nwith socketserver.TCPServer(("", PORT), Handler) as httpd:\n    print(f"[+] Serving development server at port {PORT}")\n    # httpd.serve_forever()\n`
  },
  '/home/ubuntu/Projects/main.c': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'ubuntu',
    group: 'ubuntu',
    content: `#include <stdio.h>\n\nint main() {\n    printf("Hello from Ubuntu 24.04 LTS C Programming Environment!\\n");\n    return 0;\n}\n`
  },
  '/home/ubuntu/welcome.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'ubuntu',
    group: 'ubuntu',
    content: `Ubuntu 24.04 LTS Noble Numbat\nDefault Python: 3.12 | GCC: 13.2.0 | GNOME: 46\n`
  },

  // 3. KALI LINUX HOME
  '/home/kali': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'kali',
    group: 'kali',
    children: ['Desktop', 'wordlists', 'payloads', 'target_recon.txt']
  },
  '/home/kali/Desktop': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'kali',
    group: 'kali',
    children: ['kali_instructions.txt']
  },
  '/home/kali/Desktop/kali_instructions.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'kali',
    group: 'kali',
    content: `Kali Linux Rolling 2024.3\nThe quiet you become, the more you are able to hear.\nUse the Cybersecurity Tools Center for offensive and defensive operations.\n`
  },
  '/home/kali/wordlists': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'kali',
    group: 'kali',
    children: ['rockyou_sample.txt']
  },
  '/home/kali/wordlists/rockyou_sample.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'kali',
    group: 'kali',
    content: `password\n123456\n12345678\nqwerty\nadmin\nwelcome\nparrot\nkali2024\nsecret123\n`
  },
  '/home/kali/target_recon.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'kali',
    group: 'kali',
    content: `Scope of Work: Authorized Educational Testing Only\nPrimary Subnet: 192.168.1.0/24\n`
  },

  // 4. LINUX MINT HOME
  '/home/mint': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'mint',
    group: 'mint',
    children: ['Desktop', 'Documents', 'notes.txt']
  },
  '/home/mint/Desktop': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'mint',
    group: 'mint',
    children: ['welcome_mint.txt']
  },
  '/home/mint/Desktop/welcome_mint.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'mint',
    group: 'mint',
    content: `Welcome to Linux Mint 22 (Wilma) Cinnamon Edition.\nClick the Mint menu at bottom-left to browse installed tools and settings.\n`
  },
  '/home/mint/notes.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'mint',
    group: 'mint',
    content: `Linux Mint: Cinnamon 6.2 Desktop\n`
  },

  // 5. FEDORA SECURITY LAB HOME
  '/home/fedora': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'fedora',
    group: 'fedora',
    children: ['Desktop', 'forensics', 'audit_plan.md']
  },
  '/home/fedora/Desktop': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'fedora',
    group: 'fedora',
    children: ['fedora_security_guide.txt']
  },
  '/home/fedora/Desktop/fedora_security_guide.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'fedora',
    group: 'fedora',
    content: `Fedora 41 Security Lab Spin\nForensics, memory analysis, reverse engineering & audit toolchain.\n`
  },
  '/home/fedora/audit_plan.md': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'fedora',
    group: 'fedora',
    content: `# Security Audit Plan\n1. Network Port Enumeration\n2. SSL/TLS Certificate Verification\n3. Web Application OWASP Top 10 Assessment\n4. Report Generation in Report Center\n`
  },

  '/var': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: ['log']
  },
  '/var/log': {
    type: 'dir',
    perms: 'rwxr-xr-x',
    owner: 'root',
    group: 'root',
    children: ['auth.log', 'syslog']
  },
  '/var/log/auth.log': {
    type: 'file',
    perms: 'rw-r-----',
    owner: 'root',
    group: 'adm',
    content: `Nov 20 08:30:00 cyberplatform systemd: pam_unix(systemd-user:session): session opened for user parrot\nNov 20 08:31:12 cyberplatform sudo: parrot : TTY=pts/0 ; PWD=/home/parrot ; USER=root ; COMMAND=/usr/bin/nmap\n`
  }
};

window.MULTIOS_PROFILES = MULTIOS_PROFILES;
window.INITIAL_VFS = INITIAL_VFS;
window.PARROT_CONFIG = MULTIOS_PROFILES.parrot; // Backward compatibility
