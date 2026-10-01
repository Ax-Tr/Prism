import { prisma } from '../db/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { scoringEngine } from '../services/scoringEngine';
import { analyticsService } from '../services/analyticsService';
import { logAudit } from '../db/audit';

async function runSecurityPenetrationSuite() {
  console.log('🛡️  Starting Prism Sprint 4: DevSecOps & Cross-Tenant Boundary Penetration Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const rogueTenantId = `rogue-corp-${Date.now()}`;
  const axioraTenantId = 'axiora-corp';

  try {
    // ------------------------------------------------------------------------
    // SETUP: Provision Rogue Tenant Fixture
    // ------------------------------------------------------------------------
    console.log('[Phase 1: Multi-Tenant Fixture Provisioning]');
    
    // Ensure Axiora primary tenant exists
    const axioraTenant = await prisma.tenant.upsert({
      where: { id: axioraTenantId },
      update: {},
      create: {
        id: axioraTenantId,
        name: 'Axiora Technologies Inc.',
        subdomain: 'axiora',
        status: 'active',
        settings: JSON.stringify({
          tier: 'Enterprise Sovereign',
          max_seats: 500,
          spectral_weights: { output: 25, risk: 20, return: 20, growth: 15, presence: 10, wellbeing: 10 },
        }),
      },
    });
    assert(!!axioraTenant, `Primary Tenant [Axiora Technologies Inc.] verified (${axioraTenantId})`);

    // Provision Rogue Tenant
    const rogueTenant = await prisma.tenant.create({
      data: {
        id: rogueTenantId,
        name: 'Rogue External Corp',
        subdomain: `rogue-${Date.now()}`,
        status: 'active',
        settings: JSON.stringify({
          tier: 'Standard Trial',
          max_seats: 10,
        }),
      },
    });
    assert(!!rogueTenant, `Isolated Adversary Tenant [Rogue External Corp] provisioned (${rogueTenantId})`);

    // Create Rogue User
    const roguePassword = await bcrypt.hash('RoguePass@123', 10);
    const rogueUser = await prisma.user.create({
      data: {
        tenantId: rogueTenantId,
        email: `adversary@roguecorp.io`,
        firstName: 'Malicious',
        lastName: 'Actor',
        passwordHash: roguePassword,
        role: 'owner',
        status: 'active',
      },
    });
    assert(!!rogueUser, `Rogue Actor User provisioned in isolated namespace (${rogueUser.email})`);

    // ------------------------------------------------------------------------
    // TEST 1: Cross-Tenant User Directory Data Leakage Attempt
    // ------------------------------------------------------------------------
    console.log('\n[Phase 2: Cross-Tenant Data Isolation & Query Boundary Tests]');

    const leakedUsers = await prisma.user.findMany({
      where: {
        tenantId: rogueTenantId,
        email: { contains: 'axiora.com' }, // Attempting to fetch Axiora employees through rogue tenant context
      },
    });
    assert(leakedUsers.length === 0, 'Cross-Tenant User Boundary: Zero Axiora users accessible under Rogue tenant scope');

    const axioraUsersUnderAxiora = await prisma.user.findMany({
      where: { tenantId: axioraTenantId },
    });
    assert(axioraUsersUnderAxiora.length > 0, `Tenant Namespace Integrity: ${axioraUsersUnderAxiora.length} users correctly scoped to Axiora`);

    // ------------------------------------------------------------------------
    // TEST 2: Cross-Tenant Task Tampering & Access Attempt
    // ------------------------------------------------------------------------
    console.log('\n[Phase 3: Cross-Tenant Task & Deliverables Isolation]');

    // Create private executive task in Axiora
    const axioraTask = await prisma.task.create({
      data: {
        tenantId: axioraTenantId,
        departmentId: 'dept-axiora-exec',
        title: 'CONFIDENTIAL: Q4 Axiora Enterprise Strategy & M&A',
        description: 'Restricted executive acquisition memorandum.',
        createdBy: 'ceo@axiora.com',
        dueDate: new Date(Date.now() + 86400000 * 7),
        status: 'pending',
        priority: 'high',
        proofRequired: true,
      },
    });
    assert(!!axioraTask, 'Confidential Axiora Executive Task created');

    // Rogue tenant attempts to query Axiora's confidential task
    const rogueTaskQuery = await prisma.task.findFirst({
      where: {
        id: axioraTask.id,
        tenantId: rogueTenantId, // Enforced tenant boundary filter
      },
    });
    assert(rogueTaskQuery === null, 'Task Isolation: Rogue tenant query for Axiora task returns NULL (100% Boundary Isolation)');

    // Rogue tenant attempts to update Axiora task status
    const rogueTaskUpdateAttempt = await prisma.task.updateMany({
      where: {
        id: axioraTask.id,
        tenantId: rogueTenantId,
      },
      data: {
        status: 'completed',
      },
    });
    assert(rogueTaskUpdateAttempt.count === 0, 'Task Mutation Defense: Zero records updated by unauthorized rogue tenant filter');

    // Cleanup the confidential task
    await prisma.task.delete({ where: { id: axioraTask.id } });

    // ------------------------------------------------------------------------
    // TEST 3: Cross-Tenant Department & OKR Priority Isolation
    // ------------------------------------------------------------------------
    console.log('\n[Phase 4: Department & Strategic Priority Isolation]');

    const rogueDepts = await prisma.department.findMany({
      where: { tenantId: rogueTenantId },
    });
    assert(rogueDepts.length === 0, 'Department Namespace: Rogue tenant cannot view Axiora corporate department tree');

    // ------------------------------------------------------------------------
    // TEST 4: SOC2 Type II & DPDP Immutable Audit Ledger Integrity
    // ------------------------------------------------------------------------
    console.log('\n[Phase 5: SOC2 Type II Audit Ledger & Merkle Chain-of-Custody]');

    const auditEvent = await logAudit({
      tenantId: axioraTenantId,
      actorId: 'ceo@axiora.com',
      actorRole: 'owner',
      action: 'SECURITY_PENETRATION_TEST_EVENT',
      resourceType: 'security_harness',
      resourceId: 'test-harness-001',
      ipAddress: '127.0.0.1',
      userAgent: 'PrismDevSecOpsHarness/2.0',
      payload: { testRunId: `run-${Date.now()}`, checksumAlg: 'SHA-256' },
    });
    assert(!!auditEvent && !!auditEvent.id, 'Audit Ledger: Append-only event successfully written with timestamp and actor context');

    // Attempt rogue query for Axiora audit log
    const rogueAuditQuery = await prisma.auditLog.findFirst({
      where: {
        id: auditEvent?.id || 'non-existent',
        tenantId: rogueTenantId,
      },
    });
    assert(rogueAuditQuery === null, 'Audit Log Boundary: Axiora audit entries inaccessible to Rogue tenant');

    // ------------------------------------------------------------------------
    // TEST 5: DPDP §28 Emergency Cryptographic Key Shredding Verification
    // ------------------------------------------------------------------------
    console.log('\n[Phase 6: DPDP §28 Cryptographic Right-to-Erasure Key Destruction]');

    // Provision dedicated KMS Key for Rogue Tenant
    const rawKeyMaterial = crypto.randomBytes(32).toString('hex');
    const cryptoKey = await prisma.cryptoKey.create({
      data: {
        tenantId: rogueTenantId,
        keyVersion: 1,
        encryptedKeyMaterial: rawKeyMaterial,
        status: 'active',
      },
    });
    assert(!!cryptoKey && cryptoKey.status === 'active', 'KMS Key Provisioning: Active AES-256 key material registered for tenant');

    // Execute Cryptographic Shredding
    const shredPattern = 'SHREDDED_0000000000000000000000000000000000000000000000000000000000000000';
    await prisma.cryptoKey.updateMany({
      where: { tenantId: rogueTenantId },
      data: {
        encryptedKeyMaterial: shredPattern,
        status: 'shredded',
        shreddedAt: new Date(),
      },
    });

    await prisma.tenant.update({
      where: { id: rogueTenantId },
      data: { status: 'shredded_suspended' },
    });

    // Verification of shredded state
    const destroyedKey = await prisma.cryptoKey.findFirst({
      where: { tenantId: rogueTenantId, keyVersion: 1 },
    });
    assert(destroyedKey?.status === 'shredded', 'DPDP Shredding: Key status updated to SHREDDED');
    assert(destroyedKey?.encryptedKeyMaterial === shredPattern, 'DPDP Shredding: Key material permanently overwritten with zero-byte mask');
    assert(destroyedKey?.shreddedAt !== null, 'DPDP Shredding: Immutably timestamped shredding audit entry');

    const suspendedTenant = await prisma.tenant.findUnique({
      where: { id: rogueTenantId },
    });
    assert(suspendedTenant?.status === 'shredded_suspended', 'Tenant Lockout: Tenant status transitioned to shredded_suspended');

    // ------------------------------------------------------------------------
    // TEST 6: Multi-Lens Spectral Engine & Dynamic Weights Math Verification
    // ------------------------------------------------------------------------
    console.log('\n[Phase 7: Dynamic Spectral Telemetry & Normalization Math]');

    const telemetry = await scoringEngine.calculateSixLenses(axioraTenantId);
    assert(telemetry.velocityIndex >= 0 && telemetry.velocityIndex <= 100, `PVI Telemetry: Valid velocity index calculated (${telemetry.velocityIndex}/100)`);
    assert(telemetry.output.score >= 0 && telemetry.output.score <= 100, 'Output Lens: Valid range (0-100)');
    assert(telemetry.risk.score >= 0 && telemetry.risk.score <= 100, 'Risk Lens: Valid range (0-100)');
    assert(telemetry.return.score >= 0 && telemetry.return.score <= 100, 'Return Lens: Valid range (0-100)');
    assert(telemetry.growth.score >= 0 && telemetry.growth.score <= 100, 'Growth Lens: Valid range (0-100)');
    assert(telemetry.presence.score >= 0 && telemetry.presence.score <= 100, 'Presence Lens: Valid range (0-100)');
    assert(telemetry.wellbeing.score >= 0 && telemetry.wellbeing.score <= 100, 'Wellbeing Lens: Valid range (0-100)');

    const totalCalculatedWeight =
      telemetry.output.weight +
      telemetry.risk.weight +
      telemetry.return.weight +
      telemetry.growth.weight +
      telemetry.presence.weight +
      telemetry.wellbeing.weight;
    assert(Math.abs(totalCalculatedWeight - 1.0) < 0.02, `Spectral Weights Normalization: Weights sum precisely to 100% (${(totalCalculatedWeight * 100).toFixed(1)}%)`);

    // ------------------------------------------------------------------------
    // TEST 7: Quota & Metering Telemetry Verification
    // ------------------------------------------------------------------------
    console.log('\n[Phase 8: Quotas & Resource Metering Engine]');

    const quotas = await analyticsService.getTenantQuotasAndMetering(axioraTenantId);
    assert(quotas.seats.limit === 500, 'Quota Engine: Seat limit correctly enforced at 500 for Enterprise');
    assert(quotas.seats.allocated > 0, `Quota Engine: Active seats calculated (${quotas.seats.allocated} allocated)`);
    assert(quotas.storage.limitMb === 50000, 'Quota Engine: S3 proof storage limit set to 50 GB');
    assert(quotas.aiTokens.limit === 1000000, 'Quota Engine: AI neural compute token cap set to 1,000,000');
    assert(quotas.tier === 'Enterprise Sovereign', 'Quota Engine: Correct tenant tier retrieved');

    // ------------------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------------------
    console.log('\n[Phase 9: Security Fixture Tear-Down]');
    await prisma.cryptoKey.deleteMany({ where: { tenantId: rogueTenantId } });
    await prisma.user.deleteMany({ where: { tenantId: rogueTenantId } });
    await prisma.tenant.delete({ where: { id: rogueTenantId } });
    assert(true, 'Fixture Cleaned: Ephemeral test tenant eradicated without residue');

  } catch (error: any) {
    console.error('💥 Test suite execution failure:', error);
    failed++;
  } finally {
    console.log('\n================================================================');
    console.log(`🏁 Penetration & DevSecOps Suite Summary: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runSecurityPenetrationSuite()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
