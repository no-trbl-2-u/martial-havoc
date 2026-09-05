# Phase 2 — Tables as data, and creation

> Agent-facing brief. Concise, opinionated, decisive. Ship without asking;
> document judgment calls in the commit body. Drafted under `/oversight`
> on 2026-09-05 from the build-plan row, `spec.md`, `plan/bearings.md`
> and the Phase 1b decomposition under `docs/`. No UI ships here: Phase 8
> owns the screen. Every behaviour added registers in `behaviours` with
> `{label, cite}` or the label leg is red.

## Scope

Three deliverables, in this order, each its own commit:

1. **One JSON Schema** and a validator leg inside the content test.
2. **Every table of the rulebook as data** in `packages/content`, cell
   for cell from `docs/`, each file and each record citing its folio.
3. **The dice interface and Master creation** in `packages/engine`,
   pure functions over injected dice and injected tables, every rule
   R01–R19 (creation) and R03/R04/R09–R11/R15–R16 (arithmetic) with a
   fixed-dice test, the eight presets loading as printed with Yin
   flagged.

Done when (build plan): the schema validates every file; the eight
presets load with Yin flagged; a Master rolls from fixture dice with the
pools reported.

## Content / data reads (Phase 1b docs are the source; copy cells, cite folios)

| Data file (`packages/content/data/`) | Source concept | Dice | Records |
|---|---|---|---|
| `world/martial-arts.json` | `docs/world/martial-arts.md` | banded d6 x d6 | 18 styles: band, row, name, styleText, proficiencies[], power (verbatim or null), powerClass |
| `world/techniques.json` | `docs/world/techniques.md` | d66 | 36: d66, name, pinyin, cost (1–4), effect (verbatim) |
| `world/rituals.json` | `docs/world/rituals.md` | d66 | 36: same shape as techniques |
| `world/deities.json` | `docs/world/deities.md` | banded d6 x d6 | 12: band, row, name, action, object |
| `world/opponents.json` | `docs/world/opponents.md` | none | 50: name, description, skill, endurance, attack, proficiencies[{name,value}], martialArtsValue (null or n, R75), page, notes |
| `world/market.json` | `docs/world/market.md` | none | four lists in one file: list (common, weapons, expedition, armor), item, priceGp, priceSp, flags (weapon, alcohol, underTwentyGp) |
| `world/oracle.json` | `docs/world/oracle.md` | 1d6 per row | 11 rows x 6 cells = 66 cell records: row, face, text, spanInferred |
| `world/inspirations.json` | `docs/world/inspirations.md` | d66 | 72: table (action, theme), d66, word |
| `world/sparks.json` | `docs/world/sparks.md` | 1d6 then d66 | 216: table (1–6), d66, word |
| `world/presets.json` | `docs/world/pregenerated-masters.md` | none | 8 Masters exactly as the sheets print them, plus the name-resolution map to canonical ids |
| `rules/social-status.json` | `docs/rules/master-creation.md` R03 | 1d6 | 5 bands: faces[], status, goldDice (e.g. `{n:3,d:6,plus:0}` or fixed 1) |
| `rules/final-blow.json` | `docs/rules/combat.md` | banded d6 x d6 | action, attribute, animal rows |
| `rules/unexpected-events.json` | `docs/rules/combat.md` | 2d6 | 11 rows: total, text, retreatRow (bool, sealed rule: Morale) |
| `rules/healing.json` | `docs/rules/multiple-combat-escape-healing.md` | none | attribute, partial, amount, full |
| `rules/xp-categories.json`, `rules/xp-costs.json` | `docs/rules/experience-and-advancement.md` | none | categories with ranges; cost per +1 by SKILL band |
| `rules/region.json`, `rules/monastery.json`, `rules/distances.json` | `docs/rules/exploration.md` | d6 per column; 1d6 / 2d6 bands | column tables as (column, face, text); the two distance/route band tables |
| `rules/city-services.json`, `rules/city-encounters.json` | `docs/rules/cities.md` | none; banded d6 x d6 | service+price; connection+trait |
| `rules/encounters.json` | `docs/rules/encounters.md` | 2d6 by column | 11 totals x 5 columns = 55 cells: total, column, opponentRef |
| `rules/treasures.json`, `rules/special-items.json` | `docs/rules/treasures-and-special-items.md` | 1d6 by ENDURANCE band; 2d6 | treasures: face, band, text; items: total, name, effect (verbatim) |
| `campaigns/adventure-hooks.json` | `docs/campaigns/adventure-hooks.md` | d66 | 36: d66, text |

Not in this phase: the cave's tables (Phase 5 owns the adventure format
and the cave file; the schema shipped here must accept a table record
kind an adventure file can reuse, so that "one schema" stays true in
Phase 5). `data/app/strings.json` stays as it is.

## The schema (`packages/content/schema/content.schema.json`)

One file, JSON Schema draft 2020-12, `$defs` per record kind, a top-level
`oneOf` on `kind`. File envelope:

```json
{
  "$schema": "../schema/content.schema.json",
  "id": "world.techniques",
  "kind": "d66",
  "title": "Techniques Table",
  "cite": "MH p.12-15",
  "label": "rule",
  "docs": "docs/world/techniques.md",
  "records": [ { "id": "technique.11", "cite": "MH p.12", "...": "..." } ]
}
```

- `kind` is one of `d6-banded`, `d66`, `1d6`, `2d6`, `2d6-by-column`,
  `d6-by-column`, `list`, `presets`, `strings`. Each kind fixes the
  required record fields; `additionalProperties: false` everywhere.
- Every record carries `id` (dotted, unique across the package) and
  `cite` (a folio). The existing content test already demands both; the
  schema makes the rest exact.
- `label` at file level is `rule` for every table here (the tables are
  the book). A record whose cell is an inferred reading (Oracle column
  spans, I-nn) carries `reading: "I-nn"` in addition, never instead.
- Validator: `ajv` (v8, `ajv/dist/2020`) as a devDependency of
  `packages/content` only. `content.test.ts` compiles the schema once
  and validates every `data/**/*.json`; `allErrors: true`, errors
  printed with the file path. Also asserts: ids unique across files;
  every `docs` path resolves; expected record counts per file (18, 36,
  36, 12, 50, 66, 72, 216, 36, 8, 55) so a dropped cell is red.
- The content test prints `content — N files, M records` (the spec's
  "counts readable from the build"; the engine's half is
  `labels:check`).

## Content package surface (`packages/content/src/`)

Small files in folders; one module per data group; types derived from
the JSON via `as const`-free explicit types (strict, no `any`):

```
src/index.ts            re-exports; keeps appStrings, stringById, t
src/types.ts            Record types per kind; TableFile<K>
src/world/*.ts          martialArts, techniques, rituals, deities,
                        opponents, market, oracle, inspirations, sparks,
                        presets — each a typed frozen array + byId lookup
src/rules/*.ts          socialStatus, finalBlow, unexpectedEvents, healing,
                        xp, exploration, cities, encounters, treasures
src/campaigns/hooks.ts  adventureHooks
src/counts.ts           contentCounts(): { files, records, byFile }
```

Lookups are total functions: `byId` returns `undefined`, never throws;
`d66` lookups take the tens and ones dice and return the record.

## Engine surface (`packages/engine/src/`)

The engine imports **types only** from `@martial-havoc/content`
(`import type`); tables are passed in as arguments. Engine unit tests
import the content package's tables as fixtures (devDependency). A test
in the engine asserts no value import of the content package
(grep over `src/**/*.ts` excluding `*.test.ts`).

```
src/dice/types.ts       Die (1..6), DiceSource = { readonly next: () => Die }
src/dice/sources.ts     fromSequence(dice) — fixed source for tests; throws
                        DiceExhausted with the count when the sequence ends.
                        No random source lives in the engine: the app
                        injects one (Phase 8); the engine rolls no dice of
                        its own (rule 7).
src/dice/rolls.ts       d6, nd6 (sum + faces), d66 (tens, ones), twoD6
                        ({a, b, total, doubles}); every roll returns the
                        faces so the UI can show both dice (Horizon).
src/creation/attributes.ts     rollAttributes: SKILL 1d6+6, ENDURANCE
                               2d6+12, LUCK 1d6+6; returns current AND
                               initial (R04, R05).
src/creation/social-status.ts  rollSocialStatus(table)(dice): status +
                               gold, using the table's goldDice (R03).
src/creation/martial-art.ts    rollMartialArt(table)(dice) — banded roll
                               (R09, D05); chooseMartialArt(table)(id).
src/creation/proficiencies.ts  the pool = rolled SKILL (R10, D06);
                               spend(map) -> { pool, spent, unspent,
                               overBy, capBreaches: [{name, value}] } —
                               cap 4 (R11); 0 and unspent allowed (I-04);
                               never refuses.
src/creation/training.ts       training(points): SKILL -= points (R15),
                               resource pool = 4 * points (R16), Training
                               as a Proficiency at that value (R17).
src/creation/learning.ts       spendResources(techniques, rituals)(picks)
                               -> { pool, spent, overBy } by printed cost
                               (R16); flags, never refuses.
src/creation/kit.ts            startingKit: common clothing, one
                               free-text weapon, one item (Health Elixir
                               or a Market item under 20 GP, from the
                               flagged list), gold (R02); the weapon is
                               a string, flagged `weapon` for I-02.
src/creation/master.ts         Master type (R01): name, age, martialArt,
                               attributes {skill, endurance, luck} with
                               initial copies, proficiencies, training,
                               techniques, rituals, equipment, gold,
                               status, xp: 0, dishonor: 0.
                               createMaster(tables)(dice)(choices) ->
                               { master, flags } — the whole procedure in
                               the book's order; flags is the union of
                               the pool reports and cap breaches.
src/creation/presets.ts        loadPreset(tables)(presetId) -> { master,
                               flags } — as printed, pool checks run,
                               range checks NOT run (R83; Sun Wukong's
                               implied 14 is not a flag).
src/creation/behaviours.ts     the Behaviour entries for this folder.
src/index.ts                   behaviours = [...dice, ...creation]
```

Behaviour entries this phase registers (id — label — cite):

- `dice.d6` — rule — MH p.6; `dice.d66` — rule — MH p.12;
  `dice.two-d6-doubles` — rule — MH p.26 (doubles are read by Phase 3).
- `creation.attributes` — rule — MH p.6 (R04);
  `creation.initial-values` — rule — MH p.6 (R05);
  `creation.social-status` — rule — MH p.5 (R03);
  `creation.starting-kit` — rule — MH p.5 (R02);
  `creation.starting-weapon-is-weapon` — reading — I-02;
  `creation.martial-art-roll` — rule — MH p.7 (R09);
  `creation.proficiency-pool-is-rolled-skill` — rule — MH p.7, 11
  (R10, R15; D06);
  `creation.proficiency-cap-4` — rule — MH p.7 (R11);
  `creation.unspent-allowed` — reading — I-04;
  `creation.training-deduction` — rule — MH p.11 (R15);
  `creation.resource-points` — rule — MH p.11 (R16);
  `creation.training-is-a-proficiency` — rule — MH p.11 (R17);
  `creation.pools-advisory-never-refuse` — invention — spec.md Refusals
  ("Creation's pools are advisory");
  `creation.presets-as-printed` — rule — MH p.92 (R83) and spec.md
  Refusals.

Not in this phase (Phase 3): R06 ENDURANCE zero, R12/R20 checks, R13
style powers in play, R18 ENDURANCE cost on use. Their tables ship as
data now; their behaviours ship with combat.

## Tests matrix (fixed dice; Vitest; colocated `*.test.ts`)

| Module | Test |
|---|---|
| dice | `fromSequence` yields in order and throws with the count when exhausted; `d66` maps (3,5) to 35; `twoD6` reports doubles; no `Math.random` anywhere in `src/` (grep test) |
| attributes | sequence [1, 6, 6, 3] gives SKILL 7, ENDURANCE 24, LUCK 9; initial equals current |
| social-status | each face maps to its band; Poor with 1d6 = 1 gives 0 GP; Noble sums ten dice |
| martial-art | (1,2) is Long weapons, (6,6) is TaiJi Quan; every 18 cells resolve; choose by id |
| proficiencies | XinYue (p. 5): 2 + 4 + 1 = 7 of 7, no flags; a 5 flags one cap breach; 8 of 12 is unspent 4, no flag (Beggar So, I-04) |
| training + learning | p. 11 example: rolled 9, Training 2, pool 9, resources 8, final SKILL 7 |
| master | `createMaster` on a scripted sequence reproduces XinYue field for field |
| presets | all eight load as printed; seven have empty flags; Yin flags `proficiencies.overBy = 1` (10 of 9) and `resources.overBy = 4` (12 of 8) — the spec's acceptance line verbatim |
| content | schema validates every file; counts per file; ids unique; `docs` paths resolve; `contentCounts()` matches |
| labels | `labels:check` green with every entry above; count printed |

## Verify gate

Unchanged composition (`typecheck → test → labels:check → build:web →
e2e`). The schema validation is inside `test` (content project). No new
leg. `build:web` and `e2e` are untouched by this phase and must stay
green: the app is not edited except the two comments below.

## Decisions made upfront — DO NOT ASK

- **No screen.** `apps/app/src/App.tsx`, `e2e/garden.spec.ts` and
  `data/app/strings.json` say "Phase 2 replaces this screen". The build
  plan gives the UI to Phase 8. The build plan wins. Ship-a-phase
  rewrites those three comments to say Phase 8 and touches nothing else
  in `apps/app` or `e2e/`.
- **Tables are injected into the engine**, never imported at runtime.
  Keeps the engine pure and lets Phase 5 hand it an adventure's tables
  the same way. `import type` from the content package is allowed.
- **One schema file, kinds in `$defs`.** Not one schema per table: the
  spec says one.
- **Cells are verbatim** (CC BY-SA 4.0, attributed): effects, style
  texts, Oracle words, hooks. Spelling as printed, including the
  sheets' "CHamber" and "mount". Normalisation happens in ids, never in
  text.
- **Ids are dotted kebab-case** derived from the printed name
  (`technique.iron-head`, `martial-art.wudang-quan`,
  `opponent.bandit`), with the d66 or band kept as a field, not the id.
  Presets reference canonical ids through the name-resolution map in
  `docs/world/pregenerated-masters.md`.
- **The "Throwing weapons" / "Ranged weapons" inconsistency** (p. 11 vs
  p. 8): the table on p. 8 wins; the p. 11 example test uses the p. 8
  name and the commit body notes it.
- **Market `underTwentyGp` flag** is computed from the price at data
  time and stored, cited to R02 and the inventory's 3.15 list; the
  engine reads the flag, it does not recompute the rule.
- **Alcohol** is a flag on Market records (none by default) and on
  free-text kit items (Beggar So's Wine bottle), per I-03. No engine
  behaviour for Drunken style here (Phase 3).
- **Gold at creation** is rolled from the status band's dice through
  the same injected source; the faces are returned.
- **Flags, never refusals.** Every pool report is data on the result;
  no function throws on overspend. The only throws are programming
  errors: an unknown id, an exhausted fixed sequence.
- **`ajv` is the only new dependency** (content devDependency). No
  runtime validation in the app; the test is the gate.
- **The engine keeps `noUncheckedIndexedAccess`**: lookups return
  `T | undefined`; callers narrow.
- **No `class`, no mutation**: `readonly` types, frozen arrays, curried
  functions `f(tables)(dice)(input)` so tables and dice bind once.

## Git

Commits, each pushed as it lands (rule 1):

1. `chore: phase 2 - the schema and the validator leg`
2. `content: phase 2 - world tables`
3. `content: phase 2 - rules tables and hooks`
4. `engine: phase 2 - dice`
5. `engine: phase 2 - creation and presets`
6. `plan: phase 2 shipped - tables as data, and creation` (the DoD tick)

`npm run verify` before every one. Judgment calls in the body. No
trailers, no emojis.

## DoD

Flip Phase 2's `[ ]` → `[x]` in `plan/steps/01_build_plan.md` with the
commit hash; add the "Phase log" line with the content counts (files,
records) and the behaviour count. `npm run verify` green;
`npm run deploy:check` green at HEAD.

## Follow-ups (out of scope this phase)

- Phase 3 consumes the rules tables shipped here (Final Blow, Unexpected
  Events, healing, XP, encounters, treasures) and adds their behaviours.
- Phase 4 adds `operation` and the authored line to each Technique,
  Ritual, Oracle cell and Unexpected Event record; the schema gains
  those optional fields then, not now.
- Phase 5 ships the cave's tables under the same schema.
- Phase 8 replaces the garden screen and wires a random dice source and
  manual entry.
- A generated `docs/` to `data/` diff check (does every docs cell appear
  in a record?) is a candidate for `/expand`.
