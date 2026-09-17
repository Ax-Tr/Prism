import { Router, Response } from 'express';
import fs from 'fs';
import { prisma } from '../../db/prisma';
import { logAudit } from '../../db/audit';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { storageService, proofUpload } from '../../services/storageService';

export const proofsRouter = Router();

// ==========================================
// 1. GET /api/v1/proofs/queue — Proof Review Queue (PRD §12 FR-041 S6-09)
// ==========================================
proofsRouter.get('/queue', authMiddleware, requireRoles(['owner', 'super_admin', 'dept_head', 'delegate', 'manager', 'auditor']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { departmentId, approvalStatus, proofType, limit = '50', page = '1' } = req.query;

    const where: any = {
      tenantId: req.tenantId!,
    };

    if (approvalStatus && approvalStatus !== 'ALL') {
      where.approvalStatus = approvalStatus as string;
    } else {
      // Default to pending proofs awaiting review
      where.approvalStatus = 'pending';
    }

    if (proofType && proofType !== 'ALL') {
      where.proofType = proofType as string;
    }

    const take = parseInt(limit as string, 10) || 50;
    const skip = (Math.max(1, parseInt(page as string, 10)) - 1) * take;

    const [proofs, total] = await Promise.all([
      prisma.taskProof.findMany({
        where,
        include: {
          task: {
            include: {
              department: { select: { id: true, name: true, code: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take,
      }),
      prisma.taskProof.count({ where }),
    ]);

    // Fetch submitters
    const submitterIds = Array.from(new Set(proofs.map((p) => p.submittedBy)));
    const submitters = await prisma.user.findMany({
      where: { id: { in: submitterIds } },
      select: { id: true, firstName: true, lastName: true, role: true, designation: true },
    });
    const submitterMap = new Map<string, any>(submitters.map((u) => [u.id, u]));

    const enrichedQueue = proofs.map((p) => {
      const submitter = submitterMap.get(p.submittedBy);
      return {
        id: p.id,
        taskId: p.taskId,
        taskTitle: p.task?.title || 'Unknown Task',
        taskPriority: p.task?.priority || 'medium',
        taskStatus: p.task?.status,
        departmentId: p.task?.departmentId,
        departmentName: p.task?.department?.name || 'General Operations',
        departmentCode: p.task?.department?.code || 'OPS',
        submittedBy: p.submittedBy,
        submitterName: submitter ? `${submitter.firstName} ${submitter.lastName}` : 'Anonymous User',
        submitterRole: submitter?.role,
        submitterDesignation: submitter?.designation,
        proofType: p.proofType,
        proofUrl: p.proofUrl,
        fileName: p.fileName,
        fileSizeBytes: p.fileSizeBytes,
        notes: p.notes,
        aiValidationStatus: p.aiValidationStatus,
        aiValidationNotes: p.aiValidationNotes,
        submittedAt: p.submittedAt,
        approvalStatus: p.approvalStatus,
        reviewedBy: p.reviewedBy,
        reviewedAt: p.reviewedAt,
      };
    });

    res.json({
      success: true,
      data: {
        items: enrichedQueue,
        pagination: {
          total,
          page: parseInt(page as string, 10) || 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    console.error('Fetch proof review queue error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve proof review queue' });
  }
});

// ==========================================
// 2. GET /api/v1/proofs/:id — Single Proof Detail with Integrity Verification
// ==========================================
proofsRouter.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const proof = await prisma.taskProof.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId! },
      include: {
        task: {
          include: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!proof) {
      res.status(404).json({ success: false, error: 'Proof artifact not found' });
      return;
    }

    let submitter = null;
    if (proof.submittedBy) {
      submitter = await prisma.user.findUnique({
        where: { id: proof.submittedBy },
        select: { id: true, firstName: true, lastName: true, role: true, designation: true },
      });
    }

    let checksum: string | null = null;
    if (proof.filePath && fs.existsSync(proof.filePath)) {
      checksum = storageService.computeFileChecksum(proof.filePath);
    }

    res.json({
      success: true,
      data: {
        ...proof,
        submitterName: submitter ? `${submitter.firstName} ${submitter.lastName}` : 'Anonymous User',
        submitterRole: submitter?.role,
        submitterDesignation: submitter?.designation,
        fileChecksumSha256: checksum,
        integrityStatus: checksum ? 'VERIFIED_IMMUTABLE' : 'UNATTACHED_FILE',
      },
    });
  } catch (error) {
    console.error('Fetch single proof error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch proof artifact' });
  }
});

// ==========================================
// 3. GET /api/v1/proofs/:id/secure-url — Generate Presigned 15-Minute Download URL (PRD §12 S6-06)
// ==========================================
proofsRouter.get('/:id/secure-url', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const proof = await prisma.taskProof.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId! },
    });

    if (!proof) {
      res.status(404).json({ success: false, error: 'Proof artifact not found' });
      return;
    }

    if (!proof.filePath || !fs.existsSync(proof.filePath)) {
      res.status(404).json({ success: false, error: 'File artifact does not exist on storage system' });
      return;
    }

    const { token, expiresAt } = storageService.generatePresignedToken(proof.id, req.tenantId!, 15);
    const downloadUrl = `/api/v1/proofs/download/${proof.id}?token=${token}`;

    res.json({
      success: true,
      data: {
        proofId: proof.id,
        downloadUrl,
        expiresAt: new Date(expiresAt).toISOString(),
        ttlSeconds: 900,
      },
    });
  } catch (error) {
    console.error('Generate secure URL error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate secure download URL' });
  }
});

// ==========================================
// 4. GET /api/v1/proofs/download/:id — Secure Download Endpoint with Token Verification
// ==========================================
proofsRouter.get('/download/:id', async (req, res) => {
  try {
    const { token } = req.query;
    const proofId = req.params.id;

    if (!token || typeof token !== 'string') {
      res.status(401).json({ success: false, error: 'Valid presigned access token required' });
      return;
    }

    const proof = await prisma.taskProof.findUnique({
      where: { id: proofId },
    });

    if (!proof || !proof.filePath || !fs.existsSync(proof.filePath)) {
      res.status(404).json({ success: false, error: 'Requested file not found' });
      return;
    }

    const isValidToken = storageService.verifyPresignedToken(token, proof.id, proof.tenantId);
    if (!isValidToken) {
      res.status(403).json({ success: false, error: 'Access token expired or cryptographic signature invalid' });
      return;
    }

    res.download(proof.filePath, proof.fileName || 'proof_artifact.bin');
  } catch (error) {
    console.error('Download proof error:', error);
    res.status(500).json({ success: false, error: 'Failed to stream proof file' });
  }
});

// ==========================================
// 5. POST /api/v1/proofs/validate — Match-Rule Pre-Validation Preview (PRD §12 S6-07)
// ==========================================
proofsRouter.post('/validate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { proofType, proofUrl, notes, structuredData, checklist, codeCommit } = req.body;

    const validationResult = storageService.validateProofMatchRules(proofType || 'link', {
      proofUrl,
      notes,
      structuredData,
      checklist,
      codeCommit,
    });

    res.json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    console.error('Validate proof rules error:', error);
    res.status(500).json({ success: false, error: 'Failed to evaluate proof match rules' });
  }
});

// ==========================================
// 6. POST /api/v1/proofs/:id/review — Review & Approve/Reject Proof (PRD §12 S6-03)
// ==========================================
proofsRouter.post('/:id/review', authMiddleware, requireRoles(['owner', 'super_admin', 'dept_head', 'delegate', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { decision, notes } = req.body;

    if (!decision || !['accepted', 'changes_requested', 'rejected'].includes(decision)) {
      res.status(400).json({ success: false, error: "Decision must be 'accepted', 'changes_requested', or 'rejected'" });
      return;
    }

    if (decision !== 'accepted' && (!notes || notes.trim().length < 5)) {
      res.status(400).json({ success: false, error: 'A mandatory review justification of at least 5 characters is required when requesting changes' });
      return;
    }

    const proof = await prisma.taskProof.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId! },
      include: { task: true },
    });

    if (!proof || !proof.task) {
      res.status(404).json({ success: false, error: 'Proof or associated task not found' });
      return;
    }

    const isAccepted = decision === 'accepted';
    const targetProofStatus = isAccepted ? 'accepted' : 'changes_requested';
    const targetTaskStatus = isAccepted ? 'completed' : 'rejected';

    const updatedProof = await prisma.taskProof.update({
      where: { id: proof.id },
      data: {
        approvalStatus: targetProofStatus,
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
        notes: notes ? `${proof.notes || ''} | Reviewer Feedback: ${notes.trim()}` : proof.notes,
      },
    });

    const updatedTask = await prisma.task.update({
      where: { id: proof.taskId },
      data: {
        status: targetTaskStatus,
        completedAt: isAccepted ? new Date() : null,
      },
    });

    // Record transition in task history
    await prisma.taskHistory.create({
      data: {
        tenantId: req.tenantId!,
        taskId: proof.taskId,
        actorId: req.user?.id || 'system',
        previousStatus: proof.task.status,
        newStatus: targetTaskStatus,
        notes: isAccepted
          ? 'Proof approved and verified. Task moved to TRANSMITTED.'
          : `Proof revision requested: ${notes.trim()}. Task moved to REWORK.`,
      },
    });

    // Notify task assignee of review outcome
    if (proof.task.assignedTo && proof.task.assignedTo !== req.user?.id) {
      await prisma.notification.create({
        data: {
          tenantId: req.tenantId!,
          userId: proof.task.assignedTo,
          title: isAccepted ? 'Proof Approved' : 'Proof Revision Requested',
          message: isAccepted
            ? `Your proof for task "${proof.task.title}" has been approved!`
            : `Reviewer requested changes on task "${proof.task.title}": ${notes.trim()}`,
          type: isAccepted ? 'TASK_COMPLETED' : 'TASK_REJECTED',
          resourceId: proof.taskId,
        },
      });
    }

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: isAccepted ? 'PROOF_APPROVED' : 'PROOF_CHANGES_REQUESTED',
      resourceType: 'task_proof',
      resourceId: proof.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { taskId: proof.taskId, decision, notes },
    });

    res.json({
      success: true,
      data: {
        proof: updatedProof,
        task: updatedTask,
        orbitStage: isAccepted ? 'TRANSMITTED' : 'REWORK_REQUIRED',
      },
    });
  } catch (error) {
    console.error('Review proof error:', error);
    res.status(500).json({ success: false, error: 'Failed to review proof' });
  }
});

// ==========================================
// 7. POST /api/v1/proofs/:id/resubmit — Resubmit Proof after Revision Request (PRD §12 S6-05)
// ==========================================
proofsRouter.post('/:id/resubmit', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { proofType, proofUrl, notes, structuredData, checklist, codeCommit } = req.body;

    const proof = await prisma.taskProof.findFirst({
      where: { id: req.params.id as string, tenantId: req.tenantId! },
      include: { task: true },
    });

    if (!proof || !proof.task) {
      res.status(404).json({ success: false, error: 'Proof not found' });
      return;
    }

    // Auto-validate match rules
    const matchRule = storageService.validateProofMatchRules(proofType || proof.proofType, {
      proofUrl,
      structuredData,
      checklist,
      codeCommit,
    });

    const updatedProof = await prisma.taskProof.update({
      where: { id: proof.id },
      data: {
        proofType: proofType || proof.proofType,
        proofUrl: proofUrl || proof.proofUrl,
        notes: notes || proof.notes,
        approvalStatus: 'pending',
        aiValidationStatus: matchRule.status,
        aiValidationNotes: matchRule.notes,
        submittedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
      },
    });

    const updatedTask = await prisma.task.update({
      where: { id: proof.taskId },
      data: {
        status: 'proof_submitted',
        submittedAt: new Date(),
      },
    });

    await prisma.taskHistory.create({
      data: {
        tenantId: req.tenantId!,
        taskId: proof.taskId,
        actorId: req.user?.id || 'system',
        previousStatus: proof.task.status,
        newStatus: 'proof_submitted',
        notes: `Proof resubmitted after revision. Moved to ORBIT for re-verification.`,
      },
    });

    await logAudit({
      tenantId: req.tenantId!,
      actorId: req.user?.id,
      actorRole: req.user?.role,
      action: 'PROOF_RESUBMITTED',
      resourceType: 'task_proof',
      resourceId: proof.id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      payload: { taskId: proof.taskId, proofType: updatedProof.proofType },
    });

    res.json({
      success: true,
      data: {
        proof: updatedProof,
        task: updatedTask,
        orbitStage: 'ORBIT',
      },
    });
  } catch (error) {
    console.error('Resubmit proof error:', error);
    res.status(500).json({ success: false, error: 'Failed to resubmit proof' });
  }
});
