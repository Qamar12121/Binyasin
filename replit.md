# Bin Yasin Travels

A premium full-stack travel agency portal for Bin Yasin Travels — enabling agents to book group tickets, Umrah flights, and packages, with an admin control panel for managing agents, bookings, and ledger.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/bin-yasin-travels run dev` — run the frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Credentials (Demo)

- **Admin:** admin@binyasintravels.com / Admin@123
- **Agent (Approved):** agent@demo.com / Agent@123
- **Agent (Pending):** pending@demo.com / Test@123

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + framer-motion + wouter + TanStack Query
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (bcryptjs + jsonwebtoken), stored in `auth_token`/`auth_user` localStorage
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Theme: Navy/gold dark — `--primary: 43 96% 56%` (gold), `--secondary: 222 47% 11%` (navy)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod validation schemas
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/bin-yasin-travels/src/pages/` — all frontend pages
- `artifacts/bin-yasin-travels/src/context/` — AuthContext, ThemeContext
- `artifacts/api-server/src/seed.ts` — database seed script (run via tsx)

## Architecture decisions

- Contract-first API: OpenAPI spec drives both React Query hooks (Orval) and Zod validators
- Admin uses single `useApproveAgent` mutation with `{ status: "approved"|"rejected" }` for approve AND reject
- Admin booking approval uses `useAdminUpdateBookingStatus` (not agent's `useUpdateBookingStatus`)
- Auth token stored in localStorage `auth_token`; api-client reads it via `setAuthTokenGetter()`
- Agent status flow: `pending` → `approved` or `rejected` (admin-controlled)

## Product

Bin Yasin Travels portal provides:
- **Public pages:** Home, About, Our Story, Services, Contact with WhatsApp floating button
- **Auth:** Register (agent), Login, Forgot Password
- **Agent Dashboard:** Group tickets, Umrah tickets, Umrah packages, create bookings, view ledger, profile settings
- **Admin Panel:** Dashboard analytics, manage agents (approve/reject), manage bookings, group tickets CRUD, Umrah tickets CRUD, packages CRUD, transactions management

## User preferences

- Helpline number: +923018780888
- Navy/gold dark color theme
- Premium travel agency aesthetic

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- `useListAgents` takes no params — client-side filter for status in admin/agents.tsx
- `useListAllBookings` takes no params — client-side filter for status in admin/bookings.tsx
- Seed script: `cd artifacts/api-server && /path/to/tsx src/seed.ts`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
