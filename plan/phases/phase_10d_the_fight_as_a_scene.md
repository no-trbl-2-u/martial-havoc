# Phase 10d — The fight as a scene

> Agent-facing brief, from the verdict of 2026-09-06. Combat's
> arithmetic is right and labelled; what a round means to the story is
> never said. This phase gives every way a fight can end its moment,
> and gives the Unexpected Event its second half.

## Outcome

A kill, a flight, a fall and a tie each land as a beat of the story,
and a tie resolves back into the room instead of deleting the foe.

**Done when:** killing a foe shows a slip on the combat screen before
the loot row; fleeing shows a slip on the beat naming the blow and the
Dishonor; an Ambush gives the enemy one unopposed opening round, shown
as such; after an Unexpected Event the foe is still in the room unless
the row removed it, and the two "The fight resumes" rows put the
player back in the round; every path has a fixed-dice test.

**Waits on:** 10a for the lines; the mechanics ship without them.
**Cost:** two weeks.

## What the book gives

- MH p.23, Combat: "The combat continues until: you succeed in landing
  a Final Blow; your opponent's or your ENDURANCE points reach zero;
  an Unexpected Event occurs."
- MH p.27–28, Unexpected event: "After an Unexpected Event, you are
  no longer in the combat phase. Imagine the two opponents still in
  the attack position, crossing their weapons ... then something
  happens." The 2d6 table: 2 Adverse divine intervention; 3 Injury or
  loss of weapon for the Master; 4 Enemy retreat; 5 Environmental
  change; 6 The fight resumes; 7 Reinforcements, 1–4 Minions; 8 The
  fight resumes; 9 Environmental change; 10 Enemy retreat; 11 Injury
  or loss of weapon for the opponent; 12 Favorable divine
  intervention. MH p.29, Table of Deities, for rows 2 and 12.
- MH p.30, Escape: "suffer a last blow and subtract 2 points from your
  ENDURANCE. Score 1 Dishonor Point for each time you fail to escape
  without suffering damage."
- MH p.58, Oracle, Encounter Outcome: Ambush, Attack. Reading I-08a:
  an Ambush is one unopposed opening round for the opponent. The
  engine registry already carries
  `progression.oracle-ambush-is-one-unopposed-round`.
- MH p.6: "if ENDURANCE reaches zero, the Master dies or becomes
  unconscious."

## Scope

- **The kill.** When the foe's ENDURANCE reaches zero (strike or Final
  Blow), a `FallenSlip` on the combat screen: the foe's name, how (the
  difference, or THE BLOW LANDS), and the authored line. The loot and
  Go On rows sit under it.
- **The flight.** `combat.leave` with the foe standing writes a
  `Result` of kind `flee` (new) and the beat's result slip shows it:
  the last blow of 2, the Dishonor Point, the foe's name. The foe
  stays in `pending` (the book does not say it follows; the reading
  I-32 says the rest of the encounter does not, so the fled foe is
  removed and the slip says it was left behind).
- **The fall.** ENDURANCE 0 shows a `FallenSlip` for the Master before
  Begin again, with the book's sentence about dying or unconsciousness
  and a line of ours.
- **The ambush.** On an Ambush, the first round is the opponent's
  alone: the roll card shows their 2d6 against the Master's SKILL plus
  2d6 with no Proficiency (I-08a), damage if it beats, then normal
  rounds. The banner reads AMBUSH, THEIR ROUND.
- **The tie's second half.** After the Unexpected Event slip:
  - rows 6 and 8: a row RESUME THE FIGHT returns to the round loop
    with the same foe and ENDURANCE;
  - rows 4 and 10 (retreat): Morale as now; on flee or cautious
    retreat the foe leaves `pending`; on rally the reinforcements are
    minions on a d6 (I-33) and stay in `pending` as extra rows;
  - rows 5 and 9 (environmental change): the fight is over and the foe
    stays in the room, marked; a row FACE IT AGAIN reopens it;
  - rows 3 and 11 (injury or weapon): the fight is over; the injured
    side's next round carries a marked penalty of 2 on Attack
    Strength, a reading cited to I-30, or the weapon is lost and the
    weapon Proficiency does not add until CHANGE OR RECOVER A WEAPON
    is chosen;
  - rows 2 and 12: roll the Deities table (MH p.29) and print the
    three words; the mechanical reading is I-30's minimum, the player
    decides.
  - row 7: 1–4 minions on a d6 join `pending`; the fight is over for
    this round.

## Decisions made upfront

- A fled foe is left behind, not carried (I-32). The book is silent;
  the reading is labelled.
- The injury penalty is 2, the same number the book uses for the last
  blow; labelled reading, reopenable.
- The Deities roll prints the three words and no mechanic; the book
  offers none.

## Not in scope

- Multiple combat and the Oracle's count (10e).
- Techniques inside a round beyond the winner's option (I-23 stands).

## BDD

```gherkin
Feature: Every way a fight ends is a moment

  Scenario: a kill has a slip before the loot
    Given the Dexterous Ghost at 8 ENDURANCE and dice 6,5,1,1
    When I roll the round and strike for 10
    Then a slip headed DEXTEROUS GHOST FALLS shows on the combat screen
    And under it TAKE ITS LOOT and GO ON are offered

  Scenario: fleeing is narrated on the beat
    Given the Ghost stands and my ENDURANCE is 11
    When I press FLEE
    Then the beat's result slip is headed FLED THE DEXTEROUS GHOST
    And it reads the last blow of 2 and DISHONOR 1
    And ENDURANCE reads 9
    And the Ghost is no longer offered to face

  Scenario: an ambush is their round first
    Given the Cave entrance on dice 1,2 (Ambush!, Ogre)
    When I face the Ogre
    Then the banner reads AMBUSH, THEIR ROUND
    And the first roll compares their 2d6 plus SKILL 6 against my 2d6 plus SKILL with no Proficiency
    And if theirs is higher I lose the difference and no option is offered
    And the next round is a normal round

  Scenario: the fight resumes on a 6
    Given a tie with the Ghost and an Unexpected Event of 3,3
    Then the slip reads "The fight resumes"
    And RESUME THE FIGHT is offered
    When I press it
    Then the round loop continues with the Ghost at the same ENDURANCE

  Scenario: an environmental change leaves the foe in the room
    Given a tie and an Unexpected Event of 2,3
    When I leave the combat phase
    Then FACE THE DEXTEROUS GHOST is offered again on the beat
    And the exits are enabled

  Scenario: reinforcements join
    Given a tie and an Unexpected Event of 3,4 and a minion die of 3
    Then the slip reads "Reinforcements" and two Devil servants are offered to face

  Scenario: the Master falls with a sentence
    Given my ENDURANCE is 1 and dice 1,1,6,6
    When I roll the round
    Then a slip headed THE MASTER FALLS shows with the book's sentence
    And BEGIN AGAIN is the only row
```

## Verify gate

`npm run verify`; each scenario above is a `reduce.test.ts` case on
fixed dice and the first three are `e2e/prototype.spec.ts` cases.
