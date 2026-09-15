# 16 — Developer Setup Guide: Nexora Prism

## 1. Quickstart Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Step 1: Install Frontend Dependencies
```bash
cd e:/Prism/frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Step 3: Install Backend Dependencies & Run API
```bash
cd e:/Prism/backend
npm install
npm run dev
```
Express API will listen on `http://localhost:5000`.

---

## 2. Branching Strategy (GitHub Flow)

All development follows **GitHub Flow**:
- **`main`** is always stable, tested, and deployable.
- Never push directly to `main`.
- Create short-lived branches prefixed by type:
  - `feature/*` — e.g. `feature/add-login`
  - `fix/*` — e.g. `fix/invoice-bug`
  - `refactor/*` — e.g. `refactor/api-client`
  - `docs/*` — e.g. `docs/api-guide`
- Open a Pull Request (PR) to `main`, wait for CI checks to pass, review, and merge.
- Refer to [CONTRIBUTING.md](../CONTRIBUTING.md) for full branch naming conventions and PR guidelines.
