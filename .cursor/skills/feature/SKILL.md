---
name: feature
description: >-
  Plan and implement new features (pages, endpoints, components) end-to-end in
  this codebase, following existing conventions instead of inventing new
  patterns. Use whenever the user asks to add, build, or implement a new
  feature, page, endpoint, or piece of functionality. Can also be invoked
  explicitly as /feature.
---

# Feature Implementation

## Process

1. **Clarify scope before writing code.** If requirements, edge cases, or the
   desired UX are ambiguous, ask — don't guess and build the wrong thing. For
   a feature big enough to have real design decisions, consider writing a
   short spec first (see `specs/README.md`).
2. **Find the closest existing pattern and match it.** This codebase already
   has working examples for most feature shapes: a list page with
   loading/error/empty states (`orders.component.ts`), a form + list page
   (`reservations.component.ts`), a guarded admin endpoint
   (`order.controller.ts`). Copy the pattern, don't invent a new one.
3. **Backend first when data is involved**: Prisma schema change → migration
   → DTO with `class-validator` → service → controller with the right guards
   → verify with `nx build api`.
4. **Frontend**: model/interface mirroring the DTO → API service
   (`firstValueFrom` + `HttpClient`) → store or component-local signals,
   depending on whether the state needs to persist across routes →
   component with loading/error/empty states → wire into `app.routes.ts`
   (with `authGuard`/`roleGuard` if it needs protection).
5. **Cross-cutting logic**: if the feature needs the same behavior in both
   `customer-web` and `staff-web`, put it in a shared `libs/frontend/*` lib
   from the start (see the `nx-boundaries` rule) — don't duplicate it and
   refactor later when both consumers are already known.
6. **Verify**: `nx build` + `nx lint` on every touched project, and a manual
   pass through the new UI/endpoint before calling it done.

## Don't

- Don't add a library/dependency for something a few lines of code can do.
- Don't build speculative configurability ("just in case") for a requirement
  that doesn't exist yet.
- Don't leave an inconsistent half-migrated state (one page on the old
  pattern, the new one on a different approach) without flagging it.
