# FinTrack — Multi-Tenant Expense Analytics Platform

A full-stack financial analytics application that lets users track income/expenses manually or via bulk file upload (CSV/Excel), with real-time dashboards and visualizations.

## Features

- **JWT Authentication** — secure register/login with token-based auth
- **Multi-tenant workspaces** — each user's data is isolated by workspace
- **Bulk data import** — upload CSV/Excel files of transactions; backend auto-parses, validates, and bulk-inserts records using Pandas
- **Auto category detection** — categories are automatically created from uploaded data if they don't already exist
- **Analytics dashboard** — real-time income/expense summary, category breakdown (pie chart), and trend over time (bar chart)
- **Full transaction CRUD** — add, view, filter, and delete transactions through the UI
- **Sidebar navigation UI** — clean, product-style layout inspired by accounting tools like Zoho Books

## Tech Stack

**Backend:** Django, Django REST Framework, PostgreSQL, Simple JWT, Pandas, Docker
**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Axios

## Architecture

```
React/Next.js (Frontend) → REST API (Django + DRF) → PostgreSQL (Docker)
                                ↓
                    JWT Auth · Bulk Upload · Aggregation Endpoints
```

## Database Schema

- **User** — Django's built-in auth user
- **Workspace** — top-level tenant boundary, owned by a user
- **WorkspaceMember** — role-based membership (owner/member)
- **Category** — income/expense categories scoped to a workspace
- **Transaction** — individual income/expense records
- **RecurringRule** — (planned) automatic recurring transaction generation

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register/` | POST | Register a new user (auto-creates a default workspace) |
| `/api/auth/login/` | POST | Login, returns JWT access + refresh tokens |
| `/api/workspaces/` | GET/POST | List or create workspaces |
| `/api/categories/` | GET/POST | List or create categories |
| `/api/transactions/` | GET/POST | List (with filters) or create transactions |
| `/api/transactions/upload/` | POST | Bulk upload transactions via CSV/Excel |
| `/api/dashboard/summary/` | GET | Aggregated income, expense, balance, category breakdown |
| `/api/dashboard/trend/` | GET | Income/expense grouped by date for trend charting |

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker Desktop

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt

docker run --name expense-db -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=expensedb -p 5432:5432 -d postgres

# create a .env file with DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, SECRET_KEY

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install

# create .env.local with:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

npm run dev
```

Visit `http://localhost:3000/register` to create an account and get started.

## Sample Upload Format

CSV/Excel files should include these columns:

| date | amount | type | category | note |
|---|---|---|---|---|
| 2026-01-05 | 500 | expense | Food | Groceries |
| 2026-01-10 | 20000 | income | Salary | January salary |

## Roadmap

- [ ] Recurring transactions (automated via scheduled background jobs)
- [ ] PDF report export
- [ ] CRM integration (Zoho Books)
- [ ] Column-mapping wizard for flexible file imports
- [ ] Token refresh handling (auto-renew expired JWTs)

## Author

Built by Jayanth Gowda as a full-stack portfolio project demonstrating Django REST API design, PostgreSQL data modeling, JWT authentication, bulk data processing, and React/Next.js frontend development.
