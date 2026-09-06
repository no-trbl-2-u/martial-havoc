/**
 * The header: the panels, right-aligned, and nothing else.
 *
 * Five destinations at 390px is more than one row of buttons holds, so
 * the nav wraps. Each is a toggle back to the beat, which keeps the
 * whole app one tap from play — there is no back stack to get lost in
 * because there is no router (phase 8 brief, decision 3).
 *
 * `nav` false renders nothing at all: while a Master is being made
 * there is no play to leave, and the room the row took goes to the
 * page below (operator request, 2026-09-06). The strip then takes its
 * own margin from the top of the leaf (App.tsx).
 *
 * The adventure's title slip that used to sit here is gone (operator
 * request, 2026-09-06): the title page names the adventure once.
 */
import { StyleSheet, View } from 'react-native'
import { t } from '@martial-havoc/content'
import type { Screen } from '../state/types'
import { Button } from './Button'

type Props = {
  readonly screen: Screen
  /** Show the panel buttons at all. */
  readonly nav: boolean
  readonly onNav: (screen: Screen) => void
}

export const Header = ({ screen, nav, onNav }: Props) =>
  !nav ? null : (
  <View style={styles.row}>
      <View style={styles.nav} testID="nav">
        <Button small text={t('ui.nav.rules')} onPress={() => onNav(screen === 'rules' ? 'beat' : 'rules')} />
        <Button
          small
          text={t('ui.nav.record')}
          onPress={() => onNav(screen === 'record' ? 'beat' : 'record')}
        />
        <Button
          small
          text={t('ui.nav.village')}
          onPress={() => onNav(screen === 'village' ? 'beat' : 'village')}
        />
        <Button small text={t('ui.nav.map')} onPress={() => onNav(screen === 'region' ? 'beat' : 'region')} />
        <Button
          small
          text={t('ui.nav.about')}
          onPress={() => onNav(screen === 'about' ? 'beat' : 'about')}
        />
      </View>
  </View>
  )

const styles = StyleSheet.create({
  row: { paddingTop: 34, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'flex-end' },
  nav: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, flexShrink: 1 },
})
