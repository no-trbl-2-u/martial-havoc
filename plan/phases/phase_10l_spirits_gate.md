# Phase 10l — Spirits immune to ordinary blows

> Agent-facing brief. R77 was built and reverted in Phase 10g because
> turning it on soft-locks the cave: the Dexterous Ghost holds the
> private quarter's key and no Technique in the build does damage.
> The critique row "R77 has no gate, and cannot have one until a
> Technique can hurt something" fixes the order: Technique damage
> first, the gate second, never the gate alone.

## Outcome

A spirit cannot be struck down by an ordinary blow, and a Master has
a legal, findable way to hurt one anyway.

**Done when:** STRIKE against a foe carrying I-29's `incorporeal`
tag is refused on the combat screen with MH p.66's sentence; a known
Technique whose effect record carries a damage operation, or the
seven-star sword, passes `ordinaryBlowsPass`; a scripted Master
without the sword takes the Dexterous Ghost's key on fixed dice;
every path has a fixed-dice test.

**Waits on:** 10k.
**Cost:** two weeks.

## What the book gives

- MH p.66: "Sometimes you will face spirits or ghosts, incorporeal
  beings immune to traditional weapons or blows; you will need to use
  a technique, ritual, or exceptional weapon to defeat them."
- MH p.24: a Technique is used "without making a roll check" at the
  cost of its value in ENDURANCE.
- 5T a2: the Dexterous Ghost, "A spirit servant, quick yet clumsy",
  LOOT the private quarter's key; the Skillful Beast, the same key;
  the seven-star sword, "magical and indestructible weapon".
- Techniques whose text is a blow: Iron Palm, Rock-Splitting Tiger,
  Piercing through stones, Poisonous Bird, Iron Broom, Three Stars
  Fist, Crushing Blow, Sky punching fist (MH p.12-15). The book prices
  them and does not quantify them.

## Scope

- **Technique damage.** In `effects.json`, a `damage` operation on the
  Technique records whose printed text is a blow, valued as the
  exchange's difference (the winner's option replaces the strike, so
  the strike's number is the natural amount; reading to be assigned
  in `docs/rules/readings/combat.md`, labelled `reading`). The engine's
  winner's-option Technique path applies it.
- **The gate.** `ordinaryBlowsPass` read by `doStrike` and the Final
  Blow against an `incorporeal` foe: refused with the p.66 sentence on
  the combat screen; the Technique row and the sword remain enabled.
  Label `combat.spirits-refuse-ordinary-blows`, `rule`, MH p.66 (R77).
- **The exceptional weapon.** The seven-star sword passes the gate
  (I-29's "exceptional weapon"). Yin's "Magical sword" on the printed
  sheet passes it too, as printed equipment.
- **The soft-lock check.** A scripted test: a Master with no sword and
  one damaging Technique defeats the Dexterous Ghost and takes the
  key; and a Master with neither still reaches the key through the
  Skillful Beast (a2: the key drops twice).

## Decisions made upfront — DO NOT ASK

- Damage by Technique equals the exchange's difference, not the
  Technique's value. The value is its cost (MH p.24); the difference
  is what the strike would have done.
- Only Techniques whose printed text is a blow carry damage. A
  Technique that runs on water does not hurt a ghost.
- The Old Vixen is incorporeal per I-29 and is treated the same.

## Not in scope

- Rituals in combat (Wudang only, MH p.10; a later row if wanted).
- Any change to the sword's sealed reading I-44.

## Verify gate

`npm run verify`; each scenario a fixed-dice test in
`packages/engine/src/combat/fight.test.ts` and `reduce.test.ts`; the
refusal and the Technique kill as `e2e/played.spec.ts` cases.
