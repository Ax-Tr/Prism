# 06 — Functional Requirements Overview: AI-BOS

**Master FRD Specification:** [`FINAL_FRD_v1.3_GLOBAL_EXPERT.md`](file:///e:/Prism/docs/FINAL_FRD_v1.3_GLOBAL_EXPERT.md)

## 1. Summary of Functional Modules
- **Goal Configuration (`FR-GOAL`)**: Owner-set revenue targets & department priority weightings.
- **Universal Task Engine (`FR-TASK`)**: Universal task lifecycle (Created $\rightarrow$ Assigned $\rightarrow$ Accepted $\rightarrow$ Proof Submitted $\rightarrow$ Completed). Leads are tasks.
- **Proof Verification (`FR-PROOF`)**: Proof required for completion credit. Anomaly flagging attached to suspicious uploads.
- **Mechanical Scoring (`FR-SCORE`)**: Task Completion % and SLA Adherence %. Formally audited score dispute path.
- **Exception & Continuity Engine (`FR-EXC`, `FR-CONT`)**: Zero task drop-off during employee leave; automatic backup selection.
- **Security & Privacy (`FR-SEC`, `FR-PRIV`)**: Mandatory OTP MFA for Owner/Delegate roles, strict multi-tenant isolation, and India DPDP Act 2023 compliance.
