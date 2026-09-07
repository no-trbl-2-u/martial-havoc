# Phase 10k — True to the book: the fight as the book runs it

> Agent-facing brief, from the merged `determined-intent.md` of
> 2026-09-07 (sections 3.1, 3.6, 3.8, 6 and 7) and the fidelity rows
> `plan/CRITIQUE.md` already carries. The engine is labelled and cited
> for every behaviour below; nothing here adds a rule. This phase
> wires the app and pins the content to what the book prints.

## Outcome

A fight runs for as long as the book says it runs, the winner's four
options are the player's every time they win an exchange, the one
optional rule in the book is offered where it applies, and the tables
the app reads are provably the printed ones.

**Done when:** a Master who loses an exchange is offered the next
exchange (and FLEE), not FLEE alone; a Master who knows more than
one usable Technique picks one from a list, with MH p.24's sentence
against ending a fight with it printed beside the row; a fight of
more than one body offers MINIONS AT 1, default off, cited to the
MH p.28 footnote, and the record remembers the choice; a content test
pins the Oracle's eleven rows to the printed spans and the printed
defects to their printed spelling; the Devil servant's LOOT on a 6
reveals the area's Hint and says so; the manual panel accepts one
face for the treasure d6; the two critique rows 10e already shipped
are moved to Done; every path has a fixed-dice test.

**Waits on:** 10e (the band), 10f (learned Techniques).
**Cost:** one to two weeks.

## What the book gives

- MH p.23, Combat: "If your opponent has the higher Attack Strength,
  they damage you, subtracting the difference between the two Attack
  Strengths from your ENDURANCE. ... The combat continues until: You
  succeed in landing a Final Blow; Your opponent's or your ENDURANCE
  points reach zero; An Unexpected Event occurs." A lost exchange is
  none of the three.
- MH p.23: "If your Attack Strength is higher than your opponent, you
  can do one of the following: Subtract the difference ...; Use one of
  the Techniques you know; Change or recover a weapon; Create an
  Opening." "one of the Techniques you know", not the first.
- MH p.24: "To make the fights more challenging, do not use the
  Technique to end a fight; even if you can knock down an opponent, it
  does not mean that they are defeated, but that you have gained a
  great advantage, or the chance to escape without consequences."
- MH p.28, footnote: "To streamline combat while maintaining the idea
  of a chaotic scene, you can consider Minions with ENDURANCE=1; if
  you hit you can remove one minion". Optional; the only optional rule
  in the book that changes a printed stat.
- MH p.58, Oracle: the merged cells, spans as in
  `determined-intent.md` section 3.6 (Outcome 1 / 2-3 / 4-5 / 6;
  Encounter Outcome 1 / 2-4 / 5-6; Enemy Type 1 / 2-3 / 4-5 / 6; No.
  of enemies 1 / 2-3 / 4-5 / 6; Enemy attack 1-4 / 5-6; Door 1-3 / 4 /
  5 / 6; Object amount 1 / 2-3 / 4-6). `oracle.json` already carries
  them; nothing pins them.
- Printed as such (rule 9.1, transcribe): "Yauxia" MH p.67 against
  "Youxia" p.79; "SKILLS 9" p.74; Huang Feng Guai's blank ATTACK p.74;
  Brawler ATTACK "2-4" p.71; "Giada" p.62; "CHamber" p.92; Treasures
  row 5 column 17-19 "2d6 + Common Item" p.68.
- 5T a2, Devil servant LOOT: "1-3 junk, 4-5 simple weapon, 6" followed
  by the warning-triangle glyph and no text. Reading I-08: the 6
  reveals a Hint.
- MH p.27: "If it is not clear from the ongoing narrative, roll on the
  following table"; MH p.84: "ignore the dice". Every roll takes a
  manual result; spec.md's override count records it.

## Scope

- **The next exchange.** `doRound` in `apps/app/src/state/reduce.ts`
  refuses a roll while `c.last !== null`; only the winner's options,
  a tie or the fan clear it. Settle a lost exchange by the hit it
  already applied: when the round's outcome is the Master hit, the
  reducer leaves `last` set for the slip and clears it (and
  `rolledOff`) on the next `combat.round`, so ROLL THE ROUND is
  enabled after a loss. On `CombatScreen`, `canRoll` reads the same.
  Label `combat.lost-round-is-followed-by-another` as `rule`, cite
  MH p.23 (R26). The reducer test "takes the hits the Master is
  behind on (I-44)" must assert the second round actually rolled.
- **Every Technique.** Replace the single `technique` row's
  `printed[0] ?? own[0]` with a chooser: when more than one usable
  Technique exists, the row opens a sub-list (one row per printed
  Technique with its cost, one per learned Technique with its value)
  in the same `Act` shape; one usable Technique keeps the current
  single row. Under the row, the p.24 sentence as a transcribed line
  from `packages/content/data/app/strings.json`, key
  `ui.combat.act.technique.warning`, cited MH p.24, printed upright
  (it is the book's, not the narrator's). No mechanical change to what
  a Technique does; that is 10l's.
- **Minions at 1.** A row MINIONS AT 1 on the fight's first screen
  whenever `foes.length > 1`, default off, toggling
  `combat.minionsAtOne: boolean` on the `Combat` state. While on, the
  band's bodies read ENDURANCE 1 for damage (`asFoeInFight` keeps the
  printed value for display, marked) and any hit removes one. Label
  `combat.minions-at-endurance-one` as `rule`, cite MH p.28 (R33),
  optional. The choice is written as a deed ("Minions at 1, MH p.28")
  so the record carries it; no record version bump, the field is
  optional and absent reads false. This is the record's first
  optional-rule flag; put it under `Combat`, not the sheet, because
  the footnote says "to streamline combat" and nothing else.
- **The pins.** In `packages/content/src/fidelity.test.ts`, one
  `describe('fidelity: the printed spans and the printed spelling')`
  with two cases: the eleven Oracle rows equal the span table above,
  face by face; and the seven printed defects appear character for
  character in the data (`Yauxia` in the encounter matrix, `SKILLS 9`
  is a docs note not data so it is asserted against
  `docs/world/opponents.md`, Huang Feng Guai's `attack: null`,
  Brawler's `"2-4"`, `Giada`, `CHamber`, the row-5 cell). A normalised
  cell goes red.
- **The Devil servant's 6.** In `doLoot` (reduce.ts line 422 region),
  when the drop's `hint` is true, call `revealHint(state.cave,
  state.cave.area)` (already done) and write a result slip line and a
  deed: "The servant's secret: the Hint of <area>", cite I-08. Today
  the reveal happens and nothing says so; the critique row records it
  as "nothing".
- **The treasure d6 by hand.** `ManualDice` already takes `need: 1`.
  Wire the treasure roll (`progression.treasure-roll-is-offered-and-
  declinable`, I-30b) through the same manual path as the Event d6:
  one face, counted as an override.
- **Bookkeeping.** Move the two critique rows "Both and the
  Woodgatherer band are fought one after another" and "the Oracle is
  not asked how many Devil servants there are" to Done with 10e's
  commit 2299f57; move the rows this phase closes to Done in the
  phase commit.

## Decisions made upfront — DO NOT ASK

- A lost exchange keeps its slip until the next roll; the slip is
  not a modal. The book has no pause between exchanges.
- The Technique chooser lists printed Techniques first, learned ones
  second, in sheet order. No sorting by cost.
- MINIONS AT 1 applies to the whole band for the whole fight; it is
  not per body. The footnote speaks of "Minions" as a class.
- The Minions flag lives on `Combat`, not on the record's sheet, and
  is written as a deed. A second optional rule, if one ever comes,
  gets a home then.
- The p.24 warning prints on every fight, not only when a Technique
  could end it; the engine does not know what "end a fight" means for
  a narrative Technique.
- `SKILLS 9` is the docs' transcription problem, not data's; assert
  it in docs, do not add it to data.
- No engine change. If a scope item turns out to need one, it is a
  labelled behaviour with a fixed-dice test, in the same commit, and
  the commit body says why.

## Not in scope

- The spirits gate and Technique damage (10l).
- The sealed double-six fumble against the book's automatic success
  at threshold 12 (a `/re-seed` question, recorded in
  `determined-intent.md` section 7 item 8).
- The Morale roll on retreat rows and the night's-rest +4 (sealed).
- Opponent Technique frequency (silent in the book; stays the
  reading it is).

## BDD

```gherkin
Feature: The fight runs as the book runs it

  Scenario: a lost exchange is followed by another
    Given San Te faces the Ogre and the dice are 1,1,6,6
    When I roll the round and lose 10
    Then the round slip shows the hit and ENDURANCE reads 10
    And ROLL THE ROUND is enabled and FLEE is enabled
    When I roll again on 6,6,1,1
    Then the winner's four options are offered

  Scenario: the Master can fall from full ENDURANCE in one fight
    Given the Master at 14 ENDURANCE against the Senior King
    When two lost exchanges total 14 or more
    Then a slip headed THE MASTER FALLS shows with the book's sentence

  Scenario: a Master who knows two Techniques chooses
    Given Chen Zhen (Sky punching fist, Tiger roar, Chain fists, Light body)
    When I win an exchange and press USE A TECHNIQUE
    Then a list of the usable Techniques with their costs is shown
    And under it the sentence "do not use the Technique to end a fight" with SOURCE MH p.24

  Scenario: the Minions rule is offered and remembered
    Given three Devil servants on the beat
    When I press FACE THEM ALL (3)
    Then MINIONS AT 1 is offered, off, with SOURCE MH p.28
    When I switch it on and win an exchange by 2
    Then one servant falls and the deed "Minions at 1" is in the ledger

  Scenario: the Oracle's spans are the printed ones
    Given oracle.json
    Then Encounter Outcome reads Ambush on 1, Attack on 2-4, NPC/Creature Reaction on 5-6
    And Enemy attack reads Normal on 1-4 and Special on 5-6

  Scenario: the servant's 6 is a secret
    Given a Devil servant falls in the Storage room and the loot die is 6
    Then the Storage room's Hint is revealed
    And the result slip reads the servant's secret with SOURCE I-08

  Scenario: the treasure d6 by hand
    Given a fallen Ogre and MY DICE
    When I enter one face of 5
    Then the Treasures table's row 5 for ENDURANCE up to 16 is read
    And the override count is one higher
```

## Verify gate

`npm run verify`; each scenario above is a `reduce.test.ts` or
`fidelity.test.ts` case on fixed dice, and the first, third and
fourth are `e2e/played.spec.ts` cases.

## Commit body template

```
app: the fight runs as the book runs it (Phase 10k)

- A lost exchange is followed by another (MH p.23, R26).
- Every known Technique is a winner's option; MH p.24's warning beside it.
- MINIONS AT 1 offered on a band, default off (MH p.28 footnote, R33).
- fidelity.test.ts pins the Oracle spans and the printed spelling.
- The Devil servant's 6 reveals the Hint and says so (I-08).
- The treasure d6 takes a manual face.
- CRITIQUE rows moved to Done: <list>.
```
