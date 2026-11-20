// ==============================================================================
// ParrotCloud OS - System Configuration & Filesystem Seed
// Debian 12 Bookworm / Parrot Security OS Architecture Specification
// ==============================================================================

const PARROT_CONFIG = {
  osName: 'ParrotCloud OS',
  version: '6.0 (Lrz)',
  edition: 'Cybersecurity & Cloud Penetration Testing Edition',
  kernel: 'Linux parrotcloud 6.5.0-parrot1-amd64 #1 SMP PREEMPT_DYNAMIC Debian x86_64',
  hostname: 'parrotcloud',
  user: 'parrot',
  userUid: 1000,
  userGid: 1000,
  userGroups: ['parrot', 'sudo', 'netdev', 'wireshark', 'docker'],
  homeDir: '/home/parrot',
  defaultWsUrl: `ws://${window.location.host || 'localhost:3000'}/terminal`,
  apiEndpoint: '/api'
};

// Virtual File System Initial Structure (Linux Directory Hierarchy)
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
    content: `NAME="Parrot Security OS Cloud"\nVERSION="6.0 (Lrz)"\nID=parrot\nID_LIKE=debian\nPRETTY_NAME="Parrot OS 6.0 (Lrz) Cloud Cybersecurity Workspace"\nHOME_URL="https://parrotsec.org/"\nSUPPORT_URL="https://community.parrotsec.org/"\n`
  },
  '/etc/hostname': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'root',
    group: 'root',
    content: 'parrotcloud\n'
  },
  '/etc/passwd': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'root',
    group: 'root',
    content: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nparrot:x:1000:1000:Parrot User,,,:/home/parrot:/bin/bash\n`
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
    children: ['parrot']
  },
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
    content: `[ParrotCloud OS - Quick Start Guide]\n\n1. Real Terminal: Launch terminal to run authentic bash commands.\n2. Security Tools: Use Nmap for network recon, Wireshark for packet capture, Burp Suite for HTTP auditing, and Ghidra for reverse engineering.\n3. Cloud VM: Connect to your isolated cloud Docker container using the top-bar Cloud Sync toggle.\n4. Educational Labs: Check /home/parrot/Labs for pre-configured capture-the-flag exercises.\n`
  },
  '/home/parrot/Desktop/Target-List.txt': {
    type: 'file',
    perms: 'rw-r--r--',
    owner: 'parrot',
    group: 'parrot',
    content: `# Educational Lab Targets (RFC 5737 Test Subnets)\n192.168.1.1      Gateway Router (OpenWRT)\n192.168.1.100    Web Server (Apache/2.4.52 - Vulnerable)\n192.168.1.150    FTP Server (vsftpd 2.3.4)\n192.168.1.200    Database (MySQL 5.7)\nscanme.nmap.org  Authorized Public Recon Target\n`
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
    content: `==========================================================\n  Welcome to ParrotCloud OS (Debian 12 Bookworm Core)\n==========================================================\nAuthorized cybersecurity simulation environment for training,\nethical hacking, network forensics, and reverse engineering.\n\nType 'help' in the terminal for a full list of commands.\n`
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
    content: `Nov 20 08:30:00 parrotcloud systemd: pam_unix(systemd-user:session): session opened for user parrot\nNov 20 08:31:12 parrotcloud sudo: parrot : TTY=pts/0 ; PWD=/home/parrot ; USER=root ; COMMAND=/usr/bin/nmap\n`
  }
};

window.PARROT_CONFIG = PARROT_CONFIG;
window.INITIAL_VFS = INITIAL_VFS;
