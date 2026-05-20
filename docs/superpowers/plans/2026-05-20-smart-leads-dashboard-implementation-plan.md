# Smart Leads Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete local-development MERN TypeScript Smart Leads Dashboard that satisfies the internship assignment and adds restrained CRM dashboard polish. Deployment is deferred until after development.

**Architecture:** Use a two-app monorepo with `backend/` for Express + TypeScript + MongoDB/Mongoose APIs and `frontend/` for React + TypeScript + TailwindCSS. Keep backend business logic in services, HTTP concerns in controllers/routes, and validation in dedicated schemas. Keep frontend screens thin by using typed API services, reusable UI components, and auth/filter hooks.

**Tech Stack:** React, TypeScript, TailwindCSS, Vite, Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Zod, Vitest, Supertest, Docker, Docker Compose.

---

## Source PRD

Use this PRD as the authority for scope:

- `docs/superpowers/specs/2026-05-20-smart-leads-dashboard-prd.md`

## Repository Shape

Create this project structure:

```text
mousumi_assignment/
  backend/
    src/
      app.ts
      server.ts
      config/
        env.ts
        database.ts
      constants/
        lead.ts
        roles.ts
      controllers/
        auth.controller.ts
        lead.controller.ts
      middleware/
        auth.middleware.ts
        error.middleware.ts
        notFound.middleware.ts
        role.middleware.ts
        validate.middleware.ts
      models/
        Lead.ts
        User.ts
      routes/
        auth.routes.ts
        lead.routes.ts
      services/
        auth.service.ts
        lead.service.ts
      types/
        api.ts
        auth.ts
        express.d.ts
        lead.ts
      utils/
        apiResponse.ts
        asyncHandler.ts
        csv.ts
        jwt.ts
        password.ts
      validators/
        auth.validator.ts
        lead.validator.ts
      tests/
        helpers/
          app.ts
          db.ts
          factories.ts
        auth.test.ts
        lead.test.ts
        rbac.test.ts
    Dockerfile
    package.json
    tsconfig.json
    vitest.config.ts
  frontend/
    src/
      App.tsx
      main.tsx
      index.css
      components/
        common/
          Button.tsx
          ConfirmDialog.tsx
          EmptyState.tsx
          ErrorState.tsx
          Input.tsx
          LoadingState.tsx
          Select.tsx
          StatusBadge.tsx
          SourceBadge.tsx
        layout/
          AppLayout.tsx
          Header.tsx
          Sidebar.tsx
        leads/
          LeadFilters.tsx
          LeadForm.tsx
          LeadsTable.tsx
          Pagination.tsx
          StatsGrid.tsx
      context/
        AuthContext.tsx
      hooks/
        useDebounce.ts
        useLeads.ts
      pages/
        DashboardPage.tsx
        LeadDetailPage.tsx
        LeadFormPage.tsx
        LeadsPage.tsx
        LoginPage.tsx
        RegisterPage.tsx
      routes/
        ProtectedRoute.tsx
      services/
        api.ts
        authApi.ts
        leadApi.ts
      types/
        api.ts
        auth.ts
        lead.ts
      utils/
        authStorage.ts
        download.ts
    Dockerfile
    index.html
    package.json
    tailwind.config.js
    tsconfig.json
    vite.config.ts
  docker-compose.yml
  .env.example
  README.md
```

## Core Conventions

Use these shared enums and labels consistently.

```ts
export const USER_ROLES = ["admin", "sales"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["Website", "Instagram", "Referral"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
```

Use this API response convention.

```ts
export interface ApiSuccess<TData, TMeta = undefined> {
  success: true;
  message: string;
  data: TData;
  meta?: TMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}
```

Use these route groups.

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/leads
POST   /api/leads
GET    /api/leads/stats
GET    /api/leads/export/csv
GET    /api/leads/:id
PUT    /api/leads/:id
DELETE /api/leads/:id
```

## Task 1: Initialize Project Structure

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`
- Create: `.env.example`

- [ ] **Step 1: Create root directories**

Run:

```bash
mkdir -p backend/src frontend/src docs/superpowers/plans
```

Expected: directories exist.

- [ ] **Step 2: Initialize backend package**

Run:

```bash
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken zod
npm install -D typescript tsx vitest supertest mongodb-memory-server @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/supertest
```

Expected: `backend/package.json` contains runtime and dev dependencies.

- [ ] **Step 3: Add backend scripts**

In `backend/package.json`, set:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

Expected: backend has dev, build, start, test, and typecheck commands.

- [ ] **Step 4: Initialize frontend package**

Run:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx tailwindcss init -p
```

Expected: Vite React TypeScript app exists in `frontend/`.

- [ ] **Step 5: Add frontend scripts**

In `frontend/package.json`, ensure:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

Expected: frontend has dev, build, preview, test, and typecheck commands.

- [ ] **Step 6: Add environment template**

Create `.env.example`:

```env
MONGO_URI=mongodb://mongo:27017/smart-leads
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PORT=5050
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5050/api
```

Expected: no real secrets are present.

- [ ] **Step 7: Verify project setup**

Run:

```bash
cd backend && npm run typecheck
cd ../frontend && npm run typecheck
```

Expected: TypeScript commands run. If the frontend starter has unused import errors, clean the starter files before continuing.

- [ ] **Step 8: Commit**

Run:

```bash
git add backend frontend .env.example docs/superpowers
git commit -m "chore: initialize smart leads dashboard"
```

Expected: setup commit is created. If the folder is not a git repository, skip commit and continue.

## Task 2: Backend App Foundation

**Files:**
- Create: `backend/src/config/env.ts`
- Create: `backend/src/config/database.ts`
- Create: `backend/src/types/api.ts`
- Create: `backend/src/utils/apiResponse.ts`
- Create: `backend/src/utils/asyncHandler.ts`
- Create: `backend/src/middleware/error.middleware.ts`
- Create: `backend/src/middleware/notFound.middleware.ts`
- Modify: `backend/src/app.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Define environment loader**

Create `backend/src/config/env.ts`:

```ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 2: Define database connector**

Create `backend/src/config/database.ts`:

```ts
import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
}
```

- [ ] **Step 3: Define API response types**

Create `backend/src/types/api.ts`:

```ts
export interface FieldError {
  field?: string;
  message: string;
}

export interface ApiSuccess<TData, TMeta = undefined> {
  success: true;
  message: string;
  data: TData;
  meta?: TMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: FieldError[];
}
```

- [ ] **Step 4: Define response helpers**

Create `backend/src/utils/apiResponse.ts`:

```ts
import { Response } from "express";
import { ApiSuccess } from "../types/api";

export function sendSuccess<TData, TMeta = undefined>(
  res: Response,
  statusCode: number,
  message: string,
  data: TData,
  meta?: TMeta
): Response<ApiSuccess<TData, TMeta>> {
  return res.status(statusCode).json({ success: true, message, data, meta });
}
```

- [ ] **Step 5: Define async handler**

Create `backend/src/utils/asyncHandler.ts`:

```ts
import { NextFunction, Request, Response } from "express";

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

- [ ] **Step 6: Define central error middleware**

Create `backend/src/middleware/error.middleware.ts`:

```ts
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};
```

- [ ] **Step 7: Define not-found middleware**

Create `backend/src/middleware/notFound.middleware.ts`:

```ts
import { RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};
```

- [ ] **Step 8: Wire Express app**

Create `backend/src/app.ts`:

```ts
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API is healthy", data: { status: "ok" } });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);
```

- [ ] **Step 9: Wire server entrypoint**

Create `backend/src/server.ts`:

```ts
import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`API running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
```

- [ ] **Step 10: Verify backend foundation**

Run:

```bash
cd backend
npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 11: Commit**

Run:

```bash
git add backend/src
git commit -m "chore: add backend app foundation"
```

Expected: backend foundation commit is created, or skipped if not using git.

## Task 3: Backend Models, Constants, and Validation

**Files:**
- Create: `backend/src/constants/roles.ts`
- Create: `backend/src/constants/lead.ts`
- Create: `backend/src/types/auth.ts`
- Create: `backend/src/types/lead.ts`
- Create: `backend/src/models/User.ts`
- Create: `backend/src/models/Lead.ts`
- Create: `backend/src/validators/auth.validator.ts`
- Create: `backend/src/validators/lead.validator.ts`
- Create: `backend/src/middleware/validate.middleware.ts`

- [ ] **Step 1: Add constants**

Create `backend/src/constants/roles.ts`:

```ts
export const USER_ROLES = ["admin", "sales"] as const;
export type UserRole = (typeof USER_ROLES)[number];
```

Create `backend/src/constants/lead.ts`:

```ts
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["Website", "Instagram", "Referral"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
```

- [ ] **Step 2: Add User model**

Create `backend/src/models/User.ts`:

```ts
import { Schema, model, InferSchemaType } from "mongoose";
import { USER_ROLES } from "../constants/roles";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };
export const User = model("User", userSchema);
```

- [ ] **Step 3: Add Lead model**

Create `backend/src/models/Lead.ts`:

```ts
import { Schema, model, InferSchemaType } from "mongoose";
import { LEAD_SOURCES, LEAD_STATUSES } from "../constants/lead";

const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: LEAD_STATUSES, required: true },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });

export type LeadDocument = InferSchemaType<typeof leadSchema> & { _id: Schema.Types.ObjectId };
export const Lead = model("Lead", leadSchema);
```

- [ ] **Step 4: Add validators**

Create `backend/src/validators/auth.validator.ts`:

```ts
import { z } from "zod";
import { USER_ROLES } from "../constants/roles";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: z.string().min(8),
    role: z.enum(USER_ROLES)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
  })
});
```

Create `backend/src/validators/lead.validator.ts`:

```ts
import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES } from "../constants/lead";

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    status: z.enum(LEAD_STATUSES),
    source: z.enum(LEAD_SOURCES)
  })
});

export const updateLeadSchema = createLeadSchema;

export const leadQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional(),
    search: z.string().trim().optional(),
    sort: z.enum(["latest", "oldest"]).default("latest")
  })
});
```

- [ ] **Step 5: Add validation middleware**

Create `backend/src/middleware/validate.middleware.ts`:

```ts
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  };
}
```

- [ ] **Step 6: Verify**

Run:

```bash
cd backend
npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 7: Commit**

Run:

```bash
git add backend/src
git commit -m "feat: add backend models and validation"
```

Expected: model and validation commit is created, or skipped if not using git.

## Task 4: Backend Authentication and RBAC

**Files:**
- Create: `backend/src/utils/password.ts`
- Create: `backend/src/utils/jwt.ts`
- Create: `backend/src/types/express.d.ts`
- Create: `backend/src/services/auth.service.ts`
- Create: `backend/src/controllers/auth.controller.ts`
- Create: `backend/src/middleware/auth.middleware.ts`
- Create: `backend/src/middleware/role.middleware.ts`
- Create: `backend/src/routes/auth.routes.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/src/tests/auth.test.ts`
- Create: `backend/src/tests/rbac.test.ts`

- [ ] **Step 1: Add password utilities**

Create `backend/src/utils/password.ts`:

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 2: Add JWT utilities**

Create `backend/src/utils/jwt.ts`:

```ts
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../constants/roles";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
```

- [ ] **Step 3: Add Express request auth typing**

Create `backend/src/types/express.d.ts`:

```ts
import { UserRole } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};
```

- [ ] **Step 4: Add auth service**

Create `backend/src/services/auth.service.ts` with functions:

```ts
import { AppError } from "../middleware/error.middleware";
import { User } from "../models/User";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { UserRole } from "../constants/roles";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

function sanitizeUser(user: { _id: unknown; name: string; email: string; role: UserRole }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new AppError(409, "Email is already registered");

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role
  });

  const token = signToken({ userId: String(user._id), role: user.role as UserRole });
  return { user: sanitizeUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) throw new AppError(401, "Invalid email or password");

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) throw new AppError(401, "Invalid email or password");

  const token = signToken({ userId: String(user._id), role: user.role as UserRole });
  return { user: sanitizeUser(user), token };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");
  return sanitizeUser(user);
}
```

- [ ] **Step 5: Add auth middleware**

Create `backend/src/middleware/auth.middleware.ts`:

```ts
import { RequestHandler } from "express";
import { AppError } from "./error.middleware";
import { verifyToken } from "../utils/jwt";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication token is required");
  }

  const token = header.replace("Bearer ", "");
  req.user = verifyToken(token);
  next();
};
```

- [ ] **Step 6: Add role middleware**

Create `backend/src/middleware/role.middleware.ts`:

```ts
import { RequestHandler } from "express";
import { UserRole } from "../constants/roles";
import { AppError } from "./error.middleware";

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw new AppError(401, "Authentication is required");
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to perform this action");
    }
    next();
  };
}
```

- [ ] **Step 7: Add auth controller and routes**

Create `backend/src/controllers/auth.controller.ts`:

```ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { getCurrentUser, loginUser, registerUser } from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  sendSuccess(res, 201, "Registration successful", result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  sendSuccess(res, 200, "Login successful", result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.userId);
  sendSuccess(res, 200, "Current user loaded", user);
});
```

Create `backend/src/routes/auth.routes.ts`:

```ts
import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.get("/me", requireAuth, me);
```

- [ ] **Step 8: Register auth routes**

Modify `backend/src/app.ts` before not-found middleware:

```ts
import { authRouter } from "./routes/auth.routes";

app.use("/api/auth", authRouter);
```

- [ ] **Step 9: Add auth tests**

Create `backend/src/tests/auth.test.ts` with tests for:

```ts
describe("auth", () => {
  it("registers a user and returns a token");
  it("rejects duplicate emails");
  it("logs in with valid credentials");
  it("rejects invalid credentials");
  it("returns current user for a valid token");
  it("rejects /me without token");
});
```

Use `mongodb-memory-server` in helpers so tests do not require a real MongoDB service.

- [ ] **Step 10: Verify auth**

Run:

```bash
cd backend
npm run test -- auth.test.ts
npm run typecheck
```

Expected: auth tests and typecheck pass.

- [ ] **Step 11: Commit**

Run:

```bash
git add backend/src
git commit -m "feat: add authentication and role middleware"
```

Expected: auth commit is created, or skipped if not using git.

## Task 5: Backend Lead CRUD, Filtering, Pagination, Stats, and CSV

**Files:**
- Create: `backend/src/services/lead.service.ts`
- Create: `backend/src/controllers/lead.controller.ts`
- Create: `backend/src/routes/lead.routes.ts`
- Create: `backend/src/utils/csv.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/src/tests/lead.test.ts`
- Modify: `backend/src/tests/rbac.test.ts`

- [ ] **Step 1: Add CSV utility**

Create `backend/src/utils/csv.ts`:

```ts
function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function toCsv(rows: Array<Record<string, string>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? "")).join(","))
  ];
  return lines.join("\n");
}
```

- [ ] **Step 2: Add lead service**

Create `backend/src/services/lead.service.ts` with functions:

```ts
export async function createLead(input, userId);
export async function listLeads(query);
export async function getLeadById(id);
export async function updateLead(id, input);
export async function deleteLead(id);
export async function getLeadStats();
export async function exportLeadsCsv(query);
```

Implementation requirements:
- `listLeads` builds a MongoDB filter from `status`, `source`, and `search`.
- `search` uses case-insensitive regex against `name` and `email`.
- Sort maps `latest` to `{ createdAt: -1 }` and `oldest` to `{ createdAt: 1 }`.
- Pagination uses `skip = (page - 1) * limit` and `limit`.
- Response metadata includes `page`, `limit`, `totalRecords`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.
- `getLeadStats` returns counts for total, New, Contacted, Qualified, and Lost.
- `exportLeadsCsv` reuses the same filter logic as list, without pagination.

- [ ] **Step 3: Add lead controller**

Create `backend/src/controllers/lead.controller.ts`:

```ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import {
  createLead,
  deleteLead,
  exportLeadsCsv,
  getLeadById,
  getLeadStats,
  listLeads,
  updateLead
} from "../services/lead.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const lead = await createLead(req.body, req.user!.userId);
  sendSuccess(res, 201, "Lead created", lead);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listLeads(req.query);
  sendSuccess(res, 200, "Leads loaded", result.data, result.meta);
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const lead = await getLeadById(req.params.id);
  sendSuccess(res, 200, "Lead loaded", lead);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const lead = await updateLead(req.params.id, req.body);
  sendSuccess(res, 200, "Lead updated", lead);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteLead(req.params.id);
  sendSuccess(res, 200, "Lead deleted", { id: req.params.id });
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getLeadStats();
  sendSuccess(res, 200, "Lead stats loaded", data);
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const csv = await exportLeadsCsv(req.query);
  res.header("Content-Type", "text/csv");
  res.attachment("leads.csv");
  res.status(200).send(csv);
});
```

- [ ] **Step 4: Add lead routes**

Create `backend/src/routes/lead.routes.ts`:

```ts
import { Router } from "express";
import { create, detail, exportCsv, list, remove, stats, update } from "../controllers/lead.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createLeadSchema, leadQuerySchema, updateLeadSchema } from "../validators/lead.validator";

export const leadRouter = Router();

leadRouter.use(requireAuth);
leadRouter.get("/", validate(leadQuerySchema), list);
leadRouter.post("/", validate(createLeadSchema), create);
leadRouter.get("/stats", stats);
leadRouter.get("/export/csv", validate(leadQuerySchema), requireRole("admin"), exportCsv);
leadRouter.get("/:id", detail);
leadRouter.put("/:id", validate(updateLeadSchema), update);
leadRouter.delete("/:id", requireRole("admin"), remove);
```

- [ ] **Step 5: Register lead routes**

Modify `backend/src/app.ts` before not-found middleware:

```ts
import { leadRouter } from "./routes/lead.routes";

app.use("/api/leads", leadRouter);
```

- [ ] **Step 6: Add lead tests**

Create `backend/src/tests/lead.test.ts` covering:

```ts
describe("leads", () => {
  it("creates a lead for an authenticated user");
  it("lists leads with 10 item backend pagination");
  it("filters by status and source together");
  it("searches by name or email");
  it("sorts latest and oldest");
  it("returns one lead by id");
  it("updates a lead");
  it("returns stats by status");
  it("exports filtered CSV for admin");
});
```

- [ ] **Step 7: Add RBAC tests**

Create or update `backend/src/tests/rbac.test.ts` covering:

```ts
describe("lead RBAC", () => {
  it("allows admin to delete leads");
  it("blocks sales users from deleting leads");
  it("allows admin to export CSV");
  it("blocks sales users from exporting CSV");
});
```

- [ ] **Step 8: Verify backend lead features**

Run:

```bash
cd backend
npm run test
npm run typecheck
```

Expected: all backend tests and typecheck pass.

- [ ] **Step 9: Commit**

Run:

```bash
git add backend/src
git commit -m "feat: add lead management APIs"
```

Expected: lead API commit is created, or skipped if not using git.

## Task 6: Backend Seed Data

**Files:**
- Create: `backend/src/seed.ts`
- Modify: `backend/package.json`

- [ ] **Step 1: Add seed script**

Create `backend/src/seed.ts`:

```ts
import { connectDatabase } from "./config/database";
import { User } from "./models/User";
import { Lead } from "./models/Lead";
import { hashPassword } from "./utils/password";

async function seed(): Promise<void> {
  await connectDatabase();
  await User.deleteMany({});
  await Lead.deleteMany({});

  const passwordHash = await hashPassword("Password123");
  const admin = await User.create({
    name: "Mousumi Admin",
    email: "admin@example.com",
    passwordHash,
    role: "admin"
  });
  const sales = await User.create({
    name: "Sales User",
    email: "sales@example.com",
    passwordHash,
    role: "sales"
  });

  const statuses = ["New", "Contacted", "Qualified", "Lost"] as const;
  const sources = ["Website", "Instagram", "Referral"] as const;

  await Lead.insertMany(
    Array.from({ length: 28 }).map((_, index) => ({
      name: `Lead ${index + 1}`,
      email: `lead${index + 1}@example.com`,
      status: statuses[index % statuses.length],
      source: sources[index % sources.length],
      createdBy: index % 2 === 0 ? admin._id : sales._id
    }))
  );

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Add seed command**

Modify `backend/package.json`:

```json
{
  "scripts": {
    "seed": "tsx src/seed.ts"
  }
}
```

- [ ] **Step 3: Verify seed compiles**

Run:

```bash
cd backend
npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 4: Commit**

Run:

```bash
git add backend/src/seed.ts backend/package.json
git commit -m "chore: add demo seed data"
```

Expected: seed commit is created, or skipped if not using git.

## Task 7: Frontend Foundation, Types, API Client, and Auth

**Files:**
- Modify: `frontend/src/index.css`
- Create: `frontend/src/types/api.ts`
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/types/lead.ts`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/services/authApi.ts`
- Create: `frontend/src/utils/authStorage.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/routes/ProtectedRoute.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Configure Tailwind base styles**

Create `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
}
```

- [ ] **Step 2: Add frontend types**

Create `frontend/src/types/auth.ts`:

```ts
export type UserRole = "admin" | "sales";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
```

Create `frontend/src/types/lead.ts`:

```ts
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  page: number;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort: "latest" | "oldest";
}

export interface LeadStats {
  total: number;
  New: number;
  Contacted: number;
  Qualified: number;
  Lost: number;
}
```

Create `frontend/src/types/api.ts`:

```ts
export interface ApiSuccess<TData, TMeta = undefined> {
  success: true;
  message: string;
  data: TData;
  meta?: TMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

- [ ] **Step 3: Add API client**

Create `frontend/src/services/api.ts`:

```ts
import axios from "axios";
import { getToken } from "../utils/authStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5050/api"
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

- [ ] **Step 4: Add auth storage**

Create `frontend/src/utils/authStorage.ts`:

```ts
const TOKEN_KEY = "smart_leads_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
```

- [ ] **Step 5: Add auth API service**

Create `frontend/src/services/authApi.ts`:

```ts
import { ApiSuccess } from "../types/api";
import { AuthResponse, AuthUser, UserRole } from "../types/auth";
import { api } from "./api";

export async function register(input: { name: string; email: string; password: string; role: UserRole }) {
  const response = await api.post<ApiSuccess<AuthResponse>>("/auth/register", input);
  return response.data.data;
}

export async function login(input: { email: string; password: string }) {
  const response = await api.post<ApiSuccess<AuthResponse>>("/auth/login", input);
  return response.data.data;
}

export async function getMe() {
  const response = await api.get<ApiSuccess<AuthUser>>("/auth/me");
  return response.data.data;
}
```

- [ ] **Step 6: Add AuthContext**

Create `frontend/src/context/AuthContext.tsx`:

```tsx
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, register as registerRequest } from "../services/authApi";
import { AuthUser, UserRole } from "../types/auth";
import { clearToken, getToken, setToken } from "../utils/authStorage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        if (getToken()) setUser(await getMe());
      } finally {
        setIsLoading(false);
      }
    }
    void restore();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    async login(input) {
      const result = await loginRequest(input);
      setToken(result.token);
      setUser(result.user);
    },
    async register(input) {
      const result = await registerRequest(input);
      setToken(result.token);
      setUser(result.user);
    },
    logout() {
      clearToken();
      setUser(null);
    }
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
```

- [ ] **Step 7: Add protected route**

Create `frontend/src/routes/ProtectedRoute.tsx`:

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 8: Wire app routes**

Modify `frontend/src/App.tsx` with routes for login, register, dashboard, leads, lead detail, and lead form. Until later tasks create full screens, add temporary typed route components in `App.tsx` that render the route name, for example:

```tsx
function TemporaryDashboardPage() {
  return <div className="p-6">Dashboard</div>;
}
```

Remove these temporary components in Tasks 9 through 12 as the real pages are created.

- [ ] **Step 9: Verify**

Run:

```bash
cd frontend
npm run typecheck
```

Expected: frontend typecheck passes.

- [ ] **Step 10: Commit**

Run:

```bash
git add frontend/src
git commit -m "feat: add frontend auth foundation"
```

Expected: frontend auth foundation commit is created, or skipped if not using git.

## Task 8: Frontend UI Components and Layout

**Files:**
- Create: `frontend/src/components/common/Button.tsx`
- Create: `frontend/src/components/common/Input.tsx`
- Create: `frontend/src/components/common/Select.tsx`
- Create: `frontend/src/components/common/LoadingState.tsx`
- Create: `frontend/src/components/common/EmptyState.tsx`
- Create: `frontend/src/components/common/ErrorState.tsx`
- Create: `frontend/src/components/common/ConfirmDialog.tsx`
- Create: `frontend/src/components/common/StatusBadge.tsx`
- Create: `frontend/src/components/common/SourceBadge.tsx`
- Create: `frontend/src/components/layout/AppLayout.tsx`
- Create: `frontend/src/components/layout/Header.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Build common controls**

Create typed reusable controls:
- `Button` with variants `primary`, `secondary`, `danger`, `ghost`.
- `Input` with label and error text.
- `Select` with label, options, and error text.

Each control must accept normal HTML attributes and avoid `any`.

- [ ] **Step 2: Build state components**

Create:
- `LoadingState` for spinners or skeleton rows.
- `EmptyState` with title, message, and optional action.
- `ErrorState` with title, message, and retry action.
- `ConfirmDialog` for delete confirmation.

- [ ] **Step 3: Build badges**

Create:
- `StatusBadge` with distinct colors for New, Contacted, Qualified, Lost.
- `SourceBadge` with readable neutral styling for Website, Instagram, Referral.

- [ ] **Step 4: Build app layout**

Create layout components:
- `Sidebar` with Dashboard and Leads links.
- `Header` with user name, role, and logout button.
- `AppLayout` wrapping protected pages.

Use a restrained dashboard style:
- Light background
- White working surfaces
- Tight spacing
- Clear table hierarchy
- No marketing hero section

- [ ] **Step 5: Verify**

Run:

```bash
cd frontend
npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 6: Commit**

Run:

```bash
git add frontend/src/components
git commit -m "feat: add dashboard UI components"
```

Expected: component commit is created, or skipped if not using git.

## Task 9: Frontend Auth Pages

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Build login page**

`LoginPage` requirements:
- Email input
- Password input
- Submit button
- Link to register
- Inline validation
- Loading state
- Error message for invalid credentials
- Redirect to `/dashboard` after successful login

- [ ] **Step 2: Build register page**

`RegisterPage` requirements:
- Name input
- Email input
- Password input
- Role select with Admin and Sales User
- Submit button
- Link to login
- Inline validation
- Loading state
- Error message for duplicate email
- Redirect to `/dashboard` after successful registration

- [ ] **Step 3: Verify auth pages**

Run:

```bash
cd frontend
npm run typecheck
npm run build
```

Expected: frontend typecheck and production build pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add frontend/src/pages frontend/src/App.tsx
git commit -m "feat: add auth pages"
```

Expected: auth pages commit is created, or skipped if not using git.

## Task 10: Frontend Lead Services, Hooks, and Dashboard

**Files:**
- Create: `frontend/src/services/leadApi.ts`
- Create: `frontend/src/hooks/useDebounce.ts`
- Create: `frontend/src/hooks/useLeads.ts`
- Create: `frontend/src/components/leads/StatsGrid.tsx`
- Create: `frontend/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Add lead API service**

Create functions:

```ts
export async function getLeads(filters: LeadFilters);
export async function getLead(id: string);
export async function createLead(input: LeadFormInput);
export async function updateLead(id: string, input: LeadFormInput);
export async function deleteLead(id: string);
export async function getLeadStats();
export async function exportLeads(filters: LeadFilters);
```

Expected:
- `getLeads` returns `{ leads, meta }`.
- `exportLeads` downloads a Blob from `/leads/export/csv`.

- [ ] **Step 2: Add debounce hook**

Create `frontend/src/hooks/useDebounce.ts`:

```ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
}
```

- [ ] **Step 3: Add leads hook**

Create `useLeads` to:
- Store filters.
- Debounce search.
- Fetch leads when filters change.
- Expose loading, error, data, metadata, and refetch.

- [ ] **Step 4: Build stats grid**

`StatsGrid` requirements:
- Total leads
- New
- Contacted
- Qualified
- Lost
- Loading and error states

- [ ] **Step 5: Build dashboard page**

`DashboardPage` requirements:
- Uses `AppLayout`.
- Shows stats grid.
- Shows recent leads preview from latest leads.
- Shows link/button to `/leads`.
- Handles loading, empty, and error states.

- [ ] **Step 6: Verify**

Run:

```bash
cd frontend
npm run typecheck
npm run build
```

Expected: frontend typecheck and build pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add frontend/src
git commit -m "feat: add lead API client and dashboard"
```

Expected: dashboard commit is created, or skipped if not using git.

## Task 11: Frontend Leads List, Filters, Pagination, and CSV Export

**Files:**
- Create: `frontend/src/components/leads/LeadFilters.tsx`
- Create: `frontend/src/components/leads/LeadsTable.tsx`
- Create: `frontend/src/components/leads/Pagination.tsx`
- Create: `frontend/src/utils/download.ts`
- Create: `frontend/src/pages/LeadsPage.tsx`

- [ ] **Step 1: Add download utility**

Create `frontend/src/utils/download.ts`:

```ts
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Build filters component**

`LeadFilters` requirements:
- Search input
- Status select
- Source select
- Sort select
- Clear filters button
- Search changes pass through debounce in `useLeads`

- [ ] **Step 3: Build table component**

`LeadsTable` requirements:
- Columns: name, email, status, source, created date, actions.
- Actions: view, edit, delete for Admin only.
- Status and source badges.
- Empty state for no results.

- [ ] **Step 4: Build pagination component**

`Pagination` requirements:
- Previous button
- Next button
- Current page display
- Total pages display
- Disable previous/next correctly from metadata

- [ ] **Step 5: Build leads page**

`LeadsPage` requirements:
- Uses `AppLayout`.
- Renders filters.
- Renders Add Lead button.
- Renders CSV export button for Admin only.
- Calls CSV endpoint with active filters.
- Renders table and pagination.
- Renders loading, empty, and error states.

- [ ] **Step 6: Verify Sales User UI restrictions**

Manual check:
- Login as Sales User.
- Confirm delete buttons are hidden.
- Confirm CSV export button is hidden.

- [ ] **Step 7: Verify**

Run:

```bash
cd frontend
npm run typecheck
npm run build
```

Expected: frontend typecheck and build pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add frontend/src
git commit -m "feat: add leads list with filters and export"
```

Expected: leads list commit is created, or skipped if not using git.

## Task 12: Frontend Lead Detail and Lead Form

**Files:**
- Create: `frontend/src/components/leads/LeadForm.tsx`
- Create: `frontend/src/pages/LeadDetailPage.tsx`
- Create: `frontend/src/pages/LeadFormPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Build LeadForm**

`LeadForm` requirements:
- Name input
- Email input
- Status select
- Source select
- Client-side required field validation
- Email format validation
- Submit loading state
- Inline server error message

- [ ] **Step 2: Build create/edit page**

`LeadFormPage` requirements:
- `/leads/new` creates a lead.
- `/leads/:id/edit` loads existing lead and updates it.
- Redirects back to `/leads` or detail page after save.
- Shows success/error messages.

- [ ] **Step 3: Build detail page**

`LeadDetailPage` requirements:
- Shows name, email, status, source, created date, updated date.
- Shows edit button.
- Shows delete button for Admin only.
- Delete uses `ConfirmDialog`.
- Sales User cannot see delete action.

- [ ] **Step 4: Verify**

Run:

```bash
cd frontend
npm run typecheck
npm run build
```

Expected: frontend typecheck and build pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add frontend/src
git commit -m "feat: add lead detail and form flows"
```

Expected: lead form commit is created, or skipped if not using git.

## Task 13: Optional Dark Mode

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/components/layout/Header.tsx`
- Modify: shared frontend components as needed

- [ ] **Step 1: Enable class-based dark mode**

Configure Tailwind:

```js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: []
};
```

- [ ] **Step 2: Add theme toggle**

Add a button in `Header` that toggles `document.documentElement.classList.toggle("dark")` and persists the setting in localStorage.

- [ ] **Step 3: Apply dark styles**

Apply dark variants to:
- App shell
- Header
- Sidebar
- Tables
- Forms
- Badges
- Dialogs

- [ ] **Step 4: Verify**

Run:

```bash
cd frontend
npm run typecheck
npm run build
```

Expected: frontend typecheck and build pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add frontend
git commit -m "feat: add optional dark mode"
```

Expected: dark mode commit is created, or skipped if not using git.

## Task 14: Docker and Local Runtime

**Files:**
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add backend Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

- [ ] **Step 2: Add frontend Dockerfile**

Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:5050/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Add docker-compose**

Create `docker-compose.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongo:27017/smart-leads
      JWT_SECRET: replace-with-a-long-random-secret
      JWT_EXPIRES_IN: 7d
      PORT: 5000
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE_URL: http://localhost:5050/api
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

- [ ] **Step 4: Verify Docker build**

Run:

```bash
docker compose build
docker compose up -d
docker compose ps
```

Expected:
- Mongo, backend, and frontend containers are running.
- Frontend is available at `http://localhost:5173`.
- Backend health endpoint is available at `http://localhost:5050/api/health`.

- [ ] **Step 5: Stop Docker**

Run:

```bash
docker compose down
```

Expected: containers stop cleanly.

- [ ] **Step 6: Commit**

Run:

```bash
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml .env.example
git commit -m "chore: add docker setup"
```

Expected: Docker commit is created, or skipped if not using git.

## Task 15: README and API Documentation

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README overview**

Include:
- Project name
- Assignment context
- Tech stack
- Feature list
- Mandatory requirements covered
- Bonus features if implemented

- [ ] **Step 2: Write setup instructions**

Include:

```bash
cp .env.example .env
cd backend && npm install
cd ../frontend && npm install
docker compose up -d mongo
cd backend && npm run dev
cd frontend && npm run dev
```

Also include Docker-only startup:

```bash
docker compose up --build
```

- [ ] **Step 3: Document demo accounts**

Include after seed data exists:

```text
Admin:
email: admin@example.com
password: Password123

Sales User:
email: sales@example.com
password: Password123
```

- [ ] **Step 4: Document API endpoints**

Include each endpoint:
- Method
- Path
- Auth requirement
- Role requirement
- Example request body or query string
- Success status code

- [ ] **Step 5: Document submission checklist**

Include:
- GitHub repository URL field to fill after pushing the repository
- Deployment note: deferred until after development; do not include deployment steps in this plan
- Updated resume reminder
- Submission email: `ritik.yadav@servicehive.tech`
- Subject: `MERN Internship Assignment Submission - Mousumi Swain`

- [ ] **Step 6: Verify docs**

Run:

```bash
rg -n "TypeScript|JWT|bcrypt|CRUD|pagination|CSV|RBAC|Docker|API|MERN Internship Assignment Submission" README.md
```

Expected: README references all key submission requirements.

- [ ] **Step 7: Commit**

Run:

```bash
git add README.md
git commit -m "docs: add setup and API documentation"
```

Expected: documentation commit is created, or skipped if not using git.

## Task 16: Final Verification

**Files:**
- Review all project files

- [ ] **Step 1: Backend verification**

Run:

```bash
cd backend
npm run typecheck
npm run test
npm run build
```

Expected:
- TypeScript passes.
- Tests pass.
- Backend build succeeds.

- [ ] **Step 2: Frontend verification**

Run:

```bash
cd frontend
npm run typecheck
npm run test
npm run build
```

Expected:
- TypeScript passes.
- Tests pass if test suite exists.
- Frontend build succeeds.

- [ ] **Step 3: Docker verification**

Run:

```bash
docker compose build
docker compose up -d
curl http://localhost:5050/api/health
docker compose down
```

Expected:
- Docker build succeeds.
- Health endpoint returns success.
- Docker shuts down cleanly.

- [ ] **Step 4: Manual reviewer flow**

Manually verify:
- Register Admin.
- Login Admin.
- Create at least 11 leads.
- Confirm pagination shows 10 per page.
- Filter by status.
- Filter by source.
- Search by name.
- Combine search + status + source.
- Sort latest and oldest.
- Export filtered CSV as Admin.
- Delete a lead as Admin.
- Register Sales User.
- Confirm Sales User can create and edit leads.
- Confirm Sales User cannot see or call delete.
- Confirm Sales User cannot see or call CSV export.

- [ ] **Step 5: Assignment rejection checklist**

Confirm:
- No plain JavaScript app logic files.
- TypeScript interfaces/types exist.
- `any` is avoided or justified.
- Validation exists on frontend and backend.
- No hardcoded production API URLs.
- Loading, empty, and error states exist.
- Components are not excessively large.
- README, `.env.example`, Docker, and API docs exist.
- Updated resume is ready.

- [ ] **Step 6: Final commit**

Run:

```bash
git status --short
git add .
git commit -m "chore: prepare assignment submission"
```

Expected: final submission commit is created, or skipped if not using git.

## Execution Options

After this plan is approved, choose one:

1. **Subagent-Driven Execution**
   - Use `superpowers:subagent-driven-development`.
   - Dispatch independent implementation tasks to agents.
   - Review and integrate after each task.

2. **Inline Execution**
   - Use `superpowers:executing-plans`.
   - Execute this plan in the current session task-by-task.
   - Use verification checkpoints after each phase.

For this assignment, inline execution is simpler unless speed matters more than close control.
