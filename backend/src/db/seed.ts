import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function seedDatabase() {
  console.log('🌱 Seeding Prism database...');

  const tenantId = 'a0000000-0000-0000-0000-000000000001';
  const deptExec = 'd0000000-0000-0000-0000-000000000001';
  const deptEng = 'd0000000-0000-0000-0000-000000000002';
  const deptOps = 'd0000000-0000-0000-0000-000000000003';
  const deptSales = 'd0000000-0000-0000-0000-000000000004';

  const userOwner = 'u0000000-0000-0000-0000-000000000001';
  const userHeadEng = 'u0000000-0000-0000-0000-000000000002';
  const userHeadOps = 'u0000000-0000-0000-0000-000000000003';
  const userEmp1 = 'u0000000-0000-0000-0000-000000000004';
  const userEmp2 = 'u0000000-0000-0000-0000-000000000005';
  const userDelegate = 'u0000000-0000-0000-0000-000000000006';
  const userAuditor = 'u0000000-0000-0000-0000-000000000007';

  // 1. Create or upsert Tenant
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: 'Prism Enterprise Inc.',
      subdomain: 'prism',
      status: 'active',
      settings: JSON.stringify({
        default_timezone: 'Asia/Kolkata',
        mfa_required_roles: ['owner', 'delegate'],
        max_proof_file_size_mb: 25,
        auto_escalation_hours: 24,
        scoring_weights: {
          task_completion: 0.4,
          speed: 0.2,
          discipline: 0.2,
          attendance: 0.2,
        },
      }),
    },
  });

  // 2. Create CryptoKey
  await prisma.cryptoKey.upsert({
    where: { tenantId_keyVersion: { tenantId, keyVersion: 1 } },
    update: {},
    create: {
      tenantId,
      keyVersion: 1,
      encryptedKeyMaterial: 'enc_key_v1_00000000000000000000000000000000000000000000000000000000',
      status: 'active',
    },
  });

  // 3. Create Departments
  const depts = [
    { id: deptExec, tenantId, name: 'Executive Leadership', code: 'EXEC', headUserId: userOwner },
    { id: deptEng, tenantId, name: 'Engineering & Product', code: 'ENG', headUserId: userHeadEng, delegateUserId: userEmp1 },
    { id: deptOps, tenantId, name: 'Operations & Continuity', code: 'OPS', headUserId: userHeadOps, delegateUserId: userDelegate },
    { id: deptSales, tenantId, name: 'Growth & Partnerships', code: 'SALES' },
  ];

  for (const dept of depts) {
    await prisma.department.upsert({
      where: { id: dept.id },
      update: {},
      create: dept,
    });
  }

  // 4. Create Users with bcrypt password hash for "Admin@123"
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const users = [
    { id: userOwner, tenantId, departmentId: deptExec, email: 'owner@prism.ai', passwordHash, firstName: 'David', lastName: 'Vance', role: 'owner', designation: 'CEO & Founder', phone: '+1-555-0101', status: 'active', mfaEnabled: true, failedLoginAttempts: 0 },
    { id: userHeadEng, tenantId, departmentId: deptEng, email: 'elena@prism.ai', passwordHash, firstName: 'Elena', lastName: 'Rostova', role: 'dept_head', designation: 'VP of Engineering', phone: '+1-555-0102', status: 'active', mfaEnabled: true, failedLoginAttempts: 0 },
    { id: userHeadOps, tenantId, departmentId: deptOps, email: 'marcus@prism.ai', passwordHash, firstName: 'Marcus', lastName: 'Chen', role: 'dept_head', designation: 'Director of Operations', phone: '+1-555-0103', status: 'active', mfaEnabled: false, failedLoginAttempts: 0 },
    { id: userEmp1, tenantId, departmentId: deptEng, email: 'alex@prism.ai', passwordHash, firstName: 'Alex', lastName: 'Rivera', role: 'employee', designation: 'Senior Backend Engineer', phone: '+1-555-0104', status: 'active', mfaEnabled: false, failedLoginAttempts: 0 },
    { id: userEmp2, tenantId, departmentId: deptEng, email: 'sarah@prism.ai', passwordHash, firstName: 'Sarah', lastName: 'Kim', role: 'employee', designation: 'Full Stack Engineer', phone: '+1-555-0105', status: 'active', mfaEnabled: false, failedLoginAttempts: 0 },
    { id: userDelegate, tenantId, departmentId: deptOps, email: 'jordan@prism.ai', passwordHash, firstName: 'Jordan', lastName: 'Taylor', role: 'delegate', designation: 'Operations Lead / Delegate', phone: '+1-555-0106', status: 'active', mfaEnabled: true, failedLoginAttempts: 0 },
    { id: userAuditor, tenantId, departmentId: deptExec, email: 'auditor@prism.ai', passwordHash, firstName: 'Rachel', lastName: 'Green', role: 'auditor', designation: 'Compliance & Audit Lead', phone: '+1-555-0107', status: 'active', mfaEnabled: false, failedLoginAttempts: 0 },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { passwordHash },
      create: user,
    });
  }

  // 5. Goals
  const goal1 = 'g0000000-0000-0000-0000-000000000001';
  const goal2 = 'g0000000-0000-0000-0000-000000000002';

  await prisma.goal.upsert({
    where: { id: goal1 },
    update: {},
    create: {
      id: goal1,
      tenantId,
      title: 'Scale Core Architecture & 99.9% Uptime',
      description: 'Zero single point of failure and fast disaster recovery',
      targetMetric: 'Uptime %',
      targetValue: 99.9,
      currentValue: 99.7,
      unit: '%',
      startDate: '2026-09-01',
      targetDate: '2026-12-31',
      status: 'active',
      createdBy: userOwner,
    },
  });

  await prisma.goal.upsert({
    where: { id: goal2 },
    update: {},
    create: {
      id: goal2,
      tenantId,
      title: 'Deliver AI-BOS Phase 1 MVP Release',
      description: 'Functional signoff on 16 core business modules',
      targetMetric: 'Modules Delivered',
      targetValue: 16,
      currentValue: 12,
      unit: 'modules',
      startDate: '2026-09-14',
      targetDate: '2027-03-28',
      status: 'active',
      createdBy: userOwner,
    },
  });

  // 6. Department Priorities
  const p1 = 'p0000000-0000-0000-0000-000000000001';
  const p2 = 'p0000000-0000-0000-0000-000000000002';
  const p3 = 'p0000000-0000-0000-0000-000000000003';

  await prisma.departmentPriority.upsert({
    where: { id: p1 },
    update: {},
    create: { id: p1, tenantId, departmentId: deptEng, goalId: goal2, title: 'Deploy Multi-Tenant PostgreSQL RLS & Audit Layer', rankOrder: 1, weight: 1.5 },
  });
  await prisma.departmentPriority.upsert({
    where: { id: p2 },
    update: {},
    create: { id: p2, tenantId, departmentId: deptEng, goalId: goal1, title: 'Build High-Throughput Task & Proof Verification Engine', rankOrder: 2, weight: 1.0 },
  });
  await prisma.departmentPriority.upsert({
    where: { id: p3 },
    update: {},
    create: { id: p3, tenantId, departmentId: deptOps, goalId: goal1, title: 'Zero-Disruption Continuity Matrix for Leave Management', rankOrder: 1, weight: 1.2 },
  });

  // 7. Tasks
  const t1 = 't0000000-0000-0000-0000-000000000001';
  const t2 = 't0000000-0000-0000-0000-000000000002';
  const t3 = 't0000000-0000-0000-0000-000000000003';
  const t4 = 't0000000-0000-0000-0000-000000000004';

  await prisma.task.upsert({
    where: { id: t1 },
    update: {},
    create: {
      id: t1,
      tenantId,
      departmentId: deptEng,
      priorityId: p1,
      title: 'Implement PostgreSQL RLS Policies & Tenant Context',
      description: 'Configure tenant isolation across all tables with SET LOCAL app.current_tenant',
      assignedTo: userEmp1,
      createdBy: userHeadEng,
      approverId: userHeadEng,
      priority: 'critical',
      status: 'completed',
      dueDate: new Date(Date.now() - 86400000),
      startedAt: new Date(Date.now() - 2 * 86400000),
      submittedAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 40000000),
      proofRequired: true,
      estimatedHours: 6.0,
      actualHours: 5.5,
    },
  });

  await prisma.task.upsert({
    where: { id: t2 },
    update: {},
    create: {
      id: t2,
      tenantId,
      departmentId: deptEng,
      priorityId: p1,
      title: 'Build Append-Only Audit Logging Middleware',
      description: 'Ensure immutable audit recording for all mutating REST actions with IP & payload capture',
      assignedTo: userEmp2,
      createdBy: userHeadEng,
      approverId: userHeadEng,
      priority: 'high',
      status: 'proof_submitted',
      dueDate: new Date(Date.now() + 7200000),
      startedAt: new Date(Date.now() - 14400000),
      submittedAt: new Date(Date.now() - 3600000),
      proofRequired: true,
      estimatedHours: 5.0,
      actualHours: 4.8,
    },
  });

  await prisma.task.upsert({
    where: { id: t3 },
    update: {},
    create: {
      id: t3,
      tenantId,
      departmentId: deptOps,
      priorityId: p3,
      title: 'Operational Continuity Handover Protocol',
      description: 'Auto-reassign pending checkpoints and open tasks whenever a manager goes on leave',
      assignedTo: userDelegate,
      createdBy: userHeadOps,
      approverId: userHeadOps,
      priority: 'medium',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 86400000),
      startedAt: new Date(Date.now() - 7200000),
      proofRequired: true,
      estimatedHours: 4.0,
    },
  });

  await prisma.task.upsert({
    where: { id: t4 },
    update: {},
    create: {
      id: t4,
      tenantId,
      departmentId: deptEng,
      priorityId: p2,
      title: 'Real-time WebSocket Push Notification Bridge',
      description: 'Stream live updates for task approvals, escalations, and system exceptions',
      assignedTo: userEmp1,
      createdBy: userHeadEng,
      approverId: userHeadEng,
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 3 * 86400000),
      proofRequired: true,
      estimatedHours: 8.0,
    },
  });

  // 8. Task Proofs
  await prisma.taskProof.upsert({
    where: { id: 'pf-001' },
    update: {},
    create: {
      id: 'pf-001',
      tenantId,
      taskId: t1,
      submittedBy: userEmp1,
      proofType: 'code_pr',
      proofUrl: 'https://github.com/prism-org/ai-bos/pull/104',
      notes: 'Merged migration 01_schema_v1.0.sql with test suite verifying zero-cross-tenant leakage.',
      aiValidationStatus: 'valid',
      aiValidationNotes: 'All RLS test cases passed with 100% tenant separation.',
      submittedAt: new Date(Date.now() - 86400000),
      reviewedBy: userHeadEng,
      reviewedAt: new Date(Date.now() - 40000000),
      approvalStatus: 'accepted',
    },
  });

  await prisma.taskProof.upsert({
    where: { id: 'pf-002' },
    update: {},
    create: {
      id: 'pf-002',
      tenantId,
      taskId: t2,
      submittedBy: userEmp2,
      proofType: 'link',
      proofUrl: 'https://staging.prism.ai/audit-stream/verify',
      notes: 'Deployed audit log middleware with append-only verification and HMAC integrity checks.',
      aiValidationStatus: 'valid',
      aiValidationNotes: 'Audit log integrity confirmed. No UPDATE/DELETE pathways detected.',
      submittedAt: new Date(Date.now() - 3600000),
      approvalStatus: 'pending',
    },
  });

  // 9. Leave Requests
  const today = new Date();
  const d1 = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
  const d2 = new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0];

  await prisma.leaveRequest.upsert({
    where: { id: 'lv-001' },
    update: {},
    create: {
      id: 'lv-001',
      tenantId,
      userId: userHeadOps,
      handoverUserId: userDelegate,
      startDate: d1,
      endDate: d2,
      reason: 'Annual family leave — delegate has full signing authority.',
      status: 'approved',
      approvedBy: userOwner,
      continuityActivated: true,
    },
  });

  // 10. Daily Scores
  const todayStr = today.toISOString().split('T')[0];
  await prisma.dailyScore.upsert({
    where: { tenantId_userId_scoreDate: { tenantId, userId: userEmp1, scoreDate: todayStr } },
    update: {},
    create: { id: 'sc-001', tenantId, userId: userEmp1, departmentId: deptEng, scoreDate: todayStr, totalScore: 94.5, taskCompletionScore: 95.0, speedScore: 92.0, disciplineScore: 96.0, attendanceScore: 95.0, tasksAssigned: 3, tasksCompleted: 2, proofsApproved: 2 },
  });
  await prisma.dailyScore.upsert({
    where: { tenantId_userId_scoreDate: { tenantId, userId: userEmp2, scoreDate: todayStr } },
    update: {},
    create: { id: 'sc-002', tenantId, userId: userEmp2, departmentId: deptEng, scoreDate: todayStr, totalScore: 91.0, taskCompletionScore: 90.0, speedScore: 88.0, disciplineScore: 94.0, attendanceScore: 92.0, tasksAssigned: 2, tasksCompleted: 1, proofsApproved: 1 },
  });
  await prisma.dailyScore.upsert({
    where: { tenantId_userId_scoreDate: { tenantId, userId: userDelegate, scoreDate: todayStr } },
    update: {},
    create: { id: 'sc-003', tenantId, userId: userDelegate, departmentId: deptOps, scoreDate: todayStr, totalScore: 96.0, taskCompletionScore: 98.0, speedScore: 95.0, disciplineScore: 95.0, attendanceScore: 96.0, tasksAssigned: 2, tasksCompleted: 2, proofsApproved: 2 },
  });

  // 11. System Exceptions
  await prisma.systemException.upsert({
    where: { id: 'ex-001' },
    update: {},
    create: {
      id: 'ex-001',
      tenantId,
      departmentId: deptEng,
      taskId: t2,
      exceptionType: 'approval_stalled',
      severity: 'high',
      title: 'Task Proof Awaiting Review > 2 Hours',
      details: 'Audit logging middleware proof submitted by Sarah Kim requires Dept Head signoff.',
      status: 'open',
    },
  });

  // 12. Audit Logs
  await prisma.auditLog.upsert({
    where: { id: 'aud-001' },
    update: {},
    create: {
      id: 'aud-001',
      tenantId,
      actorId: userOwner,
      actorRole: 'owner',
      action: 'TENANT_PROVISIONED',
      resourceType: 'tenant',
      resourceId: tenantId,
      ipAddress: '127.0.0.1',
      userAgent: 'Prism-Web-Client/1.0',
      payload: JSON.stringify({ tenantName: 'Prism Enterprise Inc.', domain: 'prism.ai' }),
    },
  });

  console.log('✅ Prism database seeded successfully with all initial records!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
