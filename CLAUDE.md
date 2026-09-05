@agents.md

<!--
The line above is an import, not a pointer: Claude Code expands
`@path` at launch and loads agents.md into context alongside this
file, so the rule book is present before any work starts rather
than depending on someone choosing to open it. Project-root
CLAUDE.md is also re-read after /compact, so the rules come back
after a context squeeze.

Keep this file to orientation only. Rules live in agents.md, and
duplicating one here would create exactly the conflicting-guidance
problem the memory docs warn about.
-->

## Orientation

Everything above this line is `agents.md`, the rule book — its
standing rules are non-negotiable. Beyond it:

- Skills live in `skills/`; state lives in `plan/`.
- The next pending work is the first `[ ]` row in
  `plan/steps/01_build_plan.md`.
- `docs/` is the decomposed rulebook and adventure, and standing
  rule 9 says to read the relevant concept there first.

Prose in `agents.md` is context, not enforcement. The rules that
must hold whatever an agent decides are enforced mechanically by
`.claude/hooks/guard.mjs` (rules 2, 3 and 5) — extend that file,
in the same commit, when a new rule needs teeth.
