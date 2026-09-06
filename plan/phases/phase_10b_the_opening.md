# Phase 10b — The opening: the village as the Call

> Agent-facing brief, from the verdict of 2026-09-06. Reverses one of
> the three phase 8c calls ("Where does a new Master start? The
> Flat-top mountain") on the operator's word that the player must know
> who they are, where they are going and why before the first roll.

## Outcome

A new Master begins in Fen Pass, the trail-head village, with the
book's premise as the Call. The first ten minutes are a first act: the
ordinary world, the incident, the point of no return, and the climb.

**Done when:** BEGIN lands on the village, not the mountain; the
premise (5T a1) is the first thing read after creation; the trail row
is the only way onto the mountain and taking it is recorded as the
act-one climax; the inn, the shrine and the stall row are reachable
before the climb; a scripted Master on fixed dice goes village, trail,
mountain, cave entrance and the record carries the order.

**Waits on:** 10a for the lines; the wiring can ship before.
**Cost:** one week.

## What the book gives

- MH p.84–85, Act I: "Define the world where the story takes place
  ... and introduce the characters. Call/Incident: an event that
  changes the balance of the world and involves the protagonist. It
  defines the initial Goal. Motivation/Point of No Return ... Climax:
  the turning point of the first act, representing the abandonment of
  the Ordinary World." The book says the Incident "can be generated
  from the Adventures table pg. 36".
- MH p.42, Exploration, step 1: "Establish a starting city." The book
  starts in a city, not on a mountain.
- MH p.44, roads: the Inn, "the perfect place for ambushes"; MH p.47,
  Temple; MH p.52–55, Market. All three are already the village's
  procedures (Phase 7).
- 5T a1, the premise: "On the Flat-top mountain two fiends threaten the
  travellers ... In the Lotus Flower cave ... are kept 5 magic
  treasures." That paragraph is the Incident and the Goal in two
  sentences.

## Scope

- `startScreen` after creation is `village`; the record's `cave.area`
  stays the mountain but `cave.visited` is empty until the trail is
  taken, so `premiseFor` and the acts read "not yet begun".
- The village screen gains, at the top, the premise slip (the same
  `PremiseSlip` the beat shows) with a heading of ours: THE CALL.
  Under it, one authored line (10a) that names the Goal in the second
  person: the five treasures, the travellers, the monk who did not
  come back is not known yet and is not said.
- The trail row's line becomes the point of no return; taking it
  records the deed "took the trail" and moves the act ladder (10c) to
  act 1's climax.
- The beat's LEAVE FOR THE REGION row is hidden on the mountain until
  the ending act; the way back down is the village, reached by walking
  back off the mountain (a new exit on area 1: TO FEN PASS).
- The village's inn is where a night is spent; REST HERE on the beat
  stays, because the book allows a night anywhere.

## Decisions made upfront

- The village is still fixed data (spec.md, Horizon). Nothing here
  rolls a city.
- Money: creation's gold is the purse the stall row spends; nothing
  changes.
- The About screen keeps the premise too; it costs nothing.

## Not in scope

- A rolled Incident from the Adventures table (10j decides whether
  the Master has a motive of their own).
- Region travel from the village (Phase 12).

## BDD

```gherkin
Feature: The adventure opens in the village with the Call

  Scenario: a made Master wakes in Fen Pass
    Given I have made a Master and pressed BEGIN
    Then the village screen is shown
    And its first slip is headed THE CALL
    And it contains "On the Flat-top mountain two fiends threaten the travellers"
    And the beat is not reachable from the header

  Scenario: the trail is the point of no return
    Given I am in the village
    When I press TAKE THE TRAIL
    Then the beat shows AREA 1 OF 8 FLAT-TOP MOUNTAIN
    And the deeds ledger contains "took the trail"
    And the village is reachable again only by the exit TO FEN PASS from area 1

  Scenario: a night before the climb
    Given I am in the village with 5 SP and ENDURANCE 16 of 20
    When I press STAY THE NIGHT
    Then ENDURANCE reads 20
    And the purse reads 1 SP

  Scenario: the scripted first act on fixed dice
    Given the dice queue 4,4
    When the scripted Master takes the trail, walks to the Cave entrance and to the Dining hall
    Then the record's visited list is mountain, cave entrance, dining hall in that order
    And the premise slip is no longer on the beat
```

## Verify gate

`npm run verify`; `e2e/creation.spec.ts`'s "a made Master wins a
fight" is re-pathed through the village; `reduce.test.ts` gains the
fourth scenario.
