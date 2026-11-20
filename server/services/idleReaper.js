// ==============================================================================
// Multi-User Linux Cloud Desktop - Automatic Idle Container Reaper
// Conserves free server RAM and CPU by shutting down inactive containers
// ==============================================================================

const db = require('../db');
const containerManager = require('./containerManager');
const config = require('../config');

class IdleReaper {
  constructor() {
    this.timer = null;
    this.intervalMs = 60 * 1000; // Check every 60 seconds
    this.isChecking = false;
  }

  start() {
    if (this.timer) return;
    console.log(`[IdleReaper] Watchdog active. Idle timeout: ${config.resources.idleTimeoutMinutes} minutes.`);
    this.timer = setInterval(() => this.reapIdleSessions(), this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async reapIdleSessions() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const timeoutMinutes = config.resources.idleTimeoutMinutes;
      const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      // Query active sessions exceeding idle threshold
      const idleSessionsQuery = `
        SELECT id, user_id, container_id, container_name, os_id, last_activity_at 
        FROM user_sessions 
        WHERE status = 'running' 
          AND last_activity_at < $1
      `;

      const res = await db.query(idleSessionsQuery, [cutoffTime]);

      if (res.rowCount > 0) {
        console.log(`[IdleReaper] Found ${res.rowCount} idle session(s) exceeding ${timeoutMinutes} min timeout.`);

        for (const session of res.rows) {
          console.log(`[IdleReaper] Auto-stopping idle container ${session.container_id} (user ${session.user_id}).`);

          // 1. Stop the container to immediately release host RAM & CPU
          await containerManager.stopSessionContainer(session.container_id);

          // 2. Update session status in DB
          await db.query(
            `UPDATE user_sessions 
             SET status = 'idle', stopped_at = NOW(), exit_reason = 'AUTO_IDLE_TIMEOUT' 
             WHERE id = $1`,
            [session.id]
          );

          // 3. Record in audit logs
          await db.query(
            `INSERT INTO audit_logs (user_id, action, details) 
             VALUES ($1, 'SESSION_IDLE_STOPPED', $2)`,
            [session.user_id, JSON.stringify({ sessionId: session.id, containerId: session.container_id })]
          );
        }
      }
    } catch (err) {
      console.error('[IdleReaper Error]:', err.message);
    } finally {
      this.isChecking = false;
    }
  }
}

module.exports = new IdleReaper();
