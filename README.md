# Avenza — Citizen Services Portal

A production-grade e-governance platform built by Avenza for the DESC Digital Innovation Center, Mardan.
Tender Reference: DESC-MRD-2026-CNC-088

---

## Technology Stack

| Category | Technology | Role |
|---|---|---|
| Frontend | Next.js 14 (TypeScript) | Server-side rendered citizen portal UI |
| UI Styling | Tailwind CSS | Utility-first responsive design system |
| Backend | NestJS 10 (TypeScript) | Modular REST API with decorator-based architecture |
| Database | PostgreSQL 16 | ACID-compliant relational persistence layer |
| Cache / Session | Redis 7 | Session tokens, rate-limiting, token blacklisting |
| Authentication | JWT + Refresh Tokens | Stateless token-based auth with refresh flow |
| Password Security | bcrypt cost factor 12 | Adaptive hashing — brute-force resistant |
| API Documentation | Swagger / OpenAPI 3.1 | Auto-generated interactive API documentation |
| Containerization | Docker (multi-stage) | Reproducible, minimal production images |
| Local Orchestration | Docker Compose | Full-stack local dev environment |
| Container Orchestration | K3s (Kubernetes) | Lightweight certified K8s cluster |
| CI Pipeline | GitHub Actions | Automated lint, test, build, scan, and image push |
| CD / GitOps | ArgoCD | Declarative Git-driven deployment reconciliation |

---

## CI/CD Pipeline

### Continuous Integration — GitHub Actions

Every push to `main` automatically triggers the full pipeline:
git push to main

↓

┌─────────────────────────────────────────────┐

│  lint-backend   →  TypeScript type-check    │

│  test-backend   →  Jest unit tests          │

│  lint-frontend  →  Next.js build check      │

└─────────────────────────────────────────────┘

↓

┌─────────────────────────────────────────────┐

│  build-backend  →  Push to ghcr.io          │

│  build-frontend →  Push to ghcr.io          │

└─────────────────────────────────────────────┘

↓

┌─────────────────────────────────────────────┐

│  security-scan  →  Trivy CVE scan           │

│                    Results in GitHub        │

│                    Security tab             │

└─────────────────────────────────────────────┘
Pipeline file: `.github/workflows/ci.yml`

Published images:

ghcr.io/youmna267/avenza-citizen-portal/backend:latest
ghcr.io/youmna267/avenza-citizen-portal/frontend:latest

### Continuous Deployment — ArgoCD GitOps

ArgoCD watches the `k8s/` folder. When manifests change:
git push (k8s/ changes)

↓

ArgoCD detects drift

↓

Auto-syncs to K3s cluster

↓

Rolling zero-downtime deployment

↓

Self-heals if pods drift from desired state

ArgoCD application manifest: `k8s/argocd/application.yaml`
ArgoCD UI: `http://192.168.231.128:32015`

---

## Access URLs

| Service | URL |
|---|---|
| Frontend (main app) | http://192.168.231.128:30090 |
| Backend API | http://192.168.231.128:30091/api/v1 |
| Swagger API Docs | http://192.168.231.128:30091/api/docs |
| Health Check | http://192.168.231.128:30091/api/v1/health |
| ArgoCD UI | http://192.168.231.128:32015 |

---

## Default Admin Account
Email:    admin@citizenportal.gov

Password: Admin@2026Secure
Change this password after first login in any real deployment.

---

## Features

**Authentication** — Register, login, JWT access tokens (15 min) + refresh tokens (7 days).
Passwords hashed with bcryptjs at cost factor 12. Token blacklisting via Redis on logout.

**Roles** — Every account is CITIZEN or ADMIN. Enforced server-side with RolesGuard.

**Citizen dashboard** — Summary stats, recent complaints and document requests,
full list views with tracking numbers and live status.

**Admin dashboard** — System-wide view of all citizen submissions with inline
status update controls.

**Complaint management** — Submit complaints with auto tracking number (CMP-2026-XXXXXX).
Status: SUBMITTED → UNDER_REVIEW → RESOLVED

**Document requests** — Birth Certificate, Domicile Certificate, Character Certificate.
Auto tracking number (APP-2026-XXXXXX).
Status: SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → COMPLETED

**Theme** — Light/dark toggle in sidebar, persisted in localStorage.

**API Documentation** — Full Swagger UI at `/api/docs` with Bearer auth support.

---

## Database Schema

- **users** — id, full_name, email, cnic, password_hash, role, phone, address
- **complaints** — id, user_id (FK), tracking_no, title, category, description, status, remarks
- **applications** — id, user_id (FK), tracking_no, type, applicant_name, purpose, status, remarks

Full DDL with enums, indexes, triggers, and admin seed: `database/init.sql`

---

## Project Structure
avenza-citizen-portal/

├── .github/

│   └── workflows/

│       └── ci.yml              # GitHub Actions CI pipeline

├── backend/                    # NestJS API

│   ├── src/

│   │   ├── auth/               # JWT auth, refresh tokens, RolesGuard

│   │   ├── complaints/         # Complaint CRUD + admin endpoints

│   │   ├── applications/       # Document request CRUD + admin endpoints

│   │   ├── users/              # User entity with roles

│   │   └── common/             # Redis module, exception filters

│   ├── jest.config.json        # Test configuration

│   └── Dockerfile              # Multi-stage production build

├── frontend/                   # Next.js 14 App Router

│   ├── src/

│   │   ├── app/                # Pages: dashboard, admin, complaints, applications

│   │   ├── components/         # Sidebar, AppShell, ThemeToggle, StatusBadge

│   │   └── lib/                # API client, auth helpers, theme context

│   └── Dockerfile

├── k8s/                        # Kubernetes manifests

│   ├── namespace.yaml

│   ├── secrets/                # PostgreSQL, Redis, JWT secrets

│   ├── configmaps/             # Non-secret environment config

│   ├── postgres/               # PVC, Deployment, Service

│   ├── redis/                  # PVC, Deployment, Service

│   ├── backend/                # Deployment, Service, HPA

│   ├── frontend/               # Deployment, Service, HPA

│   ├── ingress/                # Traefik ingress routing

│   ├── argocd/

│   │   └── application.yaml    # ArgoCD GitOps application

│   └── deploy.sh               # One-command deploy script

├── database/

│   └── init.sql                # PostgreSQL schema + admin seed

├── docker-compose.yml          # Local development stack

└── .env.example                # Environment template

---

## Running Locally with Docker Compose

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET and database passwords
docker compose up --build
```

Access at http://localhost:3000

---

## Kubernetes Deployment (K3s)

### First time

```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
bash k8s/deploy.sh
```

### After VM restart

```bash
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl rollout restart deployment/postgres deployment/redis deployment/backend deployment/frontend -n avenza
```

### Check status

```bash
kubectl get pods -n avenza
kubectl get applications -n argocd
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register citizen account |
| POST | `/api/v1/auth/login` | Public | Login, returns access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| POST | `/api/v1/auth/logout` | Bearer | Invalidate tokens in Redis |
| GET | `/api/v1/auth/profile` | Bearer | Get current user profile |
| POST | `/api/v1/complaints` | Bearer | File a complaint |
| GET | `/api/v1/complaints` | Bearer | List my complaints |
| GET | `/api/v1/complaints/admin/all` | Admin | All complaints system-wide |
| PATCH | `/api/v1/complaints/:id/status` | Admin | Update complaint status |
| POST | `/api/v1/applications` | Bearer | Submit document request |
| GET | `/api/v1/applications` | Bearer | List my document requests |
| GET | `/api/v1/applications/admin/all` | Admin | All requests system-wide |
| PATCH | `/api/v1/applications/:id/status` | Admin | Update request status |
| GET | `/api/v1/health` | Public | Service health check |
