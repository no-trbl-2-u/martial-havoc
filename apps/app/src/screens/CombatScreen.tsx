/**
 * Combat: both rolls, both Proficiencies, both totals and the difference
 * in one glance; the winner's four options as a menu; a tie as an
 * Unexpected Event; the retreat row that rolls Morale (spec.md, Horizon;
 * design prototype, "COMBAT").
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { effectFor, t, techniqueById, treasureFoeById } from '@martial-havoc/content'
import { aftermath, eventReading } from '@martial-havoc/engine'
import type { AttackStrength } from '@martial-havoc/engine'
import { fill } from '../lib/fill'
import { momentOfFightEnd, narrate } from '../lib/narrator'
import type { Action, Combat, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Die } from '../components/Die'
import { ManualDice } from '../components/ManualDice'
import { MenuButton } from '../components/MenuButton'
import { RollBar } from '../components/RollBar'
import { Narrator } from '../components/Narrator'
import { Slip } from '../components/Slip'
import { Source } from '../components/Source'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** One side's card: two dice, the sum and what was added, the total. */
const Side = ({ title, strength, idle, prefix }: { title: string; strength: AttackStrength | null; idle: string; prefix: string }) => (
  <Slip style={styles.side}>
    <Text style={styles.sideTitle}>{title}</Text>
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
  </Slip>
)

/**
 * A body on the floor: the foe's, or the Master's (R26, R06).
 *
 * The phase before this one ended a fight by simply changing the menu -
 * the loot row appeared and the foe's ENDURANCE read zero, and a player
 * who was reading the dice rather than the numbers never saw the moment
 * happen. The slip is the moment: who fell, and how.
 */
const FallenSlip = ({ title, how, text }: { title: string; how: string; text?: string }) => (
  <Slip borderColor={color.ink} testID="fallen">
    <View style={styles.eventHead}>
      <Text style={styles.eventTitle}>{title}</Text>
      <Source cite={t('ui.combat.fallen.cite')} />
    </View>
    <View style={styles.eventBody}>
      <Text testID="fallen-how" style={styles.eventText}>{how}</Text>
      {text === undefined ? null : <Text style={styles.eventLine}>{text}</Text>}
    </View>
  </Slip>
)

type Act = { id: string; title: string; cite: string; line: string; enabled: boolean; action: Action }

/** Did the tie land on a row that says the fight resumes (R32, rows 6 and 8)? */
const resumes = (c: Combat): boolean => {
  if (c.event === null) return false
  const reading = eventReading(c.event.roll.total)
  return reading !== undefined && aftermath(reading).resumes
}

/** The menu for the fight's current state: R25's four when ahead, else what the phase allows. */
const actions = (state: RecordState, c: Combat): readonly Act[] => {
  const won = c.last?.outcome === 'master-wins'
  const diff = c.last?.difference ?? 0
  if (c.over.ended && c.over.reason === 'master-down')
    return [{ id: 'fall', title: t('ui.combat.act.fall'), cite: t('ui.combat.act.fall.cite'), line: t('ui.combat.act.fall.line'), enabled: true, action: { type: 'combat.leave' } }]
  if (c.foeEndurance === 0)
    return [
      { id: 'loot', title: t('ui.combat.act.loot'), cite: t('ui.combat.act.loot.cite'), line: t('ui.combat.act.loot.line'), enabled: !c.looted, action: { type: 'combat.loot' } },
      { id: 'go-on', title: t('ui.combat.act.go-on'), cite: t('ui.combat.act.go-on.cite'), line: t('ui.combat.act.go-on.line'), enabled: true, action: { type: 'combat.leave' } },
    ]
  if (c.event !== null) {
    const rows: Act[] = []
    // Rows 6 and 8 say what happens, so the row that acts on them comes
    // first: the fight is not over, whatever `endsFight` reported.
    if (resumes(c))
      rows.push({ id: 'resume', title: t('ui.combat.act.resume'), cite: t('ui.combat.act.resume.cite'), line: t('ui.combat.act.resume.line'), enabled: true, action: { type: 'combat.resume' } })
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
  const usable = state.sheet.techniques
    .map((id) => ({ id, effect: effectFor(id), name: techniqueById(id)?.name ?? id }))
    .filter((x) => x.effect?.timing === 'combat-winner-option')
  const technique = usable[0]
  return [
    { id: 'strike', title: t('ui.combat.act.strike'), cite: t('ui.combat.act.strike.cite'), line: won ? fill(t('ui.combat.act.strike.won'), { n: diff }) : t('ui.combat.act.strike.lost'), enabled: won, action: { type: 'combat.strike' } },
    {
      id: 'technique',
      title: t('ui.combat.act.technique'),
      cite: t('ui.combat.act.technique.cite'),
      line: technique === undefined ? t('ui.combat.act.technique.none') : fill(t('ui.combat.act.technique.line'), { name: technique.name, cost: technique.effect?.cost ?? 0 }),
      enabled: won && technique !== undefined,
      action: { type: 'combat.technique', id: technique?.id ?? '' },
    },
    { id: 'weapon', title: t('ui.combat.act.weapon'), cite: t('ui.combat.act.weapon.cite'), line: t('ui.combat.act.weapon.line'), enabled: won, action: { type: 'combat.weapon' } },
    { id: 'opening', title: t('ui.combat.act.opening'), cite: t('ui.combat.act.opening.cite'), line: t('ui.combat.act.opening.line'), enabled: won, action: { type: 'combat.opening' } },
  ]
}

const banner = (state: RecordState, c: Combat): { label: string; value: string; bg: string } => {
  if (c.over.ended && c.over.reason === 'master-down') return { label: t('ui.combat.banner.down'), value: '0', bg: color.ink }
  // Before anything has been rolled, an ambush says whose round this is
  // rather than inviting one (I-08a).
  if (c.ambush && c.last === null) return { label: t('ui.combat.banner.ambush'), value: '-', bg: color.vermilion }
  const r = c.last
  if (r === null) return { label: t('ui.combat.banner.roll'), value: '-', bg: color.ink }
  if (r.difference > 0) return { label: t('ui.combat.banner.ahead'), value: String(r.difference), bg: color.vermilion }
  if (r.difference < 0) return { label: t('ui.combat.banner.behind'), value: String(-r.difference), bg: color.ink }
  return { label: t('ui.combat.banner.tie'), value: '0', bg: color.vermilion }
}

const moraleText = (m: NonNullable<Combat['morale']>): string =>
  m.result === 'flee'
    ? t('ui.combat.morale.flee')
    : m.result === 'cautious-retreat'
      ? t('ui.combat.morale.cautious')
      : fill(t('ui.combat.morale.rally'), { n: m.reinforcements })

export const CombatScreen = ({ state, dispatch }: Props) => {
  const c = state.combat
  const foe = c === null ? undefined : treasureFoeById(c.foeId)
  if (c === null || foe === undefined) return null
  const b = banner(state, c)
  const mine = state.sheet.proficiencies.reduce((best, p) => (p.value > best.value ? p : best), state.sheet.proficiencies[0] ?? { name: '', value: 0 })
  const theirs = foe.proficiencies.reduce((best, p) => (p.value > best.value ? p : best), foe.proficiencies[0] ?? { name: '', value: 0 })
  const canRoll = !c.over.ended && c.last === null && !c.opening
  // Filled here rather than in `banner`: the banner is the rule's word
  // for how the fight ended, this is the narrator's, and they are two
  // different jobs on two different lines (plan/VOICE.md).
  const end = c.over.ended ? narrate(momentOfFightEnd(c.over.reason), state.sheet.name) : null
  return (
    <View style={styles.screen} testID="combat">
      <View style={styles.sides}>
        <Side title={t('ui.combat.you')} strength={c.last?.master ?? null} prefix="mine" idle={fill(t('ui.combat.mine.idle'), { skill: state.sheet.skill, name: mine.name.toUpperCase(), value: mine.value })} />
        <Side title={foe.name.toUpperCase()} strength={c.last?.opponent ?? null} prefix="theirs" idle={fill(t('ui.combat.theirs.idle'), { end: c.foeEndurance, name: theirs.name.toUpperCase(), value: theirs.value })} />
      </View>
      {foe.description.length === 0 ? null : (
        <Text testID="foe-description" style={styles.foeLine}>
          {foe.description}
        </Text>
      )}

      <View style={[styles.banner, { backgroundColor: b.bg }]}>
        <Text style={styles.bannerLabel}>{b.label}</Text>
        <Text testID="banner-value" style={styles.bannerValue}>{b.value}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/*
          The three things that can be true before the round is rolled,
          each said once: whose round this is, and the two marks a tie
          can leave on the next Attack Strength (I-08a, I-30).
        */}
        {c.ambush && c.last === null ? (
          <Slip dashed style={styles.pad} testID="ambush">
            <Text style={styles.small}>{t('ui.combat.ambush.note')}</Text>
            <Source cite={t('ui.combat.ambush.cite')} />
          </Slip>
        ) : null}
        {state.marked === null ? null : (
          <Slip dashed style={styles.pad} testID="marked">
            <Text style={styles.small}>
              {fill(t('ui.combat.marked'), { who: t(`ui.combat.marked.${state.marked}`) })}
            </Text>
          </Slip>
        )}
        {state.weaponLost ? (
          <Slip dashed style={styles.pad} testID="weapon-lost">
            <Text style={styles.small}>{t('ui.combat.weapon-lost')}</Text>
          </Slip>
        ) : null}
        {c.over.ended && c.over.reason === 'master-down' ? (
          <FallenSlip
            title={t('ui.combat.fallen.master')}
            how={t('ui.combat.fallen.master.text')}
          />
        ) : c.foeEndurance === 0 ? (
          <FallenSlip
            title={fill(t('ui.combat.fallen.foe'), { name: foe.name.toUpperCase() })}
            how={
              c.blow?.landed === true
                ? t('ui.combat.fallen.blow')
                : fill(t('ui.combat.fallen.difference'), { n: c.felledBy ?? c.last?.difference ?? 0 })
            }
          />
        ) : null}
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
        {c.deity === null ? null : (
          <Slip dashed borderColor={color.vermilion} style={styles.pad} testID="deity">
            <Text style={styles.strong}>
              {fill(t('ui.combat.deity'), { name: c.deity.name, action: c.deity.action, object: c.deity.object })}
            </Text>
            <Text style={styles.small}>{t('ui.combat.deity.note')}</Text>
            <Source cite={t('ui.combat.deity.cite')} />
          </Slip>
        )}
        {c.minions === null ? null : (
          <Slip dashed borderColor={color.vermilion} style={styles.pad} testID="minions">
            <View style={styles.between}>
              <Text style={styles.strong}>{fill(t('ui.combat.minions'), { n: c.minions.count })}</Text>
              <Text style={styles.mono}>{fill(t('ui.combat.morale.die'), { n: c.minions.face })}</Text>
            </View>
            <Source cite={t('ui.combat.minions.cite')} />
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
        {c.techniqueLine === null ? null : (
          <Slip style={styles.pad} testID="technique-line">
            <Text style={styles.eventText}>{c.techniqueLine}</Text>
          </Slip>
        )}
        {/*
          The narrator speaks once a fight is over, and only then: mid-fight
          the screen is already dense with the book's own rows, and VOICE.md
          keeps him off anything that is still a live choice ("A choice the
          menu still offers, foreclosed or recommended"). A tie resolved by
          an Unexpected Event prints the table's own line above, so
          `momentOfFightEnd` returns silence for it rather than talking over
          it (Phase 10a).
        */}
        {end === null ? null : (
          <Slip dashed style={styles.pad} testID="fight-end">
            <Narrator testID="combat-narrator" line={end} style={styles.narrator} />
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
          primaryText={c.over.ended || c.foeEndurance === 0 ? t('ui.combat.primary.over') : state.manual.length === 2 ? t('ui.roll.manual') : t('ui.combat.primary.roll')}
          onPrimary={() => dispatch({ type: 'combat.round' })}
          primaryDisabled={!canRoll}
          onManual={() => dispatch({ type: 'manual.toggle' })}
          overrides={state.overrides}
          right={c.over.ended || c.foeEndurance === 0 ? t('ui.combat.leave.go') : t('ui.combat.leave.flee')}
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
  foot: { paddingTop: 8, paddingHorizontal: 14, paddingBottom: 14 },
  manual: { marginBottom: 0 },
})
