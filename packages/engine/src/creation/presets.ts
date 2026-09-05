/**
 * Loading a pre-generated Master (MH p.91-92, R83).
 *
 * Appendix C's eight sheets are data, not creations the engine validates.
 * They load **as printed**: their arithmetic is checked and reported, and
 * nothing is corrected. Two things follow from that, both deliberate:
 *
 * - The pool checks run. Yin's sheet spends 10 Proficiency points against
 *   a pool of 9 and 12 Resource points against 8; both are reported, and
 *   Yin loads anyway. That is the same "advisory pools" rule creation
 *   follows (spec.md, Refusals), applied to the book's own characters.
 * - The **range** checks do not run. Sun Wukong's implied rolled SKILL of
 *   14 is outside R04's 1d6+6, and his sheet is legendary rather than
 *   wrong. R83 makes Appendix C data; validating it against the creation
 *   rules would be validating the author.
 *
 * The Proficiency pool a sheet is checked against is derived, because the
 * sheets print the final SKILL rather than the rolled one: rolled SKILL =
 * printed SKILL + Training (R10 with R15). This is the estate's
 * derivation in docs/world/pregenerated-masters.md, not a printed rule.
 */
import type { Preset } from '@martial-havoc/content'
import { UnknownEntry } from '../errors'
import { fixedAttribute } from './attributes'
import type { Item, ItemFlag } from './kit'
import { COMMON_CLOTHING, freeTextItem, marketItem } from './kit'
import { spendResources } from './learning'
import { martialArtBySheetName } from './martial-art'
import { spendProficiencies } from './proficiencies'
import { chooseSocialStatus } from './social-status'
import type { CreationTables } from './tables'
import { canonicalName } from './tables'
import { training as buildTraining } from './training'
import type { Creation, CreationFlags } from './master'
import { raisedFlags } from './master'

/**
 * Flags for the free-text equipment the sheets carry.
 *
 * docs/world/pregenerated-masters.md names exactly these six lines as
 * not being Market items: "Nunchaku, Revolver, Magical sword, Magical
 * staff, Legendary weapon and Wine bottle". The first five are the
 * sheets' weapons, which I-02 says satisfy an armed Proficiency
 * whatever they are; the sixth is the alcohol Drunken style requires
 * (R13, I-03), which is why Beggar So carries one. Anything else on a
 * sheet is matched against the Market and takes the flags the data set,
 * or carries none - guessing at "double knives" or "protection sutra"
 * would be inventing, not transcribing.
 */
const SHEET_EQUIPMENT_FLAGS: Readonly<Record<string, readonly ItemFlag[]>> = Object.freeze({
  nunchaku: ['weapon'],
  revolver: ['weapon'],
  'magical sword': ['weapon'],
  'magical staff': ['weapon'],
  'legendary weapon': ['weapon'],
  'wine bottle': ['alcohol'],
})

/** Turn one printed equipment line into an inventory item. */
const sheetItem =
  (tables: CreationTables) =>
  (line: string): Item => {
    const onMarket = tables.market.find(
      (m) => m.item.trim().toLowerCase() === line.trim().toLowerCase(),
    )
    if (onMarket !== undefined) return marketItem(onMarket)
    return freeTextItem(line, SHEET_EQUIPMENT_FLAGS[line.trim().toLowerCase()] ?? [])
  }

/**
 * Load one of the eight sheets by id.
 *
 * An id the table does not hold is a caller bug and throws, like every
 * other unknown id. Everything the sheet itself gets wrong is a flag.
 */
export const loadPreset =
  (tables: CreationTables) =>
  (presetId: string): Creation => {
    const preset = tables.presets.find((p) => p.id === presetId)
    if (preset === undefined) throw new UnknownEntry('preset', presetId)
    return loadPresetRecord(tables)(preset)
  }

/** {@link loadPreset}, given the record rather than its id. */
export const loadPresetRecord =
  (tables: CreationTables) =>
  (preset: Preset): Creation => {
    const resolution = tables.presetNameResolution
    const martialArt = martialArtBySheetName(tables.martialArts, resolution)(preset.martialArt)
    // Every sheet's style resolves through the map; a miss means the map
    // and the sheets have drifted apart, which is a bug, not a rule.
    if (martialArt === undefined) throw new UnknownEntry('martial art on sheet', preset.martialArt)

    const training = buildTraining(preset.training)
    // The sheets print the final SKILL; R15 means the pool was the rolled
    // one, which is that plus the Training bought.
    const impliedRolledSkill = preset.skill + preset.training

    const proficiencies = spendProficiencies(martialArt, resolution)(impliedRolledSkill)(
      Object.fromEntries(
        preset.proficiencies.map((p) => [canonicalName(resolution)(p.name), p.value]),
      ),
    )

    const resources = spendResources(tables.techniques, tables.rituals, resolution)(
      training.resourcePool,
    )({ techniques: preset.techniques, rituals: preset.rituals })

    const kit = { itemOverCap: false, itemUnpriced: false }
    const flags: CreationFlags = {
      proficiencies,
      resources,
      kit,
      raised: raisedFlags(proficiencies, resources, kit),
    }

    return {
      master: {
        name: preset.name,
        age: preset.age,
        martialArt,
        attributes: {
          skill: fixedAttribute(preset.skill),
          endurance: fixedAttribute(preset.endurance),
          luck: fixedAttribute(preset.luck),
        },
        proficiencies: proficiencies.assigned,
        training,
        techniques: resources.learned.techniques,
        rituals: resources.learned.rituals,
        equipment: [COMMON_CLOTHING, ...preset.equipment.map(sheetItem(tables))],
        // The sheets print a status but no gold; R03's gold is rolled at
        // creation and a printed sheet has none to report.
        gold: 0,
        status: chooseSocialStatus(tables.socialStatuses)(preset.status) ?? null,
        xp: 0,
        dishonor: 0,
      },
      flags,
    }
  }

/** Load all eight, in printed order. */
export const loadAllPresets = (tables: CreationTables): readonly Creation[] =>
  tables.presets.map((preset) => loadPresetRecord(tables)(preset))
