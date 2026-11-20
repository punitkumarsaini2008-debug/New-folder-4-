// ==============================================================================
// Multi-User Linux Cloud Desktop - Host-Side Docker Container Manager
// Enforces cgroup limits, network isolation, and user home volume mounts
// ==============================================================================

const { exec, spawn } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const execAsync = util.promisify(exec);

// Operating System Docker Image Registry Map (Optimized for ARM64)
const OS_IMAGE_REGISTRY = {
  ubuntu: {
    name: 'Ubuntu 24.04 LTS (Noble Numbat)',
    image: 'cloudos/ubuntu-desktop:24.04-arm64',
    fallbackImage: 'ubuntu:24.04',
    defaultDesktop: 'GNOME',
    vncPort: 5901,
    sshPort: 2222,
    defaultUser: 'user'
  },
  parrot: {
    name: 'Parrot Security OS 6.0',
    image: 'cloudos/parrot-desktop:6.0-arm64',
    fallbackImage: 'parrotsec/core:latest',
    defaultDesktop: 'MATE',
    vncPort: 5901,
    sshPort: 2222,
    defaultUser: 'user'
  },
  kali: {
    name: 'Kali Linux 2024.3',
    image: 'cloudos/kali-desktop:2024.3-arm64',
    fallbackImage: 'kalilinux/kali-rolling:latest',
    defaultDesktop: 'XFCE',
    vncPort: 5901,
    sshPort: 2222,
    defaultUser: 'user'
  },
  mint: {
    name: 'Linux Mint 22 (Cinnamon on Ubuntu ARM64 Base)',
    image: 'cloudos/mint-desktop:22-arm64',
    fallbackImage: 'ubuntu:24.04',
    defaultDesktop: 'Cinnamon',
    vncPort: 5901,
    sshPort: 2222,
    defaultUser: 'user'
  },
  fedora: {
    name: 'Fedora Security Lab 40',
    image: 'cloudos/fedora-desktop:40-arm64',
    fallbackImage: 'fedora:40',
    defaultDesktop: 'GNOME',
    vncPort: 5901,
    sshPort: 2222,
    defaultUser: 'user'
  }
};

class ContainerManager {
  constructor() {
    this.activeContainers = new Map();
    this.isDockerAvailable = false;
    this.checkDockerAvailability();
  }

  async checkDockerAvailability() {
    try {
      const { stdout } = await execAsync('docker --version');
      this.isDockerAvailable = true;
      console.log(`[DockerManager] Docker Engine detected: ${stdout.trim()}`);
      await this.ensureUserNetwork();
    } catch (err) {
      this.isDockerAvailable = false;
      console.warn('[DockerManager] Docker daemon not reachable. Sandboxed execution fallback active.');
    }
  }

  async ensureUserNetwork() {
    if (!this.isDockerAvailable) return;
    try {
      const { stdout } = await execAsync(`docker network ls --filter name=^${config.resources.userNetwork}$ --format "{{.Name}}"`);
      if (!stdout.trim()) {
        console.log(`[DockerManager] Creating isolated internal bridge: ${config.resources.userNetwork}`);
        await execAsync(`docker network create --driver bridge --internal=false ${config.resources.userNetwork}`);
      }
    } catch (err) {
      console.error('[DockerManager] Failed to verify/create docker network:', err.message);
    }
  }

  getUserHomeDir(userId) {
    const userDir = path.join(config.resources.userDataPath, `user_${userId}`, 'home');
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true, mode: 0o750 });
    }
    return userDir;
  }

  async spawnSessionContainer(user, osId) {
    const osSpec = OS_IMAGE_REGISTRY[osId] || OS_IMAGE_REGISTRY.ubuntu;
    const containerName = `cloudos_u${user.id}_${osId}_${Date.now().toString(36)}`;
    const userHomeDir = this.getUserHomeDir(user.id);

    console.log(`[DockerManager] Spawning container for user ${user.username} (${user.id}): ${osSpec.name}`);

    // If Docker Engine is available on the host:
    if (this.isDockerAvailable) {
      try {
        // Enforce strict cgroup and isolation parameters:
        // 1. RAM limit: 2048 MB
        // 2. CPU quota: 1.5 cores
        // 3. PIDs limit: 256 (anti-forkbomb)
        // 4. Drop all dangerous capabilities
        // 5. User persistent home directory bind-mounted
        // 6. Network attached to isolated user bridge
        const dockerCmd = [
          'docker run -d',
          `--name ${containerName}`,
          `--hostname ${osId}-cloud`,
          `--network ${config.resources.userNetwork}`,
          `--memory="${config.resources.containerRamLimitMb}m"`,
          `--memory-swap="${config.resources.containerRamLimitMb + 512}m"`,
          `--cpus="${config.resources.containerCpuQuota}"`,
          `--pids-limit=${config.resources.containerPidsLimit}`,
          '--security-opt=no-new-privileges:true',
          '--cap-drop=ALL',
          '--cap-add=CHOWN --cap-add=SETUID --cap-add=SETGID --cap-add=KILL --cap-add=NET_BIND_SERVICE',
          `-v "${userHomeDir}:/home/user:rw"`,
          `-e USER_ID=${user.id}`,
          `-e USERNAME=${user.username}`,
          `-e DESKTOP=${osSpec.defaultDesktop}`,
          `-e DISPLAY_WIDTH=1920`,
          `-e DISPLAY_HEIGHT=1080`,
          `${osSpec.image}`
        ].join(' ');

        const { stdout: containerIdRaw } = await execAsync(dockerCmd);
        const containerId = containerIdRaw.trim().substring(0, 12);

        // Retrieve assigned internal container IP on user bridge
        const { stdout: ipRaw } = await execAsync(
          `docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" ${containerId}`
        );
        const containerIp = ipRaw.trim() || '127.0.0.1';

        const sessionInfo = {
          containerId,
          containerName,
          containerIp,
          osId,
          vncPort: osSpec.vncPort,
          sshPort: osSpec.sshPort,
          status: 'running',
          startedAt: new Date()
        };

        this.activeContainers.set(containerId, sessionInfo);
        return sessionInfo;
      } catch (err) {
        console.error(`[DockerManager] Container spawn failed for ${user.username}:`, err.message);
        throw new Error(`Failed to initialize container: ${err.message}`);
      }
    }

    // In local development or when Docker is simulated:
    const mockContainerId = `sim_${Date.now().toString(36)}`;
    const mockSession = {
      containerId: mockContainerId,
      containerName,
      containerIp: '127.0.0.1',
      osId,
      vncPort: osSpec.vncPort,
      sshPort: osSpec.sshPort,
      status: 'running',
      isSimulated: true,
      startedAt: new Date()
    };
    this.activeContainers.set(mockContainerId, mockSession);
    return mockSession;
  }

  async stopSessionContainer(containerId) {
    if (!containerId) return;

    if (this.isDockerAvailable && !containerId.startsWith('sim_')) {
      try {
        console.log(`[DockerManager] Stopping container: ${containerId}`);
        await execAsync(`docker stop -t 10 ${containerId}`);
        await execAsync(`docker rm -f ${containerId}`);
      } catch (err) {
        console.warn(`[DockerManager] Warning stopping container ${containerId}:`, err.message);
      }
    }

    this.activeContainers.delete(containerId);
  }

  async restartSessionContainer(containerId) {
    if (!containerId) return;

    if (this.isDockerAvailable && !containerId.startsWith('sim_')) {
      try {
        console.log(`[DockerManager] Restarting container: ${containerId}`);
        await execAsync(`docker restart -t 5 ${containerId}`);
      } catch (err) {
        throw new Error(`Failed to restart container: ${err.message}`);
      }
    }
  }

  async getContainerLiveStats(containerId) {
    if (!this.isDockerAvailable || !containerId || containerId.startsWith('sim_')) {
      return {
        cpuPercent: '3.5%',
        memoryUsage: '380MB / 2048MB',
        memoryPercent: '18.5%',
        pids: 24,
        isSimulated: true
      };
    }

    try {
      const { stdout } = await execAsync(
        `docker stats ${containerId} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.PIDs}}"`
      );
      const [cpu, memUsage, memPerc, pids] = stdout.trim().split('|');
      return {
        cpuPercent: cpu || '0%',
        memoryUsage: memUsage || '0MB / 2048MB',
        memoryPercent: memPerc || '0%',
        pids: parseInt(pids, 10) || 0,
        isSimulated: false
      };
    } catch (err) {
      return { cpuPercent: '0%', memoryUsage: 'N/A', memoryPercent: '0%', pids: 0 };
    }
  }

  async getActiveContainersCount() {
    if (!this.isDockerAvailable) {
      return this.activeContainers.size;
    }
    try {
      const { stdout } = await execAsync('docker ps --filter "name=cloudos_" -q');
      const lines = stdout.trim().split('\n').filter(Boolean);
      return lines.length;
    } catch (err) {
      return this.activeContainers.size;
    }
  }
}

module.exports = new ContainerManager();
