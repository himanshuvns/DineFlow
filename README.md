# DineFlow

> The operating system for the hospitality industry. Multi-tenant SaaS for restaurants, cafés, hotels, cloud kitchens, and food trucks.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 |
| Backend | Go 1.26 + Gin |
| Database | MongoDB Atlas |
| Cache | Upstash Redis |
| Real-time | Socket.io |
| Monorepo | Turborepo + pnpm |
| Deployment | Vercel (frontend) + Railway.app (backend) |

## Monorepo Structure

```
DineFlow/
├── apps/
│   ├── web/        # Next.js 15 — dashboard + customer ordering pages
│   └── api/        # Go 1.26 — REST API + WebSocket server
├── packages/
│   └── types/      # Shared TypeScript types
├── docs/           # Product & architecture planning documents
└── .github/        # CI/CD workflows
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Go >= 1.22
- pnpm >= 9

### 1. Clone & Install

```bash
git clone https://github.com/your-org/dineflow.git
cd dineflow
pnpm install
```

### 2. Configure Environment

```bash
# Frontend
cp .env.example apps/web/.env.local

# Backend
cp .env.example apps/api/.env
```

Edit both files with your MongoDB Atlas URI, Upstash Redis URL, and other credentials. See [`.env.example`](.env.example) for all required variables.

### 3. Run Development Servers

```bash
# Run everything (frontend + backend)
pnpm dev

# Or individually:
cd apps/web && pnpm dev        # http://localhost:3000
cd apps/api && go run cmd/server/main.go  # http://localhost:8080
```

### 4. Health Check

```bash
curl http://localhost:8080/health
# → {"status":"ok","mongo":"connected","redis":"connected"}
```

## Documentation

All planning documents are in [`/docs`](./docs):

- [Product Vision](docs/PRODUCT_VISION.md)
- [Product Requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Feature Roadmap](docs/FEATURE_ROADMAP.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [API Strategy](docs/API_STRATEGY.md)
- [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md)
- [Subscription Model](docs/SUBSCRIPTION_MODEL.md)
- [Development Plan](docs/DEVELOPMENT_PLAN.md)
- [Questions & Assumptions](docs/QUESTIONS_AND_ASSUMPTIONS.md)

## Development Status

- [x] Phase 0 — Planning & Architecture
- [ ] Phase 1 — Foundation & Infrastructure ← **Current**
- [ ] Phase 2 — Restaurant MVP
- [ ] Phase 3 — Hotel Module
- [ ] Phase 4 — SaaS Billing
- [ ] Phase 5 — Scale & Analytics
- [ ] Phase 6 — AI Features
