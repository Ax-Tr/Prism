-- Nexora Prism Relational Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'EMPLOYEE',
    department VARCHAR(128) NOT NULL,
    title VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bandwidth_load INT DEFAULT 80,
    focus_area TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DORMANT',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    assignee_id VARCHAR(64) REFERENCES employees(id),
    points INT DEFAULT 3,
    estimated_hours INT DEFAULT 16,
    logged_hours INT DEFAULT 0,
    subtasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kpis (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_val NUMERIC(10,2) NOT NULL,
    current_val NUMERIC(10,2) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    trend VARCHAR(32) DEFAULT 'stable',
    weight INT DEFAULT 20,
    status VARCHAR(32) DEFAULT 'on_track',
    category VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_nodes (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    phase VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'upcoming',
    progress INT DEFAULT 0,
    target_date VARCHAR(64),
    lead_person VARCHAR(128),
    dependencies JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    urgency VARCHAR(32) DEFAULT 'ROUTINE',
    requested_by VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    impact_summary TEXT,
    risk_score INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
