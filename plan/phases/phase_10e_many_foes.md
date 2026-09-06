# Phase 10e — Many foes

> Agent-facing brief, from the verdict of 2026-09-06 and two rows the
> audit already carries ([4.0] multiple combat, [4.2] the Oracle's
> count). The engine's `multiple` module has implemented R35–R37 since
> Phase 3; the combat screen has never used it.

## Outcome

"Both" in the Attendants room is fought as both; a band of devil
servants is as many as the Oracle says; the Woodgatherers are a band;
and ATTACK means what the sealed rule says it means.

**Done when:** the combat screen has a many-foes mode showing the
Master's one roll against each attacker's roll, SKILL reduced by the
headcount, up to ATTACK attackers striking; the Oracle's "No. of
enemies" row is rolled for dice-less devil-servant areas and the
result is shown; a Butterfly Palms or Light Body Technique reaches the
opponents its text says; a scripted fight against three on fixed dice
resolves.

**Waits on:** 10d (the round loop it extends).
**Cost:** two weeks.

## What the book gives

- MH p.30, Multiple Combat: "Reduce your SKILL points by an amount
  equal to the number of opponents you face. Remember that some
  Techniques or Martial Proficiencies can help you in multiple combat:
  in case of a successful attack, distribute the same amount of damage
  to the enemies. E.g. you have the Martial Proficiency Double Strike,
  your attack against 3 opponents causes 4 damage; two of them will
  suffer 4 damage. The opponent's ATTACK attribute (see Opponents pg.
  70) indicates how many enemies can attack at the same time."
- MH p.28, footnote: "To streamline combat while maintaining the idea
  of a chaotic scene, you can consider Minions with ENDURANCE=1; if
  you hit you can remove one minion."
- MH p.58, Oracle, No. of enemies: Minion 1d6, Subordinate 3, Warrior
  2, Boss 1.
- MH p.12–14, Techniques: Butterfly Palms "You can hit two opponents";
  Light Body "Jump to kick all opponents surrounding you"; Exploding
  Qi "a circle of energy that repels those around you".
- 5T a2: Devil servant "Sneaky minion, easily frightened if alone (use
  the Oracle for the number of devils)"; Special skill Surround (3).
  Woodgatherer ATT 5; Skillful Beast ATT 5; Ogre ATT 3.
- 5T a1, Attendants room: "5-6 Both".
- `spec.md`, sealed: "ATTACK is the number of opponents a creature can
  wound at once and is inert against a lone Master."
- Readings I-06 (one Master roll per round), I-09 (blank ATTACK reads
  as 1), I-11 (area reach from the prose), I-33 (minions on a d6),
  I-34 (dice-less encounters are fixed; count from the Oracle).

## Scope

- The Event resolver: for the Kitchen, Storage room and Women quarter,
  and for row 7 reinforcements, roll the Oracle's Minion count (1d6)
  and push that many `foe.devil-servant` ids; the roll card shows a
  third die and MET: 3 Devil servants. For "Both", push both ids.
- The beat offers one row, FACE THEM ALL (n), and the single rows
  under it; facing one leaves the others pending.
- `CombatScreen` many-foes mode: the Master's card as now, SKILL shown
  reduced by n; a column of attacker cards each with its own 2d6 and
  total; each attacker's outcome against the one Master roll; damage
  taken is the sum of the attackers that beat it, capped by ATTACK of
  the kind (the highest ATTACK among them, reading I-09b, labelled);
  the winner's option applies to one target chosen by tapping its
  card, or to the reach of an area Technique.
- Minions at ENDURANCE 1 is offered as a toggle on the fight's first
  screen, cited MH p.28 footnote, default off.
- Loot: one LOOT line per fallen foe, read in order, each a slip.

## Decisions made upfront

- ATTACK against a lone Master stays inert (sealed). It caps attackers
  only when the Master faces several of one kind.
- Mixed kinds (Beast and Ghost) each attack; the cap is per kind.
- The Junior King is never in a band.

## Not in scope

- The Master with allies (Older Brother ritual, Protective Demon):
  a later phase.

## BDD

```gherkin
Feature: Several foes at once

  Scenario: the Oracle counts the devils
    Given the Kitchen entered on dice 2,4
    Then the roll card shows a third die reading 4
    And MET: 4 Devil servants
    And FACE THEM ALL (4) is offered

  Scenario: the round against three
    Given three Devil servants and a Master of SKILL 8 with Non lethal combat 4
    When I roll the round on dice 5,4 and theirs 3,3 / 6,6 / 2,2
    Then my total reads 5+4+5+4 = 18 with SKILL shown as 5
    And the servants read 14, 20, 12
    And I lose 2 from the one that beat me and the banner says so
    And the two I beat are marked; STRIKE asks which

  Scenario: ATTACK caps who can reach me
    Given four Ogres (ATT 3)
    When all four roll higher than me
    Then only three wound me and the fourth is marked HELD BACK

  Scenario: an area Technique reaches two
    Given three Devil servants and Butterfly Palms known, and a won round by 4
    When I choose USE A TECHNIQUE, Butterfly Palms
    Then two servants each lose 4 and the third none
    And my ENDURANCE drops by the Technique's cost

  Scenario: both attendants
    Given the Attendants room on dice 2,6
    Then MET: Skillful Beast, Dexterous Ghost
    And FACE THEM ALL (2) is offered
    And beating both reads two LOOT lines in turn
```

## Verify gate

`npm run verify`; `packages/engine/src/multiple` tests are already
green and are reused; `reduce.test.ts` and one e2e case per scenario.
