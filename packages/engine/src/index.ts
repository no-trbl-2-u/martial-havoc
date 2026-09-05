/**
 * @martial-havoc/engine — public surface.
 *
 * Phase 1 (the garden) ships an empty engine on purpose: the point of
 * this phase is that the verify gate is green on nothing. Phase 2 adds
 * the dice interface and creation; Phase 3 the combat core. Every
 * behaviour those phases add registers itself in {@link behaviours}
 * so the label leg can see it.
 *
 * Rules for this package (agents.md standing rule 7): no React, no
 * I/O, no dice of its own — pure functions over immutable state.
 */

export { LABELS, isLabel, isLabelled } from './labels'
export type { Label, Behaviour } from './labels'

// The dice: injected sources and the four rolls the book asks for.
export { FACES, isDie } from './dice/types'
export type { Die, DiceSource } from './dice/types'
export { DiceExhausted, NotADie, fromSequence } from './dice/sources'
export { d6, d66, nd6, rollSpec, twoD6 } from './dice/rolls'
export type { D66Roll, DiceSpec, SumRoll, TwoD6Roll } from './dice/rolls'

// Creation: the whole of MH p.5-11 as pure functions over injected
// tables and injected dice.
export { UnknownEntry } from './errors'
export { fixedAttribute, rollAttributes } from './creation/attributes'
export type { Attribute, Attributes } from './creation/attributes'
export { chooseSocialStatus, rollSocialStatus } from './creation/social-status'
export { chooseMartialArt, martialArtBySheetName, rollMartialArt } from './creation/martial-art'
export {
  CREATION_CAP,
  proficienciesClean,
  proficiencyValue,
  spendProficiencies,
  styleHasProficiency,
} from './creation/proficiencies'
export type {
  NamedValue,
  ProficiencyReport,
  ProficiencySpend,
} from './creation/proficiencies'
export {
  RESOURCES_PER_TRAINING_POINT,
  TRAINING_PROFICIENCY,
  finalSkill,
  proficiencyPool,
  training,
} from './creation/training'
export type { Training } from './creation/training'
export { resourcesClean, spendResources } from './creation/learning'
export type { Learned, ResourceReport } from './creation/learning'
export {
  COMMON_CLOTHING,
  NAMED_STARTING_ITEM,
  freeTextItem,
  marketItem,
  startingKit,
  weaponItem,
} from './creation/kit'
export type { Item, ItemFlag, KitChoice, KitReport } from './creation/kit'
export { createMaster, creationClean, raisedFlags } from './creation/master'
export type { Creation, CreationChoices, CreationFlags, Flag, Master } from './creation/master'
export { loadAllPresets, loadPreset, loadPresetRecord } from './creation/presets'
export { canonicalName, findByName } from './creation/tables'
export type { CreationTables } from './creation/tables'

import type { Behaviour } from './labels'
import { diceBehaviours } from './dice/behaviours'
import { creationBehaviours } from './creation/behaviours'

/**
 * The registry of every behaviour the engine exports.
 *
 * `scripts/labels-check.test.ts` reads this list and fails the build
 * on any entry that is not `rule | reading | invention` with a
 * citation. It is the concatenation of each folder's own list, so a
 * folder cannot ship a behaviour without registering it next to the
 * code that implements it. Frozen so nothing mutates it at runtime.
 */
export const behaviours: readonly Behaviour[] = Object.freeze([
  ...diceBehaviours,
  ...creationBehaviours,
])
