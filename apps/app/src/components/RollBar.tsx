/**
 * The bottom of the beat and the fight: roll, or use your own dice, and
 * the two counters under them (overrides left, deeds or the exit right).
 *
 * `onManual` is optional so a bar can be one button; on the beat MY
 * DICE opens the roll card's picker (design/roll-modal, reading A) and
 * is disabled with the primary when the menu offers nothing to roll.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { color, font } from '../theme/tokens'
import { Button } from './Button'

type Props = {
  readonly primaryText: string
  readonly onPrimary: () => void
  readonly primaryDisabled?: boolean
  readonly onManual?: () => void
  readonly manualDisabled?: boolean
  readonly overrides: number
  /** Plain text on the right, or a pressable one. */
  readonly right: string
  readonly onRight?: () => void
}

export const RollBar = ({ primaryText, onPrimary, primaryDisabled = false, onManual, manualDisabled = false, overrides, right, onRight }: Props) => (
  <View>
    <View style={styles.buttons}>
      <Button testID="primary" primary text={primaryText} onPress={onPrimary} disabled={primaryDisabled} style={styles.primary} />
      {onManual === undefined ? null : (
        <Button testID="my-dice" text={t('ui.manual.open')} onPress={onManual} disabled={manualDisabled} style={styles.manual} />
      )}
    </View>
    <View style={styles.counters}>
      <Text style={styles.counter}>{fill(t('ui.overrides'), { n: overrides })}</Text>
      {onRight === undefined ? (
        <Text style={styles.counter}>{right}</Text>
      ) : (
        <Text accessibilityRole="button" onPress={onRight} style={[styles.counter, styles.link]}>
          {right}
        </Text>
      )}
    </View>
  </View>
)

const styles = StyleSheet.create({
  buttons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: { flex: 1.3 },
  manual: { flex: 1 },
  counters: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  counter: { fontFamily: font.mono, fontSize: 10, color: color.dim },
  link: { textDecorationLine: 'underline' },
})
