# Site audit

> Latest findings from `/iterate audit`. Rewritten on each audit
> pass. Durable rows (`[needs-user-call]`, `[user-issue #N]`, a
> `> Bias:` line) survive the rewrite.

# Site audit — 2026-09-08 (fifth pass)

The first tick after `/critique`'s first-ever pass (pass 1, commit
d770a00) actually ran — the queue gained three rows instead of only
draining. It also gained a fourth: two concurrent `/oversight`
sessions on 2026-09-07 both promoted candidate 5.0 (the docs-fidelity
family) to Phases 15 and 16, which moves [4.4] and [3.5] off this
list the same way the 149-lines row left it last pass — decided work
now, not iterate work.

The Ambush row wins on the same ground the dispatcher row won last
tick: a precisely diagnosed one-line bug with a named fix location
and an e2e assertion already written for the corrected behaviour, no
judgement required. It shipped this tick.

## Top 5 findings (scored)

### [x] [4.8] apps/app/src/lib/narrator.ts — the narrator's Ambush line was spoken only for an ambush by nobody
- category: external-critique
- impact: 6 (a real player-facing voice bug: the one narrator line VOICE.md wrote for the book's own exclamation point almost never spoke, because an Ambush that also brought a foe read as a plain Encounter instead)
- ease: 8 (the finding named the exact function, the exact swap, and the e2e assertion to flip back; a unit test for the ambush-with-foe case was the only thing not already spelled out)
- source: agent
- issue: #66 (closed)
- next: shipped this tick as commit a6e2d77 — `momentOf`'s `turn` branch now checks `result.event === 'ambush'` before `foes.length > 0`; `brought()`'s own priority for the slip's "against" sub-line is untouched, a different question. `narrator.test.ts` gained the ambush+foe case; `e2e/played.spec.ts` flipped its assertion from `turn.encounter` to `turn.ambush`. See `plan/CRITIQUE.md` Done.

### [ ] [4.5] skills/iterate.md + .claude/hooks/guard.mjs — the two commit-verb lists disagree
- category: external-critique
- impact: 5 (no user sees it, but it fires as a surprise mid-tick rather than as a gate; hit three times now — `test:` refused on 2026-09-07, `audit:` refused the same tick, `critique:` refused on 2026-09-08 and fixed in isolation via `/oversight` commit c6cd95c. `content:`, `data:`, `seo:`, `a11y:`, `test:`, `perf:`, `refactor:` — seven of the skill's eight prefixes — are still refused)
- ease: 9 (edit two files in one commit — `plan/bearings.md`'s vocabulary table and `VERBS` in the guard — widening the list the same way `critique` and `re-seed` were already added)
- source: agent
- next: one commit adding the seven remaining prefixes to both files together, per `agents.md`'s rule that the guard and its vocabulary move together. Still open; not picked this tick because the Ambush row's impact-on-a-player outranked impact-on-the-loop at comparable ease.

### [ ] [4.0] general — CLOUDFLARE_API_TOKEN cannot read Workers Builds
- category: external-critique
- impact: 7 (it blocks `/march` step 2 outright: the critique gate wants a green `deploy:check`, which wants a `/builds/**` read this token does not have, so `/critique` can never fire from a cloud tick and the queue this pass drained never refills)
- ease: 5 (the row's own fix is the operator widening the token; the agent-side alternative is teaching `deploy:check` to read the deployed version off the Workers Scripts API instead, which is a rewrite on an unproven assumption)
- source bump: +0.5 (user-filed via /jot)
- next: `[needs-user-call]` — widen the token with Workers Builds read, and say so in `.env.example`. Until then the gate is dead rather than not-due, and no agent tick can revive it cheaply.
- operator's call, 2026-09-07 via /oversight: **leave it.** The token is not being widened, `deploy:check` is not being rewritten onto the Workers Scripts API, and `/critique` is not being run by hand to fill the queue. The row stays open and durable. Do not re-ask this until the operator reopens it.

### [ ] [needs-user-call] infra — this cloud session has no browser automation tool, so an interactive `/critique` pass cannot run
- category: external-critique
- impact: 8 (blocks `/critique`'s entire premise from this surface — the reader sub-agent could reach only the pre-hydration SPA shell via WebFetch, not one real screen, on its first-ever pass)
- ease: n/a — not `/iterate` work; the fix is either running `/critique` from a surface with `mcp__claude-in-chrome__*` attached, or giving the reader a Playwright-based tool against `apps/app/dist`
- source: agent (filed by `/critique` pass 1, 2026-09-08)
- next: `[needs-user-call]` — durable until the operator picks a path. See `plan/CRITIQUE.md` Pending for the full finding.

### [ ] [2.7] apps/app/dist/index.html — no Open Graph or canonical tags
- category: external-critique
- impact: 3 (a shared link renders with no preview image or description on any OG-reading platform — real, but nobody inside the app ever sees it)
- ease: 9 (four meta tags and a canonical link in the index.html template, reusing the existing tagline string)
- source: agent (filed by `/critique` pass 1, 2026-09-08)
- next: unshipped; a clean next pick if nothing higher-scored lands first. A sibling finding at the same pass — no pre-hydration splash content, [2.4] — is the same shape and could ship alongside it.

## Left the list this pass

Not findings any more, recorded so a later pass does not re-score them:

- **[4.4] packages/content + docs — five rule-file fields carry the docs' gloss** and **[3.5] docs — table cells do not say which are transcription and which are the bundle's gloss.** Both promoted 2026-09-07 via `/oversight` as candidate 5.0 in `plan/PHASE_CANDIDATES.md`, now Phases 15 and 16 in `plan/steps/01_build_plan.md`. Decided work, not iterate work.
- **[4.5] packages/content — effects.json operation strings are unverified.** Already shipped, by commit f3e4475. Recorded as bookkeeping last pass.
- **[4.5] packages/content — 149 authored lines are held to no style guide at all.** Superseded by the operator's call of 2026-09-07 (candidate 6.0, blocked on the spec re-issue). Not iterate work.
