/**
 * The bottom of the beat and the fight: roll, or use your own dice, and
 * the two counters under them (overrides left, deeds or the exit right).
 *
 * Both buttons are optional so a bar can be one button. The beat's bar
 * is MY DICE alone, a toggle: on, the next move's Event die is entered
 * by hand on the roll card (design/roll-modal, reading A). The fight's
 * bar keeps ROLL THE ROUND beside its own MY DICE.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { color, font } from '../theme/tokens'
import { Button } from './Button'

type Props = {
  /** The primary button, where the bar has one; the beat's does not. */
  readonly primaryText?: string
  readonly onPrimary?: () => void
  readonly primaryDisabled?: boolean
  readonly onManual?: () => void
  readonly manualDisabled?: boolean
  /** MY DICE as a toggle that is on: drawn as the primary weight. */
  readonly manualOn?: boolean
  readonly overrides: number
  /** Plain text on the right, or a pressable one. */
  readonly right: string
  readonly onRight?: () => void
}

export const RollBar = ({ primaryText, onPrimary, primaryDisabled = false, onManual, manualDisabled = false, manualOn = false, overrides, right, onRight }: Props) => (
  <View>
    <View style={styles.buttons}>
      {primaryText === undefined || onPrimary === undefined ? null : (
        <Button testID="primary" primary text={primaryText} onPress={onPrimary} disabled={primaryDisabled} style={styles.primary} />
      )}
      {onManual === undefined ? null : (
        <Button
          testID="my-dice"
          primary={manualOn}
          text={manualOn ? t('ui.manual.on') : t('ui.manual.open')}
          onPress={onManual}
          disabled={manualDisabled}
          style={styles.manual}
        />
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
