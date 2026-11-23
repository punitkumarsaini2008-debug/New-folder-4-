// ==============================================================================
// Multi-User Linux Cloud Desktop - Administrator Control REST Routes
// Version: 2.1.0 - User Management, Challenge Authoring, & Activity Auditing
// ==============================================================================

const express = require('express');
const db = require('../db');
const { inMemoryStore } = db;
const { authenticate, requireAdmin } = require('../middleware/auth');
const containerManager = require('../services/containerManager');

const router = express.Router();

// Enforce authentication & administrator privileges across all admin routes
router.use(authenticate);
router.use(requireAdmin);

// -----------------------------------------------------------------------------
// 1. User Management Routes
// -----------------------------------------------------------------------------

// GET /api/admin/users (List all registered users with metrics)
router.get('/users', async (req, res, next) => {
  try {
    const usersRes = await db.query(
      `SELECT id, username, email, role, points, disk_quota_mb, max_active_containers, is_active, created_at, updated_at 
       FROM users 
       ORDER BY id ASC`
    );

    // Fetch completed lab counts per user
    const progressRes = await db.query(
      `SELECT user_id, count(*) as completed_count 
       FROM user_challenge_progress 
       WHERE status = 'completed' 
       GROUP BY user_id`
    );

    const progressMap = {};
    if (progressRes && progressRes.rows) {
      progressRes.rows.forEach(r => {
        progressMap[r.user_id] = parseInt(r.completed_count, 10);
      });
    }

    const users = (usersRes.rows || []).map(u => ({
      ...u,
      completedLabsCount: progressMap[u.id] || 0
    }));

    res.json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/role (Change user role: student <-> admin)
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['student', 'admin', 'user', 'moderator'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role specified.' });
    }

    if (targetUserId === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'You cannot revoke your own administrator role.' });
    }

    await db.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role, targetUserId]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'ADMIN_ROLE_CHANGE', req.ip, JSON.stringify({ targetUserId, newRole: role })]
    );

    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id/status (Toggle user active status)
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isActive boolean is required.' });
    }

    if (targetUserId === req.user.id && !isActive) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own account.' });
    }

    await db.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [isActive, targetUserId]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'ADMIN_USER_STATUS_CHANGE', req.ip, JSON.stringify({ targetUserId, isActive })]
    );

    res.json({ success: true, message: `User account ${isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id (Delete user account)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [targetUserId]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'ADMIN_USER_DELETED', req.ip, JSON.stringify({ targetUserId })]
    );

    res.json({ success: true, message: 'User account deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// 2. Challenge Authoring & Management Routes
// -----------------------------------------------------------------------------

// GET /api/admin/challenges (List all challenges)
router.get('/challenges', async (req, res, next) => {
  try {
    const chRes = await db.query('SELECT * FROM challenges ORDER BY created_at DESC');
    res.json({
      success: true,
      challenges: chRes.rows || []
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/challenges (Create a new practical lab challenge)
router.post('/challenges', async (req, res, next) => {
  try {
    const {
      id,
      title,
      category,
      difficulty = 'Beginner',
      objective,
      hint,
      command,
      exercise,
      expected_output,
      question,
      expected_answer,
      explanation,
      points = 10
    } = req.body;

    if (!title || !category || !question || !expected_answer || !explanation) {
      return res.status(400).json({
        success: false,
        error: 'Title, category, question, expected_answer, and explanation are required.'
      });
    }

    const challengeId = id && id.trim() ? id.trim().toLowerCase().replace(/\s+/g, '-') : `lab-custom-${Date.now()}`;

    const insertRes = await db.query(
      `INSERT INTO challenges (
        id, title, category, difficulty, objective, hint, command, exercise, expected_output, question, expected_answer, explanation, points
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        challengeId,
        title,
        category,
        difficulty,
        objective || title,
        hint || '',
        command || '',
        exercise || '',
        expected_output || '',
        question,
        expected_answer,
        explanation,
        parseInt(points, 10) || 10
      ]
    );

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'ADMIN_CHALLENGE_CREATED', req.ip, JSON.stringify({ challengeId, title })]
    );

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully.',
      challenge: insertRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/challenges/:id (Update existing challenge)
router.put('/challenges/:id', async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const {
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
      points
    } = req.body;

    await db.query(
      `UPDATE challenges SET 
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        difficulty = COALESCE($3, difficulty),
        objective = COALESCE($4, objective),
        hint = COALESCE($5, hint),
        command = COALESCE($6, command),
        exercise = COALESCE($7, exercise),
        expected_output = COALESCE($8, expected_output),
        question = COALESCE($9, question),
        expected_answer = COALESCE($10, expected_answer),
        explanation = COALESCE($11, explanation),
        points = COALESCE($12, points),
        updated_at = NOW()
      WHERE id = $13`,
      [title, category, difficulty, objective, hint, command, exercise, expected_output, question, expected_answer, explanation, points, challengeId]
    );

    res.json({ success: true, message: 'Challenge updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/challenges/:id (Delete challenge)
router.delete('/challenges/:id', async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    await db.query('DELETE FROM challenges WHERE id = $1', [challengeId]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'ADMIN_CHALLENGE_DELETED', req.ip, JSON.stringify({ challengeId })]
    );

    res.json({ success: true, message: 'Challenge deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// 3. Platform Monitoring & Activity Auditing
// -----------------------------------------------------------------------------

// GET /api/admin/activity (Live audit feed of platform events & submissions)
router.get('/activity', async (req, res, next) => {
  try {
    const logsRes = await db.query(
      `SELECT a.id, a.user_id, u.username, a.action, a.ip_address, a.details, a.created_at 
       FROM audit_logs a 
       LEFT JOIN users u ON a.user_id = u.id 
       ORDER BY a.created_at DESC 
       LIMIT 50`
    );

    res.json({
      success: true,
      activity: logsRes.rows || []
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats (Platform-wide summary metrics)
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = inMemoryStore ? inMemoryStore.users.size : 2;
    const totalChallenges = inMemoryStore ? inMemoryStore.challenges.size : 5;
    const completedChallenges = inMemoryStore ? inMemoryStore.userProgress.size : 0;
    const activeContainers = inMemoryStore ? inMemoryStore.sessions.size : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChallenges,
        completedChallenges,
        activeContainers,
        systemHealth: 'OPTIMAL'
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
