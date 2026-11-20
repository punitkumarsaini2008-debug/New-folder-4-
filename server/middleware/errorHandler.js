// ==============================================================================
// Multi-User Linux Cloud Desktop - Error Sanitization & Security Handler
// ==============================================================================

function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log error on server side for auditing
  console.error('[Unhandled Error]:', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: isDev ? err.stack : undefined
  });

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Never leak internal stack traces or database errors in production
  res.status(statusCode).json({
    success: false,
    error: isDev ? err.message : 'An unexpected error occurred while processing your request.',
    code: err.code || 'INTERNAL_ERROR'
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
