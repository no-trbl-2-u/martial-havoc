/**
 * The frame: a binding down the left, the header and the attribute
 * strip, and one of four screens under them. The Phase 1 garden page
 * this replaces was a placeholder; this is the design prototype
 * (design/prototype) built on the real engine and the real content.
 *
 * Dice: the table's random d6, with any `?dice=` faces served first so
 * a browser test can name its rolls. The source is made once.
 */
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { beatForArea, t } from '@martial-havoc/content'
import { parseDiceQuery, queued, randomSource } from './dice/random'
import { layoutFromQuery } from './layouts/types'
import { useRecord } from './hooks/useRecord'
import { fill } from './lib/fill'
import type { RecordState } from './state/types'
import { color, frameWidth } from './theme/tokens'
import { AttributeStrip } from './components/AttributeStrip'
import { Binding } from './components/Binding'
import { Header } from './components/Header'
import { BeatScreen } from './screens/BeatScreen'
import { CombatScreen } from './screens/CombatScreen'
import { RegionScreen } from './screens/RegionScreen'
import { RulesScreen } from './screens/RulesScreen'

/** The header's second line, per screen. */
const placeLine = (state: RecordState): string => {
  switch (state.screen) {
    case 'combat':
      return fill(t('ui.combat.place'), { n: state.combat?.round ?? 1 })
    case 'rules':
      return t('ui.rules.place')
    case 'region':
      return t('ui.region.place')
    case 'beat': {
      const beat = beatForArea(state.area)
      return fill(t('ui.beat.place'), { area: state.area, name: (beat?.name ?? '').toUpperCase() })
    }
  }
}

const search = (): string => {
  try {
    return (globalThis as { location?: { search?: string } }).location?.search ?? ''
  } catch {
    return ''
  }
}

/** Root component. */
export const App = () => {
  const table = useMemo(() => randomSource(), [])
  const dice = useMemo(() => queued(parseDiceQuery(search()), table), [table])
  // Phase 8a: which candidate layout the beat draws in. Temporary —
  // 8b keeps the operator's pick and deletes the flag.
  const layout = useMemo(() => layoutFromQuery(search()), [])
  const [state, dispatch] = useRecord(dice, table)
  return (
    <View style={styles.root}>
      <View style={styles.frame} testID="frame">
        <Binding />
        <View style={styles.page}>
          <Header place={placeLine(state)} screen={state.screen} onNav={(screen) => dispatch({ type: 'nav', screen })} />
          <View style={styles.strip}>
            <AttributeStrip sheet={state.sheet} />
          </View>
          {state.screen === 'beat' ? <BeatScreen state={state} dispatch={dispatch} layout={layout} /> : null}
          {state.screen === 'combat' ? <CombatScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'rules' ? <RulesScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'region' ? <RegionScreen state={state} dispatch={dispatch} /> : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.frame, alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: frameWidth, flexDirection: 'row', backgroundColor: color.ochre, borderColor: color.ink, borderLeftWidth: 1, borderRightWidth: 1 },
  page: { flex: 1 },
  strip: { marginHorizontal: 14 },
})
