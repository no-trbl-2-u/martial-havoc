# schema/

The one JSON Schema every table of the rulebook and the adventure
validates against arrives in Phase 2 ("Tables as data, and creation").
The garden ships this directory empty on purpose; the schema test in
`../src/content.test.ts` walks it and `../data/` on every run, so the
leg exists and runs before it has anything to validate.

Rules (spec.md, Routine calls; agents.md rule 7): every data record
carries `cite` (where in the book) and, for engine-facing tables,
`label: rule`. No copy is hardcoded in components.
