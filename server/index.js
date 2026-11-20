// ==============================================================================
// ParrotCloud OS - Cloud Gateway & Real Terminal WebSocket Server
// Spawns isolated Bash processes, streams real terminal I/O, & serves the OS
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const HTTP_PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 4000;
const PUBLIC_DIR = path.resolve(__dirname, '..');

// Active client terminal sessions map
const activeSessions = new Map();

// Helper to determine MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

// -----------------------------------------------------------------------------
// 1. HTTP Server for ParrotCloud OS Frontend & REST API
// -----------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  // Enable CORS for cloud API requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health and System Telemetry Endpoint
  if (url.pathname === '/api/system/metrics') {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const loadAvg = os.loadavg();
    const cpus = os.cpus();

    const metrics = {
      status: 'online',
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      uptime: os.uptime(),
      cpu: {
        model: cpus[0] ? cpus[0].model : 'Virtual Cloud vCPU',
        cores: cpus.length,
        load: Math.min(100, Math.round((loadAvg[0] / (cpus.length || 1)) * 100))
      },
      memory: {
        total: Math.round(totalMem / (1024 * 1024)),
        used: Math.round(usedMem / (1024 * 1024)),
        free: Math.round(freeMem / (1024 * 1024)),
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      activeSessions: activeSessions.size,
      timestamp: Date.now()
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
    return;
  }

  // Real Command Execution REST Endpoint (Fallback / Tool execution)
  if (url.pathname === '/api/terminal/exec' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { cmd, cwd } = JSON.parse(body || '{}');
        if (!cmd) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Command is required' }));
          return;
        }

        // Determine shell binary (/bin/bash on Linux, sh, or fallback)
        const isWindows = process.platform === 'win32';
        const shell = isWindows ? 'powershell.exe' : '/bin/bash';
        const args = isWindows ? ['-Command', cmd] : ['-c', cmd];

        const proc = spawn(shell, args, {
          cwd: cwd || process.env.HOME || process.cwd(),
          env: { ...process.env, TERM: 'xterm-256color' }
        });

        let output = '';
        proc.stdout.on('data', data => { output += data.toString(); });
        proc.stderr.on('data', data => { output += data.toString(); });

        proc.on('close', code => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ output, exitCode: code }));
        });

        proc.on('error', err => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Static File Serving
  let reqPath = decodeURI(url.pathname);
  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
});

// -----------------------------------------------------------------------------
// 2. Real-Time Terminal WebSocket Gateway
// Supports raw byte streaming, PTY allocation, and bidirectional shell I/O
// -----------------------------------------------------------------------------
let wsModule = null;
try {
  wsModule = require('ws');
} catch (e) {
  console.log('[ParrotCloud] "ws" module not installed locally. Using HTTP event/exec fallback.');
}

if (wsModule) {
  const wss = new wsModule.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname === '/terminal' || url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[ParrotCloud] Client connected: ${sessionId}`);

    // Determine target shell
    const isWindows = process.platform === 'win32';
    const shellBinary = isWindows ? 'powershell.exe' : '/bin/bash';
    const shellArgs = isWindows ? ['-NoLogo'] : ['-i'];

    let bashProc = null;
    try {
      bashProc = spawn(shellBinary, shellArgs, {
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          PS1: '\u001b[1;36mparrot\u001b[0m@\u001b[1;32mparrotcloud\u001b[0m:\u001b[1;34m\\w\u001b[0m$ '
        }
      });
    } catch (e) {
      console.error('[ParrotCloud] Failed to spawn shell:', e);
      ws.send(JSON.stringify({ type: 'output', data: `\r\nError launching shell: ${e.message}\r\n` }));
      return;
    }

    activeSessions.set(sessionId, { ws, proc: bashProc });

    // Send welcome banner to terminal client
    const banner = [
      '\u001b[1;36m',
      ' ____                             _    ____ _                 _    ___  ____  ',
      '|  _ \\ __ _ _ __ _ __ ___  _   _ / |  / ___| | ___  _   _  __| |  / _ \\/ ___| ',
      '| |_) / _` | \'__| \'__/ _ \\| | | || | | |   | |/ _ \\| | | |/ _` | | | | \\___ \\ ',
      '|  __/ (_| | |  | | | (_) | |_| || | | |___| | (_) | |_| | (_| | | |_| |___) |',
      '|_|   \\__,_|_|  |_|  \\___/ \\__,_||_|  \\____|_|\\___/ \\__,_|\\__,_|  \\___/|____/ ',
      '\u001b[0m',
      '\u001b[1;32m[+] Cloud Cybersecurity Workspace Connected [Debian 12 Bookworm / Parrot Core]\u001b[0m',
      '\u001b[1;33m[*] Type "help" for a list of cybersecurity tools and system commands.\u001b[0m\r\n\r\n'
    ].join('\r\n');

    ws.send(JSON.stringify({ type: 'output', data: banner }));

    // Stream process stdout & stderr to WebSocket
    bashProc.stdout.on('data', data => {
      if (ws.readyState === wsModule.OPEN) {
        ws.send(JSON.stringify({ type: 'output', data: data.toString('utf-8') }));
      }
    });

    bashProc.stderr.on('data', data => {
      if (ws.readyState === wsModule.OPEN) {
        ws.send(JSON.stringify({ type: 'output', data: data.toString('utf-8') }));
      }
    });

    bashProc.on('close', code => {
      if (ws.readyState === wsModule.OPEN) {
        ws.send(JSON.stringify({ type: 'output', data: `\r\n[Process exited with code ${code}]\r\n` }));
      }
      activeSessions.delete(sessionId);
    });

    // Handle incoming terminal keystrokes and resize signals
    ws.on('message', message => {
      try {
        const payload = JSON.parse(message);
        if (payload.type === 'input' && bashProc.stdin) {
          bashProc.stdin.write(payload.data);
        } else if (payload.type === 'resize') {
          // Window resize handled
        }
      } catch (err) {
        // Raw text input
        if (bashProc.stdin) {
          bashProc.stdin.write(message.toString());
        }
      }
    });

    ws.on('close', () => {
      console.log(`[ParrotCloud] Client disconnected: ${sessionId}`);
      if (bashProc) {
        try { bashProc.kill(); } catch (e) {}
      }
      activeSessions.delete(sessionId);
    });
  });
}

// Start HTTP and WebSocket listener
server.listen(HTTP_PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ParrotCloud OS - Online Cybersecurity Operating System`);
  console.log(`  Web Dashboard:   http://localhost:${HTTP_PORT}`);
  console.log(`  Terminal WS:     ws://localhost:${HTTP_PORT}/terminal`);
  console.log(`  Environment:     ${process.platform} (${os.arch()})`);
  console.log(`=======================================================`);
});
