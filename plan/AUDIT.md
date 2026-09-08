# Site audit

> Latest findings from `/iterate audit`. Rewritten on each audit
> pass. Durable rows (`[needs-user-call]`, `[user-issue #N]`, a
> `> Bias:` line) survive the rewrite.

# Site audit — 2026-09-07 (fourth pass)

The tick after PR #61, which filed the first `/expand` candidates and
the third field report. That merge changed what is iterate work: the
149-lines row is now the operator's decision to cut, blocked on a
sealed spec sentence, so it leaves this list and lives as a candidate.
Two rows in `plan/CRITIQUE.md` Pending turned out to be already
shipped or already answered, which is its own finding — the queue is
28 rows deep, has never been drained by a `/critique` pass, and rows
go stale in it faster than they are read.

The dispatcher row wins on the same ground the copy leg won on last
tick: it defends an invariant the loop itself rests on, its fix is
mechanical, and there is no judgement in it. It shipped this tick.

## Top 5 findings (scored)

### [x] [5.4] skills/ship-a-phase.md — the dispatcher picks by list order, not by dependency
- category: external-critique
- impact: 7 (latent: the row order happens to be a topological order today, and nothing held it there)
- ease: 7 (a test asserting the row order is a topological order of the `Waits on` graph)
- source bump: +0.5 (user-filed via /jot)
- issue: #62
- next: shipped this tick as commit 1648bad — `scripts/plan-check.test.ts`, a fifth root-level leg of the verify gate, proven red on three bad plans before green on this one. See `plan/CRITIQUE.md` Done. The fuller fix (Step 1 reading `Waits on` itself) is phase-shaped and unshipped.

### [ ] [4.4] packages/content + docs — five rule-file fields carry the docs' gloss, not the book's text
- category: external-critique
- impact: 7 (standing rule 9's sharp end: five fields labelled `rule` are the bundle's summary, not the book's printed text, and the content is transcribed from the bundle, so a gloss in `docs/` is a gloss in play)
- ease: 6 (each is a two-file change — the docs source and its dependent record, in one commit, because `fidelity.test.ts` holds them together — but each needs the PDF page read first, and one waits on I-08 saying what an icon stands for)
- source bump: +0.5 (user-filed via /jot)
- next: the top of the docs-fidelity family, and the only member of it that is per-field rather than per-bundle. Four of the five are mechanical once the folio is read; the fifth (`loot.the-5-treasures.devil-servant.3.item`, an icon with no text) needs either I-08 or a schema that permits an empty item where `hint` is true. The family as a whole is candidate 5.0 in `plan/PHASE_CANDIDATES.md`; this row is the slice that does not need the phase.

### [ ] [4.5] skills/iterate.md + .claude/hooks/guard.mjs — the two commit-verb lists disagree
- category: external-critique
- impact: 5 (no user sees it, but it fires as a surprise mid-tick rather than as a gate, and it bit this one tick twice: `test:` refused for the fix commit, which shipped as `fix:`, and then `audit:` refused for the tick commit that Step 6 of the skill prescribes by name, which shipped as `plan:`. Two of the skill's own documented commit subjects are unusable as written)
- ease: 9 (edit two files in one commit; the decision is which list wins, and the cheap answer is to map the skill's eight categories onto the eleven verbs the guard already allows)
- source: agent
- next: one commit editing `skills/iterate.md` §5 and, if the vocabulary widens instead, `plan/bearings.md` plus `VERBS` in the guard together — `agents.md` asks that the guard and its rule move in the same commit. §6 of the skill (`audit: finding [<id>] addressed`) has to move with §5: it names a verb the guard refuses.

### [ ] [3.5] docs — table cells do not say which are transcription and which are the bundle's gloss
- category: external-critique
- impact: 7 (274 of 879 table cells are not verbatim and nothing marks which; without a marker no docs-to-PDF gate can be built at all, so `VISION.md`'s "verbatim and cited" is checked only from JSON back to docs)
- ease: 5 (two conventions in `docs/index.md` are cheap; retrofitting the headers table by table across three directories is not, and the gate that pays for it comes after)
- source bump: +0.5 (user-filed via /jot)
- next: the second member of the docs-fidelity family, and the one that unlocks the other two. Phase-shaped rather than tick-shaped; carried in candidate 5.0.

### [ ] [4.0] general — CLOUDFLARE_API_TOKEN cannot read Workers Builds
- category: external-critique
- impact: 7 (it blocks `/march` step 2 outright: the critique gate wants a green `deploy:check`, which wants a `/builds/**` read this token does not have, so `/critique` can never fire from a cloud tick and the queue this pass drained never refills)
- ease: 5 (the row's own fix is the operator widening the token; the agent-side alternative is teaching `deploy:check` to read the deployed version off the Workers Scripts API instead, which is a rewrite on an unproven assumption)
- source bump: +0.5 (user-filed via /jot)
- next: `[needs-user-call]` — widen the token with Workers Builds read, and say so in `.env.example`. Until then the gate is dead rather than not-due, and no agent tick can revive it cheaply.
- operator's call, 2026-09-07 via /oversight: **leave it.** The token is not being widened, `deploy:check` is not being rewritten onto the Workers Scripts API, and `/critique` is not being run by hand to fill the queue. The row stays open and durable; the queue stays a `/jot` and `/iterate` inbox with 25 rows already in it. Do not re-ask this until the operator reopens it.

## Left the list this pass

Not findings any more, recorded so a later pass does not re-score them:

- **[4.5] packages/content — effects.json operation strings are unverified.** Already shipped, by commit f3e4475: `packages/engine/src/operations.test.ts` resolves every non-null `operation` against the engine's public surface, in two halves so a right export in the wrong folder still fails. The row had sat in `plan/CRITIQUE.md` Pending since; moved to Done this tick as bookkeeping.
- **[4.5] packages/content — 149 authored lines are held to no style guide at all.** Superseded by the operator's call of 2026-09-07: the 149 are to be cut to the book's printed text, not given a guide. Now candidate 6.0 in `plan/PHASE_CANDIDATES.md`, blocked on `spec.md`'s sealed 440-line sentence and the field report asking for its re-issue (`RE-SEED.md`, third entry). Both merged as PR #61. Not iterate work.
