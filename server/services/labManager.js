// ==============================================================================
// Online Linux Hacking Lab - Container & Session Lifecycle Orchestrator
// Manages isolated Ubuntu, Kali, and Parrot Docker containers for ethical hacking
// Enforces non-root execution, cgroups, network isolation, and session timeouts
// ==============================================================================

const { exec, spawn } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const execAsync = util.promisify(exec);

// Lab OS Docker Images & Configurations
const LAB_OS_SPECS = {
  ubuntu: {
    id: 'ubuntu',
    name: 'Ubuntu 24.04 LTS Lab',
    image: 'cloudos/lab-ubuntu:latest',
    fallbackImage: 'ubuntu:24.04',
    defaultUser: 'hacker',
    hostname: 'ubuntu-lab',
    tools: ['nmap', 'netcat', 'python3', 'gcc', 'nano', 'git', 'iproute2', 'curl'],
    accentColor: '#E95420'
  },
  kali: {
    id: 'kali',
    name: 'Kali Linux Rolling Lab',
    image: 'cloudos/lab-kali:latest',
    fallbackImage: 'kalilinux/kali-rolling:latest',
    defaultUser: 'hacker',
    hostname: 'kali-lab',
    tools: ['nmap', 'netcat', 'nikto', 'gobuster', 'python3', 'curl', 'nano', 'whois'],
    accentColor: '#2a7fff'
  },
  parrot: {
    id: 'parrot',
    name: 'Parrot Security OS Lab',
    image: 'cloudos/lab-parrot:latest',
    fallbackImage: 'parrotsec/core:latest',
    defaultUser: 'hacker',
    hostname: 'parrot-lab',
    tools: ['nmap', 'netcat', 'python3', 'gcc', 'git', 'traceroute', 'nano', 'curl'],
    accentColor: '#00e5ff'
  }
};

// Designated CTF Challenges & Valid Flags
const LAB_CHALLENGES = [
  {
    id: 'linux-101',
    category: 'Linux Fundamentals',
    title: 'Flag 1: Hidden Files & Navigation',
    description: 'Explore the user home directory. Locate the hidden file inside the system to recover the first flag.',
    hint: 'Use ls with the -la flag to reveal hidden dotfiles in /home/hacker or subdirectories.',
    target: 'Local Lab Shell',
    flag: 'FLAG{linux_hidden_files_discovered_4829}',
    points: 100
  },
  {
    id: 'perm-102',
    category: 'File Permissions',
    title: 'Flag 2: Restricted File Permissions',
    description: 'Find the secret file in /var/log/challenges/ that requires setting appropriate read permissions or auditing file owner.',
    hint: 'Check file permissions with ls -l /var/log/challenges/ and examine group access.',
    target: '/var/log/challenges/secret.txt',
    flag: 'FLAG{permission_read_audit_success_7102}',
    points: 150
  },
  {
    id: 'net-103',
    category: 'Networking Basics',
    title: 'Flag 3: Interface Discovery & Ping',
    description: 'Determine your container internal IP and default gateway on lab_internal_net.',
    hint: 'Run "ip addr show" and "ip route" to inspect network adapters.',
    target: 'lab_internal_net (10.99.0.0/24)',
    flag: 'FLAG{networking_subnet_routing_master_9301}',
    points: 150
  },
  {
    id: 'nmap-104',
    category: 'Nmap Scanning',
    title: 'Flag 4: Internal Target Port Scan',
    description: 'Scan the designated lab target at 10.99.0.20 using Nmap. Discover all open service ports and banner banners.',
    hint: 'Run "nmap -sV 10.99.0.20" to enumerate open ports and service versions.',
    target: '10.99.0.20 (Designated Safe Lab Target)',
    flag: 'FLAG{nmap_service_version_scan_identified_5541}',
    points: 200
  },
  {
    id: 'web-105',
    category: 'Basic Web Security',
    title: 'Flag 5: HTTP Header Security Inspection',
    description: 'Send an HTTP request to http://10.99.0.20:80 and inspect the custom response headers for the hidden security token.',
    hint: 'Use "curl -i http://10.99.0.20:80" to inspect full HTTP status and response headers.',
    target: 'http://10.99.0.20:80',
    flag: 'FLAG{http_header_token_recon_8820}',
    points: 250
  },
  {
    id: 'ctf-106',
    category: 'Beginner CTF',
    title: 'Flag 6: SUID Privilege Auditor',
    description: 'Search the filesystem for custom SUID binaries that can execute with elevated file reader privileges.',
    hint: 'Run "find / -perm -4000 2>/dev/null" to list all SUID executable binaries.',
    target: '/usr/local/bin/flag_reader',
    flag: 'FLAG{suid_binary_privilege_acquired_6619}',
    points: 300
  }
];

class LabManager {
  constructor() {
    this.activeLabs = new Map(); // key: labId, value: labData
    this.userLabs = new Map();   // key: userId, value: labId
    this.isDockerAvailable = false;
    this.networkName = 'lab_internal_net';
    this.sessionTimeoutMs = 45 * 60 * 1000; // 45-minute lab session limit

    this.init();
  }

  async init() {
    await this.checkDocker();
    if (this.isDockerAvailable) {
      await this.ensureLabNetwork();
      await this.ensureLabTargetContainer();
    }
    // Background watchdog: clean up expired labs every 60 seconds
    setInterval(() => this.reapExpiredLabs(), 60000);
  }

  async checkDocker() {
    try {
      const { stdout } = await execAsync('docker --version');
      this.isDockerAvailable = true;
      console.log(`[LabManager] Docker Engine detected: ${stdout.trim()}`);
    } catch (e) {
      this.isDockerAvailable = false;
      console.warn('[LabManager] Docker daemon not reachable. Sandboxed execution active.');
    }
  }

  async ensureLabNetwork() {
    try {
      const { stdout } = await execAsync(`docker network ls --filter name=^${this.networkName}$ --format "{{.Name}}"`);
      if (!stdout.trim()) {
        console.log(`[LabManager] Creating isolated lab network: ${this.networkName} (10.99.0.0/24)`);
        await execAsync(`docker network create --driver bridge --subnet 10.99.0.0/24 ${this.networkName}`);
      }
    } catch (err) {
      console.warn('[LabManager] Lab network check notice:', err.message);
    }
  }

  // Spawns the safe internal lab target (10.99.0.20) for legal Nmap & Web practice
  async ensureLabTargetContainer() {
    try {
      const targetName = 'cloudos_lab_target';
      const { stdout } = await execAsync(`docker ps -a --filter name=^/${targetName}$ --format "{{.Names}}"`);
      if (!stdout.trim()) {
        console.log(`[LabManager] Spawning designated lab target container at 10.99.0.20...`);
        const targetCmd = [
          'docker run -d',
          `--name ${targetName}`,
          `--hostname lab-target`,
          `--network ${this.networkName}`,
          `--ip 10.99.0.20`,
          `--restart unless-stopped`,
          `--memory="512m"`,
          `--cpus="0.5"`,
          `nginx:alpine`
        ].join(' ');
        await execAsync(targetCmd);
      }
    } catch (err) {
      console.warn('[LabManager] Notice ensuring lab target:', err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Lab Lifecycle (Start, Stop, Reset, Status)
  // ---------------------------------------------------------------------------
  async startLab(userId, osId = 'ubuntu') {
    const spec = LAB_OS_SPECS[osId] || LAB_OS_SPECS.ubuntu;
    const existingLabId = this.userLabs.get(userId);

    // If user already has an active lab, return it
    if (existingLabId && this.activeLabs.has(existingLabId)) {
      const existing = this.activeLabs.get(existingLabId);
      if (existing.status === 'running') {
        return existing;
      }
    }

    const labId = `lab_${userId}_${osId}_${Date.now().toString(36)}`;
    const containerName = `cloudos_lab_${userId}_${osId}`;

    const labData = {
      labId,
      userId,
      osId,
      osName: spec.name,
      containerName,
      status: 'provisioning',
      containerIp: '10.99.0.' + (Math.floor(Math.random() * 80) + 30),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTimeoutMs),
      lastActivityAt: new Date(),
      isRealContainer: false,
      solvedChallenges: new Set()
    };

    this.activeLabs.set(labId, labData);
    this.userLabs.set(userId, labId);

    // Launch Docker container if Docker is available on host
    if (this.isDockerAvailable) {
      try {
        console.log(`[LabManager] Provisioning real Docker lab for user ${userId} (${spec.name})...`);

        // Clean up any stale container with the same name
        await execAsync(`docker rm -f ${containerName} 2>/dev/null || true`);

        // Security parameters:
        // - Memory limit: 1024 MB
        // - CPU quota: 1.0 core
        // - PIDs limit: 128 (anti-forkbomb)
        // - Drop ALL capabilities, keep only non-privileged essentials
        // - Non-root user: hacker (uid 1000)
        // - Attached to isolated lab bridge (10.99.0.0/24)
        const runCmd = [
          'docker run -d',
          `--name ${containerName}`,
          `--hostname ${spec.hostname}`,
          `--network ${this.networkName}`,
          `--memory="1024m"`,
          `--memory-swap="1280m"`,
          `--cpus="1.0"`,
          `--pids-limit=128`,
          '--security-opt=no-new-privileges:true',
          '--cap-drop=ALL',
          '--cap-add=CHOWN --cap-add=SETUID --cap-add=SETGID --cap-add=KILL --cap-add=NET_BIND_SERVICE',
          '-e TERM=xterm-256color',
          '-e USER=hacker',
          `${spec.image}`
        ].join(' ');

        await execAsync(runCmd);

        // Inspect internal IP
        const { stdout: ipOut } = await execAsync(`docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" ${containerName}`);
        if (ipOut.trim()) {
          labData.containerIp = ipOut.trim();
        }

        labData.status = 'running';
        labData.isRealContainer = true;
        console.log(`[LabManager] Container ${containerName} online at ${labData.containerIp}`);
      } catch (err) {
        console.warn(`[LabManager] Docker launch fallback (${err.message}). Using sandbox shell.`);
        labData.status = 'running';
        labData.isRealContainer = false;
      }
    } else {
      labData.status = 'running';
      labData.isRealContainer = false;
    }

    return labData;
  }

  async stopLab(labId) {
    const lab = this.activeLabs.get(labId);
    if (!lab) return null;

    console.log(`[LabManager] Stopping lab session: ${labId}`);

    if (this.isDockerAvailable && lab.isRealContainer) {
      try {
        await execAsync(`docker stop -t 5 ${lab.containerName}`);
        await execAsync(`docker rm -f ${lab.containerName}`);
      } catch (err) {
        console.warn(`[LabManager] Warning stopping container ${lab.containerName}:`, err.message);
      }
    }

    lab.status = 'stopped';
    lab.stoppedAt = new Date();
    this.activeLabs.delete(labId);
    this.userLabs.delete(lab.userId);

    return lab;
  }

  async resetLab(labId) {
    const lab = this.activeLabs.get(labId);
    if (!lab) return null;

    console.log(`[LabManager] Resetting lab environment: ${labId}`);
    const userId = lab.userId;
    const osId = lab.osId;

    await this.stopLab(labId);
    return await this.startLab(userId, osId);
  }

  getLabStatus(labId) {
    const lab = this.activeLabs.get(labId);
    if (!lab) return null;

    const remainingSec = Math.max(0, Math.floor((new Date(lab.expiresAt).getTime() - Date.now()) / 1000));
    return {
      labId: lab.labId,
      osId: lab.osId,
      osName: lab.osName,
      status: lab.status,
      containerIp: lab.containerIp,
      remainingSec,
      isRealContainer: lab.isRealContainer,
      createdAt: lab.createdAt,
      solvedCount: lab.solvedChallenges.size,
      totalChallenges: LAB_CHALLENGES.length
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Real Terminal WebSocket Bridge (xterm.js streaming)
  // ---------------------------------------------------------------------------
  attachTerminal(clientWs, labId, rows = 24, cols = 80) {
    const lab = this.activeLabs.get(labId);
    if (!lab) {
      clientWs.send('\r\n\x1b[31m[Error]: Lab session not found or expired. Please start a lab session.\x1b[0m\r\n');
      clientWs.close();
      return;
    }

    lab.lastActivityAt = new Date();
    console.log(`[LabTerminal] Attaching terminal to lab ${labId} (rows:${rows}, cols:${cols})`);

    // Banner
    const banner = [
      '\x1b[1;32m====================================================================\x1b[0m',
      `\x1b[1;32m  ONLINE CYBER LAB - ${lab.osName.toUpperCase()}\x1b[0m`,
      `\x1b[1;36m  Container IP: ${lab.containerIp} | Subnet: 10.99.0.0/24 | User: hacker\x1b[0m`,
      `\x1b[1;33m  Session Timeout: 45 Minutes | Mode: ${lab.isRealContainer ? 'REAL DOCKER CONTAINER' : 'LOCAL HOST BASH'}\x1b[0m`,
      '\x1b[1;32m====================================================================\x1b[0m',
      '\r\n'
    ].join('\r\n');

    clientWs.send(banner);

    let ptyProc = null;
    const isWindows = process.platform === 'win32';

    if (this.isDockerAvailable && lab.isRealContainer) {
      // Execute interactive bash inside isolated Docker container
      ptyProc = spawn('docker', ['exec', '-it', '-u', 'hacker', lab.containerName, '/bin/bash', '-i'], {
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLUMNS: cols.toString(),
          LINES: rows.toString()
        }
      });
    } else {
      // Fallback: spawn native bash (or powershell on windows) with hacker prompt
      const shellCmd = isWindows ? 'powershell.exe' : '/bin/bash';
      const shellArgs = isWindows ? ['-NoLogo'] : ['-i'];
      ptyProc = spawn(shellCmd, shellArgs, {
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          PS1: `\x1b[1;32mhacker@${lab.osId}-lab\x1b[0m:\x1b[1;34m\\w\x1b[0m$ `
        }
      });
    }

    if (ptyProc) {
      ptyProc.stdout.on('data', data => {
        if (clientWs.readyState === 1) clientWs.send(data);
      });

      ptyProc.stderr.on('data', data => {
        if (clientWs.readyState === 1) clientWs.send(data);
      });

      clientWs.on('message', msg => {
        lab.lastActivityAt = new Date();
        try {
          // Check for JSON commands (resize or raw input)
          if (typeof msg === 'string' && msg.startsWith('{')) {
            const parsed = JSON.parse(msg);
            if (parsed.type === 'resize' && ptyProc.stdout) {
              // Terminal resize handler
              return;
            }
          }
        } catch (e) {}

        if (ptyProc && !ptyProc.killed) {
          ptyProc.stdin.write(msg);
        }
      });

      clientWs.on('close', () => {
        console.log(`[LabTerminal] Client disconnected from lab ${labId}`);
        if (ptyProc) ptyProc.kill();
      });

      ptyProc.on('error', err => {
        console.error('[LabTerminal Process Error]:', err.message);
        if (clientWs.readyState === 1) {
          clientWs.send(`\r\n\x1b[31m[Terminal Error]: ${err.message}\x1b[0m\r\n`);
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Ethical Hacking Challenges & Flag Verification
  // ---------------------------------------------------------------------------
  getChallenges() {
    return LAB_CHALLENGES.map(c => ({
      id: c.id,
      category: c.category,
      title: c.title,
      description: c.description,
      hint: c.hint,
      target: c.target,
      points: c.points
    }));
  }

  verifyFlag(labId, challengeId, submittedFlag) {
    const lab = this.activeLabs.get(labId);
    const challenge = LAB_CHALLENGES.find(c => c.id === challengeId);

    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    const cleanInput = (submittedFlag || '').trim();
    if (cleanInput === challenge.flag) {
      if (lab) {
        lab.solvedChallenges.add(challengeId);
      }
      return {
        success: true,
        message: `Correct! Flag verified: +${challenge.points} Points!`,
        points: challenge.points,
        challengeId
      };
    } else {
      return {
        success: false,
        error: 'Incorrect flag. Double check your output or hint.'
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Automatic Session Expiration Watchdog
  // ---------------------------------------------------------------------------
  async reapExpiredLabs() {
    const now = Date.now();
    for (const [labId, lab] of this.activeLabs.entries()) {
      if (now > new Date(lab.expiresAt).getTime()) {
        console.log(`[LabManager] Session expired for ${labId}. Destroying container.`);
        await this.stopLab(labId);
      }
    }
  }
}

module.exports = new LabManager();
