# Phase 10g — The five treasures work

> Agent-facing brief, from the verdict of 2026-09-06. The adventure is
> named for five treasures, each with a printed way of working, and
> the app lets the player use one of them (the gourd's night, shipped
> 2edf072). The other four are inert loot. In the story they are
> named for, the treasures are how the demons are beaten.

## Outcome

Each treasure held is a move on the beat or in a fight, doing what
its printed text says, gated the way the adventure gates it.

**Done when:** the vase traps a named foe who answers; the cord ties
a foe once the spells are known; the fan's fire is a combat option
that hurts and cannot be put out; the sword blocks a stronger foe's
hit without a roll; the gourd's night stays as is; each is a labelled
reading cited to 5T a2 and the reading that fixes its mechanic; a
scripted Master beats Silver Horn with the vase on fixed dice.

**Waits on:** 10d (the fight loop the fan and sword hook into).
**Cost:** two weeks.

## What the book gives

5T a2, "The 5 Treasures. Read this if you want to know the treasure's
way of working":

- Gold and red gourd: "if opened it will swallow the sky, changing day
  to night. Close it to have the daylight back." (Shipped: flag
  `night`, I-45.)
- Dazzling Golden Cord: "with a spell it moves to tie a person. Another
  spell unties. It can't be cut with normal weapons." Women quarter
  hint: "The old lady is the demons' adoptive mother. She knows the
  spells to control the Dazzling Golden Cord." (The spells are
  `cave.effects`, I-41; shipped as knowledge, not as a move.)
- Vase of muttonfat jade: "remove the label and call out a person's
  name, if they respond they'll be trapped inside."
- Plantain Fan: "it creates magic-fire's waves inextinguishable using
  conventional methods."
- Seven-star sword: "magical and indestructible weapon. It can block
  hits from stronger enemies without any effort from the holder."

Chieftain quarter hint: "By interpreting what is written on the
sheets, you come to how two of the treasures work." (I-38b, shipped.)
MH p.66: spirits immune to traditional weapons need "a technique,
ritual, or exceptional weapon" (R77, I-29: the sword is one).

## Scope

Each treasure's mechanic is a reading, because the book prints the
effect and not the procedure. Cited 5T a2 and a new I-4x each, written
into `docs/rules/readings/the-5-treasures.md` in the same commit:

- **Vase.** On the beat with a named foe pending, CALL OUT ITS NAME
  (needs the vase and its effect known). The foe answers on a LUCK
  check (the answering is not the Master's skill); success traps it:
  removed from every table as if defeated, no loot, deed "trapped
  {name} in the vase". Failure: the foe attacks, an Ambush round. One
  use per named foe.
- **Cord.** In a fight, as the winner's option, TIE IT WITH THE CORD
  (needs the cord and the spells known): the foe is bound, an Opening
  exists, and it stays bound through a missed Final Blow. Untying is
  automatic when the fight ends.
- **Fan.** In a fight, as the winner's option, WAVE THE FAN: 1d6 fire
  damage now and 1 each round after until the fight ends; the fire
  cannot be put out. Against the Senior King, whose own skill is Magic
  flames (4), the fan does nothing: the reading says his flames are
  the fan's.
- **Sword.** Passive while held: when the foe's Attack Strength beats
  the Master's, the difference is not taken once per fight; the slip
  reads THE SWORD TAKES IT. It also passes R77's gate against spirits.
- The About screen's treasure text stays gated until earned (I-60).

## Decisions made upfront

- The vase's check is LUCK, not SKILL, so it costs a LUCK point each
  call (R21). This makes it precious.
- The fan's damage is 1d6 then 1: the smallest mechanic that matches
  "inextinguishable".
- The sword blocks once per fight, not always: "without any effort"
  is read as no roll, not as invulnerability.
- The Junior King's shapeshifting and the Senior King's Call to arms
  are not modelled here; they are 10e's reinforcements and nothing
  else.

## Not in scope

- Using treasures in the sandbox after the cave (Phase 12 carries the
  record's treasures and may call this phase's moves).

## BDD

```gherkin
Feature: The treasures are tools

  Scenario: the vase swallows Silver Horn
    Given the vase held and its effect known, and the Junior King pending in the Dining hall
    When I press CALL OUT ITS NAME on LUCK dice 2,3 against LUCK 9
    Then the slip reads JUNIOR KING SILVER HORN, TRAPPED and LUCK reads 8
    And the King is in the defeated list and appears in no table again
    And no loot is read

  Scenario: the vase and a foe that does not answer
    Given the same on LUCK dice 5,6
    Then the slip reads HE DOES NOT ANSWER and an Ambush round follows

  Scenario: the cord ties
    Given the cord held, the spells known, and a won round by 3
    When I choose TIE IT WITH THE CORD
    Then the foe is marked BOUND and DELIVER THE FINAL BLOW is offered
    And a missed blow leaves it bound

  Scenario: the fan burns
    Given the fan held and a won round
    When I choose WAVE THE FAN on a die of 4
    Then the foe loses 4 now
    And loses 1 at the start of each later round
    And against the Senior King the row reads HIS FLAMES ARE THE FAN'S and is disabled

  Scenario: the sword blocks once
    Given the sword held and a lost round by 6
    Then ENDURANCE does not drop and the slip reads THE SWORD TAKES IT
    When I lose the next round by 2
    Then ENDURANCE drops by 2

  Scenario: the sword against a spirit
    Given the Dexterous Ghost and the sword held
    Then STRIKE is enabled after a won round without a Technique
```

## Verify gate

`npm run verify`; each scenario a `reduce.test.ts` case; the readings
resolve in `fidelity.test.ts`'s readings check.
