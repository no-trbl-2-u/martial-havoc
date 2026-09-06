/**
 * The trail-head village (spec.md, Horizon: "a trail-head village is
 * a City on fixed data").
 *
 * The rulebook describes a City with seven locations (MH p.46-51);
 * The 5 Treasures describes a mountain and a cave. Neither describes
 * a settlement between them, and a solo player who has just rolled a
 * Master needs somewhere to spend the gold R03 gave them before they
 * walk into a demon king's kitchen. The Horizon fills that gap with
 * *fixed* data — the same three locations on every run — so the
 * approach to the cave is a place the player learns rather than a
 * table they re-roll.
 *
 * This file is the barrel and the two functions that need the whole
 * village rather than one location: reading the places out of the
 * injected table, and finding the way out. The procedures themselves
 * are one file each:
 *
 * - `./money.ts`  — 1 GP = 10 SP, and spending it.
 * - `./market.ts` — buying at printed prices (MH p.52-55).
 * - `./temple.ts` — the Spirituality check for +1 LUCK (R58, I-58).
 * - `./inn.ts`    — a meal and a night's rest (R40; spec.md sealed).
 *
 * No React, no I/O, no dice of its own (agents.md rule 7). The village
 * table is injected exactly like every other content table.
 */
import type { VillagePlace, VillageProcedure } from '@martial-havoc/content'

export { SP_PER_GP, toSilver, fromSilver, priceInSilver, spend } from './money'
export type { Purse, Spend } from './money'
export { buy } from './market'
export type { Buy, BuyInput, BuyRefusal } from './market'
export { templeVisit } from './temple'
export type { TempleVisit, TempleVisitInput, TempleRefusal } from './temple'
export { stayTheNight } from './inn'
export type { RestingAttribute, Stay, StayInput } from './inn'

/**
 * The three places a Master can stand in and act.
 *
 * Filtered rather than assumed: the data file is the authority on how
 * many locations the village has, and a phase that adds a fourth
 * should not have to find a hardcoded `3` in the engine.
 */
export const locationsOf = (places: readonly VillagePlace[]): readonly VillagePlace[] =>
  places.filter((place) => place.kind === 'location')

/**
 * The way out: the trail to the Flat-top mountain.
 *
 * `undefined` rather than a throw when a table carries no trail — a
 * village with no exit is a content bug the content test catches, and
 * an engine that throws on it only makes the message worse.
 */
export const trailOf = (places: readonly VillagePlace[]): VillagePlace | undefined =>
  places.find((place) => place.kind === 'trail')

/**
 * The one place that runs a given procedure, if the village has one.
 *
 * Lets a caller ask for "the inn" by what it *does* rather than by an
 * id string, which keeps the id namespace an implementation detail of
 * the data file.
 */
export const placeRunning = (
  places: readonly VillagePlace[],
  procedure: VillageProcedure,
): VillagePlace | undefined => places.find((place) => place.procedure === procedure)
