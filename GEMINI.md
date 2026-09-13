# DineFlow — Antigravity (`agy`) Workspace Rules

## Project
DineFlow is a **Next-Gen Multi-Tenant Restaurant & Hospitality OS** (monorepo):
- `apps/web` — Next.js 14 frontend (TypeScript, Tailwind CSS, shadcn/ui)
- `apps/api` — Go REST API (Gin framework, MongoDB, Redis)
- Deployment: **Vercel** (frontend) + **Railway** (backend)
- Production URL: https://dineflow-steel.vercel.app
- Backend API: https://api-production-f170.up.railway.app

## Tech Stack
- **Package manager**: `pnpm` (workspace root) — always use `pnpm`, never `npm` or `yarn` directly
- **Frontend build**: `pnpm --filter web run build` | dev: `pnpm --filter web run dev`
- **Backend build**: `go build ./...` from `apps/api/`
- **Git remote**: `github.com:himanshuvns/DineFlow.git` (main branch)

## Code Style
- TypeScript: strict mode, no `any` types
- React: functional components + hooks only, no class components
- CSS: Tailwind + Vanilla CSS via `index.css`; support both `light` and `dark` mode with `dark:` variants
- Go: idiomatic Go, explicit error handling
- All UI text must have high contrast in both light and dark modes

## Key Files
- Frontend entry: `apps/web/app/page.tsx`
- Dashboard layout: `apps/web/app/dashboard/layout.tsx`
- Toast component: `apps/web/components/ui/toast.tsx`
- Tenant data store: `apps/web/lib/stores/tenant-data-store.ts`
- API main: `apps/api/cmd/server/main.go`
- API seed data: `apps/api/cmd/server/seed.go`

## Workflow Rules
1. Always run `pnpm --filter web run build` before declaring frontend work done.
2. Commit messages: use conventional commits (`feat:`, `fix:`, `chore:`, etc.)
3. Push to `main` after verifying the build passes.
4. Never hardcode API URLs — use `NEXT_PUBLIC_API_URL` env var.
5. Every UI change must work in both Light Mode and Dark Mode.
