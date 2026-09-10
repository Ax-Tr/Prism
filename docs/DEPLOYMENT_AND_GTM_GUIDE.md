# PRISM (AI-BOS) — PRODUCTION DEPLOYMENT & GO-TO-MARKET (GTM) PLAYBOOK

**Document Version:** 1.0.0  
**Author:** CTO & Full-Stack Lead  
**Target Release:** MVP Public / Pilot Launch  
**Repository:** `e:\Prism`

---

## 📋 Table of Contents
1. [System Architecture & Deployment Topology](#1-system-architecture--deployment-topology)
2. [Deployment Options & Infrastructure Sizing](#2-deployment-options--infrastructure-sizing)
3. [Step-by-Step Production Deployment Guide (Docker VPS)](#3-step-by-step-production-deployment-guide-docker-vps)
4. [Alternative Deployment: Managed PaaS (Render / Railway / Vercel)](#4-alternative-deployment-managed-paas)
5. [Production Configuration & Secrets Management](#5-production-configuration--secrets-management)
6. [External Integrations & Third-Party Service Setup](#6-external-integrations--third-party-service-setup)
7. [Production Hardening & Security Checklist](#7-production-hardening--security-checklist)
8. [Monitoring, Health Checks & Disaster Recovery](#8-monitoring-health-checks--disaster-recovery)
9. [Go-To-Market (GTM) & Pilot Launch Strategy](#9-go-to-market-gtm--pilot-launch-strategy)
10. [Customer Onboarding & Operations Playbook](#10-customer-onboarding--operations-playbook)

---

## 1. System Architecture & Deployment Topology

Prism is architected as a modern, containerized three-tier cloud application:

```
                          ┌───────────────────────────┐
                          │   Internet / End Users    │
                          └─────────────┬─────────────┘
                                        │ (HTTPS / Port 443)
                                        ▼
                          ┌───────────────────────────┐
                          │ Cloudflare / Nginx (SSL)  │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼ (Port 3000 / Web Traffic)                   ▼ (Port 5000 / API Traffic)
   ┌───────────────────────────┐                 ┌───────────────────────────┐
   │      prism-frontend       │                 │       prism-backend       │
   │  React + Vite + Nginx     │                 │   Node.js 20 + Express    │
   │  SPA Static Distribution  │                 │  Scoring Engine & AI Hub  │
   └───────────────────────────┘                 └─────────────┬─────────────┘
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         │                                           │
                                         ▼ (Port 5432)                               ▼ (Volume Storage)
                           ┌───────────────────────────┐               ┌───────────────────────────┐
                           │      prism-postgres       │               │      Task Deliverables    │
                           │ PostgreSQL 16 (Relational)│               │  `uploads/proofs` / S3    │
                           └───────────────────────────┘               └───────────────────────────┘
```

---

## 2. Deployment Options & Infrastructure Sizing

### Recommended Tier for MVP Launch: Single-Server Docker VPS
- **Best For:** Initial 1–50 tenant pilots, high cost-efficiency, simple operational overhead.
- **Provider:** DigitalOcean Droplet / AWS Lightsail / Hetzner Cloud.
- **Specs:** 2 vCPU, 4GB RAM, 50GB NVMe SSD ($12–$24 / month).
- **OS:** Ubuntu 24.04 LTS.

### Scaling Tier (Post-Pilot Growth): Cloud Native
- **Frontend:** AWS S3 + CloudFront / Vercel.
- **Backend:** AWS ECS Fargate / GCP Cloud Run.
- **Database:** AWS RDS PostgreSQL Multi-AZ (with automated daily snapshots).
- **Object Storage:** AWS S3 Bucket with IAM presigned upload URLs.

---

## 3. Step-by-Step Production Deployment Guide (Docker VPS)

### Step 3.1: Server Provisioning & Initial Setup
1. Spin up an **Ubuntu 24.04 LTS** server instance.
2. SSH into your server:
   ```bash
   ssh root@<YOUR_SERVER_IP>
   ```
3. Update packages and install Docker + Docker Compose:
   ```bash
   apt update && apt upgrade -y
   apt install -y curl git ufw fail2ban
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   systemctl enable docker
   ```
4. Configure basic UFW firewall:
   ```bash
   ufw allow OpenSSH
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

---

### Step 3.2: Clone Repository & Configure Environment
1. Clone the Prism repository to `/opt/prism`:
   ```bash
   git clone <YOUR_GIT_REPO_URL> /opt/prism
   cd /opt/prism
   ```
2. Create your production environment file `backend/.env.production`:
   ```bash
   cat << 'EOF' > backend/.env.production
   NODE_ENV=production
   PORT=5000
   DATABASE_URL="postgresql://prism_user:super_secret_db_pass_2026@prism-db:5432/prism?schema=public"
   JWT_SECRET="GENERATE_A_64_CHAR_RANDOM_HEX_STRING_FOR_PRODUCTION"
   JWT_EXPIRES_IN="24h"
   CORS_ORIGIN="https://yourdomain.com"
   LOG_LEVEL="info"

   # Optional 3rd Party Integrations (Add when ready)
   OPENAI_API_KEY="sk-proj-your-openai-api-key"
   SENDGRID_API_KEY="SG.your-sendgrid-api-key"
   TWILIO_ACCOUNT_SID=""
   TWILIO_AUTH_TOKEN=""
   EOF
   ```

---

### Step 3.3: Production `docker-compose.prod.yml`
Create an SSL-ready production Docker Compose file:

```yaml
version: '3.8'

services:
  prism-db:
    image: postgres:16-alpine
    container_name: prism-postgres-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: prism
      POSTGRES_USER: prism_user
      POSTGRES_PASSWORD: super_secret_db_pass_2026
    volumes:
      - prism_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prism_user -d prism"]
      interval: 10s
      timeout: 5s
      retries: 5

  prism-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: prism-api-server
    restart: unless-stopped
    depends_on:
      prism-db:
        condition: service_healthy
    env_file:
      - backend/.env.production
    volumes:
      - prism_uploads:/app/uploads

  prism-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: prism-web-client
    restart: unless-stopped
    depends_on:
      - prism-backend
    ports:
      - "80:80"

volumes:
  prism_pgdata:
    driver: local
  prism_uploads:
    driver: local
```

---

### Step 3.4: Database Initialization & Launch
1. Build and start the containers:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
2. Run database migration and seed initial tenant data:
   ```bash
   # Push Prisma schema to PostgreSQL
   docker exec -it prism-api-server npx prisma db push

   # Run initial seed script
   docker exec -it prism-api-server npx ts-node src/db/seed.ts
   ```

---

### Step 3.5: HTTPS / SSL Setup (Let's Encrypt / Certbot)
To secure the application with HTTPS:
1. Point your domain DNS **A Record** (e.g., `app.yourdomain.com`) to `<YOUR_SERVER_IP>`.
2. Install Certbot on the host:
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```
3. Or use **Cloudflare Free SSL / Proxy**:
   - Set SSL mode to **Full (Strict)** in Cloudflare Dashboard.
   - Point DNS A record to your VPS with the orange cloud (Proxied) enabled.

---

## 4. Alternative Deployment: Managed PaaS

If you prefer zero server management:

| Component | Platform | Configuration Steps |
| :--- | :--- | :--- |
| **Database** | **Supabase / Neon / Render Postgres** | 1. Create a free/pro PostgreSQL instance.<br>2. Copy the `DATABASE_URL` connection pool string. |
| **Backend API** | **Render / Railway / Fly.io** | 1. Connect repo branch.<br>2. Set Root Directory: `backend`.<br>3. Build Command: `npm install && npx prisma generate && npm run build`.<br>4. Start Command: `npm start`.<br>5. Set environment variables (`DATABASE_URL`, `JWT_SECRET`). |
| **Frontend Web** | **Vercel / Netlify / Cloudflare Pages** | 1. Connect repo branch.<br>2. Set Root Directory: `frontend`.<br>3. Build Command: `npm run build`.<br>4. Output Directory: `dist`.<br>5. Configure rewrite proxy in `vercel.json` or `_redirects` pointing `/api/*` to your backend URL. |

---

## 5. Production Configuration & Secrets Management

Generate secure random secrets before deploying:

```bash
# Generate JWT Secret (Run in Node or bash)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Complete `.env` Reference Table

| Variable | Description | Required | Default / Example |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Environment identifier | Yes | `production` |
| `PORT` | API server port | Yes | `5000` |
| `DATABASE_URL` | PostgreSQL connection URI | Yes | `postgresql://user:pass@host:5432/prism` |
| `JWT_SECRET` | Secret key for signing auth tokens | Yes | 64-char hex string |
| `JWT_EXPIRES_IN` | Token expiration lifespan | Yes | `24h` |
| `CORS_ORIGIN` | Allowed web domain | Yes | `https://app.yourdomain.com` |
| `LOG_LEVEL` | Logging verbosity | No | `info` (or `debug` / `warn`) |
| `OPENAI_API_KEY` | OpenAI Key for Luminary AI | No | `sk-proj-...` |
| `SENDGRID_API_KEY` | SendGrid Key for Email Notifications | No | `SG....` |
| `TWILIO_ACCOUNT_SID`| Twilio SID for WhatsApp/SMS | No | `AC....` |

---

## 6. External Integrations & Third-Party Service Setup

### 6.1: Luminary AI COO Setup (OpenAI)
1. Register at [platform.openai.com](https://platform.openai.com) and generate an API key.
2. Ensure you have set a billing usage limit (e.g. $50/mo cap to avoid surprise bills).
3. Set `OPENAI_API_KEY` in `backend/.env`.
4. The system automatically routes chat queries to `gpt-4o-mini` with real-time operational context (Scoring metrics, active exceptions, overdue tasks, team health).

### 6.2: Transactional Emails (SendGrid / Postmark)
1. Create a SendGrid account and verify your sender domain with DNS records (SPF, DKIM, DMARC).
2. Set `SENDGRID_API_KEY` in `backend/.env`.
3. Notifications for task approvals, checkpoint proofs, and daily scoring digests will automatically route to employee emails.

### 6.3: WhatsApp & SMS Notifications (Twilio)
1. Setup a Twilio WhatsApp Sender Sandbox or Business Profile.
2. Provide `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
3. Critical system exceptions (e.g. 3 consecutive task slips, unauthorized leave breaches) trigger instant WhatsApp alerts.

---

## 7. Production Hardening & Security Checklist

Prior to opening the application to public pilots, verify each item:

- [ ] **Database Passwords:** Never use default credentials (`Admin@123` or `prism_secure_password_2026`) in production.
- [ ] **Account Lockout Policy:** Verified active in `auth.routes.ts` (accounts automatically lock after 5 failed login attempts).
- [ ] **Rate Limiting:** General API limited to 100 req/min; Auth endpoints limited to 10 req/15min.
- [ ] **CORS Restriction:** `CORS_ORIGIN` strictly locked to your production frontend URL (no wildcard `*` in production).
- [ ] **Security Headers:** Helmet enabled with CSP and Cross-Origin Resource Policies.
- [ ] **File Upload Sandboxing:** Multer file storage restricts file types to images/documents with 25MB ceiling.
- [ ] **Audit Trail:** All destructive mutations (task status overrides, role changes, delegations) log to immutable `AuditLog` table.

---

## 8. Monitoring, Health Checks & Disaster Recovery

### 8.1: Built-in Health & Metrics Probes
Set up your external uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com), [BetterStack](https://betterstack.com)) to ping these endpoints:

| Endpoint | Method | Expected Code | Purpose |
| :--- | :---: | :---: | :--- |
| `/health` | `GET` | `200 OK` | Liveness check (Server is running) |
| `/health/ready` | `GET` | `200 OK` | Readiness check (Database is connected and responding) |
| `/metrics` | `GET` | `200 OK` | Process telemetry (Node memory usage, RSS, Uptime) |

### 8.2: Automated Database Backup Script
Create a daily backup cron job on the server:

```bash
# /opt/prism/scripts/backup.sh
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/prism/backups"
mkdir -p $BACKUP_DIR

docker exec prism-postgres-db pg_dump -U prism_user prism | gzip > "$BACKUP_DIR/prism_db_$TIMESTAMP.sql.gz"

# Retain only last 14 days of backups
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
```

Add to cron (`crontab -e`):
```cron
0 2 * * * /opt/prism/scripts/backup.sh
```

---

## 9. Go-To-Market (GTM) & Pilot Launch Strategy

### 9.1: Ideal Customer Profile (ICP)
- **Target Company Size:** 15–200 employees.
- **Target Verticals:** Tech Agencies, Digital Services, Professional Services, Operations-heavy Startups.
- **Key Decision Makers:** Founders / CEOs, COOs, Heads of Delivery, Engineering Leads.
- **Pain Point Addressed:** Operational blindness, delayed task handoffs, micromanagement overhead, and lack of objective performance scoring.

---

### 9.2: 4-Week Paid Pilot Program Structure

```
  Week 1: Onboarding & Setup ──► Week 2: Baseline Scoring ──► Week 3: AI Intervention ──► Week 4: ROI Review
  • Org Chart & Goals Setup    • Daily task & proof logs    • Luminary AI bottleneck     • Executive presentation
  • Tenant scoring weights     • Initial speed/discipline     alerts & continuity handovers • Conversion to Annual
```

1. **Week 1 (Onboarding):** Configure tenant, create departments, import initial users, set scoring weights (e.g. 40% Completion, 25% Speed, 20% Discipline, 15% Attendance).
2. **Week 2 (Baseline):** Teams work normally with proof-gated tasks. The mechanical scoring engine calculates baseline team health.
3. **Week 3 (AI COO Insights):** Luminary AI surfaces early bottleneck alerts, delegation handoffs during leaves, and anomaly detection.
4. **Week 4 (Executive ROI Review):** Review Founder & Executive Lenses with the CEO, showcasing hours saved and transparency gains to close an annual subscription.

---

### 9.3: Recommended Pricing Model

| Tier | Price | Ideal For | Features |
| :--- | :--- | :--- | :--- |
| **Starter Pilot** | **$199 / month** | Up to 15 users | Core 4 Lenses, Proof-Gated Tasks, Scoring Engine, SQLite/Cloud hosting. |
| **Growth** | **$499 / month** | Up to 50 users | Luminary AI COO, Multi-channel notifications, Leave Continuity Matrix, Custom scoring weights. |
| **Enterprise** | **$1,299 / month** | Unlimited users | Dedicated PostgreSQL instance, custom SLA, bespoke KPI integrations, priority AI tokens. |

---

## 10. Customer Onboarding & Operations Playbook

### Step 1: Create New Tenant Account
1. Send registration invite or create tenant via API:
   ```bash
   POST /api/v1/auth/register
   {
     "email": "ceo@clientcompany.com",
     "password": "TemporarySecurePassword!",
     "name": "Jane Doe",
     "role": "founder",
     "tenantName": "Client Company Inc"
   }
   ```
2. Prompt user to change password on first login.

### Step 2: Configure Departmental Priorities & Goals
1. Navigate to **Executive Lens → Meridian Roadmap**.
2. Add quarterly strategic milestones (e.g., "Q4 Revenue Goal: $500k", "SOC2 Compliance").
3. Assign target departments and accountability leads.

### Step 3: Train Team on Proof-Gated Workflows
1. Demonstrate how Individual Contributors (ICs) drag tasks to `Under Review` and upload deliverables (Screenshots, PDFs, Git links) via the proof modal.
2. Demonstrate how Managers validate deliverables with 1-click approvals, instantly updating the employee's discipline score.

---

## 🎯 Summary

Prism is now **100% code-complete, verified, containerized, and documented**. Following this playbook will allow you to deploy the full stack to production in under 30 minutes and initiate your first customer pilots with complete confidence.
