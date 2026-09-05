/**
 * Spending the Proficiency pool (MH p.7, R10 and R11).
 *
 * R10: the pool is "as many points as your SKILL value" — the **rolled**
 * SKILL, before any Training deduction (R15 says the deduction is
 * "without affecting the total points to be spent"; D06 records the
 * reading). R11: no Proficiency may exceed 4 at creation.
 *
 * Nothing here refuses. spec.md's Refusals seal creation's pools as
 * advisory: an overspend, a broken cap and a Proficiency the style does
 * not carry are all reported on the result, and the Master is built with
 * exactly what was asked for. I-04 makes 0 and unspent points legal, so
 * neither is reported as a problem.
 */
import type { MartialArt, NameResolution } from '@martial-havoc/content'
import { canonicalName, findByName } from './tables'

/** What was asked for: a value per Proficiency name. */
export type ProficiencySpend = Readonly<Record<string, number>>

/** A Proficiency name with the value it was given. */
export type NamedValue = {
  readonly name: string
  readonly value: number
}

/** The pool report R10/R11 produce. Data, never a refusal. */
export type ProficiencyReport = {
  /** The rolled SKILL (R10). */
  readonly pool: number
  readonly spent: number
  /** Legal and common: I-04 allows points to be left unspent. */
  readonly unspent: number
  /** How far over the pool the spend went; 0 when it fits. */
  readonly overBy: number
  /** Every Proficiency taken above the cap of 4 (R11). */
  readonly capBreaches: readonly NamedValue[]
  /** Names the chosen style does not carry (R12 allows acting without one). */
  readonly unknown: readonly string[]
  /** The spend as assigned, in the style's printed order then the rest. */
  readonly assigned: readonly NamedValue[]
}

/** The cap a Proficiency may not exceed at creation (R11). */
export const CREATION_CAP = 4

/**
 * Spend a pool across a style's Proficiencies.
 *
 * Names are matched case-insensitively and through the sheet-name
 * resolution map, so "Non lethal combat" finds Shaolin Quan's
 * "Non-lethal combat" and is reported under the table's spelling.
 */
export const spendProficiencies =
  (martialArt: MartialArt, resolution: readonly NameResolution[] = []) =>
  (pool: number) =>
  (spend: ProficiencySpend): ProficiencyReport => {
    const resolve = canonicalName(resolution)
    const styleNames = martialArt.proficiencies
    const assigned = Object.entries(spend).map(([name, value]) => {
      const resolved = resolve(name)
      const match = styleNames.find((p) => p.toLowerCase() === resolved.toLowerCase())
      return { name: match ?? resolved, value, known: match !== undefined }
    })

    const spent = assigned.reduce((sum, p) => sum + p.value, 0)
    return {
      pool,
      spent,
      unspent: Math.max(0, pool - spent),
      overBy: Math.max(0, spent - pool),
      capBreaches: assigned
        .filter((p) => p.value > CREATION_CAP)
        .map(({ name, value }) => ({ name, value })),
      unknown: assigned.filter((p) => !p.known).map((p) => p.name),
      // Printed order first, so a sheet reads the way the book prints it.
      assigned: [
        ...styleNames.flatMap((styleName) => {
          const found = assigned.find((p) => p.name === styleName)
          return found === undefined ? [] : [{ name: found.name, value: found.value }]
        }),
        ...assigned.filter((p) => !p.known).map(({ name, value }) => ({ name, value })),
      ],
    }
  }

/** True when the spend raised nothing worth telling the player about. */
export const proficienciesClean = (report: ProficiencyReport): boolean =>
  report.overBy === 0 && report.capBreaches.length === 0 && report.unknown.length === 0

/** Look a Proficiency up on a style, through the resolution map. */
export const styleHasProficiency =
  (martialArt: MartialArt, resolution: readonly NameResolution[] = []) =>
  (name: string): boolean => {
    const resolved = canonicalName(resolution)(name).toLowerCase()
    return martialArt.proficiencies.some((p) => p.toLowerCase() === resolved)
  }
