# RestaurantOS — Agent Guide

Full-stack restaurant ordering & table-reservation platform. Nx monorepo:
Angular frontends + NestJS backend + Prisma/PostgreSQL.

## Stack

- **Monorepo**: Nx. Apps/libs carry `scope:*`/`type:*` tags, enforced by
  `@nx/enforce-module-boundaries` in `eslint.config.mjs`.
- **Backend**: NestJS, Prisma (PostgreSQL), JWT auth (short-lived access token +
  rotating single-use refresh token), `class-validator` DTOs.
- **Frontend**: Angular, standalone components only, `@ngrx/signals` SignalStore,
  Angular Material, signal-based `input()`/`output()`, new `@if`/`@for` control flow.
- **Infra**: Docker Compose (Postgres, Redis, MinIO, Mailpit) — see `docker-compose.yml`.

## Layout

| Path | What |
|---|---|
| `apps/api` | NestJS backend entry point |
| `apps/customer-web` | Angular app for diners |
| `apps/staff-web` | Angular app for staff/admin (scaffolded, not built out yet) |
| `libs/backend/*` | NestJS feature modules: `auth`, `menu`, `orders`, `reservations`, `kitchen`, `database` |
| `libs/frontend/ui` | Shared Angular UI components, `ui-*` selectors |
| `libs/frontend/auth-client` | Shared auth state/guards/interceptor — used by both web apps |
| `libs/shared/util` | Framework-agnostic helpers (currency formatting, etc.) |
| `prisma/schema.prisma` | Single source of truth for the DB schema |

## Commands

```bash
npm run dev:be          # serve the NestJS API
npm run dev:fe          # serve customer-web
npm run db:seed         # seed roles + test users (admin@restaurant-os.dev / Admin123!)
npx nx build <project>  # e.g. npx nx build customer-web
npx nx lint <project>
npx nx test <project>
npx prisma migrate dev  # create + apply a migration from a schema.prisma change
```

## Conventions

Enforceable details live in `.cursor/rules/` and load automatically per file
type. Highlights:

- Everything written into the repo is in English — code, comments, commits,
  seed data. Chat replies to the user can be in any language; the repo cannot.
- Never use the non-null assertion operator (`!`) — narrow types with a real guard.
- Comments explain *why*, not *what* — don't restate the line below them.
- Commits: `type: short imperative summary` (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- New shared frontend logic goes in a `libs/frontend/*` lib tagged
  `scope:shared` from the start, not duplicated into both web apps and
  refactored later.

## Workflow skills

`.cursor/skills/bug-fix/` and `.cursor/skills/feature/` describe the
step-by-step process for those two task types. Both trigger automatically
when relevant, or can be invoked explicitly in chat as `/bug-fix` and
`/feature`.

For a feature big enough to have real design decisions, write a short spec in
`specs/` first — see `specs/README.md`.
