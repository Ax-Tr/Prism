# 08 — API Specification: Nexora Prism

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Request Body**: `{ "email": "ceo@nexora.com", "password": "optional" }`
- **Response**:
```json
{
  "token": "mock_jwt_token_prism_2026",
  "user": {
    "id": "u1",
    "name": "Aarav Sharma",
    "email": "ceo@nexora.com",
    "role": "CEO",
    "department": "Executive",
    "title": "Chief Executive Officer"
  }
}
```

## 2. Team & Workspace Endpoints

### `GET /api/team`
- **Response**: Array of employee objects containing `id`, `name`, `role`, `bandwidthLoad`, `focusArea`, and `skills`.

### `GET /api/health`
- **Response**: `{ "status": "ok", "service": "Nexora Prism Core API", "timestamp": "2026-09-08T19:00:00.000Z" }`
