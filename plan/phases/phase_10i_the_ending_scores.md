# Phase 10i — The ending scores the adventure

> Agent-facing brief, from the verdict of 2026-09-06. The book's loop
> closes with experience and advancement; the app's ending is a slip
> with a count. The engine's `progression` module implements R43–R47
> and nothing calls it from a screen.

## Outcome

Reaching the ending is a scene: the freeze frame, the four scores the
book asks for, the XP, and the chance to spend it before the sandbox.

**Done when:** the ending slip becomes an ending screen with the act's
line, the treasures held, the named foes down and the Dishonor; the
player gives the four scores of 1–3; XP is computed and shown with the
Dishonor subtracted; the advancement table is offered at the Master's
SKILL band and spending is applied to the sheet, flagged and never
refused; unspent XP is carried on the record; LEAVE FOR THE REGION is
the last row; a scripted Master reaches it on fixed dice and spends 8
XP.

**Waits on:** 10c (the acts), 10f (the sheet's migration path).
**Cost:** one week.

## What the book gives

- MH p.34, Experience and Advancement: "At the end of each adventure,
  assign a number from 1 (poor) to 3 (excellent) for each of the
  following: Mission Success; Use of equipment and environment; Combat
  spectacularity; Lateral thinking. Add the four values together and
  subtract your Dishonor Points from the total to obtain the XP you
  can spend on advancement."
- MH p.34, the table: by the Master's SKILL (6 or less / 7–9 / 10–12):
  Martial Proficiency 6/8/10 XP; SKILL 8/10/12; ENDURANCE 4/4/4; LUCK
  10/8/6; Training skill 10/8/6.
- MH p.35: "SKILL and LUCK attributes cannot exceed 12 points, while
  Martial Proficiency can exceed the initial maximum value of 4. To
  learn new Techniques or Rituals, you will need to increase your
  Training Skill (by spending XP)." The worked example: Master Lee,
  2+3+1+3 minus 1 Dishonor = 8 XP; ENDURANCE +1 or +2 for 4 XP each,
  or LUCK +1 for 6, or Training +1 for 6 giving 4 Resource points.
  "Any remaining XP will remain available to spend on the next
  advancement."
- MH p.87–88, Act 3, Resolution: "In MH-CJ, if you decide to end the
  adventure, you don't have to come up with a meaningful ending; a
  joyful jump and a freeze frame with the closing credits will
  suffice. If, on the other hand, you are ready to face new challenges
  with the same protagonist, pick up one of the narrative threads left
  unresolved in the second act; or answer the question: which figure
  in the shadows was pulling the strings of the boss you just
  defeated? And start over."
- `spec.md`, Refusals: scores are advisory, never refused.

## Scope

- `EndingScreen` replaces the ending slip when the ending act is
  satisfied: the act's line; a FREEZE FRAME block of ours (the
  Master's name, the treasures, the foes, the Dishonor); then THE FOUR
  SCORES with four pickers of 1–3 named as the book names them; XP
  shown as the sum less Dishonor, with the arithmetic visible.
- ADVANCEMENT: the table's column for the Master's current SKILL band
  (I-53), each row a MenuButton with its cost; tapping applies the
  advance through the engine and deducts; the caps (R45) are flagged
  and never refused (spec.md); Training +1 adds 4 resource points and
  opens the Technique/Ritual picker from creation, reused.
- The record keeps `xp: {earned, spent, unspent}` and the four scores
  for the adventure; migration defaults.
- The last row: LEAVE FOR THE REGION, and under it the book's closing
  question as a line: "which figure in the shadows was pulling the
  strings of the boss you just defeated?" printed verbatim, cited MH
  p.89.

## Decisions made upfront

- Scores are the player's; nothing is computed for them. The default
  is blank, not 2.
- Dishonor is the sheet's, accrued by the escape rule and I-39.
- Spending LUCK XP restores LUCK's initial value too (R05 keeps the
  initial beside the current); reading, labelled.

## Not in scope

- A second adventure to carry the Master into (Phase 12's sandbox is
  the next scene).

## BDD

```gherkin
Feature: The ending is scored and spent

  Scenario: the freeze frame
    Given five treasures held, Golden Horn down, Dishonor 1
    Then the ending screen shows the act line and a FREEZE FRAME with the Master's name, 5 OF 5, the foes, DISHONOR 1

  Scenario: the four scores make XP
    When I pick Mission Success 2, Use of equipment 3, Combat spectacularity 1, Lateral thinking 3
    Then XP reads 2+3+1+3-1 = 8

  Scenario: spending at the band
    Given SKILL 11 and XP 8
    Then the table shows ENDURANCE 4 XP, LUCK 6 XP, Training 6 XP, SKILL 12 XP, Proficiency 10 XP
    When I press ENDURANCE +1 twice
    Then ENDURANCE's initial value is 26 and XP reads 0

  Scenario: the caps are flagged, not refused
    Given SKILL 12 and XP 12
    When I press SKILL +1
    Then SKILL reads 13 and a flag reads "SKILL above 12 (R45)"

  Scenario: unspent XP carries
    Given XP 8 and nothing spent
    When I press LEAVE FOR THE REGION
    Then RECORD shows XP UNSPENT 8
    And export and import keep it

  Scenario: Training buys a Technique
    Given XP 6 and Training 1
    When I press TRAINING +1
    Then the picker offers Techniques and Rituals with 4 resource points to spend
```

## Verify gate

`npm run verify`; `packages/engine/src/progression` tests are green
already; `reduce.test.ts` per scenario; one e2e case to the freeze
frame and one spend.
