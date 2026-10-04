---
name: bug-fix
description: >-
  Diagnose and fix bugs in this codebase by finding the root cause, not just
  patching the visible symptom. Use whenever the user reports unexpected
  behavior, an error, a crash, a flaky/intermittent issue, or asks to
  fix/debug something. Can also be invoked explicitly as /bug-fix.
---

# Bug Fixing

## Process

1. **Reproduce first.** Read the actual error/stack trace, or the exact steps
   that trigger the bug, before touching code. If it can't be reproduced from
   the description, ask for the missing detail (logs, request/response,
   exact steps) rather than guessing.
2. **Find the root cause, not the nearest symptom.** Trace the data/control
   flow backward from where it breaks. A race condition, a type mismatch at a
   boundary (e.g. frontend sends a numeric-looking string where the backend's
   `@IsInt()` expects a real number), or a wrong assumption about a library's
   internals are more often the real cause than "add a null check here."
3. **Check for siblings.** If the bug is a pattern (e.g. one
   `ControlValueAccessor` not reporting validity), grep for other places with
   the same shape — fix them together or flag them explicitly, don't fix one
   instance and leave identical bugs elsewhere.
4. **Fix at the source**, not with a defensive workaround at the call site,
   unless the root cause is in code outside this repo's control.
5. **Verify**: run the relevant `nx build`/`nx lint`/`nx test` for every
   touched project (see `AGENTS.md` for commands), and manually exercise the
   fixed path when feasible.
6. **Leave a trail.** If the fix isn't self-explanatory from the code, add one
   comment explaining the actual cause (see the code-comments rule) — not a
   changelog entry, a comment future-you will actually need.

## Red flags to call out, not silently work around

- `try { ... } catch { }` that swallows an error without logging or handling it
- A fix that only works "most of the time" (timing-dependent, relies on
  request ordering) — that's a race condition, not a fix
- Copy-pasting the same patch into multiple files instead of extracting the
  shared logic
