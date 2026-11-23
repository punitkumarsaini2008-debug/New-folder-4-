-- ==============================================================================
-- Multi-User Linux Cloud Desktop - PostgreSQL Database Schema
-- Version: 2.1.0 - Authentication, Roles, Labs & Admin Management
-- ==============================================================================

-- Enable UUID extension for cryptographic session IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Supports Student and Administrator Roles)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'user', 'admin', 'moderator')),
    points INT NOT NULL DEFAULT 0,
    disk_quota_mb INT NOT NULL DEFAULT 5120, -- 5 GB default persistent storage
    max_active_containers INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 2. Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reset_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets (reset_token);

-- 3. Cybersecurity Challenges & Labs Table
CREATE TABLE IF NOT EXISTS challenges (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    objective TEXT NOT NULL,
    hint TEXT,
    command TEXT,
    exercise TEXT,
    expected_output TEXT,
    question TEXT NOT NULL,
    expected_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges (category);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges (difficulty);

-- 4. User Challenge Progress & Submissions Table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id VARCHAR(64) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('started', 'completed', 'failed')),
    attempts INT NOT NULL DEFAULT 1,
    user_answer TEXT,
    points_awarded INT NOT NULL DEFAULT 10,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_challenge_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge ON user_challenge_progress (challenge_id);

-- 5. User Sessions & Container Allocations Table
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

-- 6. Session Queue (when server reaches max capacity)
CREATE TABLE IF NOT EXISTS session_queue (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    os_id VARCHAR(50) NOT NULL,
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON session_queue (status, queued_at);

-- 7. Audit & Security Activity Logs
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

-- 8. System Configuration & Resource Limits
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

-- Seed Default Admin User (username: admin, pass: Admin@123456)
INSERT INTO users (username, email, password_hash, role, points)
VALUES (
    'admin',
    'admin@parrotcloud.io',
    '$2a$10$fcAtm33KHf27eufHx1DOheY8DpvYdb28ME7egRal6aSEmhAA8T9mK',
    'admin',
    500
)
ON CONFLICT (username) DO NOTHING;

-- Seed Default Student User (username: student, pass: Student@123456)
INSERT INTO users (username, email, password_hash, role, points)
VALUES (
    'student',
    'student@parrotcloud.io',
    '$2a$10$Rk7MSdN6ZbhfKwXFGjXMgOF31vKha9A0dYiBI6gy5nO2mNXiZDxj.',
    'student',
    100
)
ON CONFLICT (username) DO NOTHING;

-- Seed User's Mandatory Lab Example
INSERT INTO challenges (
    id, title, category, difficulty, objective, hint, command, exercise, expected_output, question, expected_answer, explanation, points
)
VALUES (
    'lab-os-find',
    'Find the Linux Operating System',
    'Linux Fundamentals',
    'Beginner',
    'Learn how Linux identifies operating system distribution details, release names, and kernel configurations.',
    'Look inside the /etc directory for standard release files.',
    'cat /etc/os-release',
    'Execute the command ''cat /etc/os-release'' in the interactive terminal to inspect release information.',
    'NAME="Parrot Security OS"' || E'\n' || 'VERSION="6.0 (Lrz)"' || E'\n' || 'ID=parrot' || E'\n' || 'ID_LIKE=debian' || E'\n' || 'PRETTY_NAME="Parrot Security 6.0"',
    'Which Linux command displays operating system information?',
    'cat /etc/os-release',
    'The /etc/os-release file is the standard configuration file used by modern systemd Linux distributions (Parrot, Kali, Ubuntu, Mint, Fedora) to declare operating system identification metadata.',
    10
)
ON CONFLICT (id) DO NOTHING;
