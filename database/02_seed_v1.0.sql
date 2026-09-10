-- ============================================================================
-- AI-BOS (Prism) — Database Seed Data (v1.0)
-- Production-like seed data for local testing, demo, and E2E verification
-- ============================================================================

-- Fixed Tenant ID
DO $$
DECLARE
    v_tenant_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_dept_exec UUID := 'd0000000-0000-0000-0000-000000000001';
    v_dept_eng  UUID := 'd0000000-0000-0000-0000-000000000002';
    v_dept_ops  UUID := 'd0000000-0000-0000-0000-000000000003';
    v_dept_sales UUID := 'd0000000-0000-0000-0000-000000000004';
    
    v_user_owner UUID := 'u0000000-0000-0000-0000-000000000001';
    v_user_head_eng UUID := 'u0000000-0000-0000-0000-000000000002';
    v_user_head_ops UUID := 'u0000000-0000-0000-0000-000000000003';
    v_user_emp1 UUID := 'u0000000-0000-0000-0000-000000000004';
    v_user_emp2 UUID := 'u0000000-0000-0000-0000-000000000005';
    v_user_delegate UUID := 'u0000000-0000-0000-0000-000000000006';
    v_user_auditor UUID := 'u0000000-0000-0000-0000-000000000007';

    v_goal_1 UUID := 'g0000000-0000-0000-0000-000000000001';
    v_goal_2 UUID := 'g0000000-0000-0000-0000-000000000002';
BEGIN
    -- 1. Create Tenant
    INSERT INTO tenants (id, name, subdomain, status)
    VALUES (v_tenant_id, 'Prism Enterprise Inc.', 'prism', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create Departments
    INSERT INTO departments (id, tenant_id, name, code)
    VALUES 
        (v_dept_exec, v_tenant_id, 'Executive Leadership', 'EXEC'),
        (v_dept_eng,  v_tenant_id, 'Engineering & Product', 'ENG'),
        (v_dept_ops,  v_tenant_id, 'Operations & Supply',   'OPS'),
        (v_dept_sales, v_tenant_id, 'Growth & Revenue',      'SALES')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Create Users (Password: Admin@123 hashed)
    INSERT INTO users (id, tenant_id, department_id, email, password_hash, first_name, last_name, role, designation, phone, status, mfa_enabled)
    VALUES
        (v_user_owner, v_tenant_id, v_dept_exec, 'owner@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'David', 'Vance', 'owner', 'CEO & Founder', '+1-555-0101', 'active', true),
        (v_user_head_eng, v_tenant_id, v_dept_eng, 'elena@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'Elena', 'Rostova', 'dept_head', 'VP of Engineering', '+1-555-0102', 'active', true),
        (v_user_head_ops, v_tenant_id, v_dept_ops, 'marcus@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'Marcus', 'Chen', 'dept_head', 'Director of Operations', '+1-555-0103', 'active', false),
        (v_user_emp1, v_tenant_id, v_dept_eng, 'alex@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'Alex', 'Rivera', 'employee', 'Senior Backend Engineer', '+1-555-0104', 'active', false),
        (v_user_emp2, v_tenant_id, v_dept_eng, 'sarah@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'Sarah', 'Kim', 'employee', 'Full Stack Engineer', '+1-555-0105', 'active', false),
        (v_user_delegate, v_tenant_id, v_dept_ops, 'jordan@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'Jordan', 'Taylor', 'delegate', 'Operations Lead / Delegate', '+1-555-0106', 'active', true),
        (v_user_auditor, v_tenant_id, v_dept_exec, 'auditor@prism.ai', '$2a$12$K8yR2s5M4zFjM.QGf1K8leY5jWpW1zY8/j1dY7J4CjU9/k8qV9b7q', 'Rachel', 'Green', 'auditor', 'Compliance Auditor', '+1-555-0107', 'active', false)
    ON CONFLICT (id) DO NOTHING;

    -- Update department heads and delegates
    UPDATE departments SET head_user_id = v_user_head_eng, delegate_user_id = v_user_emp1 WHERE id = v_dept_eng;
    UPDATE departments SET head_user_id = v_user_head_ops, delegate_user_id = v_user_delegate WHERE id = v_dept_ops;

    -- 4. Create Goals
    INSERT INTO goals (id, tenant_id, title, description, target_metric, target_value, current_value, unit, start_date, target_date, status, created_by)
    VALUES
        (v_goal_1, v_tenant_id, 'Scale Core Architecture & 99.9% Uptime', 'Execute infrastructure hardening and performance optimization', 'Uptime %', 99.9, 99.7, '%', '2026-09-01', '2026-12-31', 'active', v_user_owner),
        (v_goal_2, v_tenant_id, 'Deliver AI-BOS Phase 1 MVP Release', 'Achieve full functional signoff on all 16 FRD core modules', 'Modules Delivered', 16, 12, 'modules', '2026-09-14', '2027-03-28', 'active', v_user_owner)
    ON CONFLICT (id) DO NOTHING;

    -- 5. Create Department Priorities
    INSERT INTO department_priorities (id, tenant_id, department_id, goal_id, title, rank_order, weight)
    VALUES
        ('p0000000-0000-0000-0000-000000000001', v_tenant_id, v_dept_eng, v_goal_2, 'Deploy Zero-Leakage RLS Multi-Tenant Schema', 1, 1.5),
        ('p0000000-0000-0000-0000-000000000002', v_tenant_id, v_dept_eng, v_goal_1, 'Complete API Gateway & Rate Limiting Module', 2, 1.0),
        ('p0000000-0000-0000-0000-000000000003', v_tenant_id, v_dept_ops, v_goal_1, 'Automate Continuity Handover Fallback Matrix', 1, 1.2)
    ON CONFLICT (id) DO NOTHING;

    -- 6. Create Initial Tasks
    INSERT INTO tasks (id, tenant_id, department_id, priority_id, title, description, assigned_to, created_by, approver_id, priority, status, due_date, proof_required, estimated_hours)
    VALUES
        ('t0000000-0000-0000-0000-000000000001', v_tenant_id, v_dept_eng, 'p0000000-0000-0000-0000-000000000001', 'Implement PostgreSQL RLS Policies & Tenant Context', 'Configure tenant isolation across all tables with SET LOCAL app.current_tenant', v_user_emp1, v_user_head_eng, v_user_head_eng, 'critical', 'completed', NOW() - INTERVAL '1 day', true, 6.0),
        ('t0000000-0000-0000-0000-000000000002', v_tenant_id, v_dept_eng, 'p0000000-0000-0000-0000-000000000001', 'Build Append-Only Audit Logging Middleware', 'Ensure immutable audit recording for all mutating REST actions', v_user_emp2, v_user_head_eng, v_user_head_eng, 'high', 'proof_submitted', NOW() + INTERVAL '2 hours', true, 5.0),
        ('t0000000-0000-0000-0000-000000000003', v_tenant_id, v_dept_ops, 'p0000000-0000-0000-0000-000000000003', 'Review Q3 Operational Continuity Checklist', 'Validate auto-reassignment rules when department head takes leave', v_user_delegate, v_user_head_ops, v_user_head_ops, 'medium', 'in_progress', NOW() + INTERVAL '1 day', true, 4.0)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Add Audit Log Sample
    INSERT INTO audit_log (tenant_id, actor_id, actor_role, action, resource_type, resource_id, ip_address, payload)
    VALUES
        (v_tenant_id, v_user_owner, 'owner', 'TENANT_INITIALIZED', 'tenant', v_tenant_id::text, '127.0.0.1', '{"status":"active","modules_enabled":16}'::jsonb),
        (v_tenant_id, v_user_head_eng, 'dept_head', 'TASK_CREATED', 'task', 't0000000-0000-0000-0000-000000000001', '127.0.0.1', '{"title":"Implement PostgreSQL RLS Policies"}'::jsonb);
END $$;
