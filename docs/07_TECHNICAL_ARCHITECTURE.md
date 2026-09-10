# 07 — Technical Architecture Document: Nexora Prism

## 1. System Architecture Diagram

```text
[ React 19 Frontend SPA ]
          │
          ├── LocalStorage State Persistence (prism_auth_user, prism_theme)
          ├── React Context API (AuthContext, ThemeContext, AppContext)
          │
          ▼
[ Express TypeScript REST API Service ]
          │
          ├── Zod Request Validation
          ├── JWT Authentication Middleware
          │
          ▼
[ PostgreSQL / SQLite Relational Database ]
```

## 2. Key Architecture Decisions
1. **React 19 + TypeScript + Vite**: Provides sub-second HMR, strict type safety, and fast production bundle builds.
2. **Tailwind CSS + Glassmorphism Tokens**: Clean utility-first styling with custom CSS variables for backdrop-blur panels and theme switching.
3. **Decoupled REST API Service**: Express backend with structured JSON error responses, Zod validation, and SQL schema integration.
