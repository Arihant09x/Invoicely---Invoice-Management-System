## Invoice Management Backend (Node.js + TS + Prisma + Postgres)

### Setup

1. Install

- npm install

2. Env

- copy `.env.example` -> `.env`
- set `DATABASE_URL` (Neon)

3. Prisma

- npx prisma generate
- npx prisma migrate deploy (or migrate dev locally)

4. Seed

- npx prisma db seed

5. Run

- npm run dev

Health:

- GET /health

### Auth

- POST /api/auth/register
  Body: { "email": "...", "password": "...", "name": "..." }

- POST /api/auth/login
  Body: { "email": "...", "password": "..." }
  Response: { "accessToken": "...", "user": {...} }

### Invoices (Bearer token required)

- GET /api/invoices?page=1&limit=10&sortBy=createdAt&sortOrder=desc&q=INV&status=PENDING&dateFrom=2026-01-01&dateTo=2026-12-31
- GET /api/invoices/:id
- POST /api/invoices
- PATCH /api/invoices/:id
- DELETE /api/invoices/:id?hard=true (ADMIN only)
- POST /api/invoices/bulk
- GET /api/invoices/export

### Dashboard

- GET /api/dashboard/stats
