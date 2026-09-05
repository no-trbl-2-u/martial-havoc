# agents.md

> The entry point for any AI agent landing in this repo cold
> (Claude Code, Cursor, Aider, anything else). Read this top to
> bottom; it's short, and the rules at the top are non-negotiable.

## Standing rules

These apply to every command, every skill, every session. They
are not optional. The skill files repeat them; this is the
canonical source.

### 1. Commit and push. Always. As a single atomic act.

Shipped work that isn't committed is rolled-back work waiting to
happen. Shipped work that's committed but not pushed is invisible
to Cloudflare and to future loop ticks. The autonomous
loop assumes `origin/main` is the source of truth.

Every shipping skill ends with `git commit` **immediately followed
by** `git push origin main`. Don't leave commits
unpushed between ticks. Don't leave the working tree dirty.

### 2. No `Co-Authored-By:` trailers. No emojis.

Plain commit message bodies. **Never** add a `Co-Authored-By:`
line, a "Generated with…" footer, or any emoji — in commits,
in code, in content, in design notes.

### 3. The verify gate is non-negotiable.

`npm run verify` runs **before** every commit:

```
typecheck → test → labels:check → build:web → e2e
```

The composition is the Seed's (`plan/bearings.md`, "Verify
gate"): `typecheck` is `tsc --noEmit` across the workspaces;
`test` is Vitest over `packages/engine` and `packages/content`
(schema validation of every data file is a test); `labels:check`
fails on any engine behaviour without a `{label, cite}`;
`build:web` is `expo export --platform web` in `apps/app`; `e2e`
is Playwright against that export. There is no `data:validate`
leg: the content package's schema test is that leg.

Every check is a hard gate. **Hermetic e2e is part of the gate.**
A red e2e is a blocked push. Never `--no-verify`. Fix the root
cause.

**Never run the gate in the background.** Run every leg as a
foreground, blocking call and wait for it. `run_in_background:
true` on the gate (or any leg) is forbidden — in a
non-interactive run (cloud `/march`) the agent SDK ends the turn
while the gate is still alive, the background-task resume
notification is unreliable, and the process cannot exit because
the gate's children (dev server, headless browser, DB
containers) keep the tree alive. That is the cloud post-result
exit hang. If the gate has outgrown a single foreground budget,
**shrink the gate, do not background it** — split it into
sequential foreground legs and move any O(content) breadth
(per-record crawls) off the per-commit path onto a nightly job.
A page template is not more correct for being rendered 2,700
times instead of 30; prove archetypes per commit, prove the
exhaustive set nightly.

### 4. The deploy gate runs **after** every push.

`npm run deploy` uploads the web export to Cloudflare Workers
static assets, tagged with the pushed commit; `npm run
deploy:check` polls Cloudflare for the deploy matching that
commit. Prints state transitions. Exits non-zero on `error` /
`failed` / timeout.

Every shipping skill calls both as Step 12 (or equivalent). A red
deploy is treated identically to a red verify gate: read the log,
patch, push again. Repeated failures escalate per failure modes.

### 5. No `--no-verify`. No force-push. No destructive resets.

If a hook fails, fix the underlying issue. If `git pull`
diverges, stop and report. Tests alongside code, never "add tests
later".

### 6. Every behaviour is labelled. The spec and the PDFs are read-only.

Every engine export carries `{label, cite}` with `label` one of
`rule`, `reading`, `invention`; `labels:check` is red otherwise.
`spec.md` is never edited — drift goes back through `/re-seed`.
The two PDFs at the repo root are the sources; never edit them.
The sealed rules in `spec.md` (ATTACK, Final Blow LUCK, night's
rest, double-six, Morale on retreat rows) reopen only by
`/re-seed`.

### 7. Content stays in `packages/content`. The engine stays pure.

No hardcoded copy in components: authored lines, table cells and
UI strings are data files in `packages/content`, each with a
citation. `packages/engine` imports no React and rolls no dice of
its own — the dice source is injected.

### 8. Blocked is loud.

Before stopping on any failure-mode condition, run
`node scripts/notify.mjs --title "<skill>: stopped"
--body "<reason>" --priority high` (best-effort — a failed
notification never becomes its own stop). Applies to every
skill; see `nexus/playbooks/hands-off.md`.

---

## Project

**Martial Havoc** — a rules engine for Gianluca Monaco's rule-light
d6 solo wuxia RPG: the sandbox is the real game, adventures are
scenes in it, and The 5 Treasures is the first. Lives at
https://martial-havoc.no-trbl-2-u.workers.dev.

The product spec is `spec.md` at the repo root. Read it once.

## Repo shape

```
packages/engine/     Pure TypeScript rules engine; no React; dice injected.
packages/content/    Data files (JSON, one schema), authored lines, adventures.
apps/app/            Expo + React Native app; web target exported to Cloudflare.
plan/                Build plan, phase briefs, audit findings.
skills/              Source-of-truth skill files invoked by slash commands.
scripts/             deploy, deploy-check, notify, pulse, loop-issue, serve-static.
e2e/                 Playwright specs against the web export.
.claude/             Claude Code config — slash commands, sub-agents,
                     settings.json (permission allowlist), hooks/ (guard).
design/              Design exports and the design prompt.
```

## How work happens

This project is **driven autonomously** by a small set of skills.
You don't normally write code by manually editing files; you
invoke a skill that does the right thing end-to-end.

### Skills (the verbs)

| Skill | Source of truth | What it does |
|---|---|---|
| `ship-a-phase` | `skills/ship-a-phase.md` | Ship one phase from the build plan. |
| `plan-a-phase` | `skills/plan-a-phase.md` | Refine the next phase brief, no code. |
| `iterate` | `skills/iterate.md` | Audit + ship one improvement. |
| `critique` | `skills/critique.md` | External-observer pass; writes to `CRITIQUE.md`. |
| `triage` | `skills/triage.md` | Issue review; routes to backlogs. |
| `expand` | `skills/expand.md` | Plan-expansion pass; proposes phase candidates from accumulated signals. Posture-controlled (bold/strict/autonomous). |
| `march` | `skills/march.md` | Outer dispatcher: triage → critique → phase → expand → iterate. |
| `oversight` | `skills/oversight.md` | **User-in-the-loop.** The general-purpose skill that asks anything. Promotes phase candidates. |
| `seed-check` | `skills/seed-check.md` | Read-only check of a change against `spec.md`'s refusals and Horizon. |
| `re-seed` | `skills/re-seed.md` | Field report back to the estate when the build drifts from `spec.md`. |
| `jot` | `skills/jot.md` | Catch a stray thought; no code. |

There is no `ship-data` skill: this project has no separate data
layer (`nexus.adopt.json` `data: false`); content ships inside
phases.

### Invocation

```
/ship-a-phase                # ship next pending phase
/plan-a-phase                # refine next phase brief
/iterate                     # audit + ship one improvement
/critique                    # external-observer pass
/triage                      # review unlabeled issues
/expand                      # propose new phase candidates
/march                       # do the right thing
/oversight                   # course-correct
/seed-check                  # check a step against spec.md
/loop 30m /march             # autonomous loop
```

### Sub-agents

| Agent | Use for |
|---|---|
| `scout` | Open-web research with citations. |
| `reader` | Fresh-eyes site observer. |

The main agent writes wiring, code, decisions. Spawn sub-agents
aggressively for everything else.

---

## Operational secrets

The autonomous loop is hermetic for shipping; the deploy and
awareness layers need tokens. They live in `.env` (gitignored) on
a laptop, or in the environment on a cloud runner. `.env.example`
names every one with its purpose and who supplies it.

### `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` — deploy and deploy gate

Used by `npm run deploy` (wrangler) and `npm run deploy:check`.
Account-scoped token with "Workers Scripts: Edit". Optional:
`CLOUDFLARE_PROJECT` (Worker name, default `martial-havoc`) and
`CLOUDFLARE_LIVE_URL` (default the workers.dev URL).

Get one: https://dash.cloudflare.com/profile/api-tokens

If missing, `npm run deploy:check` exits 3 with a clear error.

### `GH_TOKEN` — issue triage

Used by `/triage` to review and label open GitHub issues. The
`gh` CLI auto-reads `GH_TOKEN`.

```
GH_TOKEN=github_pat_...
GH_REPO=no-trbl-2-u/martial-havoc
```

Get one: https://github.com/settings/tokens

### `EXPO_TOKEN` — native builds (Phase 13 only)

Read by `eas-cli`. The app is linked to EAS project
`344d4bd5-661e-469c-83de-223cea93aaaf` (owner `no.trbl.2.u`) in
`apps/app/app.json`; build profiles are in `apps/app/eas.json`
(`preview` = internal distribution, `production`). No build runs
before Phase 13.

### `NOTIFY_NTFY_TOPIC` / `NOTIFY_WEBHOOK_URL` — pager (optional)

Used by `scripts/notify.mjs` (standing rule 8). Either works;
ntfy is the zero-setup path. Optional at Level 0–2; required
before an unattended window per the hands-off pre-flight.

### No other secrets

If a feature ever requires more, the relevant skill stops at its
failure-mode condition rather than inventing a placeholder.

---

## Where to look

| If you need… | Read |
|---|---|
| What Martial Havoc is | `spec.md` |
| Stack, conventions, defaults | `plan/bearings.md` |
| What ships next | `plan/steps/01_build_plan.md` |
| How a phase is built | `plan/phases/phase_<N>_<topic>.md` |
| How a skill works | `skills/<skill>.md` |
| What a sub-agent does | `.claude/agents/<name>.md` |
| Latest weaknesses | `plan/AUDIT.md` |
| Critique queue | `plan/CRITIQUE.md` |
| Phase candidates | `plan/PHASE_CANDIDATES.md` |
| The design prompt | `design/V1-DESIGN-PROMPT.md` |
