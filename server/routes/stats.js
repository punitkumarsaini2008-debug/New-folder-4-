// ==============================================================================
// Multi-User Linux Cloud Desktop - Server Capacity & Telemetry Routes
// ==============================================================================

const express = require('express');
const os = require('os');
const db = require('../db');
const config = require('../config');
const containerManager = require('../services/containerManager');

const router = express.Router();

router.get('/capacity', async (req, res, next) => {
  try {
    const activeSessionsCount = await containerManager.getActiveContainersCount();
    const maxCapacity = config.resources.maxConcurrentSessions;
    const availableSlots = Math.max(0, maxCapacity - activeSessionsCount);

    const queueRes = await db.query(
      `SELECT count(*) FROM session_queue WHERE status = 'waiting'`
    );
    const queueLength = queueRes && queueRes.rows && queueRes.rows[0] ? parseInt(queueRes.rows[0].count, 10) : 0;

    const totalHostMemMb = Math.round(os.totalmem() / (1024 * 1024));
    const freeHostMemMb = Math.round(os.freemem() / (1024 * 1024));
    const usedHostMemMb = totalHostMemMb - freeHostMemMb;

    res.json({
      success: true,
      capacity: {
        activeContainers: activeSessionsCount,
        maxCapacity,
        availableSlots,
        queueLength,
        isAtCapacity: activeSessionsCount >= maxCapacity
      },
      hostTelemetry: {
        platform: `${process.platform} (${os.arch()})`,
        uptimeHours: Math.round(os.uptime() / 3600),
        cpuCount: os.cpus().length,
        totalMemoryMb: totalHostMemMb,
        usedMemoryMb: usedHostMemMb,
        freeMemoryMb: freeHostMemMb
      },
      quotas: {
        perContainerRamMb: config.resources.containerRamLimitMb,
        perContainerCpu: config.resources.containerCpuQuota,
        idleTimeoutMinutes: config.resources.idleTimeoutMinutes
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/health', async (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'cloudos-backend',
    version: '2.0.0',
    timestamp: new Date()
  });
});

module.exports = router;
