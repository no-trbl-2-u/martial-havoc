# Phase 1 — The garden

> Agent-facing brief. Concise, opinionated, decisive. Ship without asking;
> document judgment calls in the commit body. This is the first phase —
> there is no shipped sibling to copy from, and there is no feature in it.
> A garden that grows a feature is not a garden.

## Scope

Make the loop able to run. Five things, in order, then one tick on
nothing:

1. **Stack.** Decided in the estate: npm workspaces with
   `packages/engine` (pure TypeScript, no React dependency, dice
   injected), `packages/content` (data files), `apps/app` (Expo, React
   Native, web target enabled). TypeScript strict. Vitest for unit;
   Playwright against the Expo web export. Pin versions below. The two
   PDFs at the repository root stay where they are; `LICENSE` is CC
   BY-SA 4.0 with attribution to Gianluca Monaco, Cristian Cammarata,
   limofeus and watabou.
2. **Environment manifest.** `.env.example` (copied by adopt) extended
   with `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
   `CLOUDFLARE_PROJECT`: name, purpose, who supplies it.
   `[needs-user-call]` to supply the values — never commit them. The
   operator's word: only Cloudflare's environment variables are to be
   obtained now.
3. **Verify gate.** `npm run verify` wired as `plan/bearings.md` states
   it (`typecheck`, `test`, `labels:check`, `build:web`, `e2e`) and green
   on the empty project. `labels:check` may pass trivially on an empty
   engine; it must exist and run.
4. **Deploy target.** A Cloudflare Workers static-assets project serving
   `apps/app`'s web export; `wrangler.toml` in the repository;
   `scripts/deploy-check.mjs` polls it with the Cloudflare block
   enabled. `[needs-user-call]` for the account, the project's creation
   and the domain; the agent writes the configuration up to the line.
5. **Seed skills.** `/seed-check` and `/re-seed` present (the kit ships
   them). No Seed-specific skill is named.

Then: one trivial slice — a placeholder page showing the project name
and the licence line — exported, deployed, deploy-check green.

## Outputs

```
package.json                 workspaces, scripts: verify, typecheck, test, labels:check, build:web, e2e, deploy:check
packages/engine/             package.json, tsconfig, src/index.ts (empty export), a passing Vitest
packages/content/            package.json, schema/ (empty), a passing schema test
apps/app/                    Expo app, web target, placeholder screen
.env.example                 extended
vitest.workspace.ts          unit composition
playwright.config.ts         e2e against the web export
wrangler.toml                Cloudflare Workers static assets
LICENSE                      CC BY-SA 4.0 with attribution
```

## Stack pins (versions)

Latest stable at the time of the garden: Expo SDK (current), React
Native as Expo pins it, TypeScript 5.x, Vitest 2.x, Playwright 1.x,
Node 20 LTS. Record the exact numbers in the commit body; bump if a
stable major has shipped at runtime and document why.

## Verify gate

```
npm run verify
```

Green on an empty project is the point of this phase, not a side effect.

## Deploy gate

```
npm run deploy:check
```

## Decisions made upfront — DO NOT ASK

- npm, not pnpm; Vitest plus Playwright; Cloudflare; web only in the
  garden; native builds are Phase 13.
- No accounts, no server, no sync; no generated prose; no art; the
  whole repository CC BY-SA 4.0.
- The trivial slice is the placeholder page; it is deleted or replaced
  in Phase 2, not kept.

A brief that leaves open questions is a brief that fails its job. The
`[needs-user-call]` rows above are the only ones permitted, and each says
what the agent does up to the line.

## Git

One commit per numbered item, verb `chore:` or `feat:` per
`plan/bearings.md`'s vocabulary; the trivial slice is its own commit.
Commit and push as a single atomic act.

## DoD

Flip Phase 1's `[ ]` → `[x]` in `plan/steps/01_build_plan.md`, append
the commit hash, add a line to "Phase log". Commit:

```
git add plan/steps/01_build_plan.md
git commit -m "plan: phase 1 shipped — the garden"
git push origin main
```

## Confirm deploy

`npm run deploy:check` green at HEAD. That, plus the ticked row, is
"one tick on nothing".

## Follow-ups (out of scope this phase)

- Everything in Phase 2 onward. If the trivial slice tempts a feature,
  that is the temptation the garden exists to refuse.
