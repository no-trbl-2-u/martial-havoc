/**
 * The last inn (MH p.31, R40-R41; spec.md's sealed night's rest;
 * spec.md, Horizon for the price).
 *
 * The healing table gives SKILL "a full night's rest" as its full
 * restore and ENDURANCE "a meal" as a partial +4; `spec.md` seals that
 * a night's rest is also worth ENDURANCE's +4, so a night at an inn is
 * the one place both attributes move. `../healing/healing.ts` already
 * holds that arithmetic — {@link nightsRest} — and this module does
 * not repeat it. What it adds is the transaction around it.
 *
 * Two calls this module makes, both invention (`spec.md`, Horizon),
 * both documented in the phase 7 brief:
 *
 * 1. **The inn charges before it heals.** The book prices no inn — the
 *    City Services list (R64) has no bed on it — so the price is a
 *    field on the village record, not a number in this file, and an
 *    unaffordable stay changes nothing at all rather than half-healing.
 * 2. **The meal and the night are the same +4, applied once.** The
 *    table lists "a meal" and a night's rest as two routes to
 *    ENDURANCE's partial recovery, not two stacking bonuses. Stacking
 *    them would hand the Master +8 a night, which no reading supports.
 *    `heal` caps at `initial`, so a Master already at full ENDURANCE
 *    gains nothing and `restored` reads 0 — a true statement, not a
 *    silent no-op.
 *
 * LUCK is untouched. Its only recovery is the Temple check (R42), and
 * sleeping through one is not it.
 */
import { nightsRest } from '../healing/healing'
import type { Heal } from '../healing/healing'
import { spend } from './money'
import type { Purse } from './money'

/**
 * An attribute as the sheet holds it: where it is, where it started.
 *
 * Named for the rest rather than bare `Attribute`, because the engine
 * already exports an `Attribute` from creation and the two are
 * different things: that one is the rolled stat, this one is the pair
 * a recovery needs (a current, and the ceiling to restore toward).
 */
export type RestingAttribute = {
  readonly current: number
  /** R05's initial value — the ceiling every recovery restores toward. */
  readonly initial: number
}

/** What a night at the inn is asked for. */
export type StayInput = {
  readonly skill: RestingAttribute
  readonly endurance: RestingAttribute
  /** The Master's purse, in silver. */
  readonly purse: Purse
  /** The inn's bed-and-meal price in silver, from the village record. */
  readonly roomPriceSp: number
}

/** What a night at the inn produced. */
export type Stay = {
  /** False when the purse could not cover the room; nothing else moved. */
  readonly stayed: boolean
  readonly cost: Purse
  readonly purseBefore: Purse
  /** Unchanged from `purseBefore` when `stayed` is false. */
  readonly purseAfter: Purse
  /** SKILL's full restore (R40). Absent on an unaffordable stay. */
  readonly skill?: Heal
  /** ENDURANCE's +4, the meal and the night as one (spec.md). */
  readonly endurance?: Heal
}

/**
 * Pay for a bed, eat, and sleep the night.
 *
 * Pure: returns the heals and the debited purse, applies nothing. A
 * refused stay is reported, never thrown — the caller decides whether
 * a Master who cannot afford a room sleeps on the trail instead.
 */
export const stayTheNight = (input: StayInput): Stay => {
  const paid = spend(input.purse, input.roomPriceSp)
  if (!paid.paid) {
    return {
      stayed: false,
      cost: paid.cost,
      purseBefore: paid.before,
      purseAfter: paid.after,
    }
  }
  const rested = nightsRest({ skill: input.skill, endurance: input.endurance })
  return {
    stayed: true,
    cost: paid.cost,
    purseBefore: paid.before,
    purseAfter: paid.after,
    skill: rested.skill,
    endurance: rested.endurance,
  }
}
