# Smart Leads Dashboard V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Smart Leads Dashboard into a polished assignment-based sales operations CRM with landing page, lead assignment, follow-ups, activity timeline, and analytics.

**Architecture:** Extend the current MERN TypeScript app instead of replacing it. Add assignment and workflow fields to `Lead`, add a `LeadActivity` model for timeline events, scope lead queries by role, and add compact analytics/follow-up endpoints. Frontend gets a public landing page plus new protected pages for follow-ups, analytics, and team workload.

**Tech Stack:** React, TypeScript, TailwindCSS, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Zod, Vitest, Supertest.

---

## Design Decisions

- Use a public landing page at `/` before login.
- Keep leads as records, not login users.
- Admin sees all leads; Sales Users see assigned leads only.
- Sales-created leads are assigned to the creator.
- Admin-created leads auto-assign to the lowest active workload Sales User when no assignment is chosen.
- Admin team analytics include assigned, active, qualified, lost, follow-ups due, reviewed leads, and last activity.
- Use CSS/Tailwind chart-like components instead of adding a chart library, keeping the UI fast and restrained.

## Backend Tasks

- [ ] Extend `Lead` with `assignedTo`, `priority`, `nextFollowUpAt`, `followUpType`, `followUpNote`, and `lastContactedAt`.
- [ ] Add `LeadActivity` model with lead, actor, type, note/message, old value, new value, and timestamps.
- [ ] Add role-aware lead query scoping: Admin sees all, Sales sees assigned leads.
- [ ] Add assignment logic and lowest-workload auto assignment.
- [ ] Record timeline entries on create, assignment change, status change, priority change, follow-up change, and notes.
- [ ] Aggregate Sales User workload and review activity for Admin.
- [ ] Add endpoints:
  - `GET /api/users/sales`
  - `GET /api/leads/follow-ups`
  - `GET /api/leads/:id/activities`
  - `POST /api/leads/:id/activities`
  - `GET /api/analytics`
  - `GET /api/analytics/team`
- [ ] Add backend E2E tests for assignment, sales scoping, timeline, follow-ups, analytics, and RBAC.

## Frontend Tasks

- [ ] Add landing page at `/` with product intro, sign in, create account, abstract gradient-mesh hero background, workflow preview, and role explanation.
- [ ] Update routing so `/dashboard` remains protected and `/` is public.
- [ ] Add lead fields to forms: assigned user, priority, follow-up date, follow-up type, follow-up note.
- [ ] Hide assignment controls from Sales Users where appropriate.
- [ ] Add timeline to Lead Detail page.
- [ ] Add follow-up work queue page.
- [ ] Add analytics page with restrained chart-like visual summaries.
- [ ] Add team workload page for Admin.
- [ ] Update sidebar with Dashboard, Leads, Follow-ups, Analytics, Team, New Lead.
- [ ] Preserve clean product-app UI and avoid chart clutter.

## Verification

- [ ] Backend: `npm run typecheck`
- [ ] Backend: `npm test`
- [ ] Backend: `npm run build`
- [ ] Frontend: `npm run lint`
- [ ] Frontend: `npm run typecheck`
- [ ] Frontend: `npm run build`
- [ ] Browser: verify landing page, admin assignment flow, sales scoped leads, timeline, follow-ups, analytics.
