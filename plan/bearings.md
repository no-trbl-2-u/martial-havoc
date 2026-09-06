# Bearings — Martial Havoc

> Standing context for every command invocation. Read this alongside the
> relevant skill file (`skills/<name>.md`) and the matching phase brief.
> If anything here changes, update in the same commit.
>
> Rendered from the Seed (`origin: idea-0003 @ state/0013`). The kit's own
> `templates/plan/bearings.md` is the full form; this file keeps its
> headings and fills only what the Seed decided. Sections the Seed did not
> reach say so, rather than guessing.

## What we're building

`spec.md` at the repo root is the product spec — the Seed's Horizon,
refusals and acceptance criteria. Read once at session start. The TL;DR:

> A rules engine for Martial Havoc: the sandbox is the real game,
> adventures are scenes in it, and The 5 Treasures is the first

A pure functional engine for Gianluca Monaco's rule-light d6 solo wuxia
RPG, a thin Expo app over it, every behaviour labelled rule, reading or
invention with a citation. The first release ships the whole engine with
one authored scene (the cave) and a trail-head village; the sandbox
(generated regions, monasteries, encounters) follows. Voice: authored
short lines beside every menu; the player writes when they want to.

**Live at:** https://martial-havoc.no-trbl-2-u.workers.dev (Cloudflare
Workers static assets; the garden's deploy step, 26c9f3c). A custom
domain is the operator's call.

## Surface

**Surface:** `hybrid` — a static web export (site) and native app builds
from the same Expo source; no server.

The Seed's Horizon fixes this: offline, no account, the web build on
Cloudflare, native tracks later.

## Auth

**Auth:** `none` — the Seed refuses accounts, login and sync.

## Stack (locked — do not re-litigate)

Decided in the estate. Revisit only if a phase genuinely cannot ship
without changing one of these — and then `/re-seed`, not a quiet edit.

| Layer | Choice | Why |
|---|---|---|
| Repo | `no-trbl-2-u/martial-havoc`, npm workspaces | The operator's word; the PDFs already live here |
| Framework | Expo + React Native, web target enabled | One TypeScript codebase for iOS, Android and web |
| Language | TypeScript, strict | Pure functions over immutable state; no classes |
| Styling | React Native StyleSheet; SVG via `react-native-svg` | Text and SVG only, art later |
| Content | Data files in `packages/content` (JSON validated by one schema) | Every table cell is data with a citation |
| Structured data | none | Offline; the campaign record is a file on the device |
| Test (unit) | Vitest, fixed-dice fixtures | The engine is pure; dice are injected |
| Test (e2e) | Playwright against the Expo web export | The operator's word: e2e from the garden |
| Pkg mgr | npm (workspaces) | The operator's word |
| Hosting | Cloudflare Workers static assets | The operator's word; only its environment variables are to be obtained now |

## Decisions standing for the autonomous loop

(These exist so the loop never asks the user.)

**From the Seed's refusals** — walls, not preferences. `/seed-check`
quotes them; the loop does not reinterpret them:

- **No accounts, login or cloud sync.** Offline; export is the backup.
- **No multiplayer.** Solo, as the book.
- **No generated prose.** Authored lines and the player's words only.
- **No monetisation.** CC BY-SA 4.0 throughout.
- **No authoring tool.** The format is public; a tool is out of scope.
- **No credited art.** Text and SVG only until a later decision.
- **No store listing** before the operator decides it.
- **Creation's pools advisory, the rest enforced.** Flag, never refuse;
  presets as printed.
- **Every behaviour labelled.** Rule, reading or invention, cited; the
  verify gate is red on an unlabelled behaviour.
- **The sealed rules stand** (ATTACK, Final Blow LUCK, night's rest,
  double-six fumble, Morale on retreat rows); reopening is `/re-seed`.

**Routine calls the Seed made** — stated so the loop does not re-open
them:

- **Packages:** `packages/engine`, `packages/content`, `apps/app`.
- **Dice:** an injected source; in-app roll by default; manual entry
  beside it; fixed-sequence source for tests; manual entry for anything
  but dice increments the override count.
- **Campaign record:** one Master, deeds ledger, per-adventure flags,
  passages, reading ids, override count; the world dies with the Master;
  versioned JSON export with migrations keyed on reading ids.
- **Labels:** every engine export carries `{label, cite}`; readings cite
  their `I-nn` id from the estate's inventory; inventions cite the
  decision or content file that made them.
- **Authored lines:** the agent drafts all; the operator may reserve any
  (`[needs-user-call]` for those only). Effects and Oracle lines before
  the December milestone; Inspirations and Sparks after.
- **Native builds:** Phase 13, Expo Application Services, accounts
  `[needs-user-call]`; the web build is the fallback distribution.
- **Region generator:** N points on a plane, nearest-neighbour links,
  miles as the sum of the two dice with the route band from the same
  sum; positions decorative and the screen says so.

**Loop defaults:**

- **Empty state copy template:** `"Nothing here yet. Roll, or write."`
- **Error state:** the rules panel shows the rule that refused nothing
  and the reading that applied; never a stack trace.
- **Comments / community / login:** out of scope.

## Hard rules

(Mirrors `agents.md` Standing Rules. Update there first; this echoes.)

1. **Commit and push as a single atomic act.**
2. **No `Co-Authored-By:` trailers, no emojis.**
3. **No `--no-verify`, no force-push, no destructive resets.**
4. **The verify gate is non-negotiable.**
5. **Tests alongside code.**
6. **Never commit secrets.**
7. **Never edit `spec.md`.** Drift goes back through `/re-seed`.
8. **Never edit the two PDFs** at the repository root; they are the
   sources, CC BY-SA 4.0, credited in `LICENSE`.
9. **Never ship an unlabelled behaviour.** The label leg is part of
   verify.

## Verify gate (hermetic, mandatory) + deploy gate

### Pre-commit: `npm run verify`

```
npm run typecheck && npm run test && npm run labels:check && npm run build:web && npm run e2e
```

`typecheck` runs `tsc --noEmit` across the workspaces; `test` is Vitest
over `packages/engine` and `packages/content` (schema validation of every
data file is a test); `labels:check` fails on any engine export without a
label; `build:web` is `expo export --platform web` in `apps/app`; `e2e`
is Playwright against the export. Each leg is a hard gate. The garden's
done-condition is that this gate is green on an empty project before any
feature exists.

### Post-push: `npm run deploy:check`

Polls Cloudflare for the deploy at HEAD. Exits 0 ready, 1 error, 2
timeout, 3 config/auth. Implementation: `scripts/deploy-check.mjs`
(copied by adopt); provider block enabled for Cloudflare. Environment:
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_PROJECT`
(`[needs-user-call]` for the values; named in `.env.example`).

**Red deploy = blocked tick.**

## Useful commands

```
npm run verify
npm run deploy:check
node scripts/pulse.mjs        # offline: queue / build-plan / candidate counts
```

## Commit verb vocabulary

Every commit message is `<verb>: <subject>`, enforced by
`.claude/hooks/guard.mjs` (standing rule 2's teeth). The verbs:

| Verb | Written by |
|---|---|
| `digest`, `expand`, `jot`, `oversight`, `triage`, `plan` | the skills of the same name, and `/plan-a-phase` |
| `feat`, `fix`, `docs`, `chore` | shipping work: a feature, a fix, documentation, housekeeping |
| `re-seed` | `/re-seed`'s field report, `RE-SEED.md`, committed alone |

A new verb is added here and to `VERBS` in the guard in the same
commit, never one without the other.
