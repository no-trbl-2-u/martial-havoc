# Phase 1b — The decomposition

> Agent-facing brief. Concise, opinionated, decisive. Ship without asking;
> document judgment calls in the commit body. Injected by the operator on
> 2026-09-05 between the garden and the engine; not a feature. No engine
> code, no data files, no schema leave this phase.

## Scope

Decompose the two source PDFs into OKF documentation (Google Cloud's Open
Knowledge Format v0.2: markdown concepts with YAML frontmatter, provenance
in `sources`, trust in `generated`, lifecycle in `status`, links as the
graph). The estate already uses OKF for its reference bundle; this repo
uses it for the book.

The three directories, by what a concept **is**, not by which PDF it came
from:

| Directory | Holds | Examples |
|---|---|---|
| `docs/rules/` | How play works: procedures, checks, the tables a procedure rolls on, and the **readings** (the estate's I-nn ids) where the book is silent | creation, actions, combat, healing, XP, exploration, cities, encounters, treasures |
| `docs/world/` | What exists: styles, powers, beings, goods, word tables, the author's presets and guidance | martial arts, techniques, rituals, deities, opponents, market, Oracle, Inspirations, Sparks |
| `docs/campaigns/` | Adventures: authored scenes and the hooks that start them | The 5 Treasures (premise, event table, areas, map, foes, treasures, credits), the 36 hooks |

Judgment rule for edge cases: a table a procedure **rolls on as part of
resolving an action** is rules (Final Blow, Unexpected Event, Encounters
matrix, Treasures); a table that **names things in the world** is world
(Opponents, Market, Deities, the word tables). The rule is recorded in
`docs/index.md`.

## Sources

`docs/sources/` holds the provenance, committed:

- `MH_Full_Itchio.extracted.txt`, `The-5-treasures.extracted.txt` — the
  estate's pdf-parse extractions (derived; the PDFs at the repo root win
  where they differ).
- `estate-inventory.md` — the estate's Findings artifact
  (`idea-0003/artifacts/0002`): 84 rules R-nn with enforceability class
  and folio, every table cell, 50 opponents, the eight presets, the cave
  in full, 14 discrepancies, 63 ambiguities I-nn. **Primary source for the
  decomposition**; the build plan already cites its ids.

Citations use the printed folio (`MH p.23`) and the adventure's two pages
(`5T a1`, `5T a2`), as the inventory does.

## Frontmatter contract

Every concept under `docs/` (not `docs/sources/*.txt`):

```yaml
type: Rule | Table | Reading | Adventure | Reference | Index
title, description
tags: [rules|world|campaigns, <topic>]
cite: "MH p.<folio>" | "5T a1"          # producer extension; required
sources: [{ id, resource (relative path), title, author? }]   # non-empty
generated: { by: <actor>/<version>, at: <ISO> }
status: active
license: CC-BY-SA-4.0
```

`docs/index.md` declares `okf_version: 0.2` and lists the three
directories and `sources/`; every directory has an `index.md` listing
every concept in it; `docs/log.md` records the decomposition.

## Verify leg

`npm run test` gains a `docs` project (`scripts/docs-check.test.ts`):

- every `docs/**/*.md` has frontmatter that parses;
- `type`, `title`, `description`, `cite`, `sources[≥1].{id,resource}`,
  `generated.{by,at}` present; `resource` paths resolve;
- every relative markdown link resolves to a file;
- every `index.md` lists every sibling `.md` and subdirectory;
- R-nn and I-nn ids used in `docs/rules/` are unique per id.

The leg is red on a missing citation exactly as `labels:check` is red on
an unlabelled behaviour; the two are the same promise at two layers.

## Outputs

```
docs/index.md, docs/log.md, docs/licence-and-credits.md
docs/sources/{index.md, *.extracted.txt, estate-inventory.md}
docs/rules/{index, master-creation, actions, combat,
            multiple-combat-escape-healing, experience-and-advancement,
            exploration, cities, encounters, treasures-and-special-items,
            oracle-procedure}.md
docs/rules/readings/{index, attributes-and-creation, combat,
            techniques-rituals-items, exploration-cities-oracle,
            the-5-treasures, discrepancies, not-found}.md
docs/world/{index, martial-arts, techniques, rituals, deities, market,
            oracle, inspirations, sparks, opponents, pregenerated-masters,
            cinematic-journey, filmography}.md
docs/campaigns/{index, adventure-hooks}.md
docs/campaigns/the-5-treasures/{index, premise, event-table, areas, map,
            foes, treasures, credits}.md
scripts/docs-check.test.ts; vitest.config.mts gains the docs project
```

## Decisions made upfront — DO NOT ASK

- Concepts are sections, not rows: one file per rulebook section or
  table, R-nn rows kept inside as tables. A file per rule would be 84
  near-empty concepts.
- The estate's ids are canonical. Never renumber R-nn or I-nn; a new
  reading taken here gets the next free I-nn and is reported back to the
  estate through `/re-seed`'s field report, not invented silently.
- Verbatim quotation is allowed and attributed (CC BY-SA 4.0).
- No SVG, no images in docs; the cave map is an adjacency table.
- `docs/` is documentation, not the content package. Phase 2 reads
  these docs to write `packages/content`; it does not import them.

## Git

Commits: `chore: phase 1b - docs gate and plan row`, then
`docs: phase 1b - rules`, `docs: phase 1b - world`, `docs: phase 1b -
campaigns`, then the DoD tick `plan: phase 1b shipped - the
decomposition`. Commit and push as a single atomic act.

## DoD

Flip Phase 1b's `[ ]` → `[x]` in `plan/steps/01_build_plan.md`, append
the commit hash, add a line to "Phase log". `npm run verify` green;
`npm run deploy:check` green at HEAD (docs do not change the export; the
gate still runs).

## Follow-ups (out of scope this phase)

- Phase 2 turns the tables in `docs/world/` and `docs/rules/` into
  `packages/content` data validated by one schema.
- A generated `docs/index.md` (the estate generates its registry) is a
  candidate for `/expand`, not this phase.
