# Martial Havoc

A rules engine for Gianluca Monaco's *Martial Havoc*, a rule-light d6 solo
wuxia RPG. The sandbox is the real game; adventures are scenes in it, and
*The 5 Treasures* is the first. Offline, no account, text and SVG only,
every behaviour labelled rule, reading or invention with a citation.

Live: https://martial-havoc.no-trbl-2-u.workers.dev

## Layout

```
spec.md              The Seed: Horizon, refusals, acceptance criteria. Read-only.
agents.md            The rule book for any agent working here. Read first.
plan/                Build plan (steps/01_build_plan.md), phase briefs, audit.
docs/                The rulebook and the adventure as OKF documentation:
                     rules/ (procedures, readings), world/ (what exists),
                     campaigns/ (The 5 Treasures, hooks), sources/ (provenance).
packages/engine/     Pure TypeScript rules engine; no React; dice injected.
packages/content/    Data files with a citation on every record.
apps/app/            Expo + React Native; web export served from Cloudflare.
skills/ .claude/     The autonomous loop's verbs and their slash commands.
design/              The design prompt and design exports.
```

## Running it

```
npm install
npm run verify          # typecheck, test (incl. the docs leg), labels:check, build:web, e2e
npm run serve:web       # the export on http://127.0.0.1:4173
npm run -w apps/app start   # Expo dev server (native and web)
```

## Shipping

The repository is connected to Cloudflare Workers Builds: a push to `main`
builds the web export and deploys it; a push to any other branch uploads
a preview at `https://<branch-slug>-martial-havoc.no-trbl-2-u.workers.dev`.
`npm run deploy:check` confirms the commit at HEAD is what Cloudflare
serves. Native builds come in Phase 13 through Expo Application Services
(`apps/app/eas.json`).

Work happens through the loop: `/march` picks the next pending phase in
`plan/steps/01_build_plan.md` and ships it end to end. See `agents.md`.

## Provenance

Exported from The Estate (`origin: idea-0003 @ state/0013`) as a nexus
build-plan payload and adopted with the
[idea-Nexus](https://github.com/no-trbl-2-u/idea-Nexus) kit; the adopt
manifest is `nexus.adopt.json`.

## Licence

CC BY-SA 4.0 for the whole repository (`LICENSE`). The rulebook and the
adventure are by Gianluca Monaco; cover and chapter art by Cristian
Cammarata; adventure icons by limofeus; cave map by watabou. The two PDFs
at the repository root are the sources as published and are never edited;
none of the credited art ships in the app.
