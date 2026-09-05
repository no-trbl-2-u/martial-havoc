# Martial Havoc

origin: idea-0003 @ state/0013

## Horizon

A rules engine for Martial Havoc, Gianluca Monaco's rule-light d6 solo
wuxia RPG, made to run so that many wuxia campaigns can be played on it.
The sandbox is the real game; adventures are scenes in it, and The 5
Treasures is the first.

On 2027-03-05, working: the operator's second Master walks out of the
Lotus Flower cave into a region the engine threw as dice on a plane, on a
phone, PDF closed. The region is seven points on a plane linked to their
nearest neighbours, each link's miles the sum of the two dice and its
route band from the same sum; the screen is a diagram of links and says
it is not to scale. A monastery generates room by room as it is entered.
An encounter resolves through a menu of what the rules allow, with an
authored line beside every result and a free-text field the player may
use and never must. Combat shows both rolls, the Proficiency each side
added, and the difference; a tie is an Unexpected Event; a retreat rolls
Morale. The rules panel lists every behaviour with one of three labels,
rule, reading or invention, and its citation.

One campaign record holds one Master, its deeds ledger (named foes killed
or fled, treasures held, NPCs rescued, Dishonor), flags namespaced per
adventure, the player's passages, the reading ids it was played under,
and an override count. A dead King is dead everywhere in that campaign;
the world dies with the Master; a fresh start is a new record. Export and
import are versioned JSON with migrations keyed on reading ids.

Creation rolls attributes, checks the point pools, flags overspend with
the numbers and never refuses; the author's eight presets ship as
printed, Yin's overspend flagged. About 440 authored lines: every Oracle
cell, Unexpected Event, Inspiration, Spark and Technique or Ritual
effect. The 5 Treasures is the first file in a public, documented
adventure format; a trail-head village is a City on fixed data. Text and
SVG only; no credited art. A web build on Cloudflare and, when the
accounts exist, internal tracks on iOS and Android. Offline; no account.

**What would make this wrong:**

1. The engine is proven by the cave, checked on **2026-12-05**. Evidence:
   a campaign record whose cave reached the freeze-frame ending screen,
   played in the app with the PDF closed; stricter, the record's override
   count shows no manual entry used for anything but dice. Falsified if
   no such record exists on that day, whatever the reason.
2. The picture holds on **2027-03-05**. Evidence: the whole sitting, a
   region thrown, a location entered, an encounter resolved, the record
   carrying all of it, on a phone, exported and imported once. Falsified
   if any part cannot be performed on the day.
3. The sandbox is the real game. Falsified by the operator's own
   sentence, "if I stop playing it myself", checked at every session
   close after falsifier 2 passes; undated by calendar by the operator's
   word.

## Refusals

- **No accounts, login or cloud sync.** Offline; the device holds the
  save; the exported file is the only backup.
- **No multiplayer.** The book is solo; the game stays solo.
- **No generated prose.** No model, external or on-device, writes
  narration; authored lines and the player's own words only.
- **No monetisation.** No ads, purchases or paid tiers; the whole
  repository is CC BY-SA 4.0 with attribution shipped in the app.
- **No authoring tool.** The adventure format is public and documented;
  a tool to write it is not in scope.
- **No credited art.** Text and SVG only until a later decision; none of
  the rulebook's or adventure's art ships.
- **No store listing** before the operator decides it.
- **Creation's pools are advisory; everything else at creation is
  enforced.** The engine flags overspend and never refuses; attributes
  are rolled, not typed; the author's eight presets ship as printed and
  are never corrected.
- **Every behaviour is labelled.** Rule, reading or invention, with a
  citation; a build with an unlabelled behaviour is red.
- **The sealed rules stand.** ATTACK is the number of opponents a
  creature can wound at once and is inert against a lone Master; the
  Final Blow LUCK roll loses 1 LUCK on failure only; a night's rest heals
  +4 ENDURANCE; a double six fails every check and lands every doubles
  roll; Unexpected Event retreat rows roll the Morale table. Reopening
  any of them is a `/re-seed`, not an edit.

## Acceptance criteria

- [ ] `npm run verify` (typecheck, Vitest, Expo web export, Playwright
      smoke) is green at HEAD; `npm run deploy:check` is green against
      Cloudflare.
- [ ] Every table in the rulebook and the adventure validates against
      one schema and carries a citation.
- [ ] Every rule in the record's inventory has a fixed-dice test; the
      label leg fails the build on an unlabelled behaviour.
- [ ] The eight presets load as printed; Yin loads flagged (10 of 9
      Proficiency points, 12 of 8 resource points).
- [ ] A scripted Master reaches the cave's ending screen on fixed dice.
- [ ] A campaign record round-trips export and import and survives one
      migration across a reversed reading.
- [ ] The shipped authored-line count is printed by the build; 437 is
      the full count, and a smaller number names the fallback.
- [ ] By 2026-12-05, the operator's campaign record shows the ending
      screen reached with the PDF closed.
- [ ] By 2027-03-05, a region throws, a location is entered, an
      encounter resolves, and the record carries it, on a phone.

## Routine calls

- Repository: `no-trbl-2-u/martial-havoc`, default branch `main`.
- npm workspaces: `packages/engine` (pure TypeScript, no React, dice
  injected), `packages/content` (data files, authored lines, adventure
  files), `apps/app` (Expo, React Native, web target).
- TypeScript strict; Vitest for unit; Playwright against the exported
  web build; Expo SDK pinned in the garden's brief.
- Hosting: Cloudflare Workers static assets for the web export;
  `scripts/deploy-check.mjs` polls it.
- Native builds via Expo Application Services in Phase 13, accounts
  `[needs-user-call]`; the web build is the fallback distribution.
- Dice: an injected source; in-app roll by default; manual entry beside
  it; a fixed-sequence source for tests.
- Licence: CC BY-SA 4.0 for the whole repository, attribution to
  Gianluca Monaco, Cristian Cammarata, limofeus and watabou.
