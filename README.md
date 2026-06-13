# PharmaCare Rwanda 💊

A modern e-commerce pharmacy platform built for Rwanda — browse medicines, manage prescriptions, and track orders online.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TailwindCSS + Zustand |
| Backend | Node.js + Express.js + Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) + bcryptjs |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Render.com |

## Features

- Product catalog with search, filter by category, pagination
- Shopping cart with real-time quantity management
- Prescription upload for restricted medications
- Order tracking (Pending → Confirmed → Processing → Shipped → Delivered)
- Admin analytics dashboard with charts (revenue, top products, orders)
- Low-stock alerts for admins
- JWT refresh tokens + rate limiting (advanced security)
- Fully responsive (mobile-first)

## Quick Start (Local Dev with Docker)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd pharmacare

# 2. Start only the database for dev
docker compose -f docker-compose.dev.yml up -d

# 3. Setup backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev

# 4. Setup frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api  
Prisma Studio: `npm run db:studio`

## Run with Docker (Full Stack)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pharmacare.rw | admin123 |
| Customer | customer@example.com | customer123 |

## Deployment (Render.com)

### Backend (Web Service)
- Build Command: `cd backend && npm ci && npx prisma generate && npx prisma migrate deploy`
- Start Command: `cd backend && node src/app.js`
- Environment Variables: Set `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`

### Frontend (Static Site)
- Build Command: `cd frontend && npm ci && npm run build`
- Publish Directory: `frontend/dist`
- Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### GitHub Actions Secrets Required
- `DOCKER_USERNAME` — Docker Hub username
- `DOCKER_TOKEN` — Docker Hub access token
- `RENDER_BACKEND_DEPLOY_HOOK` — Render deploy hook URL for backend
- `RENDER_FRONTEND_DEPLOY_HOOK` — Render deploy hook URL for frontend
- `VITE_API_URL` — Production API URL

## Project Structure

```
pharmacare/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Auth, error handling
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Sample data
│   └── Dockerfile
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages + admin
│   │   ├── store/         # Zustand state management
│   │   └── services/      # API client
│   └── Dockerfile
├── docker-compose.yml     # Full stack (production-like)
├── docker-compose.dev.yml # DB only (dev mode)
└── .github/workflows/     # CI/CD pipelines
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | - | Register new user |
| POST | /api/auth/login | - | Login |
| POST | /api/auth/refresh | - | Refresh access token |
| GET | /api/products | - | List products (filterable) |
| GET | /api/products/:id | - | Product detail |
| POST | /api/products | Admin | Create product |
| GET | /api/cart | User | Get cart |
| POST | /api/cart | User | Add to cart |
| POST | /api/orders | User | Place order |
| GET | /api/orders/my | User | My orders |
| GET | /api/orders | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update order status |
| GET | /api/analytics/dashboard | Admin | Analytics data |
| POST | /api/upload/prescription | User | Upload prescription |
