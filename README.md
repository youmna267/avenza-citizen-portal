# Avenza — Citizen Services Portal

A Dockerized government citizen services platform built by Avenza: citizens
register, sign in, file complaints, request official documents, and track
every submission from a sidebar dashboard. Staff sign in to a separate Admin
section to review and update the status of every submission in the system.
Light and dark themes are supported throughout.

## What's new in v2

- **Sidebar navigation** replacing the original top bar, role-aware (citizens
  see Dashboard / My complaints / My document requests; admins see Overview /
  All complaints / All document requests).
- **Admin role and dashboard.** A `role` column (`CITIZEN` | `ADMIN`) was
  added to the `users` table. Admins can view every citizen's complaints and
  document requests and change their status inline. Citizens still only see
  and manage their own.
- **Light / dark theme toggle**, persisted in the browser and respecting the
  visitor's OS preference on first visit.
- A seeded admin account is created automatically on first database init
  (see Default admin account below).

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Backend | NestJS 10 · TypeScript · JWT auth · role-based guards |
| Database | PostgreSQL 16 |
| Containerization | Docker · Docker Compose |
| Storage | Named Docker volume (`postgres-data`) — survives rebuilds |

## Default admin account

Seeded automatically the first time the database container initializes:

```
Email:    admin@citizenportal.gov
Password: Admin@2026Secure
```

Change this password after first login in any real deployment — there is no
in-app "change password" flow yet, so for now that means updating the
`password_hash` directly in the database, or re-running the seed with a new
bcrypt hash.

## Folder structure

```
citizen-portal/
├── docker-compose.yml
├── .env.example
├── database/
│   └── init.sql                 # Schema: users (+role), complaints, applications, admin seed
├── backend/                     # NestJS API
│   ├── Dockerfile
│   └── src/
│       ├── auth/                # Register, login, JWT strategy/guard, RolesGuard
│       ├── users/                # User entity (+ role)
│       ├── complaints/           # Complaint CRUD, citizen + admin endpoints
│       ├── applications/         # Document request CRUD, citizen + admin endpoints
│       ├── common/filters/       # Global exception handling
│       ├── app.module.ts
│       └── main.ts
└── frontend/                    # Next.js app
    ├── Dockerfile
    └── src/
        ├── app/
        │   ├── login/  register/
        │   ├── dashboard/                  # Citizen overview
        │   ├── complaints/  complaints/new/
        │   ├── applications/  applications/new/
        │   └── admin/                      # Admin overview
        │       ├── complaints/             # All complaints, status editing
        │       └── applications/           # All document requests, status editing
        ├── components/           # Sidebar, AppShell, ThemeToggle, StatusBadge, etc.
        ├── lib/                  # api client, auth/session helpers, theme context, useCurrentUser
        └── types/
```

## Features

**Authentication** — register, login, JWT-protected routes, `/auth/profile`
endpoint for the current user. Passwords hashed with bcryptjs (12 rounds);
never returned in API responses. JWTs now carry the user's role.

**Roles** — every account is `CITIZEN` or `ADMIN`. Citizens can only read and
manage their own complaints and document requests. Admins can list every
submission in the system and update its status; this is enforced server-side
with a `RolesGuard`, not just hidden in the UI.

**Citizen dashboard** — summary counts plus recent complaints and document
requests, with full list views under "My complaints" and "My document
requests" in the sidebar.

**Admin dashboard** — system-wide counts, recent activity across all
citizens, and dedicated management tables for all complaints and all
document requests with inline status-update controls.

**Complaints** — submit with title/category/description, auto-generated
tracking number (`CMP-2026-000123`), status lifecycle: `SUBMITTED` →
`UNDER_REVIEW` → `RESOLVED`. Status changes are admin-only.

**Document requests** — Birth Certificate, Domicile Certificate, Character
Certificate. Auto tracking number (`APP-2026-000123`), status lifecycle:
`SUBMITTED` → `UNDER_REVIEW` → `APPROVED`/`REJECTED` → `COMPLETED`. Status
changes are admin-only.

**Theme** — light/dark toggle in the sidebar, stored in `localStorage`,
falls back to the visitor's OS preference on first load.

**Security basics** — JWT bearer auth on every protected route, role checks
enforced server-side via guard + decorator, per-route rate limiting on auth
endpoints, global input validation (`class-validator`), Helmet security
headers, parameterized queries via TypeORM, ownership checks so citizens can
only read their own records (admins are explicitly exempted from that check).

## Database schema (summary)

- **users** — id, full_name, email (unique), cnic (unique), password_hash, role, phone, address
- **complaints** — id, user_id (FK), tracking_no, title, category, description, status, remarks
- **applications** — id, user_id (FK), tracking_no, type, applicant_name, purpose, status, remarks

Full DDL with enums, indexes, auto-numbering triggers, and the admin seed
insert is in `database/init.sql`.

## Running locally

**Prerequisites:** Docker and Docker Compose installed.

1. Copy the environment template and fill in real secrets:

   ```bash
   cp .env.example .env
   ```

   At minimum, change `JWT_SECRET` and the database passwords. Generate a
   strong secret with:

   ```bash
   openssl rand -hex 64
   ```

2. Build and start everything:

   ```bash
   docker compose up --build
   ```

3. Once all three containers report healthy:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api/v1
   - Backend health check: http://localhost:4000/api/v1/health
   - PostgreSQL: localhost:5432 (for inspection with `psql` or a GUI client)

4. Sign in as the seeded admin (see Default admin account above) to see the
   Admin dashboard, or register a new citizen account to see the citizen
   flow.

### Upgrading an existing v1 deployment

The `users` table gained a `role` column and the database seed now inserts
an admin account, both of which only run on first container initialization.
If you already have a running v1 stack with data in its Postgres volume,
`docker compose up --build` alone will **not** apply the new schema, since
the init script only runs against an empty database volume.

The simplest path for a local/test deployment with no data worth keeping:

```bash
docker compose down -v   # stops containers AND wipes the old database volume
docker compose up --build
```

This re-runs `database/init.sql` from scratch, including the new `role`
column and the admin seed. If you have real citizen data you need to keep,
this needs a proper migration instead of a volume wipe — ask if you want
help writing one.

### Stopping / resetting

```bash
docker compose down            # stop containers, keep data
docker compose down -v         # stop containers AND wipe the database volume
```

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | – | Create citizen account, returns JWT |
| POST | `/api/v1/auth/login` | – | Authenticate, returns JWT (includes role) |
| GET | `/api/v1/auth/profile` | check | Current user's profile |
| POST | `/api/v1/complaints` | check | File a complaint |
| GET | `/api/v1/complaints` | check | List your own complaints |
| GET | `/api/v1/complaints/admin/all` | Admin | List every complaint in the system |
| GET | `/api/v1/complaints/:id` | check | Get one complaint (owner, or any admin) |
| PATCH | `/api/v1/complaints/:id/status` | Admin | Update a complaint's status |
| POST | `/api/v1/applications` | check | Submit a document request |
| GET | `/api/v1/applications` | check | List your own requests |
| GET | `/api/v1/applications/admin/all` | Admin | List every request in the system |
| GET | `/api/v1/applications/:id` | check | Get one request (owner, or any admin) |
| PATCH | `/api/v1/applications/:id/status` | Admin | Update a request's status |
| GET | `/api/v1/health` | – | Service health check |

All protected routes require `Authorization: Bearer <token>`. Routes marked
"Admin" return `403 Forbidden` for citizen accounts even with a valid token.

## What's deliberately out of scope for this build

Per the original brief, this stops at a working Dockerized application with
basic role separation. Not included: an in-app way to promote a citizen to
admin (currently requires a direct database update), password reset/change
flows, audit logging of admin actions, Kubernetes manifests, CI/CD
pipelines, Terraform/IaC provisioning, or Prometheus/Grafana observability.
The services remain stateless aside from Postgres and expose health
endpoints, so they're a reasonable starting point for that work later.
