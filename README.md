# Real-Time Complaint System

A full-stack complaint management platform built for institutional use (e.g., a university), with role-based workflows, automatic SLA-breach escalation, and real-time status updates.

Complaints move through a validated status lifecycle, are automatically escalated to admins if they breach their SLA deadline, and every status change is reflected live on role-specific dashboards via WebSockets — no manual refreshing or follow-up required.

---

## Features

- **Role-based access control** — four roles (Student, Staff, HOD, Admin), each with a dedicated dashboard and permission set
- **Complaint lifecycle with validated state transitions** — complaints move through `SUBMITTED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`, with `ESCALATED` as a parallel state; invalid transitions are rejected server-side
- **Type-based SLA rules** — different complaint types carry different resolution deadlines (Hostel: 24h, Academic: 48h, Exam: 72h, Harassment: immediate)
- **Automatic SLA-breach escalation** — a scheduled job checks every 5 minutes for complaints past their deadline and auto-escalates them to an Admin, with a full audit trail
- **Real-time updates** — Socket.IO pushes live status changes to connected clients, scoped per user
- **Audit logging** — every automated action (like an escalation) is recorded with actor, entity, and metadata
- **Rate limiting** — API-level rate limiting to guard against abuse
- **Dashboards & reporting** — role-specific dashboards (student, staff, admin) with charts and summaries built using Chart.js/Recharts

---

## Tech Stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- Socket.IO (real-time layer)
- JWT (`jsonwebtoken`) + `bcrypt`/`bcryptjs` for authentication
- `node-cron` for the scheduled SLA-breach checker
- `ioredis` (Redis client)
- `express-rate-limit` for API rate limiting

**Frontend**
- React 19 + Vite
- Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) for state management
- React Router v7
- Tailwind CSS v4
- Axios for API calls
- Socket.IO client for live updates
- Chart.js + Recharts for dashboard visualizations
- React Hot Toast for notifications

---

## Architecture Overview

```
Client (React + Redux)
   |
   |  REST API (Axios)             Socket.IO (live updates)
   v                                     ^
Express API layer
   |  - Auth middleware (JWT)
   |  - RBAC middleware (role checks)
   |  - State validator middleware (enforces valid status transitions)
   v
Controllers -> Services -> MongoDB (Mongoose models)
   |
   v
Background cron job (every 5 min)
   -> Scans for SLA-breached complaints -> auto-escalates -> logs to Audit trail -> emits Socket.IO event
```

Requests flow through the Express API, are authenticated via JWT and authorized via role-based middleware, and are validated against the complaint's finite-state machine before any status change is persisted. A separate `node-cron` job runs independently of user requests, continuously monitoring for SLA breaches and escalating them automatically.

---

## Project Structure

```
backend/
  src/
    config/         # DB connection, Socket.IO setup, role config
    controllers/     # Route handlers (auth, complaints, admin, escalation)
    jobs/            # Scheduled jobs (SLA breach checker)
    middlewares/     # Auth, RBAC, error handling, state validation
    models/          # Mongoose schemas (Complaint, User, SLA, EscalationRule, AuditLog)
    routes/           # Express route definitions
    services/         # Business logic (complaints, escalation, SLA, priority, audit)
    utils/            # Constants, FSM helpers, JWT helpers, logger
    app.js
    server.js

frontend/
  src/
    api/             # Axios API modules
    components/       # Reusable UI (common, complaint, dashboard)
    context/          # Auth context
    hooks/            # Redux slice, custom hooks (useAuth, useComplaints, useSLA, useRole)
    layouts/           # Role-specific layouts (Admin, Manager, Staff, User, Auth)
    pages/             # Role-specific pages (admin/, staff/, user/, manager/, auth/)
    routes/            # App routing, protected/role-based routes
    utils/             # Constants, formatting, socket client
```

---

## Getting Started

### Prerequisites
- Node.js
- A running MongoDB instance (local or Atlas)
- (Optional) Redis instance, if using rate-limiting/caching features that depend on it

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with at least:
```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your JWT secret>
```

Run the backend:
```bash
npm run dev     # starts with nodemon
# or
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev      # starts Vite dev server (default: http://localhost:5173)
```

> Note: the backend's Socket.IO CORS config currently allows `http://localhost:5173` — update this in `backend/src/config/socket.js` if your frontend runs on a different origin.

---

## API Overview

| Route prefix | Purpose |
|---|---|
| `/api/auth` | Register, login, get current user (`/me`) |
| `/api/complaints` | Create, view, assign, update status, and close complaints (role-restricted) |
| `/api/admin` | Admin dashboard, SLA config, escalation rules, staff management, reports |
| `/health` | Basic health check endpoint |

Most routes require a valid JWT (`authMiddleware`) and are further restricted by role via `rbacMiddleware`.

---

## Complaint Status Lifecycle

```
SUBMITTED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
                |             |
                +--> ESCALATED <--+
                        |
                        +--> IN_PROGRESS
```

Transitions are enforced server-side (`utils/constants.js` -> `VALID_TRANSITIONS`) — a complaint can't jump straight from `SUBMITTED` to `CLOSED`, for example.

---
