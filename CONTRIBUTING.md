# Contributing to Nexora Prism

## 🌿 Branching Strategy: GitHub Flow

We adhere strictly to **GitHub Flow**, an agile, lightweight, branch-based workflow where `main` is always stable and production-ready.

```
       (feature/add-login)
           ●───●───●  (Pull Request & CI checks)
          /         \
───●─────●───────────●───────────────────► main (Deployable)
```

---

### 1. Core Principles
1. **`main` is always deployable**: Any code merged to `main` must pass all CI tests and builds.
2. **Branch from `main`**: Always create a new, short-lived branch directly from the latest `main`.
3. **Descriptive branch naming**: Use standardized prefixes (see below).
4. **Pull Requests for all changes**: Never commit or push directly to `main`.
5. **Continuous Integration**: Every PR automatically triggers the GitHub Actions CI pipeline.
6. **Review & Merge**: PRs must be reviewed and approved before merging into `main`.
7. **Delete after merge**: Delete feature branches immediately after merging.

---

### 2. Branch Naming Conventions

Use the following naming conventions for branches:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| `feature/` | New features or enhancements | `feature/add-login`, `feature/kpi-tracker` |
| `fix/` | Bug fixes and patches | `fix/invoice-bug`, `fix/navbar-overflow` |
| `refactor/` | Code refactoring without functionality changes | `refactor/api-client`, `refactor/theme-context` |
| `docs/` | Documentation changes only | `docs/update-api-specs`, `docs/readme-fix` |
| `chore/` | Tooling, dependencies, or CI updates | `chore/upgrade-deps`, `chore/ci-caching` |

---

### 3. Step-by-Step Developer Workflow

#### Step 1: Pull Latest Main
```bash
git checkout main
git pull origin main
```

#### Step 2: Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

#### Step 3: Develop & Test Locally
Verify that both frontend and backend build cleanly:
```bash
# In /frontend
npm run build

# In /backend
npx prisma generate
npm run build
```

#### Step 4: Commit Your Changes
Use descriptive commit messages following Conventional Commits (e.g. `feat: ...`, `fix: ...`, `docs: ...`):
```bash
git add .
git commit -m "feat: add user authentication view"
```

#### Step 5: Push Branch & Open Pull Request
```bash
git push -u origin feature/your-feature-name
```
- Go to GitHub and open a **Pull Request (PR)** targeting `main`.
- Fill out the PR template checklist.
- Verify that the **CI Pipeline** passes green (✅).

#### Step 6: Review, Merge & Clean Up
- After review and approval, merge the PR into `main` (Squash & Merge recommended).
- Delete the remote feature branch.
- Switch back to local `main` and pull updates:
  ```bash
  git checkout main
  git pull origin main
  git branch -d feature/your-feature-name
  ```
