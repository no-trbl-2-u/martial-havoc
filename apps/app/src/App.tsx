/**
 * The frame: a binding down the left, and to its right one leaf: the
 * header, the attribute strip, and one screen under them. Changing
 * screen turns the whole leaf over the spine (`components/Leaf.tsx`);
 * the binding stays. The Phase 1 garden page this replaces was a
 * placeholder; this is the design prototype (design/prototype) built
 * on the real engine and the real content.
 *
 * Dice: the table's random d6, with any `?dice=` faces served first so
 * a browser test can name its rolls. The source is made once.
 */
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { t, theFiveTreasuresAreaById } from '@martial-havoc/content'
import { parseDiceQuery, queued, randomSource } from './dice/random'
import { useRecord } from './hooks/useRecord'
import { fill } from './lib/fill'
import type { RecordState } from './state/types'
import { color, frameWidth } from './theme/tokens'
import { AttributeStrip } from './components/AttributeStrip'
import { Binding } from './components/Binding'
import { Header } from './components/Header'
import { Leaf } from './components/Leaf'
import { BeatScreen } from './screens/BeatScreen'
import { CreationScreen } from './screens/CreationScreen'
import { VillageScreen } from './screens/VillageScreen'
import { RecordScreen } from './screens/RecordScreen'
import { CombatScreen } from './screens/CombatScreen'
import { RegionScreen } from './screens/RegionScreen'
import { RulesScreen } from './screens/RulesScreen'
import { AboutScreen } from './screens/AboutScreen'

/** The header's second line, per screen. */
const placeLine = (state: RecordState): string => {
  switch (state.screen) {
    case 'combat':
      return fill(t('ui.combat.place'), { n: state.combat?.round ?? 1 })
    case 'rules':
      return t('ui.rules.place')
    case 'region':
      return t('ui.region.place')
    case 'creation':
      return t('ui.creation.place')
    case 'village':
      return t('ui.village.place')
    case 'record':
      return t('ui.record.place')
    case 'about':
      return t('ui.about.place')
    case 'beat': {
      const area = theFiveTreasuresAreaById(state.cave.area)
      return fill(t('ui.beat.place'), { area: area?.area ?? '', name: (area?.name ?? '').toUpperCase() })
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
  // One timestamp for the life of the screen: a component reads no
  // clock, and a value that changed every render would rewrite the
  // export field under the player's cursor.
  const exportedAt = useMemo(() => new Date().toISOString(), [])
  const [state, dispatch] = useRecord(dice, table)
  return (
    <View style={styles.root}>
      <View style={styles.frame} testID="frame">
        <Binding />
        <Leaf page={state.screen}>
          <View style={styles.page}>
          <Header place={placeLine(state)} screen={state.screen} onNav={(screen) => dispatch({ type: 'nav', screen })} />
          <View style={styles.strip}>
            <AttributeStrip sheet={state.sheet} blank={state.creation !== null} />
          </View>
          {state.screen === 'creation' ? <CreationScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'village' ? <VillageScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'record' ? (
            <RecordScreen state={state} dispatch={dispatch} at={exportedAt} />
          ) : null}
          {state.screen === 'beat' ? <BeatScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'combat' ? <CombatScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'rules' ? <RulesScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'region' ? <RegionScreen state={state} dispatch={dispatch} /> : null}
          {state.screen === 'about' ? <AboutScreen dispatch={dispatch} /> : null}
          </View>
        </Leaf>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // `overflow: 'hidden'`: a leaf mid-turn projects past the frame, and
  // the document must not grow a sideways scroll for it.
  root: { flex: 1, backgroundColor: color.frame, alignItems: 'center', overflow: 'hidden' },
  frame: { flex: 1, width: '100%', maxWidth: frameWidth, flexDirection: 'row', backgroundColor: color.ochre, borderColor: color.ink, borderLeftWidth: 1, borderRightWidth: 1 },
  page: { flex: 1 },
  strip: { marginHorizontal: 14 },
})
