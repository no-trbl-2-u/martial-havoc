/**
 * Combat: both rolls, both Proficiencies, both totals and the difference
 * in one glance; the winner's four options as a menu; a tie as an
 * Unexpected Event; the retreat row that rolls Morale (spec.md, Horizon;
 * design prototype, "COMBAT").
 */
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { effectFor, t, techniqueById, treasureFoeById } from '@martial-havoc/content'
import type { AttackStrength } from '@martial-havoc/engine'
import { fill } from '../lib/fill'
import type { Action, Combat, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Die } from '../components/Die'
import { ManualDice } from '../components/ManualDice'
import { MenuButton } from '../components/MenuButton'
import { RollBar } from '../components/RollBar'
import { Slip } from '../components/Slip'

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

type Act = { id: string; title: string; cite: string; line: string; enabled: boolean; action: Action }

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
  return (
    <View style={styles.screen}>
      <View style={styles.sides}>
        <Side title={t('ui.combat.you')} strength={c.last?.master ?? null} prefix="mine" idle={fill(t('ui.combat.mine.idle'), { skill: state.sheet.skill, name: mine.name.toUpperCase(), value: mine.value })} />
        <Side title={foe.name.toUpperCase()} strength={c.last?.opponent ?? null} prefix="theirs" idle={fill(t('ui.combat.theirs.idle'), { end: c.foeEndurance, name: theirs.name.toUpperCase(), value: theirs.value })} />
      </View>

      <View style={[styles.banner, { backgroundColor: b.bg }]}>
        <Text style={styles.bannerLabel}>{b.label}</Text>
        <Text testID="banner-value" style={styles.bannerValue}>{b.value}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {c.event === null ? null : (
          <Slip borderColor={color.vermilion} testID="event">
            <View style={styles.eventHead}>
              <Text style={styles.eventTitle}>{fill(t('ui.combat.event.heading'), { n: c.event.roll.total })}</Text>
              <Text style={styles.eventCite}>{t('ui.combat.event.cite')}</Text>
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
            <Text style={styles.small}>{t('ui.combat.morale.cite')}</Text>
          </Slip>
        )}
        {c.blow === null ? null : (
          <Slip style={[styles.pad, styles.blow]} testID="blow">
            <Die size={30} face={c.blow.roll.a} testID="die-blow-a" />
            <Die size={30} face={c.blow.roll.b} testID="die-blow-b" />
            <View style={styles.blowText}>
              <Text style={styles.strong}>{c.blow.landed ? t('ui.combat.blow.landed') : t('ui.combat.blow.missed')}</Text>
              <Text style={styles.small}>{t('ui.combat.blow.cite')}</Text>
            </View>
          </Slip>
        )}
        {c.techniqueLine === null ? null : (
          <Slip style={styles.pad} testID="technique-line">
            <Text style={styles.eventText}>{c.techniqueLine}</Text>
          </Slip>
        )}
        {actions(state, c).map((a) => (
          <MenuButton key={a.id} testID={`act-${a.id}`} title={a.title} note={a.cite} line={a.line} enabled={a.enabled} onPress={() => dispatch(a.action)} />
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
  banner: { marginTop: 8, marginHorizontal: 14, borderWidth: 3, borderColor: color.ink, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  bannerLabel: { flexShrink: 1, fontFamily: font.sans, fontSize: 12, fontWeight: '800', letterSpacing: 1, color: color.paper },
  bannerValue: { fontFamily: font.sans, fontSize: 30, fontWeight: '800', lineHeight: 32, color: color.paper },
  body: { flex: 1, marginTop: 8 },
  bodyContent: { paddingHorizontal: 14, gap: 6 },
  eventHead: { backgroundColor: color.vermilion, paddingVertical: 5, paddingHorizontal: 9, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  eventTitle: { fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  eventCite: { fontFamily: font.sans, fontSize: 10, fontWeight: '800', color: color.paper },
  eventBody: { padding: 9, gap: 6 },
  eventText: { fontFamily: font.serif, fontSize: 15, lineHeight: 21, color: color.ink },
  eventLine: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, fontStyle: 'italic', color: color.ink },
  small: { fontFamily: font.mono, fontSize: 10, lineHeight: 15, color: color.ink },
  mono: { fontFamily: font.mono, fontSize: 11, color: color.ink },
  strong: { flexShrink: 1, fontFamily: font.sans, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: color.ink },
  pad: { padding: 9 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 5 },
  blow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  blowText: { marginLeft: 'auto', alignItems: 'flex-end', flexShrink: 1 },
  foot: { paddingTop: 8, paddingHorizontal: 14, paddingBottom: 14 },
  manual: { marginBottom: 0 },
})
