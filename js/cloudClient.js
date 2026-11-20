// ==============================================================================
// ParrotCloud OS - Cloud Container WebSocket Client & Telemetry Bridge
// Connects to live Docker containers or backend daemon for real Bash execution
// ==============================================================================

class CloudClient {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.endpoint = localStorage.getItem('parrot_cloud_ws') || `ws://${window.location.host || 'localhost:3000'}/terminal`;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.metrics = {
      cpu: 18,
      memory: 32,
      activeSessions: 1,
      status: 'offline'
    };
    this.localEngine = new window.LinuxShellEngine();

    // Start background telemetry polling
    this.pollTelemetry();
    setInterval(() => this.pollTelemetry(), 3000);
  }

  // Attempt connection to cloud WebSocket server
  connect() {
    try {
      this.ws = new WebSocket(this.endpoint);

      this.ws.onopen = () => {
        this.connected = true;
        this.notifyStatus(true);
        console.log('[ParrotCloud] Connected to cloud container WebSocket:', this.endpoint);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'output') {
            this.broadcastOutput(payload.data);
          }
        } catch (e) {
          this.broadcastOutput(event.data);
        }
      };

      this.ws.onerror = (err) => {
        // Will fallback to integrated Linux engine gracefully
        this.connected = false;
        this.notifyStatus(false);
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.notifyStatus(false);
      };
    } catch (e) {
      this.connected = false;
      this.notifyStatus(false);
    }
  }

  // Send keystrokes or commands to container shell
  sendInput(data) {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'input', data }));
    }
  }

  // Execute command (uses cloud container if connected, or local Linux engine)
  async executeCommand(cmdStr) {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendInput(cmdStr + '\n');
      return null; // Output arrives via WebSocket stream
    } else {
      return await this.localEngine.execute(cmdStr);
    }
  }

  // Poll system metrics endpoint
  async pollTelemetry() {
    try {
      const res = await fetch('/api/system/metrics');
      if (res.ok) {
        const data = await res.json();
        this.metrics = {
          cpu: data.cpu ? data.cpu.load : Math.floor(Math.random() * 15 + 10),
          memory: data.memory ? data.memory.percentage : 34,
          activeSessions: data.activeSessions || 1,
          status: 'online'
        };
      } else {
        throw new Error('Metrics endpoint offline');
      }
    } catch (e) {
      // Realistic simulated telemetry when running pure static client
      this.metrics = {
        cpu: Math.floor(Math.random() * 8 + 12),
        memory: Math.floor(Math.random() * 4 + 31),
        activeSessions: 1,
        status: 'standalone'
      };
    }

    // Update top panel telemetry indicators
    const cpuEl = document.getElementById('panel-cpu-text');
    const memEl = document.getElementById('panel-mem-text');
    if (cpuEl) cpuEl.textContent = `CPU: ${this.metrics.cpu}%`;
    if (memEl) memEl.textContent = `RAM: ${this.metrics.memory}%`;
  }

  // Subscribe to terminal output stream
  onOutput(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcastOutput(data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.connected);
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(status) {
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }
}

window.cloudClient = new CloudClient();
