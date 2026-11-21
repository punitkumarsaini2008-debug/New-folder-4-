// ==============================================================================
// Online Linux Hacking Lab - REST API Routes
// Endpoints for lab container start/stop/reset, status polling, and CTF flags
// ==============================================================================

const express = require('express');
const labManager = require('../services/labManager');
const { apiLimiter } = require('../middleware/rateLimiter');

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

module.exports = router;
