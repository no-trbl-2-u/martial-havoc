/** The header slip: the adventure, where the Master is, and the two panels. */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'
import type { Screen } from '../state/types'
import { Button } from './Button'
import { Slip } from './Slip'

type Props = {
  readonly place: string
  readonly screen: Screen
  readonly onNav: (screen: Screen) => void
}

export const Header = ({ place, screen, onNav }: Props) => (
  <View style={styles.row}>
    <Slip style={styles.title}>
      <Text style={styles.adventure}>{t('ui.adventure.title')}</Text>
      <Text testID="place" style={styles.place}>{place}</Text>
    </Slip>
    <View style={styles.nav}>
      <Button small text={t('ui.nav.rules')} onPress={() => onNav(screen === 'rules' ? 'beat' : 'rules')} />
      <Button small text={t('ui.nav.map')} onPress={() => onNav(screen === 'region' ? 'beat' : 'region')} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  row: { paddingTop: 34, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { paddingVertical: 5, paddingHorizontal: 9, flexShrink: 1 },
  adventure: { fontFamily: font.sans, fontSize: 12, fontWeight: '800', letterSpacing: 1.7, color: color.ink },
  place: { fontFamily: font.mono, fontSize: 10, marginTop: 2, color: color.ink },
  nav: { flexDirection: 'row', gap: 6 },
})
