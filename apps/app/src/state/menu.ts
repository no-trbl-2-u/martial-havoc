/**
 * The beat's menu, derived from the adventure graph and the cave's state
 * (Phase 8c: the cave, verbatim).
 *
 * Nothing here is authored: every row is a fact of the tables - an exit
 * the area lists, a gate that wants a key, a treasure lying here, the
 * rescue the area names, a source that teaches a treasure's effect - or
 * a foe the last Event brought. The book prints no menu, so the row
 * titles are the app's copy (`ui.cave.*`), and every line under a title
 * is the book's own text where the book has one (a gate's text, the
 * rescue's text) and nothing where it does not.
 *
 * A pure function of the record. The reducer reads the same tables and
 * refuses the same moves, so a row this menu disables is a move the
 * reducer would ignore.
 */
import { canEnter, ending, flag, hintRevealed } from '@martial-havoc/engine'
import type { Passage } from '@martial-havoc/engine'
import {
  t,
  theFiveTreasures,
  theFiveTreasuresAreaById,
  theFiveTreasuresTreasureById,
  treasureFoeById,
} from '@martial-havoc/content'
import { fill } from '../lib/fill'
import type { RecordState } from './types'

/** What a row does when tapped. */
export type BeatAction =
  | { readonly kind: 'go'; readonly to: string }
  | { readonly kind: 'take'; readonly treasure: string }
  | { readonly kind: 'rescue' }
  | { readonly kind: 'attack' }
  | { readonly kind: 'learn' }
  | { readonly kind: 'fight'; readonly foe: string }
  | { readonly kind: 'rest' }
  | { readonly kind: 'gourd' }
  | { readonly kind: 'leave' }
  | { readonly kind: 'village' }

/** One row of the beat's menu. */
export type BeatOption = {
  readonly id: string
  readonly title: string
  /** The short note beside the title: an area number, a lock, an event. */
  readonly note: string
  /** The book's own line under the title, or the empty string. */
  readonly line: string
  readonly enabled: boolean
  readonly action: BeatAction
}

const TABLES = theFiveTreasures

/** The foes the adventure treats as rank and file: unlimited, never recorded as defeated. */
export const RANK_AND_FILE: readonly string[] = ['foe.devil-servant', 'foe.ogre', 'foe.woodgatherer']

/**
 * The treasure whose printed effect is an act the Master can perform on
 * the beat, and the flag that act sets.
 *
 * The gourd is the adventure's only one: "if opened it will swallow the
 * sky, changing day to night. Close it to have the daylight back."
 * Reading I-45 makes that night a flag the tables read - it is what
 * `absences.json` empties the Cave entrance of Ogres by - so opening the
 * gourd is a move, not a line of narration. The other four treasures do
 * nothing a menu row could offer.
 *
 * The id lives here rather than in the engine because it names one
 * adventure's content (agents.md standing rule 7), the same way
 * {@link RANK_AND_FILE} does.
 */
export const GOURD = 'treasure.the-5-treasures.gold-and-red-gourd'

/** The flag the gourd sets (I-45). */
export const NIGHT = 'night'

/** A foe's printed name, or its id where the roster does not know it. */
export const foeName = (id: string): string => treasureFoeById(id)?.name ?? id

/** A treasure's printed name, or its id. */
export const treasureName = (id: string): string => theFiveTreasuresTreasureById(id)?.name ?? id

/** The printed stat line of a foe: SKILL, END, ATT, as the block reads. */
const foeLine = (id: string): string => {
  const foe = treasureFoeById(id)
  return foe === undefined
    ? ''
    : fill(t('ui.cave.foe.line'), { skill: foe.skill, endurance: foe.endurance, attack: foe.attack ?? '' })
}

/** The note beside an exit: its printed number, or why the door refuses. */
const exitNote = (passage: Passage, to: string): string => {
  if (passage.ok) return fill(t('ui.cave.go.note'), { n: passage.area.area })
  if (passage.reason === 'locked') return t('ui.cave.go.locked')
  return fill(t('ui.cave.go.note'), { n: theFiveTreasuresAreaById(to)?.area ?? '' })
}

/** The menu the cave allows here, in the order a player reads it. */
export const menuFor = (state: RecordState): readonly BeatOption[] => {
  const here = theFiveTreasuresAreaById(state.cave.area)
  if (here === undefined) return []
  const engaged = state.pending.length > 0
  const last = state.result?.kind === 'turn' ? state.result.eventText.toUpperCase() : ''
  const rows: BeatOption[] = []

  // The foes the Event brought come first: an Ambush or an Encounter is
  // the room's business before anything else in it.
  state.pending.forEach((foe, i) => {
    rows.push({
      id: `fight-${foe}-${i}`,
      title: fill(t('ui.cave.face'), { name: foeName(foe).toUpperCase() }),
      note: last,
      line: foeLine(foe),
      enabled: true,
      action: { kind: 'fight', foe },
    })
  })

  here.exits.forEach((to) => {
    const passage = canEnter(TABLES, state.cave, to)
    const name = theFiveTreasuresAreaById(to)?.name ?? to
    rows.push({
      id: `go-${to}`,
      title: fill(t('ui.cave.go'), { name: name.toUpperCase() }),
      note: exitNote(passage, to),
      line: passage.ok || passage.reason !== 'locked' ? '' : passage.text,
      enabled: passage.ok && !engaged,
      action: { kind: 'go', to },
    })
  })

  here.treasures
    .filter((id) => !state.cave.treasures.includes(id))
    .forEach((id) => {
      rows.push({
        id: `take-${id}`,
        title: fill(t('ui.cave.take'), { name: treasureName(id).toUpperCase() }),
        note: fill(t('ui.cave.take.note'), { n: state.cave.treasures.length + 1 }),
        line: '',
        enabled: !engaged,
        action: { kind: 'take', treasure: id },
      })
    })

  const rescue = here.rescue
  if (
    rescue !== null &&
    !state.cave.rescued.includes(rescue.foe) &&
    !state.cave.defeated.includes(rescue.foe)
  ) {
    const name = foeName(rescue.foe).toUpperCase()
    rows.push({
      id: 'rescue',
      title: fill(t('ui.cave.rescue'), { name }),
      note: t('ui.cave.rescue.note'),
      line: rescue.text,
      enabled: !engaged,
      action: { kind: 'rescue' },
    })
    rows.push({
      id: 'attack',
      title: fill(t('ui.cave.attack'), { name }),
      note: t('ui.cave.attack.note'),
      line: '',
      enabled: !engaged,
      action: { kind: 'attack' },
    })
  }

  const teaches = TABLES.treasures.filter(
    (tr) => tr.knownFrom.includes(here.id) && !state.cave.effects.includes(tr.id),
  )
  if (teaches.length > 0) {
    rows.push({
      id: 'learn',
      title: t('ui.cave.learn'),
      note: t('ui.cave.learn.note'),
      line: hintRevealed(state.cave, here.id) ? here.hint : '',
      enabled: !engaged,
      action: { kind: 'learn' },
    })
  }

  // The gourd, once held, is an act: it swallows the sky (I-45). The
  // line under the row is the treasure's own printed effect, so the
  // player reads the book rather than a paraphrase of it.
  if (state.cave.treasures.includes(GOURD)) {
    const night = flag(state.cave, NIGHT)
    rows.push({
      id: 'gourd',
      title: night ? t('ui.cave.gourd.close') : t('ui.cave.gourd.open'),
      note: night ? t('ui.cave.gourd.note.night') : t('ui.cave.gourd.note.day'),
      line: theFiveTreasuresTreasureById(GOURD)?.effect ?? '',
      enabled: !engaged,
      action: { kind: 'gourd' },
    })
  }

  rows.push({
    id: 'rest',
    title: t('ui.cave.rest'),
    note: t('ui.cave.rest.note'),
    line: '',
    enabled: !engaged,
    action: { kind: 'rest' },
  })

  // The way back to the doorstep. Phase 10b made the trail the only way
  // onto the mountain, so it is also the only way off it: from the start
  // area, and from nowhere else, the Master can walk back down to Fen
  // Pass. Nothing is spent and nothing is reset - the cave remembers.
  if (here.id === TABLES.meta.startArea) {
    rows.push({
      id: 'village',
      title: t('ui.cave.village'),
      note: t('ui.cave.village.note'),
      line: '',
      enabled: !engaged,
      action: { kind: 'village' },
    })
  }

  // The sandbox opens at the ending and not before (Phase 10b). It used
  // to sit on the start area too, which offered a Master who had not
  // yet walked into the cave a way out of the adventure they had not
  // yet begun - the region as an escape from the first act rather than
  // the thing the first act is for.
  if (ending(TABLES, state.cave) !== null) {
    rows.push({
      id: 'leave',
      title: t('ui.cave.leave'),
      note: t('ui.cave.leave.note'),
      line: '',
      enabled: !engaged,
      action: { kind: 'leave' },
    })
  }

  return rows
}
