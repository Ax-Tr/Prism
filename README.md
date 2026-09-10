# Nexora Prism — Reconstructed Web Application & Platform Package

This repository contains the complete, production-ready reconstruction of **Nexora Prism ("Performance Refracted")**, an enterprise AI COO and performance analytics workspace.

---

## 📁 Repository Structure

```text
e:\Prism/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS SPA
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── context/      # Auth, App, and Theme Context Providers
│       ├── components/   # Common, Landing, Auth, Genesis, and App views
│       ├── types/        # Full domain model TypeScript definitions
│       └── data/         # Mock data for team, KPIs, tasks, reviews, etc.
├── backend/              # Node.js + Express TypeScript REST API Service
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       └── server.ts
├── database/             # SQL schema and seed data for relational database
│   ├── schema.sql
│   └── seed.sql
├── docs/                 # Complete 18-Document Technical Specification Package
│   ├── 01_PRODUCT_OVERVIEW.md
│   ├── 02_SITEMAP.md
│   ├── 03_UI_UX_SPECIFICATION.md
│   ├── 04_DESIGN_SYSTEM.md
│   ├── 05_USER_JOURNEYS.md
│   ├── 06_FUNCTIONAL_REQUIREMENTS.md
│   ├── 07_TECHNICAL_ARCHITECTURE.md
│   ├── 08_API_SPECIFICATION.md
│   ├── 09_DATABASE_DESIGN.md
│   ├── 10_SECURITY_SPECIFICATION.md
│   ├── 11_SEO_SPECIFICATION.md
│   ├── 12_ACCESSIBILITY_SPECIFICATION.md
│   ├── 13_PERFORMANCE_SPECIFICATION.md
│   ├── 14_TESTING_STRATEGY.md
│   ├── 15_DEPLOYMENT_GUIDE.md
│   ├── 16_DEVELOPER_SETUP.md
│   ├── 17_ASSET_INVENTORY.md
│   └── 18_RECONSTRUCTION_GAP_REPORT.md
└── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Run Frontend Application
```bash
cd e:/Prism/frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Run Backend Express API Service
```bash
cd e:/Prism/backend
npm install
npm run dev
```
Express API will listen on `http://localhost:5000`.

---

## 🌟 Key Features & Workflows
- **Spectrum (Command Center)**: Real-time velocity index (73/100), capacity utilization, and Luminary executive narrative.
- **Team Roster & 1:1 Prep**: Detailed team member cards, load percentages, 1:1 prep modal notes, and individual profile views.
- **KPI OKR Variance Tracker**: Target vs current progress, trend indicators, and weightings.
- **Sanctum Digital Twin**: AI avatar customization and decision sliders (Autonomy vs Alignment, Analytical vs Intuitive).
- **Kanban Task Board**: Sprint task management across Dormant, In Flux, Orbit, and Transmitted states with assignee filters and subtask checklists.
- **The (Leaderboard)**: Refraction rankings across Output, Return, Growth, Motivation, and Wellbeing.
- **360° Review**: Composite skill radar (Communication, Technical, Leadership, Collaboration, Innovation) and review stream.
- **Attendance & Anomaly Detection**: Anomaly alerts flagging mass leave and operational risks.
- **Meridian Strategic Roadmap**: Interactive node graph mapping milestone dependencies (Auth Service, Design System v2, API Gateway, Luminary RAG, Beta Launch).
- **Checkpoint Urgency Radar**: Sign-off queue for architectural, financial, and deployment approvals.
- **Synthesis Reports**: AI executive summaries and downloadable PDF export.
- **Calibration Admin**: System identity, AI engine fine-tuning, and role controls.
- **Luminary AI COO Assistant**: Floating bottom-right chat drawer for real-time strategic guidance.
- **Theme Switcher**: Synchronous dark (`#050505`) and light (`#f2f0eb`) mode switching.
