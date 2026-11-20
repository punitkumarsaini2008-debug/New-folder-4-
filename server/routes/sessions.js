// ==============================================================================
// Multi-User Linux Cloud Desktop - Session Lifecycle & Container Routes
// ==============================================================================

const express = require('express');
const db = require('../db');
const config = require('../config');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const containerManager = require('../services/containerManager');

const router = express.Router();

// -----------------------------------------------------------------------------
// POST /api/sessions/start (Launch or restore an OS desktop session)
// -----------------------------------------------------------------------------
router.post('/start', authenticate, apiLimiter, async (req, res, next) => {
  try {
    const { osId = 'ubuntu' } = req.body;
    const userId = req.user.id;

    // 1. Check if user already has an active running/starting session
    const existingSession = await db.query(
      `SELECT id, os_id, container_id, status, vnc_internal_port, container_ip 
       FROM user_sessions 
       WHERE user_id = $1 AND status IN ('starting', 'running') 
       LIMIT 1`,
      [userId]
    );

    if (existingSession.rowCount > 0) {
      const active = existingSession.rows[0];
      return res.json({
        success: true,
        message: 'Reconnected to your existing active session.',
        session: active
      });
    }

    // 2. Capacity Check: Count active containers across the entire host
    const activeCountRes = await db.query(
      `SELECT count(*) FROM user_sessions WHERE status IN ('starting', 'running')`
    );
    const activeCount = parseInt(activeCountRes.rows[0].count, 10);
    const maxCapacity = config.resources.maxConcurrentSessions;

    if (activeCount >= maxCapacity) {
      // Server is at free resource ceiling. Add user to queue
      const queueInsert = await db.query(
        `INSERT INTO session_queue (user_id, os_id) 
         VALUES ($1, $2) RETURNING id, queued_at`,
        [userId, osId]
      );

      const queuePositionRes = await db.query(
        `SELECT count(*) FROM session_queue WHERE status = 'waiting' AND queued_at <= $1`,
        [queueInsert.rows[0].queued_at]
      );

      return res.status(503).json({
        success: false,
        queued: true,
        queuePosition: parseInt(queuePositionRes.rows[0].count, 10),
        error: `Server is at maximum capacity (${maxCapacity}/${maxCapacity} active desktops). You have been placed in the waiting queue.`
      });
    }

    // 3. Spawn isolated Docker container with cgroup constraints
    const containerResult = await containerManager.spawnSessionContainer(req.user, osId);

    // 4. Record new session in PostgreSQL
    const sessionInsert = await db.query(
      `INSERT INTO user_sessions (
         user_id, os_id, container_id, container_name, status, 
         vnc_internal_port, ssh_internal_port, container_ip
       ) 
       VALUES ($1, $2, $3, $4, 'running', $5, $6, $7) 
       RETURNING id, os_id, container_id, status, started_at`,
      [
        userId,
        osId,
        containerResult.containerId,
        containerResult.containerName,
        containerResult.vncPort,
        containerResult.sshPort,
        containerResult.containerIp
      ]
    );

    const newSession = sessionInsert.rows[0];

    // 5. Audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, details) 
       VALUES ($1, 'SESSION_STARTED', $2)`,
      [userId, JSON.stringify({ sessionId: newSession.id, osId, containerId: containerResult.containerId })]
    );

    res.status(201).json({
      success: true,
      message: `${osId.toUpperCase()} cloud desktop initialized successfully.`,
      session: {
        ...newSession,
        isSimulated: containerResult.isSimulated || false
      }
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/sessions/stop (Stop active container and release RAM & CPU)
// -----------------------------------------------------------------------------
router.post('/stop', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessionRes = await db.query(
      `SELECT id, container_id FROM user_sessions 
       WHERE user_id = $1 AND status IN ('starting', 'running', 'idle') 
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    if (sessionRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active session found to terminate.'
      });
    }

    const { id: sessionId, container_id: containerId } = sessionRes.rows[0];

    // 1. Terminate container
    await containerManager.stopSessionContainer(containerId);

    // 2. Update DB status
    await db.query(
      `UPDATE user_sessions 
       SET status = 'stopped', stopped_at = NOW(), exit_reason = 'USER_INITIATED' 
       WHERE id = $1`,
      [sessionId]
    );

    // 3. Audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, details) 
       VALUES ($1, 'SESSION_STOPPED', $2)`,
      [userId, JSON.stringify({ sessionId, containerId })]
    );

    res.json({
      success: true,
      message: 'Cloud desktop stopped. Host RAM and CPU freed.'
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/sessions/restart (Restart active container)
// -----------------------------------------------------------------------------
router.post('/restart', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessionRes = await db.query(
      `SELECT id, container_id FROM user_sessions 
       WHERE user_id = $1 AND status = 'running' 
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    if (sessionRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No running session found to restart.'
      });
    }

    const { id: sessionId, container_id: containerId } = sessionRes.rows[0];
    await containerManager.restartSessionContainer(containerId);

    await db.query(
      `UPDATE user_sessions SET last_activity_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Cloud desktop restarted successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/sessions/heartbeat (Update last_activity_at to prevent idle shutdown)
// -----------------------------------------------------------------------------
router.post('/heartbeat', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    await db.query(
      `UPDATE user_sessions 
       SET last_activity_at = NOW() 
       WHERE user_id = $1 AND status = 'running'`,
      [userId]
    );

    res.json({ success: true, timestamp: new Date() });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/sessions/status (Get live telemetry, idle timer & container status)
// -----------------------------------------------------------------------------
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessionRes = await db.query(
      `SELECT id, os_id, container_id, container_name, status, started_at, last_activity_at 
       FROM user_sessions 
       WHERE user_id = $1 AND status IN ('starting', 'running', 'idle') 
       ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );

    if (sessionRes.rowCount === 0) {
      return res.json({
        success: true,
        hasActiveSession: false
      });
    }

    const session = sessionRes.rows[0];
    const liveStats = await containerManager.getContainerLiveStats(session.container_id);

    // Calculate remaining idle time before shutdown
    const idleTimeoutMs = config.resources.idleTimeoutMinutes * 60 * 1000;
    const elapsedSinceActivity = Date.now() - new Date(session.last_activity_at).getTime();
    const remainingIdleSec = Math.max(0, Math.floor((idleTimeoutMs - elapsedSinceActivity) / 1000));

    res.json({
      success: true,
      hasActiveSession: true,
      session: {
        id: session.id,
        osId: session.os_id,
        status: session.status,
        startedAt: session.started_at,
        remainingIdleSec,
        liveStats
      }
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/sessions/history (Past session log for current user)
// -----------------------------------------------------------------------------
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const historyRes = await db.query(
      `SELECT id, os_id, status, started_at, stopped_at, exit_reason 
       FROM user_sessions 
       WHERE user_id = $1 
       ORDER BY started_at DESC LIMIT 20`,
      [req.user.id]
    );

    res.json({
      success: true,
      history: historyRes.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
