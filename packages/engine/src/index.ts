/**
 * @martial-havoc/engine — public surface.
 *
 * Phase 1 (the garden) ships an empty engine on purpose: the point of
 * this phase is that the verify gate is green on nothing. Phase 2 added
 * the dice interface and creation; Phase 3 adds the checks and the
 * combat core. Every behaviour those phases add registers itself in
 * {@link behaviours} so the label leg can see it.
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

// Checks: the two roll-under resolutions outside combat (MH p.22).
export { check, isDoubleSix, luckCheck, skillCheck } from './checks/checks'
export type { CheckOutcome, SkillCheckInput } from './checks/checks'

// Combat: the round, the Final Blow, the Unexpected Event (MH p.23-29).
export { attackStrength, relevantProficiency } from './combat/attack-strength'
export type { AttackStrength, Combatant } from './combat/attack-strength'
export { endsFight, resolveRound, spendTechnique } from './combat/round'
export type { FightEnd, FightState, RoundOutcome, WinnerOption } from './combat/round'
export { finalBlow, namingRoll, newTechnique } from './combat/final-blow'
export type { FinalBlowInput, FinalBlowRoll, NamingRoll, NewTechnique } from './combat/final-blow'
export {
  eventReading,
  injuryDamage,
  minions,
  morale,
  unexpectedEvent,
} from './combat/unexpected-event'
export type { EventReading, Morale, UnexpectedEventRoll } from './combat/unexpected-event'

// Multiple combat: several opponents at once (MH p.30).
export { areaDamage, attackersThisRound, roundAgainstMany, skillForFight } from './multiple/multiple'
export type { ManyRound, OpponentExchange } from './multiple/multiple'

// Escape: leaving a fight, and what it costs (MH p.30).
export { ESCAPE_DAMAGE, escape } from './escape/escape'
export type { Escape, EscapeInput } from './escape/escape'

// Healing: how the three attributes come back (MH p.31).
export { NIGHTS_REST_ENDURANCE, PARTIAL, heal, nightsRest } from './healing/healing'
export type { Heal, HealAttribute, HealInput } from './healing/healing'

// Progression: XP, spoils, and the Oracle's two mechanical readings.
export { CAPS, INCREASES, SKILL_BANDS, XP_CATEGORIES, purchase, skillBand, xpAward } from './progression/xp'
export type { Increase, Purchase, SkillBand, XpAward, XpCategoryName, XpScores } from './progression/xp'
export {
  TREASURE_BANDS,
  opponentProficiencyValue,
  ordinaryBlowsPass,
  treasureBand,
} from './progression/spoils'
export type { BlowInput, TreasureBand } from './progression/spoils'
export { ambush, enemyAttack } from './progression/oracle'
export type { Ambush, EnemyAttack } from './progression/oracle'

// The region: dice thrown on a plane, linked and measured (MH p.42-44).
export { linksFrom, otherEnd, throwRegion } from './region/region'
export type { Region, RegionLink, RegionPoint } from './region/region'

import type { Behaviour } from './labels'
import { diceBehaviours } from './dice/behaviours'
import { creationBehaviours } from './creation/behaviours'
import { checkBehaviours } from './checks/behaviours'
import { combatBehaviours } from './combat/behaviours'
import { multipleBehaviours } from './multiple/behaviours'
import { escapeBehaviours } from './escape/behaviours'
import { healingBehaviours } from './healing/behaviours'
import { progressionBehaviours } from './progression/behaviours'
import { regionBehaviours } from './region/behaviours'

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
  ...checkBehaviours,
  ...combatBehaviours,
  ...multipleBehaviours,
  ...escapeBehaviours,
  ...healingBehaviours,
  ...progressionBehaviours,
  ...regionBehaviours,
])
