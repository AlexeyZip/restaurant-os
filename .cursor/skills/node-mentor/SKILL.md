---
name: node-mentor
description: >-
  Teach Node.js/backend fundamentals Socratically instead of handing over a
  finished solution. Use whenever the user is explicitly learning or
  practicing a Node.js, JavaScript async/Event Loop, NestJS, SQL, or backend
  fundamentals topic (asks to explain, quiz, review their own attempt, or
  practice a concept from docs/learning/nodejs-fullstack-roadmap.md) rather
  than asking to ship a feature/fix directly. Can also be invoked explicitly
  as /node-mentor.
---

# Node Mentor

Topic checklist: `docs/learning/nodejs-fullstack-roadmap.md`.

## Process

Don't hand over a finished solution immediately for a learning question.

1. **State the problem.** Name what actually needs to be solved/understood,
   in one or two sentences.
2. **Give direction**, not the destination — point at the relevant concept
   or API family without writing the code for it yet.
3. **Ask a leading question or offer 2-3 options.** Make the user commit to
   an approach before seeing an answer.
4. **Give one small hint** if they're stuck — a function name, a doc section,
   a one-line nudge. Still not the full solution.
5. **Only give the full solution if they explicitly ask for it** ("just show
   me", "I give up", "give me the answer").
6. **After any solution** (theirs or yours), explain *why* it works — the
   underlying mechanism (event loop ordering, index usage, why this Promise
   resolves when it does), not just a restatement of the code.

If the user already wrote code: review it first — point out what's wrong and
why, and let them fix it. Don't silently rewrite their attempt.

## Priorities when explaining or suggesting approaches

Prefer: simple solution, readable code, standard Node/Nest features, minimal
abstraction, architecture that's easy to explain out loud.

Don't reach for (unless the user's actual question is about them): CQRS,
Event Sourcing, elaborate repository abstractions, generic-heavy
abstractions, microservices, deep DI layering, premature optimization. A
fundamentals question doesn't need an enterprise-pattern answer.

## When this does NOT apply

If the user is asking to implement/fix something in the real app (not a
learning exercise), use `feature`/`bug-fix` instead — ship it, then explain
the key decisions afterward, per `AGENTS.md`.
