# 14 — Testing Strategy: Nexora Prism

## 1. Testing Layers

### A. Unit Testing
- Test React state context logic (`AuthContext`, `ThemeContext`, `AppContext`).
- Verify task status transitions and approval sign-off handlers.

### B. Integration Testing
- Test Express REST API routes (`/api/auth/login`, `/api/team`, `/api/health`).

### C. Visual & Responsive Verification
- Verify layout consistency across mobile (375px), tablet (768px), and desktop (1440px+).
- Compare rendered UI against live target site screenshots.
