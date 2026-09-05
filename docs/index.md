---
type: Index
title: "Martial Havoc — the book as documentation"
description: "Root of the OKF v0.2 bundle that decomposes the Martial Havoc rulebook and The 5 Treasures into concepts the engine phases cite."
okf_version: "0.2"
tags: [index, okf]
cite: "MH p.1"
sources:
  - id: rulebook
    resource: ./sources/MH_Full_Itchio.extracted.txt
    title: "Martial Havoc rulebook (pdf-parse extraction)"
    author: human:gianluca-monaco
  - id: adventure
    resource: ./sources/The-5-treasures.extracted.txt
    title: "The 5 Treasures (pdf-parse extraction)"
    author: human:gianluca-monaco
  - id: inventory
    resource: ./sources/estate-inventory.md
    title: "Estate inventory of the rulebook and the adventure (idea-0003/artifacts/0002)"
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Martial Havoc, decomposed

This directory is an [OKF v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
knowledge bundle: one markdown concept per section of Gianluca Monaco's
*Martial Havoc* rulebook and per part of *The 5 Treasures*, each with
YAML frontmatter naming its `type`, its `sources`, the folio it `cite`s
and who `generated` it. It exists so the engine phases in
`../plan/steps/01_build_plan.md` cite one place in this repository
instead of two PDFs and an artifact in another one.

Phase 1b of the build plan wrote it (`../plan/phases/phase_1b_decomposition.md`).
`scripts/docs-check.test.ts` keeps it honest: every concept must carry
frontmatter, a citation and resolvable links, or `npm run test` is red.

## The split

Concepts are sorted by what they **are**, not by which PDF they came from:

| Directory | Holds |
|---|---|
| [rules/](./rules/index.md) | How play works: procedures, checks, the tables a procedure rolls on while resolving an action, and the **readings** (the estate's I-nn ids) where the book is silent |
| [world/](./world/index.md) | What exists: the 18 Martial Arts, Techniques, Rituals, deities, the 50 opponents, the Market, the Oracle and its word tables, the author's presets and guidance |
| [campaigns/](./campaigns/index.md) | Adventures: *The 5 Treasures* in full and the 36 hooks that start a campaign |
| [sources/](./sources/index.md) | Provenance: the two text extractions and the estate's inventory |

Edge rule: a table rolled on **while resolving an action** (Final Blow,
Unexpected Event, the Encounters matrix, Treasures) is rules; a table
that **names things in the world** (Opponents, Market, Deities, the word
tables) is world.

## Also here

- [licence-and-credits.md](./licence-and-credits.md) — the rulebook's
  licence page and the adventure's credits, verbatim.
- [log.md](./log.md) — the bundle's history.

## Conventions

- Citations use the printed folio (`MH p.23`; PDF page = folio + 1) and
  the adventure's two pages (`5T a1`, `5T a2`).
- Rule rows keep the estate's ids `R01`–`R84`; readings keep `I-01`–`I-63`.
  Neither is renumbered here; a new reading gets the next free id and
  goes back to the estate through `/re-seed`.
- Where the extraction and the PDF differ, the PDF at the repository
  root wins; where these docs and `../spec.md` differ, `spec.md` wins.
- Everything here is CC BY-SA 4.0, attributed to Gianluca Monaco.
