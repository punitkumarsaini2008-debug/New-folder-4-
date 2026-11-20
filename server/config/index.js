// ==============================================================================
// Multi-User Linux Cloud Desktop - Central Configuration Loader
// ==============================================================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_insecure_jwt_secret_do_not_use_in_prod_1234567890',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  },

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'cloudos_db',
    user: process.env.DB_USER || 'cloudos_admin',
    password: process.env.DB_PASSWORD || 'cloudos_password',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  },

  guacd: {
    host: process.env.GUACD_HOST || '127.0.0.1',
    port: parseInt(process.env.GUACD_PORT, 10) || 4822
  },

  resources: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS, 10) || 8,
    containerRamLimitMb: parseInt(process.env.CONTAINER_RAM_LIMIT_MB, 10) || 2048,
    containerCpuQuota: parseFloat(process.env.CONTAINER_CPU_QUOTA) || 1.5,
    containerPidsLimit: parseInt(process.env.CONTAINER_PIDS_LIMIT, 10) || 256,
    idleTimeoutMinutes: parseInt(process.env.IDLE_TIMEOUT_MINUTES, 10) || 15,
    sessionMaxDurationHours: parseInt(process.env.SESSION_MAX_DURATION_HOURS, 10) || 2,
    userDataPath: process.env.USER_DATA_PATH || path.resolve(__dirname, '..', 'data', 'users'),
    sharedLabsPath: process.env.SHARED_LABS_PATH || path.resolve(__dirname, '..', 'data', 'shared_labs'),
    userNetwork: process.env.DOCKER_USER_NETWORK || 'cloudos_user_net'
  }
};

module.exports = config;
