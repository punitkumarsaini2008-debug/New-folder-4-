// ==============================================================================
// Multi-User Linux Cloud Desktop - Master Application Server
// Node.js + Express REST API + WebSocket Guacamole & Terminal Gateway
// ==============================================================================

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ws = require('ws');

const config = require('./config');
const db = require('./db');
const idleReaper = require('./services/idleReaper');
const guacamoleTunnel = require('./services/guacamoleTunnel');
const containerManager = require('./services/containerManager');

// Route modules
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const statsRoutes = require('./routes/stats');
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

// -----------------------------------------------------------------------------
// 2. Static Frontend Serving (Optional unified mode / local fallback)
// -----------------------------------------------------------------------------
const PUBLIC_DIR = path.resolve(__dirname, '..');
app.use(express.static(PUBLIC_DIR, { index: 'index.html' }));

// -----------------------------------------------------------------------------
// 3. API Routes
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statsRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// -----------------------------------------------------------------------------
// 4. HTTP & WebSocket Server Setup
// -----------------------------------------------------------------------------
const server = http.createServer(app);

// WebSocket Server for Guacamole Remote Desktop & Real Shell PTY
const wssGuac = new ws.Server({ noServer: true });
const wssTerm = new ws.Server({ noServer: true });

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
  } else {
    socket.destroy();
  }
});

// Guacamole WebSocket Connection Handler
wssGuac.on('connection', (clientWs, request) => {
  guacamoleTunnel.handleWebSocket(clientWs, request);
});

// Real Terminal WebSocket Connection Handler
wssTerm.on('connection', (clientWs, request) => {
  console.log('[TerminalWS] Client connected to real terminal stream.');
  
  // Interactive Shell Process allocation
  const isWindows = process.platform === 'win32';
  const shellBinary = isWindows ? 'powershell.exe' : '/bin/bash';
  const shellArgs = isWindows ? ['-NoLogo'] : ['-i'];

  const { spawn } = require('child_process');
  let proc = null;
  try {
    proc = spawn(shellBinary, shellArgs, {
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        PS1: '\u001b[1;36muser\u001b[0m@\u001b[1;32mcloudos\u001b[0m:\u001b[1;34m\\w\u001b[0m$ '
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
  console.log(`  Multi-User Real Linux Cloud Desktop Platform v2.0.0`);
  console.log(`  REST API & UI:      http://${config.host}:${config.port}`);
  console.log(`  Guacamole Tunnel:   ws://${config.host}:${config.port}/guacamole`);
  console.log(`  Terminal Gateway:   ws://${config.host}:${config.port}/terminal`);
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
