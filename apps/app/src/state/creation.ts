/**
 * Making a Master, in the book's order (MH p.5-19, R01-R19).
 *
 * The engine exports one function per rule and one `createMaster` that
 * runs them all at once. The screen uses the **per-rule** functions,
 * not `createMaster`, and that is deliberate: creation on a phone is a
 * sequence of moments — you roll your standing, you see it, you roll
 * your numbers, you see those — and `createMaster` consumes every die
 * in one call, which cannot be shown a step at a time. The composite
 * stays the right tool for a test; this is the right tool for a player.
 *
 * Everything here is pure. The dice arrive as an argument, the state
 * goes in and a new state comes out, and nothing is validated away:
 * `spec.md` is explicit that creation **reports and never refuses**, so
 * an overspent pool is a flag on the way past, not a blocked button.
 *
 * What a flag *is* comes from the engine's own reports
 * (`spendProficiencies`, `spendResources`): the pool, the cap of 4
 * (R11), a name the style does not carry. This module only turns those
 * reports into the sentences the screen shows.
 */
import {
  COMMON_CLOTHING,
  chooseSocialStatus,
  martialArtBySheetName,
  proficiencyPool,
  rollAttributes,
  rollMartialArt,
  rollSocialStatus,
  rollSpec,
  spendProficiencies,
  spendResources,
  training as buildTraining,
} from '@martial-havoc/engine'
import type { DiceSource, ProficiencyReport, ResourceReport } from '@martial-havoc/engine'
import {
  canonicalIdForSheetName,
  marketItemById,
  martialArtById,
  martialArts,
  presetById,
  presetNameResolution,
  ritualById,
  ritualByName,
  rituals,
  socialStatuses,
  techniqueById,
  techniqueByName,
  t,
  techniques,
} from '@martial-havoc/content'
import type { MartialArt } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import type { CreationState, RolledAttribute, Sheet } from './types'

/** The name a Master gets if the player never types one. */
export const DEFAULT_NAME = 'A wandering master'

/** A creation that has been started and nothing more. */
export const emptyCreation = (): CreationState => ({
  step: 'who',
  name: '',
  age: '',
  presetId: null,
  status: null,
  skill: null,
  endurance: null,
  luck: null,
  martialArtId: null,
  training: 0,
  proficiencies: {},
  techniqueIds: [],
  ritualIds: [],
  weapon: '',
  kitItemId: null,
})

/** The martial art chosen or rolled so far, if any. */
export const artOf = (c: CreationState): MartialArt | undefined =>
  c.martialArtId === null ? undefined : martialArtById(c.martialArtId)

/** R01: the typed age as a number, or null when it is blank or not one. */
export const ageOf = (c: CreationState): number | null => {
  const n = Number.parseInt(c.age.trim(), 10)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * R02, R03 — the social band and its gold, in one roll.
 *
 * One d6 picks the band; the band's own dice spec gives the gold. Both
 * come off the same source in that order, which is the order the book
 * prints them.
 */
export const rollStanding = (c: CreationState, dice: DiceSource): CreationState => {
  const rolled = rollSocialStatus(socialStatuses)(dice)
  return {
    ...c,
    status: { id: rolled.status.id, name: rolled.status.status, gold: rolled.gold },
  }
}

/** R04, R05 — SKILL 1d6+6, ENDURANCE 2d6+12, LUCK 1d6+6, in that order. */
export const rollNumbers = (c: CreationState, dice: DiceSource): CreationState => {
  const a = rollAttributes(dice)
  const keep = (x: { current: number; initial: number }): RolledAttribute => ({
    current: x.current,
    initial: x.initial,
  })
  return { ...c, skill: keep(a.skill), endurance: keep(a.endurance), luck: keep(a.luck) }
}

/**
 * R09 — the Martial Art, rolled on the d66 table.
 *
 * Choosing one instead draws no dice, which is why choosing is a plain
 * state change (`creation.art`) and only rolling comes through here.
 */
export const rollArt = (c: CreationState, dice: DiceSource): CreationState => ({
  ...c,
  martialArtId: rollMartialArt(martialArts)(dice).martialArt.id,
})

/**
 * R10, D06 — the Proficiency pool is the **rolled** SKILL.
 *
 * R15's Training deduction is permanent and lands on the sheet, but it
 * does not shrink this pool; discrepancy D06 is exactly that question,
 * and the engine already takes the position. Reading it off `initial`
 * rather than `current` is how that position reaches the screen. A
 * printed sheet's `initial` is its implied rolled SKILL (`takePreset`).
 */
export const pool = (c: CreationState): number =>
  c.skill === null ? 0 : proficiencyPool(c.skill.initial)

/** How much of the Proficiency pool has been put on the sheet. */
export const spentProficiency = (c: CreationState): number =>
  Object.values(c.proficiencies).reduce((sum, n) => sum + n, 0)

/** R16 — resource points, four per Training point. */
export const resourcePool = (c: CreationState): number => buildTraining(c.training).resourcePool

/** What the chosen Techniques and Rituals cost against that pool (R16). */
export const spentResources = (c: CreationState): number =>
  c.techniqueIds.reduce((sum, id) => sum + (techniqueById(id)?.cost ?? 0), 0) +
  c.ritualIds.reduce((sum, id) => sum + (ritualById(id)?.cost ?? 0), 0)

/** SKILL after R15's deduction — what the sheet will carry. */
export const skillAfterTraining = (c: CreationState): number =>
  c.skill === null ? 0 : c.skill.current - c.training

/** The names the tables give the learned ids, for the engine's spend. */
const learnedNames = (c: CreationState) => ({
  techniques: c.techniqueIds.flatMap((id) => {
    const name = techniqueById(id)?.name
    return name === undefined ? [] : [name]
  }),
  rituals: c.ritualIds.flatMap((id) => {
    const name = ritualById(id)?.name
    return name === undefined ? [] : [name]
  }),
})

/**
 * The engine's own report on the Proficiency spend (R10, R11), or null
 * before a Martial Art exists to spend against. Names go through the
 * sheet-name resolution map, so San Te's printed "Non lethal combat" is
 * Shaolin Quan's "Non-lethal combat" and not a stranger.
 */
export const proficiencyReport = (c: CreationState): ProficiencyReport | null => {
  const art = artOf(c)
  return art === undefined
    ? null
    : spendProficiencies(art, presetNameResolution)(pool(c))(c.proficiencies)
}

/** The engine's own report on the Resource spend (R16). */
export const resourceReport = (c: CreationState): ResourceReport =>
  spendResources(techniques, rituals, presetNameResolution)(resourcePool(c))(learnedNames(c))

/**
 * Every way this Master is outside the printed limits, as sentences.
 *
 * Reported, never enforced. `spec.md`: the engine "reports the numbers
 * and never refuses" — Yin's own printed sheet overspends, so a build
 * that blocked an overspend could not load the author's own eight.
 *
 * Four flags, each a rule: the Proficiency pool (R10), the cap of 4
 * (R11), a Proficiency the style does not carry (R10; R12 lets a Master
 * act without one, so this is a note, not a fault), and the Resource
 * pool (R16). The flag lines are content (agents.md rule 7): read by
 * id, filled here.
 */
export const flagsOf = (c: CreationState): readonly string[] => {
  const flags: string[] = []
  const p = proficiencyReport(c)
  if (p !== null && p.overBy > 0) {
    flags.push(fill(t('ui.creation.flag.proficiencies-overspent'), { n: p.overBy, spent: p.spent, pool: p.pool }))
  }
  if (p !== null) {
    for (const breach of p.capBreaches) {
      flags.push(fill(t('ui.creation.flag.proficiency-over-cap'), { name: breach.name, value: breach.value }))
    }
    if (p.unknown.length > 0) {
      flags.push(fill(t('ui.creation.flag.stray-proficiencies'), { names: p.unknown.join(', ') }))
    }
  }
  const r = resourceReport(c)
  if (r.overBy > 0) {
    flags.push(fill(t('ui.creation.flag.techniques-overspent'), { n: r.overBy, spent: r.spent, pool: r.pool }))
  }
  return flags
}

/** A printed Technique name to its `technique.*` id, if the tables know it. */
const techniqueIdFor = (onSheet: string): string | undefined =>
  canonicalIdForSheetName(onSheet) ?? techniqueByName(onSheet)?.id

/** A printed Ritual name to its `ritual.*` id, likewise. */
const ritualIdFor = (onSheet: string): string | undefined =>
  canonicalIdForSheetName(onSheet) ?? ritualByName(onSheet)?.id

/**
 * One of the eight printed sheets (MH p.91-92, R83), gold rolled.
 *
 * The sheets print a status but no gold, so R03's dice are thrown for
 * it here. Everything else is read as printed and never corrected —
 * including Yin's overspend, which is the proof that creation reports
 * rather than refuses.
 *
 * Two derivations, both the estate's (docs/world/pregenerated-masters.md):
 *
 * - The sheets print the **final** SKILL. R15 means the Proficiency
 *   pool was the rolled one, which is that plus the Training bought, so
 *   `skill.initial` is set to the implied rolled SKILL. That is what
 *   makes Yin load flagged "10 of 9" as spec.md asks, and what stops
 *   Golden Swallow and Sun Wukong being flagged for spends that fit.
 * - Printed names ("Pluck the phoenix's Eye", "Guardians of the gate")
 *   reach the tables through the name-resolution map.
 */
export const takePreset = (
  c: CreationState,
  presetId: string,
  dice: DiceSource,
): CreationState => {
  const preset = presetById(presetId)
  if (preset === undefined) return c
  const status = chooseSocialStatus(socialStatuses)(preset.status)
  const gold = status === undefined ? 0 : rollSpec(status.goldDice)(dice).sum
  const art = martialArtBySheetName(martialArts, presetNameResolution)(preset.martialArt)
  const impliedRolledSkill = preset.skill + preset.training
  return {
    ...c,
    presetId,
    name: preset.name,
    age: String(preset.age),
    status: { id: status?.id ?? '', name: preset.status, gold },
    // `current` carries the printed SKILL plus Training so that
    // `skillAfterTraining` lands back on the printed number.
    skill: { current: impliedRolledSkill, initial: impliedRolledSkill },
    endurance: { current: preset.endurance, initial: preset.endurance },
    luck: { current: preset.luck, initial: preset.luck },
    martialArtId: art?.id ?? null,
    training: preset.training,
    proficiencies: Object.fromEntries(preset.proficiencies.map((p) => [p.name, p.value])),
    techniqueIds: preset.techniques.map(techniqueIdFor).filter((id): id is string => id !== undefined),
    ritualIds: preset.rituals.map(ritualIdFor).filter((id): id is string => id !== undefined),
    // The sheets print their equipment whole; `finishCreation` copies
    // the printed lines rather than these two fields.
    weapon: '',
    kitItemId: null,
    step: 'ready',
  }
}

/**
 * R02 — the equipment lines a made Master carries.
 *
 * "Common clothing; a weapon (even if not listed); a Health Elixir or an
 * item from the Market costing less than 20 GP." A printed sheet's lines
 * are copied as printed (R83); a made Master's are the rule's three,
 * with the weapon and the item as chosen, and a blank left out.
 */
export const equipmentOf = (c: CreationState): readonly string[] => {
  const preset = c.presetId === null ? undefined : presetById(c.presetId)
  if (preset !== undefined) return [COMMON_CLOTHING.name, ...preset.equipment]
  const weapon = c.weapon.trim()
  const item = c.kitItemId === null ? undefined : marketItemById(c.kitItemId)?.item
  return [COMMON_CLOTHING.name, ...(weapon === '' ? [] : [weapon]), ...(item === undefined ? [] : [item])]
}

/**
 * The made Master as a sheet the rest of the app can play.
 *
 * Total: a creation with nothing rolled still produces a sheet, at the
 * book's own floors. That is the "never refuses" rule taken seriously —
 * a player who taps BEGIN on an empty creation gets a playable Master,
 * not an error screen.
 */
export const finishCreation = (c: CreationState): Sheet => {
  const report = proficiencyReport(c)
  const learned = resourceReport(c).learned
  const skill = c.skill?.current ?? 7
  // A printed sheet is a transcription (R83, standing rule 9): its
  // Proficiencies keep the spelling the book gives them. A *made*
  // Master is a spend, and `spendProficiencies` reports that under the
  // table's own spelling — which is why "Non lethal combat" stays as
  // printed on San Te's sheet but resolves to "Non-lethal combat" when
  // a player puts points on it themselves.
  const printed = c.presetId !== null
  const endurance = c.endurance?.current ?? 14
  return {
    name: c.name.trim() === '' ? DEFAULT_NAME : c.name.trim(),
    age: ageOf(c),
    martialArtId: c.martialArtId,
    skill: skill - c.training,
    skillInitial: c.skill?.initial ?? skill,
    endurance,
    enduranceInitial: c.endurance?.initial ?? endurance,
    luck: c.luck?.current ?? 7,
    luckInitial: c.luck?.initial ?? c.luck?.current ?? 7,
    gold: c.status?.gold ?? 0,
    dishonor: 0,
    proficiencies:
      printed || report === null
        ? Object.entries(c.proficiencies).map(([name, value]) => ({ name, value }))
        : report.assigned,
    training: c.training,
    techniques: learned.techniques.map((l) => l.id),
    rituals: learned.rituals.map((l) => l.id),
    equipment: equipmentOf(c),
    xp: 0,
  }
}
