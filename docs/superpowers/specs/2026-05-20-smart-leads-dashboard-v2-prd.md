# Product Requirements Document: Smart Leads Dashboard V2

Date: 2026-05-20
Scope: Version 2 enhancement over the original internship assignment

## Product Direction

Smart Leads Dashboard V2 upgrades the assignment from a basic lead CRUD dashboard into an assignment-based sales operations CRM. The app still satisfies every original assignment requirement, but adds a more realistic sales workflow: landing page, lead assignment, follow-ups, activity timeline, priority, and analytics.

## Core Positioning

This product has two surfaces:

- Public website flow: a polished intro page that explains the product and routes users to sign in or register.
- Internal app flow: a protected CRM workspace for Admin and Sales Users.

Leads are customer records. Leads do not log in. Admins and Sales Users are the people who use the system.

## Master Frontend Design Direction

- Purpose: help sales teams understand, assign, prioritize, and follow up with leads without drowning in dashboards.
- Audience: internship reviewer, admin/manager, and sales users.
- Tone: refined minimal, professional, product-led.
- Differentiation: the app starts like a real product website, then moves into a clean operational CRM.
- Content plan: landing intro -> auth -> dashboard -> assigned lead work queue -> lead detail timeline -> follow-ups -> analytics.
- Interaction thesis: calm landing-page entry, focused work queues, crisp timeline/status interactions, charting used only for decisions.

## Required Assignment Features Preserved

- React + TypeScript + TailwindCSS frontend
- Node.js + Express + TypeScript backend
- MongoDB + Mongoose models
- JWT auth and bcrypt password hashing
- Protected routes
- Admin and Sales User RBAC
- Lead CRUD
- Status/source fields
- Search/filter/sort
- Backend pagination with 10 leads per page
- Debounced search
- CSV export
- Docker setup
- README, `.env.example`, API docs

## V2 Enhancements

### 1. Public Landing Page

Path: `/`

The app should no longer open directly into the protected dashboard. It should first show a polished website intro with:

- Product name
- Clear one-line value proposition
- Sign in button
- Create account button
- Abstract gradient-mesh hero background with strong contrast and readable auth actions
- Brief workflow preview
- Short explanation of Admin and Sales User roles

### 2. Assignment-Based Lead Visibility

Admin:

- Can view all leads
- Can assign/reassign leads
- Can see sales workload

Sales User:

- Can only see leads assigned to them
- Can create leads; newly created sales-user leads are assigned to that user
- Can update assigned leads
- Cannot delete leads
- Cannot export CSV

### 3. Lead Assignment

Each lead has:

- `assignedTo`
- `priority`: Low, Medium, High
- `nextFollowUpAt`
- `followUpType`: Call, Email, WhatsApp, Meeting, Demo
- `followUpNote`
- `lastContactedAt`

Admin can assign leads manually. If no `assignedTo` is provided during Admin lead creation, the backend should auto-assign the lead to the Sales User with the lowest active workload.

Active workload means leads assigned to a Sales User whose status is New, Contacted, or Qualified.

### 4. Lead Activity Timeline

Each lead detail page should include a timeline showing important events:

- Lead created
- Assigned/reassigned
- Status changed
- Priority changed
- Follow-up scheduled
- Note added

Each activity contains:

- Lead ID
- Actor user ID
- Type
- Message/note
- Old value when relevant
- New value when relevant
- Created date

### 5. Status Change Notes

When a user changes lead status, they can attach a note. That note appears in the timeline.

### 6. Follow-Up Work Queue

Path: `/follow-ups`

Shows:

- Overdue follow-ups
- Due today
- Upcoming follow-ups

Sort order:

1. Overdue
2. Due today
3. High priority
4. Qualified leads
5. New leads
6. Contacted leads
7. Lost leads

### 7. Analytics

Path: `/analytics`

Admin-focused analytics should include:

- Leads by status
- Leads by source
- Lead workload by Sales User
- Follow-up summary
- Conversion funnel summary
- Team review/activity summary

Charts should be useful and restrained. Avoid filling the screen with chart clutter.

### 8. Sales Team Page

Path: `/team`

Admin page showing:

- Sales user name
- Assigned leads count
- Active leads count
- Qualified leads count
- Lost leads count
- Follow-ups due
- Reviewed leads count, based on timeline activity performed by that sales user
- Last activity date

This helps Admin decide who should receive the next lead.

## Out Of Scope For V2

- Real email/WhatsApp sending
- Calendar integration
- Customer/lead login portal
- AI lead scoring
- Deployment
- Payment/subscription features

## Success Criteria

- Landing page appears at `/`.
- Unauthenticated users can understand the product before logging in.
- Sales Users see only assigned leads.
- Admin sees all leads and can assign/reassign leads.
- Admin can see each Sales User's workload and review activity.
- Lead detail page includes a timeline.
- Follow-up page shows due work in priority order.
- Analytics page uses clean charts or chart-like visual summaries.
- Backend tests prove assignment, activity, follow-up, analytics, and RBAC behavior.
- Existing assignment requirements remain intact.
