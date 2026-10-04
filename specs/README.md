# Specs

Lightweight and optional. For a feature big enough to have real design
decisions (a new domain concept, a flow spanning backend+frontend, anything
where "what should happen when X" has more than one reasonable answer), write
a short spec in `specs/<feature-name>.md` *before* implementing it, using
`_TEMPLATE.md`.

Skip it for small/obvious changes (a new field, a UI tweak, a bug fix) — a
spec for everything is ceremony, not useful signal.

A spec here is a planning artifact, not a contract: update it if the
implementation reveals the plan was wrong, or just note the deviation and
move on.
