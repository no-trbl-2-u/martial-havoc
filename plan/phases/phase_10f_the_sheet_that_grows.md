# Phase 10f — The sheet that grows: the Final Blow's Technique, and age

> Agent-facing brief, from the verdict of 2026-09-06. The book's most
> delightful rule, inventing your own named Technique off a landed
> Final Blow, is implemented in the engine and never reached by the
> app. It needs a field on the sheet, so it takes the sheet's other
> missing field, age, with it, under one migration.

## Outcome

A landed Final Blow can become a Technique of the Master's own, named
by the player with the book's three-word table for inspiration, and
that Technique is then a winner's option in later fights. The Master
has an age.

**Done when:** after THE BLOW LANDS a row offers to keep it; the LUCK
roll is made and shown, with the sealed cost on failure only; on
success the naming card rolls the table (MH p.26), prints the three
words, and takes a name, a value 1–4 and a one-line description; the
Technique appears on the sheet, in the RECORD screen and in the
combat menu's USE A TECHNIQUE; the campaign record migrates; creation
asks for an age after the name and the record shows it.

**Waits on:** nothing.
**Cost:** one to two weeks.

## What the book gives

- MH p.25, Final Blow: "After creating an opening, roll 2d6. If both
  dice show the same number, your blow lands, giving you the chance to
  deliver a devastating strike. To add this new Technique to your
  Martial Arts knowledge, roll against your current LUCK. On a
  failure, lose 1 LUCK; on success assign it a value (1–4) with a
  brief description. For inspiration, roll 2d6 on the following
  table, the attributes suit both the action and the animal. E.g.
  Destroying Palm of the Turtle / Palm of the Destroyer Turtle /
  Deadly Palm of the Destroyer Turtle. E.g. New technique: Impetuous
  Slap of the Phoenix (2). I jump and strike my opponent's cheek,
  leaving a red scar on their face."
- MH p.26, Final blow table: 1d6 × 1d6, Action / Attribute / Animal
  (Strike Furious Dragon ... Sweep Sharp Unicorn).
- MH p.24, Use a technique: "without making a roll check, but you must
  subtract as many ENDURANCE points as the value of the Technique."
- MH p.5, Master creation: "Name and age" is the first line of the
  sheet; MH p.92, every preset prints an age (Sun Wukong, 1100).
- `spec.md`, sealed: "the Final Blow LUCK roll loses 1 LUCK on failure
  only". Engine: `newTechnique`, `namingRoll` in
  `packages/engine/src/combat/final-blow.ts`; content:
  `rules/final-blow.json`, `rollFinalBlow`.

## Scope

- `Sheet` gains `age: number | null` and `learned: readonly {name,
  value, description, words}[]`; `CampaignRecord` version bumps with
  a migration keyed on I-12 (the reading that settles the LUCK cost),
  defaulting both.
- Creation step `who` gains an AGE field beside NAME (numeric,
  optional; the printed sheets fill it).
- Combat: after `blow.landed`, a row KEEP IT AS A TECHNIQUE (line:
  "Roll against LUCK n. A failure costs 1 LUCK.") and a row LET IT
  GO. Keeping rolls `newTechnique(luck)`; the result slip shows the
  2d6 and LUCK; on success the naming card: ROLL FOR INSPIRATION
  prints the three words, a NAME field prefilled with the book's first
  ordering ("Furious Strike of the Dragon"), a value picker 1–4, a
  DESCRIPTION field. KEEP writes the Technique to `sheet.learned` and
  a deed "learned {name}".
- The combat menu's USE A TECHNIQUE lists learned Techniques with the
  printed ones; a learned Technique's effect is combat-narrative
  (Phase 4's class) with cost = value and the player's description as
  its line.
- RECORD shows THE MASTER with age, and a TECHNIQUES section listing
  printed and learned ones.

## Decisions made upfront

- The name field is prefilled but free; the copy-check does not read
  player text.
- A learned Technique does damage equal to its value when used as the
  winner's option, in addition to costing its value: a reading, I-31b,
  labelled, since the book gives learned Techniques no effect beyond
  their description. Reopenable.
- Age is optional; a blank age is shown as a dash.

## Not in scope

- Learning printed Techniques with XP (10i).

## BDD

```gherkin
Feature: The Final Blow becomes a Technique of your own

  Scenario: the blow lands and the LUCK roll succeeds
    Given the Ghost, an Opening, and dice 3,3 then 2,4 then 1,5
    When I press DELIVER THE FINAL BLOW
    Then THE BLOW LANDS and KEEP IT AS A TECHNIQUE is offered
    When I press it
    Then the slip shows 2d6 = 6 against LUCK 9, passed, LUCK still 9
    And the naming card offers ROLL FOR INSPIRATION
    When I press it
    Then the three words read Strike, Furious, Dragon on 1,5 mapped to the table
    And the NAME field reads "Furious Strike of the Dragon"

  Scenario: naming and keeping
    Given the naming card
    When I type "Impetuous Slap of the Phoenix", pick 2, type "I jump and strike the cheek" and press KEEP
    Then the deeds ledger contains "learned Impetuous Slap of the Phoenix"
    And RECORD lists it under TECHNIQUES with (2)
    And in the next fight USE A TECHNIQUE offers it at 2 END

  Scenario: the LUCK roll fails
    Given LUCK 7 and the LUCK dice 4,5
    When I press KEEP IT AS A TECHNIQUE
    Then the slip reads failed and LUCK reads 6
    And no Technique is added

  Scenario: a double six on the LUCK roll
    Given the LUCK dice 6,6
    Then the check fails whatever LUCK is and LUCK drops by 1

  Scenario: the save carries it
    Given a learned Technique
    When I export and import the campaign
    Then RECORD still lists it
    And a record saved before this phase imports with an empty learned list and a blank age

  Scenario: age
    Given creation step 1
    When I type "27" in AGE
    Then RECORD shows "Lin Shu, 27"
```

## Verify gate

`npm run verify`; `campaign.test.ts` migration case; `reduce.test.ts`
for each scenario; one e2e case through the naming card.
