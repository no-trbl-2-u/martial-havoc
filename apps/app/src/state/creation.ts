/**
 * Making a Master, in the book's order (MH p.5-21, R02-R19).
 *
 * The engine exports one function per rule and one `createMaster` that
 * runs them all at once. The screen uses the **per-rule** functions,
 * not `createMaster`, and that is deliberate: creation on a phone is a
 * sequence of moments — you roll your standing, you see it, you roll
 * your numbers, you see those — and `createMaster` consumes every die
 * in one call, which cannot be shown a step at a time. The composite
 * stays the right tool for a test or a preset; this is the right tool
 * for a player.
 *
 * Everything here is pure. The dice arrive as an argument, the state
 * goes in and a new state comes out, and nothing is validated away:
 * `spec.md` is explicit that creation **reports and never refuses**, so
 * an overspent pool is a flag on the way past, not a blocked button.
 */
import {
  chooseSocialStatus,
  fixedAttribute,
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
import type { DiceSource } from '@martial-havoc/engine'
import {
  canonicalIdForSheetName,
  martialArtById,
  martialArts,
  presetById,
  presetNameResolution,
  rituals,
  socialStatuses,
  techniqueById,
  techniqueByName,
  techniques,
} from '@martial-havoc/content'
import type { MartialArt } from '@martial-havoc/content'
import type { CreationState, RolledAttribute, Sheet } from './types'

/** The name a Master gets if the player never types one. */
export const DEFAULT_NAME = 'A wandering master'

/** Training points the screen offers. R15 sets no ceiling; this one is ours. */
export const MAX_TRAINING = 3

/** A creation that has been started and nothing more. */
export const emptyCreation = (): CreationState => ({
  step: 'who',
  name: '',
  presetId: null,
  status: null,
  skill: null,
  endurance: null,
  luck: null,
  martialArtId: null,
  training: 0,
  proficiencies: {},
  techniqueIds: [],
  kitItemId: null,
})

/** The martial art chosen or rolled so far, if any. */
export const artOf = (c: CreationState): MartialArt | undefined =>
  c.martialArtId === null ? undefined : martialArtById(c.martialArtId)

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
 * rather than `current` is how that position reaches the screen.
 */
export const pool = (c: CreationState): number =>
  c.skill === null ? 0 : proficiencyPool(c.skill.initial)

/** How much of the Proficiency pool has been put on the sheet. */
export const spentProficiency = (c: CreationState): number =>
  Object.values(c.proficiencies).reduce((sum, n) => sum + n, 0)

/** R16 — resource points, four per Training point. */
export const resourcePool = (c: CreationState): number => buildTraining(c.training).resourcePool

/** What the chosen Techniques cost against that pool. */
export const spentResources = (c: CreationState): number =>
  c.techniqueIds.reduce((sum, id) => sum + (techniqueById(id)?.cost ?? 0), 0)

/** SKILL after R15's deduction — what the sheet will carry. */
export const skillAfterTraining = (c: CreationState): number =>
  c.skill === null ? 0 : c.skill.current - c.training

/**
 * Every way this Master is outside the printed limits, as sentences.
 *
 * Reported, never enforced. `spec.md`: the engine "reports the numbers
 * and never refuses" — Yin's own printed sheet overspends, so a build
 * that blocked an overspend could not load the author's own eight.
 */
export const flagsOf = (c: CreationState): readonly string[] => {
  const art = artOf(c)
  const flags: string[] = []
  const overProficiency = spentProficiency(c) - pool(c)
  if (overProficiency > 0) flags.push(`Proficiencies overspent by ${overProficiency} (R10).`)
  const overResources = spentResources(c) - resourcePool(c)
  if (overResources > 0) flags.push(`Techniques overspent by ${overResources} points (R16).`)
  if (c.training > 0 && skillAfterTraining(c) < 1) {
    flags.push(`Training has taken SKILL to ${skillAfterTraining(c)} (R15).`)
  }
  if (art !== undefined) {
    const known = new Set(art.proficiencies.map((p) => p.toLowerCase()))
    const strays = Object.keys(c.proficiencies).filter(
      (name) => c.proficiencies[name] !== 0 && !known.has(name.toLowerCase()),
    )
    if (strays.length > 0) flags.push(`Not proficiencies of this style: ${strays.join(', ')} (R11).`)
  }
  return flags
}

/** A printed Technique name to its `technique.*` id, if the tables know it. */
const techniqueIdFor = (onSheet: string): string | undefined =>
  canonicalIdForSheetName(onSheet) ?? techniqueByName(onSheet)?.id

/**
 * One of the eight printed sheets (MH p.91-92, R83), gold rolled.
 *
 * The sheets print a status but no gold, so R03's dice are thrown for
 * it here. Everything else is read as printed and never corrected —
 * including Yin's overspend, which is the proof that creation reports
 * rather than refuses.
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
  return {
    ...c,
    presetId,
    name: preset.name,
    status: { id: status?.id ?? '', name: preset.status, gold },
    skill: { current: preset.skill, initial: preset.skill },
    endurance: { current: preset.endurance, initial: preset.endurance },
    luck: { current: preset.luck, initial: preset.luck },
    martialArtId: art?.id ?? null,
    training: 0,
    proficiencies: Object.fromEntries(preset.proficiencies.map((p) => [p.name, p.value])),
    techniqueIds: preset.techniques
      .map(techniqueIdFor)
      .filter((id): id is string => id !== undefined),
    kitItemId: null,
    step: 'ready',
  }
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
  const art = artOf(c)
  const report =
    art === undefined
      ? null
      : spendProficiencies(art, presetNameResolution)(pool(c))(c.proficiencies)
  const learned = spendResources(techniques, rituals, presetNameResolution)(resourcePool(c))({
    techniques: c.techniqueIds.flatMap((id) => {
      const name = techniqueById(id)?.name
      return name === undefined ? [] : [name]
    }),
  })
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
    skill: skill - c.training,
    skillInitial: c.skill?.initial ?? skill,
    endurance,
    enduranceInitial: c.endurance?.initial ?? endurance,
    luck: c.luck?.current ?? 7,
    gold: c.status?.gold ?? 0,
    dishonor: 0,
    proficiencies:
      printed || report === null
        ? Object.entries(c.proficiencies).map(([name, value]) => ({ name, value }))
        : report.assigned,
    techniques: learned.learned.techniques.map((t) => t.id),
  }
}
