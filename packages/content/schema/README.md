# schema/

`content.schema.json` is the one JSON Schema every data file in
`../data/` validates against — the rulebook's tables, and (from
Phase 5) the adventure files, which reuse the same record kinds.
That reuse is what keeps "one schema" true as the content grows.

## Shape

A file is an envelope wrapping an array of records:

```json
{
  "$schema": "../schema/content.schema.json",
  "id": "world.techniques",
  "kind": "d66",
  "title": "Techniques Table",
  "cite": "MH p.12-15",
  "label": "rule",
  "docs": "docs/world/techniques.md",
  "records": [{ "id": "technique.blue-dragon", "cite": "MH p.12", "d66": 11 }]
}
```

- **`kind`** names the shape of the table's dice address, and is
  what the top-level `oneOf` switches on: `d6-banded`, `d66`,
  `1d6`, `2d6`, `2d6-by-column`, `d6-by-column`, `list`,
  `presets`, `strings`. Each kind fixes exactly which record
  shapes it may hold.
- **`label`** is the spec's vocabulary (`rule`, `reading`,
  `invention`). Every table transcribed from the book is `rule`;
  `data/app/strings.json` is ours, so it is `invention`.
- **`docs`** points at the concept under `docs/` the file was
  transcribed from. Required for every kind but `strings`, which
  has no docs concept behind it.
- Every **record** carries `id` (dotted, unique across the whole
  package) and `cite` (a folio). A record whose cell is an
  inferred reading carries `reading: "I-nn"` *in addition*, never
  instead.

Every object is closed (`additionalProperties: false`), so a
stray or misspelled field is red rather than ignored.

## The gate

`../src/content.test.ts` is the validation leg — there is no
separate `data:validate` script. It compiles this schema once
with ajv (draft 2020-12, `allErrors`) and then checks what a
schema cannot: ids are unique across files, every `docs` pointer
resolves, every file holds exactly the number of records the book
prints, and every `d66` address is two real d6 faces. It prints
`content - N files, M records`; the engine's half of that promise
is `labels:check`.

Adding a table means adding its file *and* its expected count to
`EXPECTED_RECORD_COUNTS` in that test. The map is exhaustive both
ways, so neither a half-transcribed table nor a forgotten file
can ship.

Rules this directory serves (spec.md, Routine calls; agents.md
rule 7): every data record carries `cite`; engine-facing tables
carry `label: rule`; no copy is hardcoded in components.
