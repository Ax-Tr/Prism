# 09 — Database Design Document: Nexora Prism

## 1. Entity Relationship Overview
The database schema models core platform entities:
- `users`: Core authentication identity records.
- `employees`: Team directory entries with bandwidth load, skills, and 1:1 notes.
- `tasks`: Kanban sprint tasks with status (`DORMANT`, `IN_FLUX`, `ORBIT`, `TRANSMITTED`), priority, and points.
- `kpis`: Quarterly targets, current metrics, variance weightings, and status flags.
- `roadmap_nodes`: Meridian roadmap milestones and dependencies.
- `approvals`: Checkpoint priority sign-off queue.

## 2. Table Schemas & Indexes
Indexes defined on:
- `users(email)`
- `tasks(assignee_id, status)`
- `employees(user_id)`
