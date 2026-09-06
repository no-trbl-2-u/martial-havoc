# Phase 10c — The three acts on screen

> Agent-facing brief, from the verdict of 2026-09-06. The five-rung
> act ladder has existed in `acts.json` since Phase 5 and the engine
> computes the current act; no screen has ever shown it. This phase
> shows it, and adds the book's one pacing rule.

## Outcome

The player always knows which act they are in, sees the act's line
the moment it changes, and near the boss the dice give way to the
story as the book says they should.

**Done when:** an act-change slip appears on the beat the first time
each act is satisfied, with the act's name and line; a progress mark
(a row of five, filled to the current act) sits in the beat's header;
in act 4's approach (the Chieftain quarter entered) the Event roll's
Safe exploration and Rest outcomes are replaced by Encounter, labelled
as the book's pacing rule; a scripted Master crosses every act on
fixed dice and the slip shows each once.

**Waits on:** 10a for the wording of the mark; the lines already
exist.
**Cost:** one week.

## What the book gives

- MH p.82–83, Three-act structure: "Each act ends with a climax, a
  point of maximum tension; a point of no return to a new act."
- MH p.84: "in Solo RPGs ... we do not know how many trials our
  protagonist will have to overcome, but we can interpret the results
  of the dice rolls to understand if we have reached a plot point. If
  the result of the dice roll conflicts with the linear development of
  the story, ignore the dice. Reach the plot point without lowering
  the tension. For example, at the beginning of the third act, the
  protagonist has defeated the generals guarding the room where the
  boss resides and is opening the door; a roll on the Event table with
  Rest result, although plausible, would slow down the momentum.
  Instead, let the Encounter happen and prepare for the finale."
- MH p.85: "you can draw the outline as you play, marking the
  transition to a new act and the achievement of plot points."
- MH p.86, "Climbing the pyramid": minions, then fewer stronger
  enemies, then the boss. That is the cave's shape: servants, ogres,
  attendants, Silver Horn, Gold Horn.
- `packages/content/data/campaigns/the-5-treasures/acts.json`: five
  acts, each with a name and a line, all `label: invention`.

## Scope

- `actFor(tables, cave)` is called on every beat; the record keeps
  `actsSeen: number[]`; when the current act is not in it, the beat
  shows an `ActSlip` (name, line, a dashed "ours" rule) above the area
  and the act is added. The slip is dismissed by any tap and never
  returns.
- A progress mark of five in the beat header, filled to the current
  act, each with the act's name on long press. It is drawn, not
  written: five small squares.
- The pacing rule: reading, cited MH p.84. When the Master enters the
  Chieftain quarter, the Event roll is made and shown as rolled, then
  a second slip says the book's sentence and the outcome is Encounter.
  Fixed dice still fix the roll; the override is visible and labelled.
- The record's `actsSeen` is in the campaign half and migrates.

## Decisions made upfront

- The mark's five names are the act names in `acts.json`; the ending
  act's name stays "The 5 Treasures".
- The pacing rule applies to one door only, the Chieftain quarter,
  because the book's example is the boss's door. No other area.
- Rest is not offered in the Chieftain quarter while Gold Horn stands.

## Not in scope

- The trial-and-error structure (MH p.86–87); the cave is a pyramid.
- Any authored line beyond the five that exist.

## BDD

```gherkin
Feature: The acts are visible and the boss's door does not slow down

  Scenario: entering the cave turns the page to act 2
    Given a fresh Master on the mountain
    When I walk to the Cave entrance on a die of 4
    Then a slip headed INSIDE THE LOTUS FLOWER shows once
    And its line is "The gate is behind you now, and the stream that went in ahead of you has stopped talking."
    And the progress mark shows two of five filled
    When I walk back to the mountain and into the cave again
    Then no act slip appears

  Scenario: the paper door is the third act
    Given I hold the private quarter's key in the Attendants room
    When I walk to the Chieftain quarter on a die of 4
    Then the roll card shows the 4 as rolled
    And a second slip cites MH p.84 and reads the book's sentence about momentum
    And the Event resolves as Encounter and the Senior King is met

  Scenario: the fourth act is Golden Horn down
    Given the Senior King has 1 ENDURANCE left
    When I strike for 1
    Then the fight ends and, on the beat, a slip headed THE LORD OF THE CAVE shows once

  Scenario: the save carries the acts seen
    Given acts 1 to 3 have been seen
    When I export and import the campaign
    Then no act slip for 1 to 3 appears again
```

## Verify gate

`npm run verify`; `campaign.test.ts` migrates a record without
`actsSeen`; `reduce.test.ts` walks the ladder on fixed dice.
