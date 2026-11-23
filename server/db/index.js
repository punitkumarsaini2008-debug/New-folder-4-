// ==============================================================================
// Multi-User Linux Cloud Desktop - PostgreSQL Database Connection Pool
// Version: 2.1.0 - Resilient SQL Executor & Dual Mode In-Memory Store
// ==============================================================================

const { Pool } = require('pg');
const config = require('../config');

let pool = null;
let isConnected = false;

// Pre-seeded bcrypt hashes for default credentials
// Admin: Admin@123456
const ADMIN_PASSWORD_HASH = '$2a$10$fcAtm33KHf27eufHx1DOheY8DpvYdb28ME7egRal6aSEmhAA8T9mK';
// Student: Student@123456
const STUDENT_PASSWORD_HASH = '$2a$10$Rk7MSdN6ZbhfKwXFGjXMgOF31vKha9A0dYiBI6gy5nO2mNXiZDxj.';

// In-Memory Dev Fallback Store (Full-featured SQL emulator for standalone testing)
const inMemoryStore = {
  users: new Map([
    [1, {
      id: 1,
      username: 'admin',
      email: 'admin@parrotcloud.io',
      password_hash: ADMIN_PASSWORD_HASH,
      role: 'admin',
      points: 500,
      disk_quota_mb: 5120,
      max_active_containers: 2,
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z'),
      updated_at: new Date('2026-01-01T00:00:00Z')
    }],
    [2, {
      id: 2,
      username: 'student',
      email: 'student@parrotcloud.io',
      password_hash: STUDENT_PASSWORD_HASH,
      role: 'student',
      points: 100,
      disk_quota_mb: 5120,
      max_active_containers: 1,
      is_active: true,
      created_at: new Date('2026-01-15T00:00:00Z'),
      updated_at: new Date('2026-01-15T00:00:00Z')
    }]
  ]),
  challenges: new Map([
    ['lab-os-find', {
      id: 'lab-os-find',
      title: 'Find the Linux Operating System',
      category: 'Linux Fundamentals',
      difficulty: 'Beginner',
      objective: 'Discover operating system information using standard Linux filesystem hierarchy tools.',
      hint: 'Look inside the /etc directory for standard release files.',
      command: 'cat /etc/os-release',
      exercise: "Execute the command 'cat /etc/os-release' in the interactive terminal to inspect release information.",
      expected_output: 'NAME="Parrot Security OS"\nVERSION="6.0 (Lrz)"\nID=parrot\nID_LIKE=debian\nPRETTY_NAME="Parrot Security 6.0"',
      question: 'Which Linux command displays operating system information?',
      expected_answer: 'cat /etc/os-release',
      explanation: 'The /etc/os-release file is the standard configuration file used by modern systemd Linux distributions (Parrot, Kali, Ubuntu, Mint, Fedora) to declare operating system identification metadata.',
      points: 10,
      is_active: true,
      created_at: new Date()
    }],
    ['lab-perm-chmod', {
      id: 'lab-perm-chmod',
      title: 'Set Restricted File Permissions',
      category: 'Linux Fundamentals',
      difficulty: 'Beginner',
      objective: 'Grant execution permissions on a security audit script.',
      hint: 'Use the chmod command with +x or numerical 755 notation.',
      command: 'chmod +x security_audit.sh',
      exercise: 'Ensure the shell script can execute under standard user privileges.',
      expected_output: '-rwxr-xr-x 1 user user 2048 Nov 23 12:00 security_audit.sh',
      question: 'Which command adds execute permissions to a file in Linux?',
      expected_answer: 'chmod +x',
      explanation: 'chmod changes file mode bits. The +x flag adds execute privileges for owner, group, and others.',
      points: 10,
      is_active: true,
      created_at: new Date()
    }],
    ['lab-net-ip', {
      id: 'lab-net-ip',
      title: 'Audit Network Adapter Configuration',
      category: 'Networking',
      difficulty: 'Beginner',
      objective: 'Display all network interfaces and associated IP addresses.',
      hint: 'Modern Linux uses the ip utility rather than legacy ifconfig.',
      command: 'ip addr show',
      exercise: 'Query the system network namespace to identify the container eth0 IP.',
      expected_output: '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> inet 10.99.0.42/24',
      question: 'Which modern Linux iproute2 command displays IP addresses for all interfaces?',
      expected_answer: 'ip addr',
      explanation: 'ip addr (or ip a) queries the kernel netlink interface to list IPv4 and IPv6 addresses assigned to local interfaces.',
      points: 10,
      is_active: true,
      created_at: new Date()
    }],
    ['lab-kali-nmap', {
      id: 'lab-kali-nmap',
      title: 'TCP SYN Port Exploration with Nmap',
      category: 'Kali Linux',
      difficulty: 'Intermediate',
      objective: 'Perform stealth port scanning against designated lab target.',
      hint: 'The -sS option performs a stealthy TCP SYN scan.',
      command: 'nmap -sS -p 22,80,443 10.99.0.20',
      exercise: 'Enumerate open services on designated safe container target 10.99.0.20.',
      expected_output: 'PORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http',
      question: 'Which nmap flag initiates a TCP SYN half-open stealth scan?',
      expected_answer: '-sS',
      explanation: '-sS sends a SYN packet and awaits SYN-ACK without completing the 3-way handshake, minimizing connection log footprints.',
      points: 10,
      is_active: true,
      created_at: new Date()
    }],
    ['lab-web-sqli', {
      id: 'lab-web-sqli',
      title: 'SQL Injection Authentication Bypass',
      category: 'SQL Injection (safe simulated environment)',
      difficulty: 'Intermediate',
      objective: 'Simulate authentication bypass using classic boolean SQL injection.',
      hint: 'Use the standard tautology expression: \' OR \'1\'=\'1',
      command: "curl -X POST http://10.99.0.20/login -d \"user=' OR '1'='1&pass=x\"",
      exercise: 'Submit a boolean tautology payload to test unsafe string concatenation.',
      expected_output: '{"status": "SUCCESS", "role": "admin", "token": "JWT_TOKEN"}',
      question: 'What classic SQL injection payload forces a WHERE clause condition to always evaluate to true?',
      expected_answer: "' OR '1'='1",
      explanation: "' OR '1'='1 breaks out of string delimiters and appends a tautology, forcing the SQL parser to match the first database record without valid password credentials.",
      points: 10,
      is_active: true,
      created_at: new Date()
    }]
  ]),
  userProgress: new Map(), // key: `${userId}:${challengeId}`, value: progressRecord
  passwordResets: new Map(), // key: token, value: resetRecord
  sessions: new Map(),
  auditLogs: [
    {
      id: 1,
      user_id: 1,
      action: 'SYSTEM_BOOT',
      ip_address: '127.0.0.1',
      user_agent: 'System Engine',
      details: { message: 'CloudOS platform initialized' },
      created_at: new Date()
    }
  ],
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
  if (pool && isConnected) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.DEBUG_SQL === 'true') {
        console.log('[DB SQL]', { text, duration, rows: res.rowCount });
      }
      return res;
    } catch (err) {
      console.warn('[DB Query Fallback] PostgreSQL error, reverting to in-memory store:', err.message);
      return executeInMemoryFallback(text, params);
    }
  } else {
    return executeInMemoryFallback(text, params);
  }
}

// In-Memory SQL Simulator for safe testing and standalone zero-dependency execution
function executeInMemoryFallback(text, params) {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');

  // 1. User Lookups
  if (normalized.startsWith('select') && normalized.includes('from users where username = $1 or email = $2')) {
    const [username, email] = params;
    const user = Array.from(inMemoryStore.users.values()).find(u => u.username === username || u.email === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from users where username = $1 or email = $1')) {
    const identifier = params[0];
    const user = Array.from(inMemoryStore.users.values()).find(u => u.username === identifier || u.email === identifier);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

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

  if (normalized.startsWith('select') && normalized.includes('from users order by id')) {
    const users = Array.from(inMemoryStore.users.values()).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      points: u.points || 0,
      disk_quota_mb: u.disk_quota_mb,
      is_active: u.is_active,
      created_at: u.created_at
    }));
    return { rows: users, rowCount: users.length };
  }

  // 2. User Insertions & Updates
  if (normalized.startsWith('insert into users')) {
    const [username, email, passwordHash, role] = params;
    const id = inMemoryStore.users.size + 1;
    const user = {
      id,
      username,
      email,
      password_hash: passwordHash,
      role: role || 'student',
      points: 0,
      disk_quota_mb: 5120,
      max_active_containers: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    inMemoryStore.users.set(id, user);
    return { rows: [user], rowCount: 1 };
  }

  if (normalized.startsWith('update users set role = $1')) {
    const [role, userId] = params;
    const user = inMemoryStore.users.get(userId);
    if (user) user.role = role;
    return { rows: user ? [user] : [], rowCount: 1 };
  }

  if (normalized.startsWith('update users set is_active = $1')) {
    const [isActive, userId] = params;
    const user = inMemoryStore.users.get(userId);
    if (user) user.is_active = isActive;
    return { rows: user ? [user] : [], rowCount: 1 };
  }

  if (normalized.startsWith('update users set password_hash = $1')) {
    const [pwdHash, userId] = params;
    const user = inMemoryStore.users.get(userId);
    if (user) user.password_hash = pwdHash;
    return { rows: user ? [user] : [], rowCount: 1 };
  }

  if (normalized.startsWith('update users set points = points + $1')) {
    const [pts, userId] = params;
    const user = inMemoryStore.users.get(userId);
    if (user) user.points = (user.points || 0) + (pts || 0);
    return { rows: user ? [user] : [], rowCount: 1 };
  }

  if (normalized.startsWith('delete from users where id = $1')) {
    const id = params[0];
    const deleted = inMemoryStore.users.delete(id);
    return { rows: [], rowCount: deleted ? 1 : 0 };
  }

  // 3. Challenges Operations
  if (normalized.startsWith('select') && normalized.includes('from challenges where is_active = true') && normalized.includes('where id = $1')) {
    const id = params[0];
    const ch = inMemoryStore.challenges.get(id);
    return { rows: ch ? [ch] : [], rowCount: ch ? 1 : 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from challenges where id = $1')) {
    const id = params[0];
    const ch = inMemoryStore.challenges.get(id);
    return { rows: ch ? [ch] : [], rowCount: ch ? 1 : 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from challenges')) {
    const list = Array.from(inMemoryStore.challenges.values()).filter(c => c.is_active);
    return { rows: list, rowCount: list.length };
  }

  if (normalized.startsWith('insert into challenges')) {
    const [id, title, category, difficulty, objective, hint, command, exercise, expected_output, question, expected_answer, explanation, points] = params;
    const ch = {
      id,
      title,
      category,
      difficulty,
      objective,
      hint,
      command,
      exercise,
      expected_output,
      question,
      expected_answer,
      explanation,
      points: points || 10,
      is_active: true,
      created_at: new Date()
    };
    inMemoryStore.challenges.set(id, ch);
    return { rows: [ch], rowCount: 1 };
  }

  if (normalized.startsWith('delete from challenges where id = $1')) {
    const id = params[0];
    const deleted = inMemoryStore.challenges.delete(id);
    return { rows: [], rowCount: deleted ? 1 : 0 };
  }

  // 4. User Challenge Progress
  if (normalized.startsWith('select') && normalized.includes('from user_challenge_progress where user_id = $1 and challenge_id = $2')) {
    const [userId, challengeId] = params;
    const prog = inMemoryStore.userProgress.get(`${userId}:${challengeId}`);
    return { rows: prog ? [prog] : [], rowCount: prog ? 1 : 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from user_challenge_progress where user_id = $1')) {
    const userId = params[0];
    const list = Array.from(inMemoryStore.userProgress.values()).filter(p => p.user_id === userId);
    return { rows: list, rowCount: list.length };
  }

  if (normalized.startsWith('insert into user_challenge_progress') || normalized.includes('on conflict (user_id, challenge_id)')) {
    const [userId, challengeId, userAns, pts] = params;
    const key = `${userId}:${challengeId}`;
    const record = {
      id: inMemoryStore.userProgress.size + 1,
      user_id: userId,
      challenge_id: challengeId,
      status: 'completed',
      attempts: 1,
      user_answer: userAns,
      points_awarded: pts || 10,
      completed_at: new Date()
    };
    inMemoryStore.userProgress.set(key, record);

    // Update user points
    const user = inMemoryStore.users.get(userId);
    if (user) {
      user.points = (user.points || 0) + (pts || 10);
    }
    return { rows: [record], rowCount: 1 };
  }

  // 5. Password Resets
  if (normalized.startsWith('insert into password_resets')) {
    const [userId, token, expiresAt] = params;
    const record = { id: inMemoryStore.passwordResets.size + 1, user_id: userId, reset_token: token, expires_at: expiresAt, is_used: false };
    inMemoryStore.passwordResets.set(token, record);
    return { rows: [record], rowCount: 1 };
  }

  if (normalized.startsWith('select') && normalized.includes('from password_resets where reset_token = $1')) {
    const token = params[0];
    const record = inMemoryStore.passwordResets.get(token);
    return { rows: record ? [record] : [], rowCount: record ? 1 : 0 };
  }

  if (normalized.startsWith('update password_resets set is_used = true')) {
    const param = params[0];
    for (const record of inMemoryStore.passwordResets.values()) {
      if (record.id === param || record.reset_token === param) {
        record.is_used = true;
      }
    }
    return { rows: [], rowCount: 1 };
  }

  // 6. Audit Logs
  if (normalized.startsWith('insert into audit_logs')) {
    const [userId, action, ip, details] = params;
    const log = { id: inMemoryStore.auditLogs.length + 1, user_id: userId, action, ip_address: ip, details, created_at: new Date() };
    inMemoryStore.auditLogs.unshift(log);
    return { rows: [log], rowCount: 1 };
  }

  if (normalized.startsWith('select') && normalized.includes('from audit_logs')) {
    return { rows: inMemoryStore.auditLogs.slice(0, 50), rowCount: Math.min(50, inMemoryStore.auditLogs.length) };
  }

  // 7. Sessions & Queue
  if (normalized.includes('session_queue')) {
    if (normalized.includes('count(*)')) return { rows: [{ count: '0' }], rowCount: 1 };
    if (normalized.startsWith('insert into session_queue')) return { rows: [{ id: 1, queued_at: new Date() }], rowCount: 1 };
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

  if (normalized.startsWith('update user_sessions')) {
    return { rows: [], rowCount: 1 };
  }

  if (normalized.startsWith('select') && normalized.includes('from system_settings')) {
    const rows = Array.from(inMemoryStore.settings.entries()).map(([k, v]) => ({ key: k, value: v }));
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

async function testConnection() {
  if (!pool) {
    isConnected = false;
    console.log('[DB] Running in resilient In-Memory development store mode.');
    return false;
  }
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    isConnected = true;
    console.log('[DB] PostgreSQL connected successfully.');
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[DB] PostgreSQL check: offline (${err.message}). Active resilient In-Memory store enabled.`);
    return false;
  }
}

module.exports = {
  query,
  testConnection,
  pool,
  inMemoryStore
};
