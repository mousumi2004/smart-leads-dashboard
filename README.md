# Smart Leads Dashboard

Smart Leads Dashboard is a MERN TypeScript CRM built for the ServiceHive Full Stack Internship assignment. It supports secure internal lead management for two roles: Admin and Sales User.

The project includes the required lead CRUD workflow, role-based access control, search/filter/sort, backend pagination, CSV export, Docker setup, setup documentation, API documentation, and a polished frontend experience. It also adds practical V2 enhancements: lead assignment, follow-up queue, lead timeline, team workload analytics, and seeded demo data.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt password hashing
- Validation: Zod
- Testing: Vitest, Supertest, mongodb-memory-server
- Local runtime: Docker Compose or memory database mode

## Assignment Coverage

- React + TypeScript frontend
- Node.js + Express + TypeScript backend
- MongoDB + Mongoose models
- JWT authentication
- Password hashing with bcrypt
- Protected frontend routes
- Admin and Sales User roles
- Lead create, read, update, delete
- Status and source fields
- Search by name/email
- Filter by status/source
- Sort latest/oldest
- Backend pagination with default 10 records per page
- CSV export for Admin
- Docker setup
- `.env.example`
- README with setup instructions and API documentation

## Demo Credentials

When running the backend in memory mode, demo data is seeded automatically.

```text
Admin
Email: admin@smartleads.test
Password: Password123!

Sales User
Email: sales@smartleads.test
Password: Password123!
```

Demo data includes 36 leads, four Sales Users, follow-up dates, priorities, assignments, analytics data, and lead timeline activity.

## User Roles

### Admin

Admin users can:

- View all leads
- Create leads
- Edit leads
- Delete leads
- Export CSV
- Assign or reassign leads to Sales Users
- View analytics
- View Sales Team workload
- View all follow-ups
- View and add timeline notes

### Sales User

Sales Users can:

- View only leads assigned to them
- Create leads, automatically assigned to themselves
- Edit assigned leads
- Schedule follow-ups
- Add notes
- View their assigned follow-up queue
- View scoped analytics

Sales Users cannot:

- Delete leads
- Export CSV
- View the Admin team workload page
- View leads assigned to other Sales Users

## Application Pages And Operations

### `/`

Public homepage with the product introduction, animated gradient mesh background, login/create actions, and high-level workflow explanation.

### `/login`

User login page. Includes demo account shortcuts for Admin and Sales User review.

### `/register`

Create an account as either Admin or Sales User.

### `/dashboard`

Protected dashboard. Shows pipeline totals and recent lead activity.

Admin sees global totals. Sales User sees totals only for assigned leads.

### `/leads`

Lead workspace with:

- Paginated lead table
- Search by name or email
- Filter by status
- Filter by source
- Sort by latest or oldest
- Admin CSV export
- Admin delete action
- Role-scoped records

### `/leads/new`

Create a lead. Admin can manually assign a Sales User or leave assignment blank for automatic lowest-workload assignment. Sales-created leads are assigned to the creator.

### `/leads/:id`

Lead detail page with:

- Status
- Source
- Priority
- Assigned Sales User
- Next follow-up
- Follow-up type/note
- Created/updated dates
- Lead activity timeline
- Quick note entry

### `/leads/:id/edit`

Edit lead details, status, source, priority, assignment, and follow-up fields. Status change notes are recorded in the timeline.

### `/follow-ups`

Follow-up work queue showing overdue, due-today, and upcoming leads. Sales Users see only their assigned follow-ups.

### `/analytics`

Analytics page with status distribution, source distribution, conversion/funnel summary, and follow-up counts. Admin additionally sees team workload signals.

### `/team`

Admin-only Sales Team page showing:

- Sales User name/email
- Assigned leads count
- Active leads count
- Qualified leads count
- Lost leads count
- Follow-ups due
- Reviewed lead count
- Activity count
- Last activity date

## Lead Fields

```text
name
email
status: New | Contacted | Qualified | Lost
source: Website | Instagram | Referral
priority: Low | Medium | High
assignedTo
nextFollowUpAt
followUpType: Call | Email | WhatsApp | Meeting | Demo
followUpNote
lastContactedAt
createdBy
createdAt
updatedAt
```

## Local Setup

### 1. Clone And Install

```bash
git clone <repository-url>
cd <repository-folder>

cd backend
npm install

cd ../frontend
npm install
```

### 2. Environment

Copy the example file:

```bash
cp .env.example .env
```

The app has safe local defaults. For local development, the most important values are:

```text
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/smart-leads
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
VITE_API_BASE_URL=http://localhost:5050/api
```

If you run commands from inside `backend` or `frontend`, copy the relevant variables into that folder's local `.env` file if needed.

## Run Locally With Memory Database

This is the quickest reviewer setup because it does not require MongoDB to be installed or running.

Terminal 1:

```bash
cd backend
npm run dev:memory
```

Memory mode automatically seeds demo users, 36 leads, timeline activity, and follow-ups.

Terminal 2:

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:5050/api npm run dev
```

Open:

```text
http://localhost:5173
```

## Run Locally With MongoDB

Start MongoDB:

```bash
docker compose up -d mongo
```

Seed demo data:

```bash
cd backend
npm run seed
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:5050/api npm run dev
```

Open:

```text
http://localhost:5173
```

## Docker Setup

Run the full stack:

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

Stop:

```bash
docker compose down
```

Remove MongoDB volume:

```bash
docker compose down -v
```

## Commands

Backend:

```bash
cd backend
npm run typecheck
npm test
npm run build
npm run seed
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

## API Documentation

Base URL:

```text
http://localhost:5050/api
```

Protected routes require:

```http
Authorization: Bearer <token>
```

### Health

`GET /health`

Returns API health status.

### Auth

`POST /auth/register`

```json
{
  "name": "Mousumi Admin",
  "email": "admin@example.com",
  "password": "Password123!",
  "role": "admin"
}
```

`POST /auth/login`

```json
{
  "email": "admin@smartleads.test",
  "password": "Password123!"
}
```

`GET /auth/me`

Returns the currently authenticated user.

### Leads

`GET /leads`

Query parameters:

```text
page
limit
status
source
search
sort=latest|oldest
```

Example:

```http
GET /api/leads?page=1&limit=10&status=Qualified&source=Instagram&search=rahul&sort=latest
```

Admin receives all matching leads. Sales User receives only assigned matching leads.

`POST /leads`

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Website",
  "priority": "High",
  "assignedTo": "",
  "nextFollowUpAt": "2026-05-22T10:30:00.000Z",
  "followUpType": "Call",
  "followUpNote": "Discuss pricing requirements."
}
```

`GET /leads/:id`

Returns one lead if the user has access.

`PUT /leads/:id`

```json
{
  "status": "Contacted",
  "priority": "High",
  "nextFollowUpAt": "2026-05-23T11:00:00.000Z",
  "followUpType": "Demo",
  "followUpNote": "Prepare product walkthrough.",
  "statusNote": "Customer requested a demo."
}
```

`DELETE /leads/:id`

Admin only.

`GET /leads/stats`

Returns role-scoped status totals.

`GET /leads/follow-ups`

Optional query:

```text
scope=overdue|today|upcoming
```

Returns role-scoped follow-up leads.

`GET /leads/:id/activities`

Returns lead timeline activity.

`POST /leads/:id/activities`

```json
{
  "note": "Customer asked to reconnect next week."
}
```

`GET /leads/export/csv`

Admin only. Supports:

```text
status
source
search
```

### Analytics

`GET /analytics`

Returns:

- Total leads
- Leads by status
- Leads by source
- Funnel data
- Follow-up summary

Sales User analytics are scoped to assigned leads.

`GET /analytics/team`

Admin only. Returns Sales User workload and review activity.

### Users

`GET /users/sales`

Admin only. Returns Sales Users for assignment dropdowns and workload review.

## Response Shape

Success:

```json
{
  "success": true,
  "message": "Leads retrieved",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalRecords": 36,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## Submission Notes

The assignment asks for:

- GitHub Repository URL
- Updated resume
- Proper `README.md`
- `.env.example`
- API documentation
- Setup instructions
- Deployment link preferred

`Preferred` means a deployment link is not mandatory, but including one can improve the submission because the reviewer can test faster. If there is enough time, deploy it; otherwise, a complete GitHub repository with clear setup instructions is acceptable based on the wording.

Submission email:

```text
To: ritik.yadav@servicehive.tech
Subject: MERN Internship Assignment Submission - Mousumi Swain
```
