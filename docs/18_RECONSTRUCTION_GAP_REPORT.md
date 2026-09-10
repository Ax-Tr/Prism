# 18 — Reconstruction Gap Report: Nexora Prism

## 1. Executive Summary
This document records any technical aspects of the original deployment that were not directly exposed via live web assets and describes the reconstructed replacement architecture.

## 2. Classification Breakdown

### VERIFIED
- Frontend single page application bundle structure (Vite + React 19 + Tailwind CSS).
- 13 primary workspace tabs, floating bottom dock navigation, top bar layout, dark/light theme switching, and Lucide icon usage.
- All team member entity identities, KPI target weights, Kanban column structures, Meridian roadmap nodes, and 360 peer review composite radar metrics.

### INFERRED / RECONSTRUCTED
- **Backend Source Code**: The original live site served a pre-rendered SPA bundle on Netlify. The Express TypeScript backend (`backend/src/server.ts`) and PostgreSQL schema (`database/schema.sql`) have been cleanly reconstructed based on observable API parameters and frontend state models.
- **AI COO LLM Provider**: The client-side Luminary AI Assistant interface has been reconstructed with custom deterministic rule-based responses and simulated network latency, with clean integration hooks to plug in OpenAI / Anthropic / Gemini API keys if desired.
