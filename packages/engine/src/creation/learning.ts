/**
 * Spending Resource points on Techniques and Rituals (MH p.11, R16).
 *
 * Each costs the value printed in parentheses beside it, 1 to 4 — the
 * same number that will later be its ENDURANCE cost to perform (R18).
 *
 * As with the Proficiency pool, nothing here refuses: an overspend is
 * reported and the picks are learned anyway. That is spec.md's Refusals
 * line, and it is also what makes the eight pre-generated sheets
 * loadable, one of which (Yin) is over budget as printed.
 */
import type { Learnable, NameResolution } from '@martial-havoc/content'
import { canonicalName, findByName } from './tables'

/** What a Master learned, resolved to table records. */
export type Learned = {
  readonly techniques: readonly Learnable[]
  readonly rituals: readonly Learnable[]
}

/** The Resource-point report R16 produces. Data, never a refusal. */
export type ResourceReport = {
  /** 4 per Training point (R16). */
  readonly pool: number
  readonly spent: number
  readonly unspent: number
  /** How far over the pool the picks went; 0 when they fit. */
  readonly overBy: number
  /** Names neither table holds, even through the resolution map. */
  readonly unknown: readonly string[]
  readonly learned: Learned
}

/**
 * Spend a Resource pool on named Techniques and Rituals.
 *
 * Names are matched case-insensitively and through the sheet-name
 * resolution map, so a printed sheet's "Pluck the phoenix's Eye" finds
 * the table's "Tear out a phoenix's eye". A name neither knows is
 * reported in `unknown` and costs nothing — it cannot be priced.
 */
export const spendResources =
  (techniques: readonly Learnable[], rituals: readonly Learnable[], resolution: readonly NameResolution[] = []) =>
  (pool: number) =>
  (picks: {
    readonly techniques?: readonly string[]
    readonly rituals?: readonly string[]
  }): ResourceReport => {
    const resolve = canonicalName(resolution)
    const pick = (names: readonly string[], table: readonly Learnable[]) =>
      names.map((name) => ({ name, record: findByName(table, resolve(name)) }))

    const pickedTechniques = pick(picks.techniques ?? [], techniques)
    const pickedRituals = pick(picks.rituals ?? [], rituals)
    const all = [...pickedTechniques, ...pickedRituals]

    const spent = all.reduce((sum, p) => sum + (p.record?.cost ?? 0), 0)
    return {
      pool,
      spent,
      unspent: Math.max(0, pool - spent),
      overBy: Math.max(0, spent - pool),
      unknown: all.filter((p) => p.record === undefined).map((p) => p.name),
      learned: {
        techniques: pickedTechniques.flatMap((p) => (p.record === undefined ? [] : [p.record])),
        rituals: pickedRituals.flatMap((p) => (p.record === undefined ? [] : [p.record])),
      },
    }
  }

/** True when the picks raised nothing worth telling the player about. */
export const resourcesClean = (report: ResourceReport): boolean =>
  report.overBy === 0 && report.unknown.length === 0
