# Martial Havoc — build-plan payload

Exported from The Estate under `contract: build-plan`, `target: nexus`.
Provenance: `origin: idea-0003 @ state/0013` (also in `spec.md`).
Rendered for kit tag `v0.2-estate` of
[`no-trbl-2-u/idea-Nexus`](https://github.com/no-trbl-2-u/idea-Nexus).

This directory is the **droppable form** of the Seed: the files the loop
reads, already decided, and nothing else. The loop itself is fetched by one
command and leaves no source behind.

## Drop it in

1. The repository is `no-trbl-2-u/martial-havoc`; it already holds the two
   source PDFs (`MH_Full_Itchio.pdf`, `The 5 treasures.pdf`). Existing is
   fine.
2. Copy this directory's contents to the repository root.
3. Adopt the loop around them (Node 18+ and git are the only prerequisites):
   ```
   npx --yes github:no-trbl-2-u/idea-Nexus#v0.2-estate adopt --commit
   ```
   The script copies the kit's skills, commands, scripts and plan files
   **around** what is already here — it never overwrites, and it reports
   each file it kept. Placeholders it cannot resolve from `nexus.adopt.json`
   (the hosting URL, until the Cloudflare project exists) land as
   `[needs-user-call]` rows in `plan/AUDIT.md`.
4. Open your agent at the repository root and paste the one-paragraph
   prompt from the kit's README, *"TL;DR — I have a Seed payload"*. It
   clears the audit rows, prunes what `plan/bearings.md` rules out, and
   stops.
5. Run `/ship-a-phase`. Phase 1 is **the garden**; its done-condition is
   *one loop tick on nothing*. Do not skip it, and do not let a feature
   into it.

## What is here

| File | What it is |
|---|---|
| `spec.md` | The Seed's Horizon, refusals, acceptance criteria, provenance — the loop's anchor; `/seed-check` reads it before any pivot |
| `nexus.adopt.json` | The adopt manifest: project identity keyed by the kit's placeholder tokens |
| `plan/bearings.md` | Standing context for every loop tick: stack locked, refusals as standing decisions, the verify and deploy gates |
| `plan/steps/01_build_plan.md` | The Status block the loop reads, garden first, then thirteen phases to 2027-03-05 |
| `plan/phases/phase_1_bootstrap.md` | The garden, as a brief the loop can ship |

`seed-check` and `re-seed` are not here: they ship with the kit
(`templates/skills/`), so every adopted repo has them.

## Human attention

Steps the estate tagged `[HUMAN ATTENTION]` are rendered here as nexus's
`[needs-user-call]` — the vocabulary the loop already parks on and
`/oversight` already drains: the Cloudflare account and its environment
variables, the layout choice, the native-build accounts and a Mac, the
cave played by the operator, the whole sitting by the operator, and any
authored line the operator reserves. The tag is a claim that the rest of
the step *is* agent-performable; an untagged step that stalls is a bug in
the plan, worth a `/re-seed` report.

## The sources

The rulebook and the adventure are CC BY-SA 4.0 by Gianluca Monaco (cover
and chapter art by Cristian Cammarata; adventure icons by limofeus; cave
map by watabou). The estate's record holds a machine-readable inventory of
every table, opponent and adventure area, and the readings the engine
takes where the book is silent; the build plan cites them by id. The
repository's licence file must carry the attribution before the first
release.
