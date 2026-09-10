# 10 — Security Specification: Nexora Prism

## 1. Authentication & Session Security
- OAuth 2.1 PKCE bearer token enforcement for API endpoints.
- Role-based authorization (`CEO`, `DEPT_HEAD`, `MANAGER`, `EMPLOYEE`).

## 2. Defensive Controls
- XSS Protection: React JSX auto-escaping for DOM nodes.
- CSRF Protection: SameSite cookie attributes and authorization headers.
- Input Validation: Strict Zod schema parsing on API request payloads.
