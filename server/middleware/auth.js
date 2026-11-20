// ==============================================================================
// Multi-User Linux Cloud Desktop - JWT Authentication Middleware
// ==============================================================================

const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query && req.query.token) {
      // Allow token query param for WebSocket handshakes
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No bearer token provided.'
      });
    }

    // Verify cryptographic signature
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please log in again.'
      });
    }

    // Lookup user in database
    const userRes = await db.query(
      'SELECT id, username, email, role, disk_quota_mb, max_active_containers, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rowCount === 0 || !userRes.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or suspended.'
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication service encountered an internal error.'
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Administrative privileges required.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin
};
