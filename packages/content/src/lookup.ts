/**
 * Total lookups over a table's records.
 *
 * Every function here is curried on the records so a module can bind the
 * table once and export a lookup that takes only dice, and every one is
 * total: an address the table does not hold returns `undefined`, never a
 * throw. Refusing to answer is the engine's job (and even there the
 * answer is a flag, never an exception - spec.md, Refusals).
 */
import type { BandedRecord, BaseRecord } from './types'

/** Find one record by its dotted id. */
export const byId =
  <R extends BaseRecord>(records: readonly R[]) =>
  (id: string): R | undefined =>
    records.find((r) => r.id === id)

/** Find one record by a field that holds a name, case-insensitively. */
export const byName =
  <R extends BaseRecord>(records: readonly R[], field: keyof R) =>
  (name: string): R | undefined => {
    const wanted = name.trim().toLowerCase()
    return records.find((r) => String(r[field]).trim().toLowerCase() === wanted)
  }

/**
 * Find one record on a d66 address.
 *
 * `tens` is the first die, `ones` the second, exactly as the book reads
 * them: (3, 5) is row 35.
 */
export const byD66 =
  <R extends BaseRecord & { readonly d66: number }>(records: readonly R[]) =>
  (tens: number, ones: number): R | undefined =>
    records.find((r) => r.d66 === tens * 10 + ones)

/**
 * Find one record on a banded d6 x d6 address.
 *
 * The first die picks the band (which lists the faces it covers), the
 * second the row within it.
 */
export const byBanded =
  <R extends BandedRecord>(records: readonly R[]) =>
  (first: number, second: number): R | undefined =>
    records.find((r) => r.faces.includes(first) && r.row === second)

/** Find one record by a single d6 face listed in its `faces`. */
export const byFaces =
  <R extends BaseRecord & { readonly faces: readonly number[] }>(records: readonly R[]) =>
  (face: number): R | undefined =>
    records.find((r) => r.faces.includes(face))

/** Find one record by a 2d6 total listed in its `totals`. */
export const byTotals =
  <R extends BaseRecord & { readonly totals: readonly number[] }>(records: readonly R[]) =>
  (total: number): R | undefined =>
    records.find((r) => r.totals.includes(total))

/** Find one record by an exact 2d6 total. */
export const byTotal =
  <R extends BaseRecord & { readonly total: number }>(records: readonly R[]) =>
  (total: number): R | undefined =>
    records.find((r) => r.total === total)

/** Every record of one named column or table, in printed order. */
export const inColumn =
  <R extends BaseRecord, K extends keyof R>(records: readonly R[], field: K) =>
  (value: R[K]): readonly R[] =>
    records.filter((r) => r[field] === value)
