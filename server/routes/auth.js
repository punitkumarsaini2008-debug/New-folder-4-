// ==============================================================================
// Multi-User Linux Cloud Desktop - Authentication REST Routes
// Version: 2.1.0 - Full Authentication Lifecycle, Roles, Profile & Password Reset
// ==============================================================================

const express = require('express');
const crypto = require('crypto');
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
    const { username, email, password, role } = req.body;

    // Strict input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required.'
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = (role === 'admin' && req.body.adminSecretKey === (process.env.ADMIN_REGISTER_KEY || 'parrot_admin_secure_2026')) 
      ? 'admin' 
      : 'student';

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

    // Insert user into Database
    const insertRes = await db.query(
      `INSERT INTO users (username, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, role, disk_quota_mb, points, created_at`,
      [cleanUsername, cleanEmail, passwordHash, assignedRole]
    );

    const newUser = insertRes.rows[0];

    // Ensure persistent user directory on host
    try {
      containerManager.getUserHomeDir(newUser.id);
    } catch (e) {
      // Non-fatal if host docker directory creation deferred
    }

    // Log registration audit event
    await db.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, details) 
       VALUES ($1, 'USER_REGISTERED', $2, $3)`,
      [newUser.id, req.ip, JSON.stringify({ username: cleanUsername, email: cleanEmail, role: newUser.role })]
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
        points: newUser.points || 0,
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
    const { username, password, email } = req.body;
    const identifier = (username || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email/Username and password are required.'
      });
    }

    // Query user by username or email
    const userRes = await db.query(
      'SELECT id, username, email, password_hash, role, points, disk_quota_mb, is_active FROM users WHERE username = $1 OR email = $1',
      [identifier]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password.'
      });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, details) 
         VALUES ($1, 'LOGIN_FAILED', $2, $3)`,
        [user.id, req.ip, JSON.stringify({ reason: 'INVALID_CREDENTIALS' })]
      );

      return res.status(401).json({
        success: false,
        error: 'Invalid email/username or password.'
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
        points: user.points || 0,
        diskQuotaMb: user.disk_quota_mb
      }
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/forgot-password (Self-service recovery token generation)
// -----------------------------------------------------------------------------
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await db.query('SELECT id, username, email FROM users WHERE email = $1', [cleanEmail]);

    if (userRes.rowCount === 0) {
      // Security practice: Return generic positive message to prevent user enumeration
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset token has been generated.'
      });
    }

    const user = userRes.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour validity

    await db.query(
      'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [user.id, 'PASSWORD_RESET_REQUESTED', req.ip, JSON.stringify({ email: cleanEmail })]
    );

    res.json({
      success: true,
      message: 'Password reset token generated. Use the token to reset your password.',
      resetToken, // Returned for instant in-browser reset in development/demo environments
      expiresInMinutes: 60
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/reset-password (Verify reset token and update password)
// -----------------------------------------------------------------------------
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.'
      });
    }

    const resetRes = await db.query(
      'SELECT id, user_id, expires_at, is_used FROM password_resets WHERE reset_token = $1',
      [token.trim()]
    );

    if (resetRes.rowCount === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or unrecognized reset token.' });
    }

    const reset = resetRes.rows[0];
    if (reset.is_used) {
      return res.status(400).json({ success: false, error: 'This reset token has already been used.' });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user record
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, reset.user_id]);
    await db.query('UPDATE password_resets SET is_used = true WHERE id = $1', [reset.id]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [reset.user_id, 'PASSWORD_RESET_SUCCESS', req.ip, JSON.stringify({ timestamp: new Date() })]
    );

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/logout
// -----------------------------------------------------------------------------
router.post('/logout', authenticate, async (req, res) => {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'LOGOUT', req.ip, JSON.stringify({ timestamp: new Date() })]
    );
  } catch (e) {
    // Non-blocking
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// -----------------------------------------------------------------------------
// GET /api/auth/me or /profile (Authenticated user profile & dashboard stats)
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

    // Get completed challenge count and user points
    const progressRes = await db.query(
      'SELECT count(*) FROM user_challenge_progress WHERE user_id = $1 AND status = $2',
      [req.user.id, 'completed']
    );
    const completedLabsCount = progressRes.rows[0] ? parseInt(progressRes.rows[0].count, 10) : 0;

    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        points: req.user.points || 0,
        diskQuotaMb: req.user.disk_quota_mb,
        completedLabsCount,
        createdAt: req.user.created_at
      },
      activeSession: sessionRes.rows[0] || null
    });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', authenticate, (req, res, next) => {
  return router.handle({ ...req, url: '/me' }, res, next);
});

// -----------------------------------------------------------------------------
// PUT /api/auth/profile (Update password or profile)
// -----------------------------------------------------------------------------
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, email } = req.body;
    const userId = req.user.id;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to set a new password.' });
      }

      // Verify current password
      const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, error: 'Current password does not match.' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
      }

      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash(newPassword, salt);
      await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
    }

    if (email && email.trim().toLowerCase() !== req.user.email) {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, error: 'Invalid email address.' });
      }
      await db.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [cleanEmail, userId]);
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
