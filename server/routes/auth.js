// ==============================================================================
// Multi-User Linux Cloud Desktop - Authentication REST Routes
// ==============================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const containerManager = require('../services/containerManager');

const router = express.Router();

// Helper to generate JWT token
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

// -----------------------------------------------------------------------------
// POST /api/auth/register
// -----------------------------------------------------------------------------
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Strict input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Username format check (alphanumeric and underscores, 3-30 chars)
    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        error: 'Username must be 3-30 characters long and contain only letters, numbers, and underscores.'
      });
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // Password strength check (min 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.'
      });
    }

    // Check if username or email already exists
    const existingUser = await db.query(
      'SELECT id, username, email FROM users WHERE username = $1 OR email = $2',
      [cleanUsername, cleanEmail]
    );

    if (existingUser.rowCount > 0) {
      const match = existingUser.rows[0];
      const field = match.username === cleanUsername ? 'Username' : 'Email address';
      return res.status(409).json({
        success: false,
        error: `${field} is already registered. Please choose another or log in.`
      });
    }

    // Hash password with bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into PostgreSQL
    const insertRes = await db.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, username, email, role, disk_quota_mb, created_at`,
      [cleanUsername, cleanEmail, passwordHash]
    );

    const newUser = insertRes.rows[0];

    // Ensure persistent user directory on host
    containerManager.getUserHomeDir(newUser.id);

    // Log registration audit event
    await db.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, details) 
       VALUES ($1, 'USER_REGISTERED', $2, $3)`,
      [newUser.id, req.ip, JSON.stringify({ username: cleanUsername, email: cleanEmail })]
    );

    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        diskQuotaMb: newUser.disk_quota_mb
      }
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------------------------
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Query user by username or email
    const userRes = await db.query(
      'SELECT id, username, email, password_hash, role, disk_quota_mb, is_active FROM users WHERE username = $1 OR email = $1',
      [cleanUsername]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.'
      });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Record failed login audit log
      await db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, details) 
         VALUES ($1, 'LOGIN_FAILED', $2, $3)`,
        [user.id, req.ip, JSON.stringify({ reason: 'INVALID_CREDENTIALS' })]
      );

      return res.status(401).json({
        success: false,
        error: 'Invalid username or password.'
      });
    }

    // Record successful login audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, details) 
       VALUES ($1, 'LOGIN_SUCCESS', $2, $3)`,
      [user.id, req.ip, JSON.stringify({ timestamp: new Date() })]
    );

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        diskQuotaMb: user.disk_quota_mb
      }
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/auth/me (Returns authenticated user profile & active session)
// -----------------------------------------------------------------------------
router.get('/me', authenticate, async (req, res, next) => {
  try {
    // Check if user currently has an active container session
    const sessionRes = await db.query(
      `SELECT id, os_id, container_id, status, started_at, last_activity_at 
       FROM user_sessions 
       WHERE user_id = $1 AND status IN ('starting', 'running', 'idle') 
       ORDER BY started_at DESC LIMIT 1`,
      [req.user.id]
    );

    res.json({
      success: true,
      user: req.user,
      activeSession: sessionRes.rows[0] || null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
