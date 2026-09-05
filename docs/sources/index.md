---
type: Index
title: "Sources"
description: "Provenance for the bundle: the two pdf-parse extractions of the PDFs at the repository root and the estate's machine-read inventory."
tags: [index, sources]
cite: "MH p.93; 5T a2"
sources:
  - id: rulebook-pdf
    resource: ../../MH_Full_Itchio.pdf
    title: "Martial Havoc (rulebook, 94 PDF pages; the source as published)"
    author: human:gianluca-monaco
  - id: adventure-pdf
    resource: "../../The 5 treasures.pdf"
    title: "The 5 Treasures (2 landscape pages; the source as published)"
    author: human:gianluca-monaco
generated: { by: claude-code/2026-09-05, at: 2026-09-05T19:00:00Z }
status: active
license: CC-BY-SA-4.0
---

# Sources

Three derived files, committed so every concept's `sources.resource`
resolves inside the repository. **The PDFs at the repository root are
the sources as published and win where a derived file differs.**

| File | What it is | Derived how |
|---|---|---|
| [MH_Full_Itchio.extracted.txt](./MH_Full_Itchio.extracted.txt) | The rulebook's text, folio numbers as lone lines before page breaks (printed folio = PDF page - 1) | pdf-parse 1.1.1, by the estate's Factor, 2026-09-05 |
| [The-5-treasures.extracted.txt](./The-5-treasures.extracted.txt) | The adventure's text; its two pages are cited `a1` and `a2` | pdf-parse 1.1.1, same |
| [estate-inventory.md](./estate-inventory.md) | The estate's Findings artifact `idea-0003/artifacts/0002`: 84 rules with enforceability class and folio, every table cell, 50 opponents, the eight presets, the cave in full, 14 discrepancies, 63 ambiguities (I-nn) | Written by the estate's research verb from the two PDFs and the two extractions; rendered pages were read visually where table structure mattered |

Neither PDF carries a creation or modification date (Google Docs
exports with those fields undefined), so no `last_modified` is claimed.

The inventory is a copy. Its home is the estate; if the estate revises
it, the revision is copied here in a commit that says so in
[../log.md](../log.md).
