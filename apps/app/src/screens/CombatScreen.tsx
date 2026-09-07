/**
 * Combat: both rolls, both Proficiencies, both totals and the difference
 * in one glance; the winner's four options as a menu; a tie as an
 * Unexpected Event; the retreat row that rolls Morale (spec.md, Horizon;
 * design prototype, "COMBAT").
 */
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { effectFor, t, techniqueById, treasureFoeById } from '@martial-havoc/content'
import { LEARNED } from '../state/reduce'
import { CORD, CORD_KNOWN, FAN, FIREPROOF, SWORD } from '../state/menu'
import type { AttackStrength } from '@martial-havoc/engine'
import { flag, skillForFight } from '@martial-havoc/engine'
import { fill } from '../lib/fill'
import { momentOfFightEnd, narrate } from '../lib/narrator'
import type { Action, Combat, FoeInFight, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { Die } from '../components/Die'
import { ManualDice } from '../components/ManualDice'
import { MenuButton } from '../components/MenuButton'
import { RollBar } from '../components/RollBar'
import { Narrator } from '../components/Narrator'
import { Slip } from '../components/Slip'
import { Source } from '../components/Source'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** One side's card: two dice, the sum and what was added, the total. */
const Side = ({
  title,
  strength,
  idle,
  prefix,
  note,
  dimmed,
  aimed,
  onPress,
}: {
  title: string
  strength: AttackStrength | null
  idle: string
  prefix: string
  /** A word over the card: HELD BACK, DOWN, or nothing. */
  note?: string
  /** Struck out: this body is down and only its record is left. */
  dimmed?: boolean
  /** The winner's option applies here: the card the Master is aimed at. */
  aimed?: boolean
  onPress?: () => void
}) => (
  <Slip
    style={[styles.side, dimmed === true && styles.sideDown, aimed === true && styles.sideAimed]}
    testID={`side-${prefix}`}
  >
    <Text style={styles.sideTitle}>{title}</Text>
    {note === undefined || note.length === 0 ? null : (
      <Text testID={`note-${prefix}`} style={styles.sideNote}>
        {note}
      </Text>
    )}
    <View style={styles.dice}>
      <Die size={30} face={strength?.roll.a ?? null} testID={`die-${prefix}-a`} />
      <Die size={30} face={strength?.roll.b ?? null} testID={`die-${prefix}-b`} />
    </View>
    <Text style={styles.sideLine}>
      {strength === null
        ? idle
        : fill(t(prefix === 'mine' ? 'ui.combat.mine' : 'ui.combat.theirs'), {
            dice: strength.roll.total,
            skill: strength.skill,
            name: (strength.proficiency?.name ?? '').toUpperCase(),
            value: strength.proficiency?.value ?? 0,
          })}
    </Text>
    <Text testID={`total-${prefix}`} style={styles.sideTotal}>{strength === null ? '-' : strength.total}</Text>
    {/*
      The whole card is the tap target, and it is drawn last so it
      sits over the text rather than under it. A card with nothing to
      aim at renders none, so a duel has no invisible button on it.
    */}
    {onPress === undefined ? null : (
      <Pressable
        accessibilityRole="button"
        testID={`aim-${prefix}`}
        onPress={onPress}
        style={styles.aimHit}
      />
    )}
  </Slip>
)

/**
 * Reading the band from the screen's side (Phase 10e).
 *
 * The reducer owns the same three questions and answers them the same
 * way; they are repeated here rather than exported because a screen
 * asking "who am I aimed at" is a rendering question, and a reducer
 * asking it is a rule. Both read the one field that decides it.
 */
const aimedAt = (c: Combat): FoeInFight | undefined => c.foes[c.target] ?? c.foes[0]

/** Is `treasure` in the Master's hands? (I-60: a held treasure's effect is known.) */
const holds = (state: RecordState, treasure: string): boolean =>
  state.cave.treasures.includes(treasure)

/** Every body still on its feet. */
const standing = (c: Combat): readonly FoeInFight[] => c.foes.filter((f) => f.endurance > 0)

/** Every body down and not yet looted, with the index the reducer wants. */
const bodies = (c: Combat): readonly { readonly index: number; readonly foe: FoeInFight }[] =>
  c.foes.map((foe, index) => ({ index, foe })).filter((x) => x.foe.endurance === 0)

type Act = { id: string; title: string; cite: string; line: string; enabled: boolean; action: Action }

/** The menu for the fight's current state: R25's four when ahead, else what the phase allows. */
const actions = (state: RecordState, c: Combat): readonly Act[] => {
  const aim = aimedAt(c)
  const won = aim?.outcome === 'master-wins'
  const diff = aim?.difference ?? 0
  const alive = standing(c)
  if (c.over.ended && c.over.reason === 'master-down')
    return [{ id: 'fall', title: t('ui.combat.act.fall'), cite: t('ui.combat.act.fall.cite'), line: t('ui.combat.act.fall.line'), enabled: true, action: { type: 'combat.leave' } }]
  // A landed Final Blow is offered before anything else the fight has
  // to say (R31). It stands above the loot and above LEAVE because it
  // is the one thing on this screen that can only be taken now: the
  // Technique is invented off *this* blow or not at all.
  if (c.blow?.landed === true && !c.blowSettled)
    return [
      {
        id: 'keep',
        title: t('ui.combat.act.keep'),
        cite: t('ui.combat.act.keep.cite'),
        line: fill(t('ui.combat.act.keep.line'), { luck: state.sheet.luck }),
        enabled: true,
        action: { type: 'combat.keep' },
      },
      {
        id: 'let-go',
        title: t('ui.combat.act.let-go'),
        cite: t('ui.combat.act.let-go.cite'),
        line: t('ui.combat.act.let-go.line'),
        enabled: true,
        action: { type: 'combat.let-go' },
      },
    ]
  // While the naming card is open it is the only thing on screen that
  // matters: a half-named Technique is finished or abandoned there.
  if (c.naming !== null) return []
  // Every body that has fallen gets its own LOOT row, in the order they
  // fell: a LOOT line belongs to an opponent, not to a fight (5T a2).
  // The rows stand while anyone is still up, too - a Master who has put
  // one of three down may stoop, and the other two are still there.
  const loot = bodies(c).map(({ index, foe }) => ({
    // One opponent keeps the row's original id: a duel is the common
    // case and its controls should not be renamed by a phase about
    // crowds. Several give each body its own.
    id: c.foes.length === 1 ? 'loot' : `loot-${String(index)}`,
    title:
      c.foes.length === 1
        ? t('ui.combat.act.loot')
        : fill(t('ui.combat.act.loot.of'), { name: (treasureFoeById(foe.id)?.name ?? '').toUpperCase() }),
    cite: t('ui.combat.act.loot.cite'),
    line: t('ui.combat.act.loot.line'),
    enabled: !foe.looted,
    action: { type: 'combat.loot', index } as Action,
  }))
  if (alive.length === 0)
    return [
      ...loot,
      { id: 'go-on', title: t('ui.combat.act.go-on'), cite: t('ui.combat.act.go-on.cite'), line: t('ui.combat.act.go-on.line'), enabled: true, action: { type: 'combat.leave' } },
    ]
  if (c.event !== null) {
    const rows: Act[] = []
    // Rows 6 and 8 are the only ones whose printed text states its own
    // effect, and the only ones that put the player back where they
    // were (R32). They get the first row, because leaving the phase
    // when the row says the fight resumes is the wrong default.
    if (c.event.reading?.kind === 'fight-resumes')
      rows.push({
        id: 'resume',
        title: t('ui.combat.resume'),
        cite: t('ui.combat.resume.cite'),
        line: t('ui.combat.resume.line'),
        enabled: true,
        action: { type: 'combat.resume' },
      })
    if (c.event.retreatRow)
      rows.push({ id: 'morale', title: t('ui.combat.act.morale'), cite: t('ui.combat.act.morale.cite'), line: t('ui.combat.act.morale.line'), enabled: c.morale === null, action: { type: 'combat.morale' } })
    rows.push({ id: 'leave-phase', title: t('ui.combat.act.leave-phase'), cite: t('ui.combat.act.leave-phase.cite'), line: t('ui.combat.act.leave-phase.line'), enabled: true, action: { type: 'combat.leave' } })
    return rows
  }
  if (c.opening)
    return [
      { id: 'blow', title: t('ui.combat.act.blow'), cite: t('ui.combat.act.blow.cite'), line: t('ui.combat.act.blow.line'), enabled: true, action: { type: 'combat.blow' } },
      { id: 'strike-instead', title: t('ui.combat.act.strike-instead'), cite: t('ui.combat.act.strike.cite'), line: t('ui.combat.act.strike-instead.line'), enabled: won, action: { type: 'combat.strike' } },
    ]
  // Both kinds of Technique are winner's options and both are offered
  // from one row: the printed ones the sheet names, and the ones this
  // Master invented off a Final Blow (R31). A learned one is named by
  // its place on the sheet, because it is in no table.
  const printed = state.sheet.techniques
    .map((id) => ({
      id,
      name: techniqueById(id)?.name ?? id,
      line: (effect: string) => effect,
      cost: effectFor(id)?.cost ?? 0,
      timing: effectFor(id)?.timing,
    }))
    .filter((x) => x.timing === 'combat-winner-option')
  const own = state.sheet.learned.map((own, i) => ({
    id: `${LEARNED}${String(i)}`,
    name: own.name,
    cost: own.value,
  }))
  const technique = printed[0] ?? own[0]
  const line =
    technique === undefined
      ? t('ui.combat.act.technique.none')
      : printed.length > 0
        ? fill(t('ui.combat.act.technique.line'), { name: technique.name, cost: technique.cost })
        : fill(t('ui.combat.act.technique.own'), { name: technique.name, value: technique.cost })
  const cordReady = holds(state, CORD) && flag(state.cave, CORD_KNOWN)
  const fireproof = aim?.id === FIREPROOF
  return [
    ...loot,
    {
      id: 'strike',
      title: t('ui.combat.act.strike'),
      cite: t('ui.combat.act.strike.cite'),
      line: won ? fill(t('ui.combat.act.strike.won'), { n: diff }) : t('ui.combat.act.strike.lost'),
      enabled: won,
      action: { type: 'combat.strike' },
    },
    ...(holds(state, CORD)
      ? [
          {
            id: 'tie',
            title: t('ui.combat.act.tie'),
            cite: t('ui.combat.act.tie.cite'),
            line: cordReady ? t('ui.combat.act.tie.line') : t('ui.combat.act.tie.unknown'),
            enabled: won && cordReady,
            action: { type: 'combat.tie' } as Action,
          },
        ]
      : []),
    ...(holds(state, FAN)
      ? [
          {
            id: 'fan',
            title: t('ui.combat.act.fan'),
            cite: t('ui.combat.act.fan.cite'),
            line: fireproof ? t('ui.combat.act.fan.fireproof') : t('ui.combat.act.fan.line'),
            enabled: won && !fireproof,
            action: { type: 'combat.fan' } as Action,
          },
        ]
      : []),
    {
      id: 'technique',
      title: t('ui.combat.act.technique'),
      cite: t('ui.combat.act.technique.cite'),
      line,
      enabled: won && technique !== undefined,
      action: { type: 'combat.technique', id: technique?.id ?? '' },
    },
    { id: 'weapon', title: t('ui.combat.act.weapon'), cite: t('ui.combat.act.weapon.cite'), line: t('ui.combat.act.weapon.line'), enabled: won, action: { type: 'combat.weapon' } },
    { id: 'opening', title: t('ui.combat.act.opening'), cite: t('ui.combat.act.opening.cite'), line: t('ui.combat.act.opening.line'), enabled: won, action: { type: 'combat.opening' } },
  ]
}

const banner = (state: RecordState, c: Combat): { label: string; value: string; bg: string } => {
  if (c.over.ended && c.over.reason === 'master-down') return { label: t('ui.combat.banner.down'), value: '0', bg: color.ink }
  // The Ambush says whose round it is before it says anything about
  // numbers (I-08a). It is the one state where a Master who loses is
  // not offered a winner's option, so the banner has to explain it
  // rather than leave the missing rows unexplained.
  if (c.ambush) return { label: t('ui.combat.ambush.banner'), value: '-', bg: color.vermilion }
  const r = c.last
  if (r === null)
    return standing(c).length > 1
      ? { label: fill(t('ui.combat.banner.band'), { n: standing(c).length }), value: '-', bg: color.ink }
      : { label: t('ui.combat.banner.roll'), value: '-', bg: color.ink }
  if (r.difference > 0) return { label: t('ui.combat.banner.ahead'), value: String(r.difference), bg: color.vermilion }
  if (r.difference < 0) return { label: t('ui.combat.banner.behind'), value: String(-r.difference), bg: color.ink }
  return { label: t('ui.combat.banner.tie'), value: '0', bg: color.vermilion }
}

/**
 * The slip for a fall, or null while both sides are still standing.
 *
 * Two falls, one shape. The foe's carries how it went down - the
 * difference struck off, or the Final Blow landing - because those are
 * two different endings and the round card has already scrolled past by
 * the time a player reads this. The Master's carries the book's own
 * sentence (MH p.6), which is the only place the app says what running
 * out of ENDURANCE means.
 *
 * `line` is the narrator's, already resolved by the caller: `kill` and
 * `down` are moments he has lines for (Phase 10a).
 */
const fallenSlip = (
  state: RecordState,
  c: Combat,
  foeName: string,
  line: string | null,
): { title: string; how: string; cite: string; line: string | null } | null => {
  if (c.over.ended && c.over.reason === 'master-down')
    return {
      title: t('ui.combat.fallen.master'),
      how: t('ui.combat.fallen.master.line'),
      cite: t('ui.combat.fallen.master.cite'),
      line,
    }
  // With several opponents the slip is about the one the Master was
  // aimed at: that is the body that just fell, and the round card has
  // already scrolled past by the time this is read.
  if ((aimedAt(c)?.endurance ?? 1) > 0) return null
  return {
    title: fill(t('ui.combat.fallen.foe'), { name: foeName.toUpperCase() }),
    how:
      c.blow?.landed === true
        ? t('ui.combat.fallen.blow')
        : fill(t('ui.combat.fallen.difference'), { n: aimedAt(c)?.difference ?? 0 }),
    cite: t('ui.combat.fallen.cite'),
    line,
  }
}

const moraleText = (m: NonNullable<Combat['morale']>): string =>
  m.result === 'flee'
    ? t('ui.combat.morale.flee')
    : m.result === 'cautious-retreat'
      ? t('ui.combat.morale.cautious')
      : fill(t('ui.combat.morale.rally'), { n: m.reinforcements })

export const CombatScreen = ({ state, dispatch }: Props) => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(aimedAt(c)?.id ?? '')
  if (c === null || foe === undefined) return null
  /** Several opponents: the band gets its own column of cards. */
  const many = c.foes.length > 1
  const b = banner(state, c)
  const mine = state.sheet.proficiencies.reduce((best, p) => (p.value > best.value ? p : best), state.sheet.proficiencies[0] ?? { name: '', value: 0 })
  const theirs = foe.proficiencies.reduce((best, p) => (p.value > best.value ? p : best), foe.proficiencies[0] ?? { name: '', value: 0 })
  const canRoll = !c.over.ended && c.last === null && !c.opening && standing(c).length > 0
  // Filled here rather than in `banner`: the banner is the rule's word
  // for how the fight ended, this is the narrator's, and they are two
  // different jobs on two different lines (plan/VOICE.md).
  const end = c.over.ended ? narrate(momentOfFightEnd(c.over.reason), state.sheet.name) : null
  const fallen = fallenSlip(state, c, foe.name, end)
  return (
    <View style={styles.screen} testID="combat">
      {/*
        The Master's card and a column of theirs (Phase 10e). One
        opponent renders exactly as it always did - the same two cards
        side by side - because a fight against one is the common case
        and it should not pay for the crowd. Several put the Master's
        card above and the band below it, one card each, each with its
        own dice and its own total against the Master's one roll (I-06).
      */}
      <View style={styles.sides}>
        <Side
          title={t('ui.combat.you')}
          strength={c.last?.master ?? null}
          prefix="mine"
          note={
            many
              ? fill(t('ui.combat.band.skill'), {
                  skill: skillForFight(state.sheet.skill, standing(c).length),
                  n: standing(c).length,
                })
              : ''
          }
          idle={fill(t('ui.combat.mine.idle'), { skill: state.sheet.skill, name: mine.name.toUpperCase(), value: mine.value })}
        />
        {many ? null : (
          <Side
            title={foe.name.toUpperCase()}
            strength={aimedAt(c)?.strength ?? null}
            prefix="theirs"
            idle={fill(t('ui.combat.theirs.idle'), { end: aimedAt(c)?.endurance ?? 0, name: theirs.name.toUpperCase(), value: theirs.value })}
          />
        )}
      </View>
      {many || foe.description.length === 0 ? null : (
        <Text testID="foe-description" style={styles.foeLine}>
          {foe.description}
        </Text>
      )}

      <View style={[styles.banner, { backgroundColor: b.bg }]}>
        <Text style={styles.bannerLabel}>{b.label}</Text>
        <Text testID="banner-value" style={styles.bannerValue}>{b.value}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      {many ? (
        <View style={styles.band} testID="band">
          {c.foes.map((body, index) => {
            const block = treasureFoeById(body.id)
            const best = (block?.proficiencies ?? []).reduce(
              (top, p) => (p.value > top.value ? p : top),
              (block?.proficiencies ?? [])[0] ?? { name: '', value: 0 },
            )
            return (
              <Side
                key={`${body.id}-${String(index)}`}
                title={(block?.name ?? body.id).toUpperCase()}
                strength={body.strength}
                prefix={`foe-${String(index)}`}
                dimmed={body.endurance === 0}
                aimed={index === c.target && body.endurance > 0}
                /*
                  Two different facts can be true of the same card, and
                  both matter: this is the one the winner's option
                  applies to, and this is the one R37 kept out of reach.
                  So they are printed together rather than one hiding
                  the other.
                */
                note={[
                  index === c.target && body.endurance > 0 ? t('ui.combat.band.aim') : '',
                  body.endurance === 0
                    ? t('ui.combat.band.down')
                    : body.heldBack
                      ? t('ui.combat.band.held')
                      : '',
                  body.endurance > 0 && body.bound ? t('ui.combat.band.bound') : '',
                  body.endurance > 0 && body.burning ? t('ui.combat.band.burning') : '',
                ]
                  .filter((word) => word.length > 0)
                  .join(t('ui.combat.band.note.join'))}
                onPress={
                  body.endurance === 0
                    ? undefined
                    : () => dispatch({ type: 'combat.target', index })
                }
                idle={fill(t('ui.combat.theirs.idle'), {
                  end: body.endurance,
                  name: best.name.toUpperCase(),
                  value: best.value,
                })}
              />
            )
          })}
        </View>
      ) : null}
        {many ? (
          <Text testID="band-tap" style={styles.bandTap}>
            {t('ui.combat.band.tap')}
          </Text>
        ) : null}

        {/*
          Whoever fell, said as a moment rather than as a number going
          to zero (Phase 10d). It stands above the loot row for a beaten
          foe and above BEGIN AGAIN for a beaten Master, because in both
          cases the next thing offered is housekeeping and the fall is
          the thing that happened.
        */}
        {fallen === null ? null : (
          <Slip dashed style={styles.pad} testID="fallen">
            <View style={styles.between}>
              <Text testID="fallen-title" style={styles.strong}>
                {fallen.title}
              </Text>
              <Source cite={fallen.cite} />
            </View>
            <Text style={styles.eventText}>{fallen.how}</Text>
            <Narrator testID="fallen-narrator" line={fallen.line} style={styles.narrator} />
          </Slip>
        )}
        {c.event === null ? null : (
          <Slip borderColor={color.vermilion} testID="event">
            <View style={styles.eventHead}>
              <Text style={styles.eventTitle}>{fill(t('ui.combat.event.heading'), { n: c.event.roll.total })}</Text>
              <Source cite={t('ui.combat.event.cite')} />
            </View>
            <View style={styles.eventBody}>
              <Text style={styles.eventText}>{c.event.text}</Text>
              <Text style={styles.eventLine}>{c.event.line}</Text>
              <Text style={styles.small}>{t('ui.combat.event.note')}</Text>
            </View>
          </Slip>
        )}
        {c.morale === null ? null : (
          <Slip dashed borderColor={color.vermilion} style={styles.pad} testID="morale">
            <View style={styles.between}>
              <Text style={styles.strong}>{moraleText(c.morale)}</Text>
              <Text style={styles.mono}>{fill(t('ui.combat.morale.die'), { n: c.morale.face })}</Text>
            </View>
            <Source cite={t('ui.combat.morale.cite')} />
          </Slip>
        )}
        {c.blow === null ? null : (
          <Slip style={[styles.pad, styles.blow]} testID="blow">
            <Die size={30} face={c.blow.roll.a} testID="die-blow-a" />
            <Die size={30} face={c.blow.roll.b} testID="die-blow-b" />
            <View style={styles.blowText}>
              <Text style={styles.strong}>{c.blow.landed ? t('ui.combat.blow.landed') : t('ui.combat.blow.missed')}</Text>
              <Source cite={t('ui.combat.blow.cite')} />
            </View>
          </Slip>
        )}
        {/*
          The naming card (R31; Phase 10f). The book's most delightful
          rule is a sequence, so this is a sequence: what the LUCK roll
          said, three words for inspiration if they are wanted, and then
          the three things the book asks the player to write down - a
          name, a value of 1 to 4, and a brief description. Nothing here
          is rolled for: the Technique is theirs.
        */}
        {c.naming === null ? null : (
          <Slip borderColor={color.vermilion} style={styles.pad} testID="naming">
            <View style={styles.between}>
              <Text style={styles.strong}>{t('ui.combat.naming.title')}</Text>
              <Source cite={t('ui.combat.naming.cite')} />
            </View>
            <Text testID="naming-luck" style={styles.small}>
              {fill(t('ui.combat.naming.luck'), {
                total: c.naming.roll.outcome.roll.total,
                luck: state.sheet.luck,
                outcome: t('ui.combat.naming.passed'),
              })}
            </Text>

            {c.naming.words === null ? (
              <Button
                testID="naming-inspire"
                text={t('ui.combat.naming.roll')}
                onPress={() => dispatch({ type: 'combat.inspire' })}
                style={styles.field}
              />
            ) : (
              <View style={styles.field}>
                <Text testID="naming-words" style={styles.words}>
                  {fill(t('ui.combat.naming.words'), {
                    action: c.naming.words.action,
                    attribute: c.naming.words.attribute,
                    animal: c.naming.words.animal,
                  })}
                </Text>
                <Text style={styles.small}>{t('ui.combat.naming.words.note')}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>{t('ui.combat.naming.name')}</Text>
              <TextInput
                testID="naming-name"
                style={styles.input}
                value={c.naming.name}
                placeholder={t('ui.combat.naming.name.placeholder')}
                placeholderTextColor={color.dim}
                onChangeText={(name) => dispatch({ type: 'combat.name', name })}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('ui.combat.naming.value')}</Text>
              <View style={styles.values}>
                {[1, 2, 3, 4].map((value) => (
                  <Button
                    key={value}
                    testID={`naming-value-${String(value)}`}
                    text={String(value)}
                    primary={c.naming?.value === value}
                    onPress={() => dispatch({ type: 'combat.value', value })}
                    style={styles.grow}
                  />
                ))}
              </View>
              <Text style={styles.small}>{t('ui.combat.naming.value.note')}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('ui.combat.naming.description')}</Text>
              <TextInput
                testID="naming-description"
                style={[styles.input, styles.describe]}
                value={c.naming.description}
                placeholder={t('ui.combat.naming.description.placeholder')}
                placeholderTextColor={color.dim}
                onChangeText={(text) => dispatch({ type: 'combat.describe', text })}
                multiline
              />
            </View>

            <Button
              testID="naming-keep"
              primary
              text={t('ui.combat.naming.keep')}
              disabled={c.naming.name.trim() === ''}
              onPress={() => dispatch({ type: 'combat.learn' })}
            />
          </Slip>
        )}
        {/*
          The sword taking a hit is a moment, not a missing number
          (I-44). Without a line here a Master reads a round they lost
          and an ENDURANCE that did not move, and concludes the app is
          broken.
        */}
        {!c.warded ? null : (
          <Slip dashed style={styles.pad} testID="warded">
            <View style={styles.between}>
              <Text style={styles.strong}>{t('ui.combat.warded')}</Text>
              <Source cite={t('ui.combat.warded.cite')} />
            </View>
            <Text style={styles.eventText}>{t('ui.combat.warded.line')}</Text>
          </Slip>
        )}
        {c.techniqueLine === null ? null : (
          <Slip style={styles.pad} testID="technique-line">
            <Text style={styles.eventText}>{c.techniqueLine}</Text>
          </Slip>
        )}
        {/*
          What the tie's row actually did, under the row's own words
          (Phase 10d). Reading I-30 supplies the mechanical floor for
          the nine rows that print none, and this is where a player
          reads it: an injury and whose it was, the three words of a
          Deity, how many Minions arrived. Each is labelled with the
          reading it stands on, never with the book's authority.
        */}
        {c.event?.injury == null ? null : (
          <Slip dashed style={styles.pad} testID="event-injury">
            <View style={styles.between}>
              <Text style={styles.strong}>
                {fill(t('ui.combat.event.injury'), {
                  n: c.event.injury.amount,
                  who: t(`ui.combat.event.injury.${c.event.injury.target}`),
                })}
              </Text>
              <Source cite={t('ui.combat.event.injury.cite')} />
            </View>
          </Slip>
        )}
        {c.event?.deity == null ? null : (
          <Slip dashed style={styles.pad} testID="event-deity">
            <View style={styles.between}>
              <Text style={styles.strong}>
                {fill(t('ui.combat.event.deity'), {
                  name: c.event.deity.name,
                  action: c.event.deity.action,
                  object: c.event.deity.object,
                })}
              </Text>
              <Source cite={t('ui.combat.event.deity.cite')} />
            </View>
          </Slip>
        )}
        {c.event?.minions == null ? null : (
          <Slip dashed style={styles.pad} testID="event-minions">
            <View style={styles.between}>
              <Text style={styles.strong}>
                {fill(t('ui.combat.event.minions'), {
                  n: c.event.minions.count,
                  face: c.event.minions.face,
                })}
              </Text>
              <Source cite={t('ui.combat.event.minions.cite')} />
            </View>
          </Slip>
        )}

        {actions(state, c).map((a) => (
          <MenuButton key={a.id} testID={`act-${a.id}`} title={a.title} note="" line={a.line} source={a.cite} enabled={a.enabled} onPress={() => dispatch(a.action)} />
        ))}
      </ScrollView>

      <View style={styles.foot}>
        {state.manualOpen && canRoll ? (
          <View style={styles.manual}>
            <ManualDice manual={state.manual} onFace={(face) => dispatch({ type: 'manual.face', face })} />
          </View>
        ) : null}
        <RollBar
          primaryText={c.over.ended || standing(c).length === 0 ? t('ui.combat.primary.over') : state.manual.length === 2 ? t('ui.roll.manual') : t('ui.combat.primary.roll')}
          onPrimary={() => dispatch({ type: 'combat.round' })}
          primaryDisabled={!canRoll}
          onManual={() => dispatch({ type: 'manual.toggle' })}
          overrides={state.overrides}
          right={c.over.ended || standing(c).length === 0 ? t('ui.combat.leave.go') : t('ui.combat.leave.flee')}
          onRight={() => dispatch({ type: 'combat.leave' })}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  sides: { flexDirection: 'row', gap: 8, marginTop: 10, marginHorizontal: 14 },
  side: { flex: 1, padding: 8 },
  /** A body that has fallen: still listed, visibly out of the fight. */
  sideDown: { opacity: 0.45 },
  /** The card the winner's option applies to. */
  sideAimed: { borderColor: color.vermilion },
  /** The whole card is the tap target; it sits under the text. */
  aimHit: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sideNote: { fontFamily: font.mono, fontSize: 9, letterSpacing: 0.6, marginTop: 2, color: color.vermilion },
  /**
   * The band: one card per opponent, inside the scrolling body.
   *
   * It scrolls with the menu rather than sitting above it in the fixed
   * frame, because five Woodgatherers would otherwise leave a phone no
   * room for the rows that act on them.
   */
  band: { gap: 6 },
  bandTap: { fontFamily: font.mono, fontSize: 10, lineHeight: 15, color: color.ink },
  sideTitle: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  dice: { flexDirection: 'row', gap: 5, marginVertical: 6 },
  sideLine: { fontFamily: font.mono, fontSize: 10, lineHeight: 16, color: color.ink },
  sideTotal: { fontFamily: font.sans, fontSize: 32, fontWeight: '800', lineHeight: 34, marginTop: 4, color: color.ink },
  foeLine: { marginTop: 6, marginHorizontal: 14, fontFamily: font.serif, fontSize: 13, lineHeight: 18, fontStyle: 'italic', color: color.ink },
  banner: { marginTop: 8, marginHorizontal: 14, borderWidth: 3, borderColor: color.ink, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  bannerLabel: { flexShrink: 1, fontFamily: font.sans, fontSize: 12, fontWeight: '800', letterSpacing: 1, color: color.paper },
  bannerValue: { fontFamily: font.sans, fontSize: 30, fontWeight: '800', lineHeight: 32, color: color.paper },
  body: { flex: 1, marginTop: 8 },
  bodyContent: { paddingHorizontal: 14, gap: 6 },
  eventHead: { backgroundColor: color.vermilion, paddingVertical: 5, paddingHorizontal: 9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  eventTitle: { flexShrink: 1, fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  eventBody: { padding: 9, gap: 6 },
  eventText: { fontFamily: font.serif, fontSize: 15, lineHeight: 21, color: color.ink },
  eventLine: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, fontStyle: 'italic', color: color.ink },
  small: { fontFamily: font.mono, fontSize: 10, lineHeight: 15, color: color.ink },
  mono: { fontFamily: font.mono, fontSize: 11, color: color.ink },
  strong: { flexShrink: 1, fontFamily: font.sans, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: color.ink },
  /** Inside a dashed slip already: his own rule needs no top margin. */
  narrator: { marginTop: 0, paddingTop: 0, borderTopWidth: 0 },
  pad: { padding: 9 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 5 },
  blow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  blowText: { marginLeft: 'auto', alignItems: 'flex-end', flexShrink: 1 },
  /** The naming card's rows: a label, a control, a note under it. */
  field: { marginTop: 8, gap: 4 },
  label: { fontFamily: font.sans, fontSize: 9, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  input: {
    borderWidth: 2,
    borderColor: color.ink,
    padding: 7,
    fontFamily: font.serif,
    fontSize: 14,
    color: color.ink,
  },
  describe: { height: 60 },
  values: { flexDirection: 'row', gap: 6 },
  grow: { flex: 1 },
  words: { fontFamily: font.sans, fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: color.vermilion },
  foot: { paddingTop: 8, paddingHorizontal: 14, paddingBottom: 14 },
  manual: { marginBottom: 0 },
})
