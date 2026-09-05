/**
 * The engine's errors.
 *
 * spec.md, Refusals: "Creation's pools are advisory." No rule outcome is
 * ever an exception — an overspent pool, a broken cap, a Proficiency the
 * style does not have are all reported as data on the result and the
 * Master is built anyway. What throws is a caller mistake the engine
 * cannot describe as a rule: an id that is not in the table it was
 * handed, or a scripted dice sequence that ran out.
 */

/** Thrown when an id is not in the table the engine was handed. */
export class UnknownEntry extends Error {
  constructor(
    readonly table: string,
    readonly id: string,
  ) {
    super(`unknown ${table}: ${id}`)
    this.name = 'UnknownEntry'
  }
}
