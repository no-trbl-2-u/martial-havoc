/**
 * The frame: a binding down the left, and to its right one leaf: the
 * header, the attribute strip, and one screen under them. Changing
 * screen turns the whole leaf over the spine (`components/Leaf.tsx`);
 * the binding stays.
 *
 * Every launch opens on the title page (`screens/TitleScreen.tsx`).
 * Whether it has been passed is this component's own state, never the
 * record's: the record remembers where play was, and START turns the
 * leaf back to it. The Phase 1 garden page this replaces was a
 * placeholder; this is the design prototype (design/prototype) built
 * on the real engine and the real content.
 *
 * Dice: the table's random d6, with any `?dice=` faces served first so
 * a browser test can name its rolls. The source is made once.
 */
import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { parseDiceQuery, queued, randomSource } from './dice/random'
import { useRecord } from './hooks/useRecord'
import { color, frameWidth } from './theme/tokens'
import { AttributeStrip } from './components/AttributeStrip'
import type { StripValues } from './components/AttributeStrip'
import { skillAfterTraining } from './state/creation'
import type { RecordState } from './state/types'
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
import { TitleScreen } from './screens/TitleScreen'

const search = (): string => {
  try {
    return (globalThis as { location?: { search?: string } }).location?.search ?? ''
  } catch {
    return ''
  }
}

/** What the strip shows: the sheet in play, or the Master being made as far as it has been rolled. */
const stripValues = (state: RecordState): StripValues => {
  const c = state.creation
  if (c === null) return state.sheet
  return {
    skill: c.skill === null ? null : skillAfterTraining(c),
    endurance: c.endurance?.current ?? null,
    luck: c.luck?.current ?? null,
    gold: c.status?.gold ?? null,
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
  // Past the title page yet? A Master still being made always opens
  // on creation, whatever screen a saved session was left on.
  const [opened, setOpened] = useState(false)
  const start = () => {
    if (state.creation !== null && state.screen !== 'creation') dispatch({ type: 'nav', screen: 'creation' })
    setOpened(true)
  }
  const making = state.creation !== null
  return (
    <View style={styles.root}>
      <View style={styles.frame} testID="frame">
        <Binding />
        <Leaf page={opened ? state.screen : 'title'}>
          {opened ? (
          <View style={styles.page}>
          <Header screen={state.screen} nav={!making} onNav={(screen) => dispatch({ type: 'nav', screen })} />
          {/* No header while making a Master: the strip starts the page. */}
          <View style={[styles.strip, making && styles.stripFirst]}>
            <AttributeStrip values={stripValues(state)} />
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
          ) : (
            <TitleScreen onStart={start} />
          )}
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
  stripFirst: { marginTop: 14 },
})
