// ==============================================================================
// ParrotCloud OS - Root Entrypoint Forwarder
// Ensures compatibility regardless of whether Render executes 'node index.js'
// or 'node server/server.js'
// ==============================================================================

module.exports = require('./server/server.js');
