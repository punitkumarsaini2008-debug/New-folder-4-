// ==============================================================================
// Online Linux Hacking Lab - REST API Routes
// Endpoints for lab container start/stop/reset, status polling, and CTF flags
// ==============================================================================

const express = require('express');
const db = require('../db');
const labManager = require('../services/labManager');
const { apiLimiter } = require('../middleware/rateLimiter');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to extract or generate anonymous/authenticated user ID
function getUserId(req) {
  if (req.user && req.user.id) return req.user.id.toString();
  const headerId = req.headers['x-lab-user-id'];
  if (headerId) return headerId;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'guest';
  return 'u_' + Buffer.from(ip).toString('hex').substring(0, 10);
}

// -----------------------------------------------------------------------------
// POST /api/labs/start (Start an isolated Linux hacking lab container)
// -----------------------------------------------------------------------------
router.post('/start', apiLimiter, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { osId = 'ubuntu' } = req.body;

    if (!['ubuntu', 'kali', 'parrot'].includes(osId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OS selection. Choose from: ubuntu, kali, or parrot.'
      });
    }

    const lab = await labManager.startLab(userId, osId);

    res.status(201).json({
      success: true,
      message: `${lab.osName} container launched. Terminal stream ready.`,
      lab: {
        labId: lab.labId,
        osId: lab.osId,
        osName: lab.osName,
        status: lab.status,
        containerIp: lab.containerIp,
        remainingSec: Math.floor((new Date(lab.expiresAt).getTime() - Date.now()) / 1000),
        isRealContainer: lab.isRealContainer
      }
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/labs/stop (Terminate lab container and release server resources)
// -----------------------------------------------------------------------------
router.post('/stop', async (req, res, next) => {
  try {
    const { labId } = req.body;
    if (!labId) {
      return res.status(400).json({ success: false, error: 'labId is required.' });
    }

    await labManager.stopLab(labId);

    res.json({
      success: true,
      message: 'Lab container terminated. CPU and RAM resources freed.'
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// POST /api/labs/reset (Destroy current container and launch clean environment)
// -----------------------------------------------------------------------------
router.post('/reset', apiLimiter, async (req, res, next) => {
  try {
    const { labId } = req.body;
    if (!labId) {
      return res.status(400).json({ success: false, error: 'labId is required.' });
    }

    const newLab = await labManager.resetLab(labId);

    res.json({
      success: true,
      message: 'Lab environment reset to initial state.',
      lab: newLab ? {
        labId: newLab.labId,
        osId: newLab.osId,
        osName: newLab.osName,
        status: newLab.status,
        containerIp: newLab.containerIp,
        remainingSec: Math.floor((new Date(newLab.expiresAt).getTime() - Date.now()) / 1000)
      } : null
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/labs/status (Query current container status, IP, and countdown)
// -----------------------------------------------------------------------------
router.get('/status', (req, res) => {
  const labId = req.query.labId;
  if (!labId) {
    return res.status(400).json({ success: false, error: 'labId parameter is required.' });
  }

  const status = labManager.getLabStatus(labId);
  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Lab session expired or not found. Please start a new lab.'
    });
  }

  res.json({
    success: true,
    lab: status
  });
});

// -----------------------------------------------------------------------------
// GET /api/labs/challenges (Retrieve list of ethical hacking challenges)
// -----------------------------------------------------------------------------
router.get('/challenges', (req, res) => {
  res.json({
    success: true,
    challenges: labManager.getChallenges()
  });
});

// -----------------------------------------------------------------------------
// POST /api/labs/verify-flag (Verify submitted CTF flag)
// -----------------------------------------------------------------------------
router.post('/verify-flag', apiLimiter, (req, res) => {
  const { labId, challengeId, flag } = req.body;
  if (!challengeId || !flag) {
    return res.status(400).json({
      success: false,
      error: 'challengeId and flag are required.'
    });
  }

  const result = labManager.verifyFlag(labId, challengeId, flag);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// -----------------------------------------------------------------------------
// POST /api/labs/submit-answer (Server-side validation for Cybersecurity Labs)
// -----------------------------------------------------------------------------
router.post('/submit-answer', apiLimiter, optionalAuthenticate, async (req, res, next) => {
  try {
    const challengeId = req.body.challengeId;
    const answer = req.body.answer !== undefined ? req.body.answer : req.body.submittedAnswer;
    const userId = req.user ? req.user.id : 2; // Default to student ID if guest/demo session

    if (!challengeId || answer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'challengeId and answer are required.'
      });
    }

    // 1. Fetch challenge from database or fallback
    let challenge = null;
    const chRes = await db.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
    if (chRes.rowCount > 0) {
      challenge = chRes.rows[0];
    } else if (db.inMemoryStore && db.inMemoryStore.challenges.has(challengeId)) {
      challenge = db.inMemoryStore.challenges.get(challengeId);
    }

    // Fallback dictionary for common core labs if not found in db
    if (!challenge) {
      const knownLabs = {
        'lab-os-find': {
          title: 'Find the Linux operating system',
          expected_answer: 'cat /etc/os-release',
          explanation: 'The /etc/os-release file is the standard configuration file used by modern Linux distributions (Parrot, Ubuntu, Debian, Kali, Mint, and Fedora) to declare operating system identification metadata.',
          hint: 'Look inside the /etc directory for standard release files.',
          points: 10
        }
      };
      challenge = knownLabs[challengeId];
    }

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found.'
      });
    }

    // 2. Normalize and compare answers
    const normalize = (str) => {
      return String(str || '')
        .toLowerCase()
        .replace(/^[`'"]+|[`'"]+$/g, '')
        .replace(/^\$\s*/, '')
        .replace(/^#\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const userNorm = normalize(answer);
    const expectedNorm = normalize(challenge.expected_answer || challenge.answer);

    const isCorrect = (
      userNorm === expectedNorm ||
      (expectedNorm.length > 3 && userNorm.includes(expectedNorm)) ||
      (userNorm.length > 3 && expectedNorm.includes(userNorm))
    );

    if (isCorrect) {
      const pointsToAward = challenge.points || 10;

      // Record progress in database
      await db.query(
        `INSERT INTO user_challenge_progress (user_id, challenge_id, user_answer, points_awarded, status) 
         VALUES ($1, $2, $3, $4, 'completed') 
         ON CONFLICT (user_id, challenge_id) DO UPDATE SET 
           user_answer = EXCLUDED.user_answer, 
           completed_at = NOW()`,
        [userId, challengeId, answer.trim(), pointsToAward]
      );

      // Increment user points
      await db.query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsToAward, userId]);

      // Audit log
      await db.query(
        'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES ($1, $2, $3, $4)',
        [userId, 'LAB_COMPLETED', req.ip, JSON.stringify({ challengeId, pointsAwarded: pointsToAward })]
      );

      return res.json({
        success: true,
        status: 'SUCCESS',
        message: 'SUCCESS! Correct answer verified.',
        pointsAwarded: pointsToAward,
        totalPoints: ((req.user && req.user.points !== undefined) ? req.user.points : 100) + pointsToAward,
        explanation: challenge.explanation || 'Command syntax and execution verified successfully.',
        completed: true
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 'INCORRECT',
        error: 'Incorrect answer. Double-check syntax and try again.',
        hint: challenge.hint || 'Review the practical commands and execution steps provided in the guide.'
      });
    }
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------------
// GET /api/labs/user-progress (Fetch user completed challenge IDs)
// -----------------------------------------------------------------------------
router.get('/user-progress', authenticate, async (req, res, next) => {
  try {
    const progRes = await db.query(
      'SELECT challenge_id, points_awarded, completed_at FROM user_challenge_progress WHERE user_id = $1 AND status = $2',
      [req.user.id, 'completed']
    );

    res.json({
      success: true,
      completedChallenges: progRes.rows || [],
      totalPoints: req.user.points || 0
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
