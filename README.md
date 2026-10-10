# Retain: Personal Expense & Budget Manager

Retain is a responsive web app for tracking personal expenses and monthly budgets, with an admin dashboard for platform insights and category management.

**Live app:** DEPLOYED_URL_HERE
**API:** DEPLOYED_API_URL_HERE/api/health

## Main features

**Users**
- Sign up, sign in, sign out (JWT authentication)
- Create, view, edit, and delete their own expenses (title, amount, category, date, payment method, optional notes)
- Search, filter by category, payment method and date range, sort by date or amount, and paginate
- Set and update a monthly budget, with a within / approaching / over status
- Dashboard: monthly total, remaining budget, highest expense, spending by category, recent expenses

**Admins**
- Create, rename, and delete expense categories. Deleting a category moves its expenses to the default "Uncategorized" category
- Platform insights: total users, total expenses, total value, expenses recorded this month, spending per category, five most- and least-used categories, recent expenses, recent users

## Technologies

- **Frontend:** React 19, TypeScript, Vite, Material UI, React Router, React Context (authentication), Redux Toolkit (expense search, filtering and sorting)
- **Backend:** Node.js, Express, JWT, bcryptjs
- **Database:** PostgreSQL (Neon)

## Project structure

```
backend/    Express REST API and database schema
frontend/   React + TypeScript + Vite app
```

## Setup

Requirements: Node.js 18+ and a PostgreSQL database (for example a free Neon project).

### Backend

```bash
cd backend
npm install
cp .env.example .env    
npm run db:init          
npm run dev              
```

Environment variables (`backend/.env`):

| Variable | Purpose |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `PORT` | API port (default 5000) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |

Create an admin: sign up normally, then run `npm run make-admin -- you@example.com`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    
npm run dev          
```

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the API, ending in `/api` |

## API overview

All routes except sign up and sign in require `Authorization: Bearer <token>`. Users only ever access their own expenses and budgets. Admin routes return 403 to non-admins.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | public | Create an account |
| POST | `/api/auth/login` | public | Sign in, returns a token |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/categories` | user | List categories |
| POST | `/api/categories` | admin | Create a category |
| PUT | `/api/categories/:id` | admin | Rename a category |
| DELETE | `/api/categories/:id` | admin | Delete a category (expenses move to Uncategorized) |
| GET | `/api/expenses` | user | List own expenses. Query: `search`, `category`, `paymentMethod`, `startDate`, `endDate`, `sortBy` (date, amount), `order`, `page`, `limit` |
| POST | `/api/expenses` | user | Create an expense |
| GET | `/api/expenses/:id` | user | View an expense |
| PUT | `/api/expenses/:id` | user | Update an expense |
| DELETE | `/api/expenses/:id` | user | Delete an expense |
| GET | `/api/budgets/:month` | user | Budget, spending and status for `YYYY-MM` |
| PUT | `/api/budgets/:month` | user | Set or update the budget |
| GET | `/api/dashboard?month=YYYY-MM` | user | Dashboard data |
| GET | `/api/admin/insights` | admin | Platform insights |
| GET | `/api/health` | public | Health check |

## Security notes

- Passwords are hashed with bcrypt; tokens are signed JWTs.
- The backend checks ownership on every expense and budget query, and re-reads the user's role from the database on each request.
- Frontend route guards are for usability only; the API enforces access control.
