// ==============================================================================
// Multi-User Linux Cloud Desktop - Rate Limiting & Anti-Brute-Force
// ==============================================================================

// In-Memory Rate Limiter (lightweight, zero external Redis dependency required on free tier)
class MemoryRateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();

    // Clean up stale entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  middleware(customMax = null) {
    const limit = customMax || this.maxRequests;

    return (req, res, next) => {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const now = Date.now();

      let clientRecord = this.requests.get(ip);
      if (!clientRecord) {
        clientRecord = { count: 1, resetTime: now + this.windowMs };
        this.requests.set(ip, clientRecord);
        return next();
      }

      if (now > clientRecord.resetTime) {
        clientRecord.count = 1;
        clientRecord.resetTime = now + this.windowMs;
        return next();
      }

      clientRecord.count++;
      if (clientRecord.count > limit) {
        const retryAfter = Math.ceil((clientRecord.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({
          success: false,
          error: `Too many requests from this IP. Please try again after ${retryAfter} seconds.`
        });
      }

      next();
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// Strict limiter for login/registration (10 requests per 15 minutes)
const authLimiter = new MemoryRateLimiter(15 * 60 * 1000, 10).middleware();

// Standard API limiter (120 requests per minute)
const apiLimiter = new MemoryRateLimiter(60 * 1000, 120).middleware();

module.exports = {
  authLimiter,
  apiLimiter,
  MemoryRateLimiter
};
