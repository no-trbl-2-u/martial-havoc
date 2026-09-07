# Site audit

> Latest findings from `/iterate audit`. Rewritten on each audit
> pass. Durable rows (`[needs-user-call]`, `[user-issue #N]`, a
> `> Bias:` line) survive the rewrite.

# Site audit — 2026-09-07 (third pass)

The first `/iterate` tick since the feel-of-play block closed: 10a-10l
are all shipped and merged, the milestone row (Phase 10) is the
operator's own sitting, and Phase 11 waits on it in time only. So this
pass ran where the work actually is - `plan/CRITIQUE.md`'s Pending
block, 27 rows deep and never drained, `/critique` proper still never
having run.

Two rows score as HIGH. The copy leg wins on ease: its fix is
mechanical, has no judgement in it, and defends the invariant the whole
project rests on (a citation is data, never code). The dispatcher row
is real but its risk has fallen since it was filed - the remaining
phases are a chain, not a DAG - so it keeps its score and waits.

## Top 5 findings (scored)

### [x] [7.2] scripts/copy-check.test.ts — the copy leg does not see a citation as copy
- category: external-critique
- impact: 9 (standing rule 7's mechanical half; three hardcoded citations shipped green under it, and two more were still live in `reduce.ts` when this pass ran)
- ease: 8 (a fourth shape in a file built for shapes; no new machinery)
- source: agent
- next: shipped this tick — see `plan/CRITIQUE.md` Done

### [ ] [5.4] skills/ship-a-phase.md — the dispatcher picks by list order, not by dependency
- category: external-critique
- impact: 7 (latent: the row order happens to be a topological order today, and nothing holds it there)
- ease: 7 (a test asserting the row order is a topological order of the `Waits on` graph)
- source bump: +0.5 (user-filed via /jot)
- next: the cheap version — one test over `01_build_plan.md`, red on a bad reordering. Risk is lower now than when filed: 11-14 are a chain, so a mis-pick needs an `/expand` insertion first.

### [ ] [4.5] packages/content — 149 authored lines are held to no style guide at all
- category: external-critique
- impact: 6 (the oracle, Unexpected Event and effect lines are the bulk of what a player reads and `voice.test.ts` deliberately exempts them)
- ease: 7 (a guide, then a test leg shaped like the narrator's)
- source bump: +0.5 (user-filed via /jot)
- next: needs a written guide before a test can exist; a `/plan-a-phase` or an `/oversight` call on what the non-narrator voice is

### [ ] [4.5] packages/content — effects.json operation strings are unverified
- category: external-critique
- impact: 6 (72 records name engine operations as dotted strings; nothing checks the name resolves, and Phase 10l leaned on one)
- ease: 7 (a test mapping every non-null `operation` to an engine export)
- source bump: +0.5 (user-filed via /jot)
- next: one test in `packages/content`; the engine's `index.ts` is the list to resolve against

### [ ] [4.0] general — CLOUDFLARE_API_TOKEN cannot read Workers Builds
- category: external-critique
- impact: 7 (it blocks `/march` step 2 outright: the critique gate wants a green `deploy:check`, which wants a `/builds/**` read this token does not have, so `/critique` can never fire from a cloud tick and the queue this pass drained never refills)
- ease: 5 (the row's own fix is the operator widening the token; the agent-side alternative is teaching `deploy:check` to read the deployed version off the Workers Scripts API instead, which is a rewrite on an unproven assumption)
- source bump: +0.5 (user-filed via /jot)
- next: `[needs-user-call]` — widen the token with Workers Builds read, and say so in `.env.example`. Until then the gate is dead rather than not-due, and no agent tick can revive it cheaply.
