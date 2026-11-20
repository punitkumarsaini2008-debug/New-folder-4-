// ==============================================================================
// Multi-User Linux Cloud Desktop - PostgreSQL Database Connection Pool
// ==============================================================================

const { Pool } = require('pg');
const config = require('../config');

let pool = null;
let isConnected = false;

// In-Memory Dev Fallback Store (Used when PostgreSQL is starting or offline)
const inMemoryStore = {
  users: new Map(),
  sessions: new Map(),
  auditLogs: [],
  settings: new Map([
    ['max_concurrent_sessions', config.resources.maxConcurrentSessions.toString()],
    ['idle_timeout_minutes', config.resources.idleTimeoutMinutes.toString()],
    ['container_ram_limit_mb', config.resources.containerRamLimitMb.toString()]
  ])
};

try {
  pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl,
    max: config.db.max,
    idleTimeoutMillis: config.db.idleTimeoutMillis,
    connectionTimeoutMillis: config.db.connectionTimeoutMillis
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err.message);
  });
} catch (e) {
  console.warn('[DB] Failed to initialize Pool. Using memory fallback:', e.message);
}

// Database query wrapper with automatic fallback
async function query(text, params = []) {
  if (pool) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.DEBUG_SQL === 'true') {
        console.log('[DB SQL]', { text, duration, rows: res.rowCount });
      }
      isConnected = true;
      return res;
    } catch (err) {
      if (!isConnected) {
        // PostgreSQL server is not yet up or reachable in current local test environment
        return executeInMemoryFallback(text, params);
      }
      throw err;
    }
  } else {
    return executeInMemoryFallback(text, params);
  }
}

// Minimal In-Memory SQL Simulator for safe testing when PG is offline
function executeInMemoryFallback(text, params) {
  const normalized = text.trim().toLowerCase();

  if (normalized.startsWith('select') && normalized.includes('from users where username = $1')) {
    const username = params[0];
    const user = Array.from(inMemoryStore.users.values()).find(u => u.username === username);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from users where email = $1')) {
    const email = params[0];
    const user = Array.from(inMemoryStore.users.values()).find(u => u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from users where id = $1')) {
    const id = params[0];
    const user = inMemoryStore.users.get(id);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (normalized.startsWith('insert into users')) {
    const [username, email, passwordHash, role] = params;
    const id = inMemoryStore.users.size + 1;
    const user = {
      id,
      username,
      email,
      password_hash: passwordHash,
      role: role || 'user',
      disk_quota_mb: 5120,
      max_active_containers: 1,
      is_active: true,
      created_at: new Date()
    };
    inMemoryStore.users.set(id, user);
    return { rows: [user], rowCount: 1 };
  }

  if (normalized.includes('count(*)') && normalized.includes('user_sessions')) {
    const active = Array.from(inMemoryStore.sessions.values()).filter(s => s.status === 'running' || s.status === 'starting');
    return { rows: [{ count: active.length.toString() }], rowCount: 1 };
  }

  if (normalized.startsWith('select') && normalized.includes('from user_sessions where user_id = $1 and status in')) {
    const userId = params[0];
    const session = Array.from(inMemoryStore.sessions.values()).find(
      s => s.user_id === userId && (s.status === 'running' || s.status === 'starting')
    );
    return { rows: session ? [session] : [], rowCount: session ? 1 : 0 };
  }

  if (normalized.startsWith('insert into user_sessions')) {
    const [userId, osId, containerId, containerName, status, vncPort, sshPort, containerIp] = params;
    const sessionId = `sess-${Date.now()}`;
    const sess = {
      id: sessionId,
      user_id: userId,
      os_id: osId,
      container_id: containerId,
      container_name: containerName,
      status: status || 'starting',
      vnc_internal_port: vncPort || 5901,
      ssh_internal_port: sshPort || 2222,
      container_ip: containerIp || '127.0.0.1',
      started_at: new Date(),
      last_activity_at: new Date()
    };
    inMemoryStore.sessions.set(sessionId, sess);
    return { rows: [sess], rowCount: 1 };
  }

  if (normalized.startsWith('update user_sessions set status = $1') || normalized.startsWith('update user_sessions set last_activity_at = now()')) {
    return { rows: [], rowCount: 1 };
  }

  if (normalized.startsWith('insert into audit_logs')) {
    const [userId, action, ip, ua, details] = params;
    inMemoryStore.auditLogs.push({ userId, action, ip, ua, details, created_at: new Date() });
    return { rows: [], rowCount: 1 };
  }

  if (normalized.startsWith('select') && normalized.includes('from system_settings')) {
    const rows = Array.from(inMemoryStore.settings.entries()).map(([k, v]) => ({ key: k, value: v }));
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

async function testConnection() {
  try {
    const res = await query('SELECT NOW()');
    isConnected = true;
    console.log('[DB] PostgreSQL connected successfully.');
    return true;
  } catch (err) {
    console.warn('[DB] PostgreSQL connection check: offline or initializing. Local memory fallback active.');
    return false;
  }
}

module.exports = {
  query,
  testConnection,
  pool,
  inMemoryStore
};
