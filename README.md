# Navapai

Navapai is a full-stack developer learning and portfolio platform. It helps developers organize learning domains, follow curriculum roadmaps, build projects, track weekly work, save resources, document progress, and share a public developer profile.

This repository is also an AWS Solutions Architect Associate (SAA) practice project. Its architecture and deployment notes are designed to show how a stateful web application can be separated into presentation, application, and data tiers while keeping early environments cost-conscious.

## Product Capabilities

- Browse learning domains, curriculum topics, projects, resources, community contributions, and leaderboards.
- Register, log in, refresh JWT sessions, and manage a developer profile.
- Enroll in domains and maintain learning plans with topic progress.
- Create projects, attach screenshots, preview GitHub metadata, sync GitHub repositories, and publish a portfolio.
- Track weekly tasks and subtasks, developer notes, pinned notes, career milestones, and certifications.
- Earn achievements and view activity analytics and heatmaps.
- Support community upvotes, moderation workflows, audit logs, and administrative user management.

## AWS Solutions Architect Practice Projects
This repository demonstrates three AWS projects using the same Navapai application:
1. Highly Available Three-Tier Architecture (VPC, ALB, Auto Scaling, RDS)
2. Infrastructure as Code with Terraform
3. Containerized Monitoring with Prometheus + Grafana + CloudWatch

## Architecture

```text
Browser
  |
  v
React + Vite development server or Nginx static site
  |
  v
Django REST API + JWT authentication
  |                  |
  v                  v
PostgreSQL        Redis (declared for cache/session workloads)
```

The repository includes a Docker Compose deployment scaffold with Nginx, Django, PostgreSQL, and Redis. It is not production-ready as committed: the Django settings read `DB_*` variables while Compose provides `DATABASE_URL`, and the Compose file contains hardcoded credentials. See the Docker section and [DEPLOYMENT.md](DEPLOYMENT.md) before using it. The AWS document covers a VPC, EC2, RDS PostgreSQL, CloudWatch, IAM, and ACM baseline, with ALB, Auto Scaling, Route 53, and ElastiCache as possible scaling components.

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- React Hook Form and Zod
- Lucide React
- Oxlint

### Backend

- Python 3.12
- Django 5.1+
- Django REST Framework
- Simple JWT
- PostgreSQL via psycopg
- Pillow and python-dotenv
- Gunicorn in the backend image

### Infrastructure

- Docker and Docker Compose
- PostgreSQL 16 Alpine
- Redis 7 Alpine (included in Compose; not currently wired into Django settings)
- Nginx 1.25 Alpine

## Repository Layout

```text
backend/
  apps/                 Django feature modules
  config/               Django settings, URL routing, WSGI and ASGI
  manage.py
  requirements.txt
frontend/
  src/                  React pages, layouts, context, routes and services
  public/               Static public assets
  package.json
docker-compose.yml      PostgreSQL, Redis, backend and frontend services
DEPLOYMENT.md           AWS architecture and SAA deployment notes
*.bat                   Windows development launchers
```

## Prerequisites

- Git
- Python 3.12 or later
- Node.js 22 or later and npm
- PostgreSQL for the non-Docker backend workflow
- Docker Desktop for the container workflow

## Local Development on Windows

### 1. Clone and enter the repository

```powershell
git clone https://github.com/<your-user>/navapai.git
cd navapai
```

### 2. Configure the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py createsuperuser
```

Update `backend/.env` with a local PostgreSQL database and a development-only secret key. Keep `.env` private.

### 3. Install and start the frontend

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open:

- Frontend: http://127.0.0.1:5173/
- API: http://127.0.0.1:8000/api/
- Health check: http://127.0.0.1:8000/api/health/
- Django admin: http://127.0.0.1:8000/admin/

The root launcher can start both development servers on Windows:

```powershell
.\start_navapai.bat
```

### Frontend environment

The API client defaults to `http://127.0.0.1:8000/api/`. To use another API origin, create `frontend/.env` with:

```dotenv
VITE_API_URL=http://localhost:8000/api/
```

## Docker Compose

The Compose files are a starting point, not a verified deployment workflow. Before starting the stack, align the backend's `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` settings with the PostgreSQL service. The current Compose file instead supplies `DATABASE_URL`, which Django does not read. It also contains hardcoded credentials and should not be used for a public or production deployment as-is.

After correcting the configuration for your environment, start the stack with:

```powershell
docker compose up --build
```

Open the frontend at http://localhost/ and the API at http://localhost/api/health/.

Stop the stack with:

```powershell
docker compose down
```

Use `docker compose down -v` only when you intentionally want to remove the PostgreSQL volume and all local database data.

For any public deployment, move secrets to environment variables or a secrets manager, disable debug mode, and restrict CORS and `ALLOWED_HOSTS` to trusted origins.

## API Surface

All API endpoints are under `/api/` and use JWT bearer authentication for protected operations.

| Module       | Base path            | Responsibility                                              |
| ------------ | -------------------- | ----------------------------------------------------------- |
| Core         | `/api/`              | Health check                                                |
| Accounts     | `/api/auth/`         | Registration, login, refresh, current user, profile         |
| Domains      | `/api/domains/`      | Catalog, enrollment, curriculum, plans, merging and stats   |
| Projects     | `/api/projects/`     | Projects, screenshots, GitHub sync, showcase and portfolios |
| Tasks        | `/api/tasks/`        | Weekly tasks, subtasks, status and statistics               |
| Notes        | `/api/notes/`        | Developer notes, pinning, public notes and stats            |
| Resources    | `/api/resources/`    | Resource library, resource stats and bookmarks              |
| Career       | `/api/career/`       | Certifications, milestones and public timelines             |
| Community    | `/api/community/`    | Contributions, upvotes and moderation                       |
| Analytics    | `/api/analytics/`    | Dashboard analytics and activity heatmaps                   |
| Gamification | `/api/gamification/` | Badges, achievements and leaderboard                        |
| Admin suite  | `/api/admin-suite/`  | System health, audit logs and user administration           |

## Verification Commands

Backend:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py check
python manage.py test
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

## SAA Architecture Notes

Navapai can be discussed as a three-tier application:

1. Presentation tier: React assets served by Nginx, S3, or CloudFront.
2. Application tier: stateless Django/Gunicorn instances running behind an ALB when scale requires it.
3. Data tier: Amazon RDS for PostgreSQL, with Redis/ElastiCache for cache and session workloads.

Recommended AWS progression:

- Portfolio baseline: one EC2 instance, RDS PostgreSQL, IAM, VPC security groups, CloudWatch, and ACM where applicable.
- Production growth: private subnets for application and database resources, ALB, Auto Scaling, ElastiCache, S3 for media, CloudFront for frontend delivery, and Route 53 for DNS.
- Security priorities: least-privilege IAM, no secrets in source control, TLS, restricted security groups, private database access, backups, health checks, and centralized logs.

The full decision record, trade-offs, and free-tier considerations are in [DEPLOYMENT.md](DEPLOYMENT.md).

## GitHub Repository Setup

Before publishing, remove hardcoded credentials from the Compose configuration and admin provisioning command, then rotate any credentials that have already been committed. Keep local `.env` files, database dumps, and generated secrets out of Git; `.gitignore` excludes environment files, but it cannot remove secrets from existing Git history.

Create an empty repository on GitHub named `navapai` without adding a README, `.gitignore`, or license because those files are maintained here. Then run these commands from the project root:

```powershell
git init
git add README.md .gitignore backend frontend docker-compose.yml DEPLOYMENT.md *.bat
git status
git commit -m "Initial Navapai application"
git branch -M main
git remote add origin https://github.com/<your-user>/navapai.git
git push -u origin main
```

For a private repository, use GitHub authentication through Git Credential Manager or SSH. Never commit passwords, API keys, OAuth secrets, database dumps, `backend/.env`, or `frontend/.env`.

## Project Status

Navapai is an active portfolio and learning project. The application contains the main user journeys and AWS design documentation, while production hardening, secret management, deployment automation, and high-availability infrastructure remain environment-specific work.

## License

No license has been selected yet. Add a license before accepting external contributions or redistributing the project.
