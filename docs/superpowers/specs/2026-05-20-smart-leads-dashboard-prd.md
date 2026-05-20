# Product Requirements Document: Smart Leads Dashboard

Date: 2026-05-20
Candidate: Mousumi Swain
Assignment: Full Stack Internship Assignment - Smart Leads Dashboard

## 1. Product Summary

Smart Leads Dashboard is a role-based CRM-style web application for small sales teams to securely manage lead records. The app allows users to register, log in, create and update leads, search and filter records, review lead status summaries, and export lead data where permitted by role.

The project must fully satisfy the internship assignment requirements while adding restrained enhancements that improve reviewer experience and product polish.

## 2. Product Type

This is not a landing page, portfolio, blog, or marketing site. It is a full-stack SaaS-style internal business dashboard.

Category: Lead Management CRM
Primary interface: Dashboard and data table
Primary users: Admin and Sales User
Core workflow: Authenticate, manage leads, filter/search records, export data

## 3. Goals

- Build a complete MERN stack lead management dashboard using TypeScript on both frontend and backend.
- Demonstrate clean architecture, reusable components, proper validation, and strong API design.
- Provide a polished dashboard experience with loading, empty, error, and validation states.
- Make assignment review easy through clear setup documentation, Docker support, seed/demo data, and API documentation.

## 4. Non-Goals

The following are intentionally out of scope for the assignment version:

- AI lead scoring
- Email campaign automation
- WhatsApp or chat integration
- Complex analytics suite
- Kanban sales pipeline
- Multi-tenant company accounts
- Payments or subscriptions
- Notification system
- Deployment planning

These features would increase scope without improving alignment with the assignment evaluation criteria.

## 5. Users and Roles

### Admin

Admin users manage the lead database and have full operational access.

Permissions:
- View dashboard metrics
- View all leads
- Create leads
- Edit leads
- Delete leads
- Export leads as CSV

### Sales User

Sales Users work with lead records but have restricted destructive and export access.

Permissions:
- View dashboard metrics
- View all leads
- Create leads
- Edit leads

Restrictions:
- Cannot delete leads
- Cannot export CSV

RBAC must be enforced by the backend. The frontend should also hide or disable unauthorized UI actions, but frontend checks alone are not sufficient.

## 6. Functional Requirements

### 6.1 Authentication

The application must implement JWT-based authentication.

Required capabilities:
- User registration
- User login
- Password hashing using bcrypt
- JWT generation on login
- Protected frontend routes
- Backend auth middleware
- Current-user endpoint for session restoration

Registration fields:
- Name
- Email
- Password
- Role: Admin or Sales User

Login fields:
- Email
- Password

Expected behavior:
- Duplicate email registration should be rejected.
- Invalid login credentials should return a clear error.
- Protected API routes should reject missing or invalid JWTs.
- Protected frontend routes should redirect unauthenticated users to login.

### 6.2 Lead Management

The application must provide complete CRUD for leads.

Lead fields:
- Name
- Email
- Status: New, Contacted, Qualified, Lost
- Source: Website, Instagram, Referral
- Created At
- Updated At
- Created By: user reference metadata

Required capabilities:
- Create lead
- View leads list
- View single lead details
- Update lead
- Delete lead, Admin only

Expected behavior:
- Lead status must be limited to the allowed status values.
- Lead source must be limited to the allowed source values.
- Invalid email format should be rejected.
- Delete actions should require confirmation in the UI.

### 6.3 Search, Filtering, and Sorting

The leads list must support advanced filtering and search.

Required filters:
- Filter by status
- Filter by source
- Search by name or email
- Sort by latest
- Sort by oldest

Expected behavior:
- Search, status filter, source filter, sorting, and pagination must work together.
- Search must be debounced on the frontend.
- Filtering, search, sorting, and pagination must be handled through backend query parameters.
- Users should be able to clear all active filters.

Example combined query:
- Status = Qualified
- Source = Instagram
- Search = Rahul
- Sort = Latest

### 6.4 Pagination

Backend pagination is mandatory.

Requirements:
- Limit records to 10 per page.
- Use skip and limit on the backend.
- Return pagination metadata in API responses.

Pagination metadata:
- Current page
- Limit
- Total records
- Total pages
- Has next page
- Has previous page

### 6.5 CSV Export

CSV export is mandatory and should be restricted to Admin users.

Requirements:
- Admin can export lead data as CSV.
- Sales User cannot export CSV.
- Export should include key lead fields.
- Export should respect active status, source, and search filters.

CSV columns:
- Name
- Email
- Status
- Source
- Created At

### 6.6 Dashboard Metrics

The dashboard should include lightweight summary metrics to make the product feel complete without expanding scope.

Metrics:
- Total leads
- New leads
- Contacted leads
- Qualified leads
- Lost leads

Expected behavior:
- Metrics should be loaded from the backend.
- Metrics should update after lead changes when the dashboard is revisited or refetched.

### 6.7 Dark Mode

Dark mode is a bonus feature from the assignment.

Requirement:
- Treat dark mode as optional or stretch scope.
- If implemented, apply it consistently across auth pages, dashboard, lead list, lead detail, and lead forms.

## 7. Screens and User Experience

### 7.1 Register Page

Purpose: Allow a new user to create an account.

Fields:
- Name
- Email
- Password
- Role

States:
- Validation errors
- Loading state during submission
- Error state for duplicate email or server failure
- Redirect to dashboard or login after successful registration

### 7.2 Login Page

Purpose: Allow an existing user to access the dashboard.

Fields:
- Email
- Password

States:
- Validation errors
- Loading state during submission
- Error state for invalid credentials
- Redirect to dashboard after successful login

### 7.3 Dashboard Page

Purpose: Provide an overview before the user enters the lead table.

Content:
- Summary metric cards or compact stat panels
- Recent leads preview
- Navigation action to manage leads

States:
- Loading metrics
- Empty state when no leads exist
- Error state if metrics fail to load

### 7.4 Leads List Page

Purpose: Main operational workspace for managing lead records.

Content:
- Search input
- Status filter
- Source filter
- Sort dropdown
- Clear filters button
- Add lead button
- CSV export button, Admin only
- Paginated leads table
- Row actions for view, edit, and delete where permitted

States:
- Loading state while fetching leads
- Empty state when no leads exist
- Empty search state when filters return no results
- Error state for failed API request

### 7.5 Lead Detail Page

Purpose: Show a single lead record.

Content:
- Name
- Email
- Status badge
- Source badge
- Created date
- Updated date
- Created by metadata where available
- Edit action
- Delete action, Admin only

### 7.6 Create/Edit Lead Page

Purpose: Create a new lead or edit an existing lead.

Fields:
- Name
- Email
- Status
- Source

States:
- Client-side validation errors
- Server-side validation errors
- Loading state during save
- Success toast after save
- Error toast after failure

## 8. API Requirements

The backend must follow RESTful API standards, use proper HTTP status codes, validate requests, and return consistent response shapes.

### Auth Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Lead Endpoints

- GET /api/leads
- POST /api/leads
- GET /api/leads/:id
- PUT /api/leads/:id
- DELETE /api/leads/:id
- GET /api/leads/export/csv
- GET /api/leads/stats

### Query Parameters for GET /api/leads

- page
- limit
- status
- source
- search
- sort

Example:

GET /api/leads?page=1&limit=10&status=Qualified&source=Instagram&search=Rahul&sort=latest

### Standard Success Response Shape

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {}
}
```

### Standard Error Response Shape

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## 9. Data Model

### User

Fields:
- name: string
- email: string, unique
- passwordHash: string
- role: admin or sales
- createdAt: date
- updatedAt: date

### Lead

Fields:
- name: string
- email: string
- status: New, Contacted, Qualified, Lost
- source: Website, Instagram, Referral
- createdBy: User reference
- createdAt: date
- updatedAt: date

Indexes to consider:
- email
- status
- source
- createdAt

## 10. Technical Requirements

### Frontend

Required:
- React.js
- TypeScript
- TailwindCSS

Expected structure:
- pages
- components
- hooks
- services
- types
- utils
- context or store

Frontend quality requirements:
- Reusable components
- Protected routes
- Debounced search
- Form validation
- Loading states
- Empty states
- Error handling UI
- Responsive layout
- Minimal and justified use of any

### Backend

Required:
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

Expected structure:
- routes
- controllers
- models
- middleware
- services
- validators
- utils
- types
- config

Backend quality requirements:
- Centralized error handling
- Auth middleware
- Role middleware
- Request validation
- RESTful route design
- Proper status codes
- Consistent response format
- Minimal and justified use of any

### DevOps

Required:
- Docker setup
- .env.example
- Clear local setup instructions

Preferred:
- Docker Compose for frontend, backend, and MongoDB
- Seed script for sample users and leads

## 11. Acceptance Criteria

### Authentication

- User can register with name, email, password, and role.
- Passwords are stored hashed.
- User can log in and receive a JWT.
- Protected APIs reject missing or invalid JWTs.
- Frontend protected pages redirect unauthenticated users.

### Role-Based Access

- Admin can create, view, edit, delete, and export leads.
- Sales User can create, view, and edit leads.
- Sales User cannot delete leads.
- Sales User cannot export CSV.
- Backend enforces all role restrictions.

### Lead Management

- User can create a lead.
- User can view a paginated leads list.
- User can view lead details.
- User can update a lead.
- Admin can delete a lead after confirmation.
- Lead status and source accept only allowed values.

### Search, Filtering, Sorting

- User can search by name or email.
- User can filter by status.
- User can filter by source.
- User can combine search, status, and source filters.
- User can sort by latest or oldest.
- Search input is debounced.
- Backend handles query logic.

### Pagination

- Backend returns 10 leads per page.
- API response includes pagination metadata.
- Frontend pagination controls work correctly.

### CSV Export

- Admin can export leads as CSV.
- Sales User is blocked from CSV export.
- CSV includes name, email, status, source, and created date.

### UI and UX

- App is responsive.
- App has loading states.
- App has empty states.
- App has error states.
- Forms display validation errors.
- Success and error toasts are shown for key actions.
- UI is dashboard-first and suitable for an internal CRM.

### Submission Readiness

- README includes setup instructions.
- README includes API documentation or an API documentation link.
- .env.example is present.
- Docker setup is present.
- GitHub repository is organized.
- Updated resume is prepared for submission.
- Submission email is addressed to ritik.yadav@servicehive.tech with subject: MERN Internship Assignment Submission - Mousumi Swain.

## 12. Review and Submission Checklist

- TypeScript is used on frontend and backend.
- No plain JavaScript implementation files are used for application logic.
- Interfaces and types are defined for User, Lead, API responses, auth state, filters, and pagination.
- Folder structure is clear and scalable.
- Validation exists on frontend and backend.
- No hardcoded API URLs are used.
- Loading and error states are implemented.
- Components are not excessively large.
- README is complete.
- API documentation is complete.
- .env.example is complete and does not contain real secrets.
- Docker setup can run the project locally.
- Sample data exists for testing filters and pagination.
- Updated resume is included in the final submission package.
- Git commit history is reasonably clean and meaningful.

## 13. Recommended Implementation Phases

### Phase 1: Project Setup

- Create frontend and backend TypeScript projects.
- Configure TailwindCSS.
- Configure Express, MongoDB, and Mongoose.
- Add shared conventions for environment variables and response formats.

### Phase 2: Backend Core

- Implement User and Lead models.
- Implement auth routes.
- Implement JWT middleware.
- Implement role middleware.
- Implement lead CRUD APIs.
- Implement validation and centralized error handling.

### Phase 3: Advanced Backend Features

- Implement combined search, filters, sorting, and pagination.
- Implement lead stats endpoint.
- Implement CSV export.
- Add seed data.

### Phase 4: Frontend Core

- Build auth pages.
- Build protected route handling.
- Build dashboard layout.
- Build leads list page.
- Build lead create, edit, and detail screens.

### Phase 5: UX Polish

- Add loading, empty, and error states.
- Add toasts.
- Add delete confirmation modal.
- Add responsive layout polish.
- Add optional dark mode if time allows.

### Phase 6: Submission

- Add Docker setup.
- Add .env.example.
- Write README.
- Add API documentation.
- Verify build and core flows.
- Update resume.
- Prepare GitHub repository.
- Send submission email to ritik.yadav@servicehive.tech with subject: MERN Internship Assignment Submission - Mousumi Swain.
