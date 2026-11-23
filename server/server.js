// ==============================================================================
// Multi-User Linux Cloud Desktop - Master Application Server
// Node.js + Express REST API + WebSocket Guacamole, VNC & Terminal Gateway
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ws = require('ws');

const config = require('./config');
const db = require('./db');
const idleReaper = require('./services/idleReaper');
const guacamoleTunnel = require('./services/guacamoleTunnel');
const vncTunnel = require('./services/vncTunnel');
const containerManager = require('./services/containerManager');

// Route modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const sessionRoutes = require('./routes/sessions');
const statsRoutes = require('./routes/stats');
const labRoutes = require('./routes/labs');
const labManager = require('./services/labManager');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// -----------------------------------------------------------------------------
// 1. Security & Core Middleware
// -----------------------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts for desktop SPA
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Top-level Health Checks for Cloud Monitoring (Render, Caddy, Load Balancers)
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'parrotcloud-backend',
    version: '2.0.0',
    timestamp: new Date()
  });
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'OK' });
});

// -----------------------------------------------------------------------------
// 2. Static Frontend Serving & noVNC Web Interface
// -----------------------------------------------------------------------------
const NOVNC_SYSTEM_PATH = '/usr/share/novnc';
if (fs.existsSync(NOVNC_SYSTEM_PATH)) {
  app.use('/novnc', express.static(NOVNC_SYSTEM_PATH));
}

const PUBLIC_DIR = path.resolve(__dirname, '..');
app.use(express.static(PUBLIC_DIR, { index: 'index.html' }));

// -----------------------------------------------------------------------------
// 3. API Routes
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/labs', labRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// -----------------------------------------------------------------------------
// 4. HTTP & WebSocket Server Setup
// -----------------------------------------------------------------------------
const server = http.createServer(app);

// WebSocket Servers for Guacamole Remote Desktop, Real Terminal PTY, & noVNC
const wssGuac = new ws.Server({ noServer: true });
const wssTerm = new ws.Server({ noServer: true });
const wssVnc = new ws.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/guacamole') {
    wssGuac.handleUpgrade(request, socket, head, clientWs => {
      wssGuac.emit('connection', clientWs, request);
    });
  } else if (pathname === '/terminal' || pathname === '/ws') {
    wssTerm.handleUpgrade(request, socket, head, clientWs => {
      wssTerm.emit('connection', clientWs, request);
    });
  } else if (pathname === '/vnc' || pathname === '/websockify') {
    wssVnc.handleUpgrade(request, socket, head, clientWs => {
      wssVnc.emit('connection', clientWs, request);
    });
  } else {
    socket.destroy();
  }
});

// Guacamole WebSocket Connection Handler
wssGuac.on('connection', (clientWs, request) => {
  guacamoleTunnel.handleWebSocket(clientWs, request);
});

// noVNC / RFB WebSocket Connection Handler
wssVnc.on('connection', (clientWs, request) => {
  vncTunnel.handleWebSocket(clientWs, request);
});

// Real Terminal WebSocket Connection Handler
wssTerm.on('connection', (clientWs, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const labId = url.searchParams.get('labId');

  // If request is specifically for an isolated hacking lab session
  if (labId) {
    const rows = parseInt(url.searchParams.get('rows'), 10) || 24;
    const cols = parseInt(url.searchParams.get('cols'), 10) || 80;
    labManager.attachTerminal(clientWs, labId, rows, cols);
    return;
  }

  console.log('[TerminalWS] Client connected to real terminal stream.');
  
  // Interactive Shell Process allocation
  const isWindows = process.platform === 'win32';
  const shellBinary = isWindows ? 'powershell.exe' : '/bin/bash';
  const shellArgs = isWindows ? ['-NoLogo'] : ['-i'];
  const userHome = process.env.HOME || (isWindows ? process.env.USERPROFILE : '/home/parrot');

  const { spawn } = require('child_process');
  let proc = null;
  try {
    proc = spawn(shellBinary, shellArgs, {
      cwd: fs.existsSync(userHome) ? userHome : undefined,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        PS1: '\u001b[1;36mparrot\u001b[0m@\u001b[1;32mparrotcloud\u001b[0m:\u001b[1;34m\\w\u001b[0m$ '
      }
    });

    proc.stdout.on('data', data => {
      if (clientWs.readyState === ws.OPEN) clientWs.send(data);
    });

    proc.stderr.on('data', data => {
      if (clientWs.readyState === ws.OPEN) clientWs.send(data);
    });

    clientWs.on('message', msg => {
      if (proc && !proc.killed) proc.stdin.write(msg);
    });

    clientWs.on('close', () => {
      if (proc) proc.kill();
    });
  } catch (err) {
    clientWs.send(`\r\n\x1b[31m[CloudOS Error]: Failed to spawn terminal shell: ${err.message}\x1b[0m\r\n`);
  }
});

// -----------------------------------------------------------------------------
// 5. Server Lifecycle & Graceful Shutdown
// -----------------------------------------------------------------------------
server.listen(config.port, config.host, async () => {
  console.log(`=======================================================`);
  console.log(`  ParrotCloud OS - Cloud Cybersecurity Master Server`);
  console.log(`  Version:            2.0.0`);
  console.log(`  REST API & UI:      http://${config.host}:${config.port}`);
  console.log(`  Health Check:       http://${config.host}:${config.port}/api/stats/health`);
  console.log(`  Terminal Gateway:   ws://${config.host}:${config.port}/terminal`);
  console.log(`  noVNC Gateway:      ws://${config.host}:${config.port}/vnc`);
  console.log(`  Guacamole Tunnel:   ws://${config.host}:${config.port}/guacamole`);
  console.log(`  Max Active Slots:   ${config.resources.maxConcurrentSessions} containers`);
  console.log(`  Idle Timeout:       ${config.resources.idleTimeoutMinutes} minutes`);
  console.log(`=======================================================`);

  // Test DB connection and start idle reaper
  await db.testConnection();
  idleReaper.start();
});

// Graceful process termination
function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
  idleReaper.stop();
  server.close(() => {
    console.log('[Server] HTTP and WebSocket listeners closed.');
    if (db.pool) {
      db.pool.end(() => {
        console.log('[Server] Database pool disconnected.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };
