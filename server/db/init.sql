-- ==============================================================================
-- Multi-User Linux Cloud Desktop - PostgreSQL Database Schema
-- Version: 2.0.0
-- ==============================================================================

-- Enable UUID extension for cryptographic session IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    disk_quota_mb INT NOT NULL DEFAULT 5120, -- 5 GB default persistent storage
    max_active_containers INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. User Sessions & Container Allocations Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    os_id VARCHAR(50) NOT NULL,
    container_id VARCHAR(64),
    container_name VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'starting' 
        CHECK (status IN ('queued', 'starting', 'running', 'idle', 'stopped', 'terminated', 'error')),
    vnc_internal_port INT DEFAULT 5901,
    ssh_internal_port INT DEFAULT 2222,
    container_ip VARCHAR(45),
    assigned_cpu VARCHAR(10) DEFAULT '1.5',
    assigned_ram_mb INT DEFAULT 2048,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stopped_at TIMESTAMP WITH TIME ZONE,
    exit_reason VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON user_sessions (status);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions (last_activity_at);

-- 3. Session Queue (when server reaches max capacity)
CREATE TABLE IF NOT EXISTS session_queue (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    os_id VARCHAR(50) NOT NULL,
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON session_queue (status, queued_at);

-- 4. Audit & Security Activity Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id);

-- 5. System Configuration & Resource Limits
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Production Settings
INSERT INTO system_settings (key, value, description)
VALUES 
    ('max_concurrent_sessions', '8', 'Maximum concurrent active user desktop containers on server'),
    ('container_ram_limit_mb', '2048', 'Hard RAM ceiling per user desktop container (MB)'),
    ('container_cpu_quota', '1.5', 'CPU core quota per user desktop container'),
    ('idle_timeout_minutes', '15', 'Minutes of user inactivity before stopping container'),
    ('session_max_duration_hours', '2', 'Maximum continuous runtime before forced termination'),
    ('maintenance_mode', 'false', 'Disable new session launches for server maintenance')
ON CONFLICT (key) DO NOTHING;

-- Seed Default Admin User (username: admin, pass: Admin@CloudOS2026!)
-- bcrypt hash of 'Admin@CloudOS2026!' with 12 rounds
INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'admin@cloudos.local',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin'
)
ON CONFLICT (username) DO NOTHING;
