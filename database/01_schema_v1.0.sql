-- ============================================================================
-- AI-BOS (Prism) — Database Schema Definition (v1.0)
-- PostgreSQL with Row-Level Security (RLS) & Immutable Audit Logging
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TENANTS & CRYPTO KEYS (Multi-tenancy & DPDP Compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    settings JSONB NOT NULL DEFAULT '{
        "default_timezone": "Asia/Kolkata",
        "mfa_required_roles": ["owner", "delegate"],
        "max_proof_file_size_mb": 25,
        "auto_escalation_hours": 24,
        "scoring_weights": {
            "task_completion": 0.40,
            "speed": 0.20,
            "discipline": 0.20,
            "attendance": 0.20
        }
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-tenant encryption keys for DPDP crypto-shredding
CREATE TABLE IF NOT EXISTS crypto_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key_version INT NOT NULL DEFAULT 1,
    encrypted_key_material TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'shredded', 'rotated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shredded_at TIMESTAMPTZ,
    UNIQUE(tenant_id, key_version)
);

-- ============================================================================
-- 2. DEPARTMENTS & USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    head_user_id UUID,
    delegate_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'dept_head', 'employee', 'delegate', 'auditor')),
    designation VARCHAR(150),
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'deleted')),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Circular foreign key on departments(head_user_id, delegate_user_id)
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_dept_delegate FOREIGN KEY (delegate_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 3. GOALS & DEPARTMENT PRIORITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_metric VARCHAR(100),
    target_value NUMERIC(12, 2),
    current_value NUMERIC(12, 2) DEFAULT 0.00,
    unit VARCHAR(50),
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'at_risk', 'missed')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS department_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    rank_order INT NOT NULL DEFAULT 1,
    weight NUMERIC(5, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. TASKS, PROOFS & TASK HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    priority_id UUID REFERENCES department_priorities(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'proof_submitted', 'approved', 'rejected', 'completed', 'blocked')),
    due_date TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    proof_required BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_hours NUMERIC(6, 2),
    actual_hours NUMERIC(6, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('link', 'file', 'metrics_snapshot', 'code_pr', 'document')),
    proof_url TEXT,
    file_path TEXT,
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    notes TEXT,
    ai_validation_status VARCHAR(50) DEFAULT 'unverified' CHECK (ai_validation_status IN ('unverified', 'valid', 'suspicious', 'incomplete')),
    ai_validation_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'accepted', 'changes_requested'))
);

CREATE TABLE IF NOT EXISTS task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. LEAVE & CONTINUITY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    handover_user_id UUID REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    continuity_activated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS continuity_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    leave_request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    original_assignee_id UUID NOT NULL REFERENCES users(id),
    temporary_assignee_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'completed')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_at TIMESTAMPTZ
);

-- ============================================================================
-- 6. SCORING & PERFORMANCE METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id),
    score_date DATE NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
    task_completion_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    speed_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    discipline_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    attendance_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tasks_assigned INT NOT NULL DEFAULT 0,
    tasks_completed INT NOT NULL DEFAULT 0,
    proofs_approved INT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, score_date)
);

-- ============================================================================
-- 7. SYSTEM EXCEPTIONS & BOTTLENECKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id),
    exception_type VARCHAR(100) NOT NULL CHECK (exception_type IN ('missed_deadline', 'approval_stalled', 'unassigned_high_priority', 'continuity_gap', 'low_discipline')),
    severity VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. IMMUTABLE AUDIT LOG (APPEND-ONLY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent UPDATE and DELETE on audit_log
CREATE OR REPLACE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- ============================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE continuity_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies based on current_setting('app.current_tenant', true)
CREATE POLICY tenant_isolation_departments ON departments
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_goals ON goals
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_department_priorities ON department_priorities
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_tasks ON tasks
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_task_proofs ON task_proofs
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_task_history ON task_history
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_leave_requests ON leave_requests
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_continuity_assignments ON continuity_assignments
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_daily_scores ON daily_scores
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_system_exceptions ON system_exceptions
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE POLICY tenant_isolation_audit_log ON audit_log
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);
