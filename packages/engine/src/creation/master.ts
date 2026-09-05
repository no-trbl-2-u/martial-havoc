/**
 * The Master, and the procedure that builds one (MH p.5-11).
 *
 * R01 fixes the schema: "name and age; Martial Art; SKILL, ENDURANCE and
 * LUCK points; Martial Proficiencies; Techniques and Rituals (if any);
 * Equipment; Experience points."
 *
 * `createMaster` runs the whole procedure in the order the book's text
 * runs, which is also the order it draws dice:
 *
 *   1. social status and starting gold (R03)  - 1 d6, then the band's dice
 *   2. SKILL, ENDURANCE, LUCK (R04, R05)      - 4 dice
 *   3. Martial Art (R09)                      - 2 dice, only if rolled
 *   4. Training (R15, R16, R17)               - no dice
 *   5. Proficiencies (R10, R11)               - no dice
 *   6. Techniques and Rituals (R16)           - no dice
 *
 * Nothing in it refuses. Every pool is reported and the Master is built
 * with exactly what was asked for (spec.md, Refusals: "Creation's pools
 * are advisory").
 */
import type { MartialArt, SocialStatus } from '@martial-havoc/content'
import type { DiceSource } from '../dice/types'
import type { Attributes } from './attributes'
import { rollAttributes } from './attributes'
import type { Item, KitChoice, KitReport } from './kit'
import { startingKit } from './kit'
import type { Learned, ResourceReport } from './learning'
import { resourcesClean, spendResources } from './learning'
import { chooseMartialArt, rollMartialArt } from './martial-art'
import type { NamedValue, ProficiencyReport, ProficiencySpend } from './proficiencies'
import { proficienciesClean, spendProficiencies } from './proficiencies'
import { rollSocialStatus } from './social-status'
import type { CreationTables } from './tables'
import type { Training } from './training'
import { finalSkill, proficiencyPool, training as buildTraining } from './training'

/** A playable Master (R01). */
export type Master = {
  readonly name: string
  readonly age: number
  readonly martialArt: MartialArt
  /** Current and initial values for all three (R04, R05). */
  readonly attributes: Attributes
  readonly proficiencies: readonly NamedValue[]
  readonly training: Training
  readonly techniques: Learned['techniques']
  readonly rituals: Learned['rituals']
  readonly equipment: readonly Item[]
  readonly gold: number
  readonly status: SocialStatus | null
  readonly xp: number
  /** Scored against XP at the end of an adventure (R39, R43). */
  readonly dishonor: number
}

/** One thing worth surfacing about a creation. Never a refusal. */
export type Flag = {
  readonly id: string
  readonly message: string
}

/** Everything a creation reports back: the pool reports and what they raised. */
export type CreationFlags = {
  readonly proficiencies: ProficiencyReport
  readonly resources: ResourceReport
  readonly kit: Pick<KitReport, 'itemOverCap' | 'itemUnpriced'>
  /** Empty when the creation is clean. */
  readonly raised: readonly Flag[]
}

/** A built Master and what building it reported. */
export type Creation = {
  readonly master: Master
  readonly flags: CreationFlags
}

/** What the player picks; everything else comes from dice and tables. */
export type CreationChoices = {
  readonly name: string
  readonly age: number
  /** Roll the banded table (R09), or take a style by id. */
  readonly martialArt: { readonly roll: true } | { readonly id: string }
  /** SKILL traded for Training, 1:1 (R15). Defaults to none. */
  readonly training?: number
  /** Points per Proficiency name (R10, R11). */
  readonly proficiencies?: ProficiencySpend
  readonly techniques?: readonly string[]
  readonly rituals?: readonly string[]
  readonly kit: KitChoice
}

/** Turn the pool reports into the list a UI would show. */
export const raisedFlags = (
  proficiencies: ProficiencyReport,
  resources: ResourceReport,
  kit: Pick<KitReport, 'itemOverCap' | 'itemUnpriced'>,
): readonly Flag[] => [
  ...(proficiencies.overBy > 0
    ? [
        {
          id: 'creation.proficiencies.over',
          message: `${String(proficiencies.spent)} Proficiency points spent against a pool of ${String(proficiencies.pool)} (over by ${String(proficiencies.overBy)})`,
        },
      ]
    : []),
  ...proficiencies.capBreaches.map((breach) => ({
    id: 'creation.proficiencies.cap',
    message: `${breach.name} is ${String(breach.value)}; creation caps a Proficiency at 4 (R11)`,
  })),
  ...proficiencies.unknown.map((name) => ({
    id: 'creation.proficiencies.unknown',
    message: `${name} is not a Proficiency of this Martial Art`,
  })),
  ...(resources.overBy > 0
    ? [
        {
          id: 'creation.resources.over',
          message: `${String(resources.spent)} Resource points spent against a pool of ${String(resources.pool)} (over by ${String(resources.overBy)})`,
        },
      ]
    : []),
  ...resources.unknown.map((name) => ({
    id: 'creation.resources.unknown',
    message: `${name} is not in the Techniques or Rituals tables`,
  })),
  ...(kit.itemOverCap
    ? [
        {
          id: 'creation.kit.over-cap',
          message: 'the starting item costs 20 GP or more; R02 caps it below 20',
        },
      ]
    : []),
  ...(kit.itemUnpriced
    ? [
        {
          id: 'creation.kit.unpriced',
          message: 'the starting item is not on the Market, so R02 cannot price it',
        },
      ]
    : []),
]

/** True when a creation raised nothing. */
export const creationClean = (flags: CreationFlags): boolean =>
  flags.raised.length === 0 &&
  proficienciesClean(flags.proficiencies) &&
  resourcesClean(flags.resources)

/**
 * Build a Master from injected tables, injected dice, and the player's
 * choices. Curried so tables bind once for a session and dice per roll.
 */
export const createMaster =
  (tables: CreationTables) =>
  (dice: DiceSource) =>
  (choices: CreationChoices): Creation => {
    // 1. Social status and starting gold (R02, R03).
    const status = rollSocialStatus(tables.socialStatuses)(dice)

    // 2. The three attributes (R04), storing what they started at (R05).
    const attributes = rollAttributes(dice)

    // 3. The Martial Art (R09). Choosing draws no dice.
    const martialArt =
      'id' in choices.martialArt
        ? chooseMartialArt(tables.martialArts)(choices.martialArt.id)
        : rollMartialArt(tables.martialArts)(dice).martialArt

    // 4. Training: SKILL down 1:1, Resource points up 4:1 (R15, R16, R17).
    const trainingPoints = choices.training ?? 0
    const training = buildTraining(trainingPoints)
    const rolledSkill = attributes.skill.current

    // 5. Proficiencies, against the ROLLED SKILL - R15 says the Training
    //    deduction does not touch this pool (R10, D06).
    const proficiencies = spendProficiencies(martialArt, tables.presetNameResolution)(
      proficiencyPool(rolledSkill),
    )(choices.proficiencies ?? {})

    // 6. Techniques and Rituals, by their printed costs (R16).
    const resources = spendResources(
      tables.techniques,
      tables.rituals,
      tables.presetNameResolution,
    )(training.resourcePool)({
      ...(choices.techniques === undefined ? {} : { techniques: choices.techniques }),
      ...(choices.rituals === undefined ? {} : { rituals: choices.rituals }),
    })

    const kit = startingKit(tables.market)(choices.kit)
    const kitFlags = { itemOverCap: kit.itemOverCap, itemUnpriced: kit.itemUnpriced }

    return {
      master: {
        name: choices.name,
        age: choices.age,
        martialArt,
        attributes: {
          // R15: the deduction is permanent, so it lands on `current`
          // while `initial` keeps what was rolled.
          skill: { ...attributes.skill, current: finalSkill(rolledSkill, trainingPoints) },
          endurance: attributes.endurance,
          luck: attributes.luck,
        },
        proficiencies: proficiencies.assigned,
        training,
        techniques: resources.learned.techniques,
        rituals: resources.learned.rituals,
        equipment: kit.equipment,
        gold: status.gold,
        status: status.status,
        xp: 0,
        dishonor: 0,
      },
      flags: {
        proficiencies,
        resources,
        kit: kitFlags,
        raised: raisedFlags(proficiencies, resources, kitFlags),
      },
    }
  }
