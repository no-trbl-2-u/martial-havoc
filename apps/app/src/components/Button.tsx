/** The two button weights: ink on paper (primary) and paper with an ink border. */
import { Pressable, StyleSheet, Text } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { color, font } from '../theme/tokens'

type Props = {
  readonly text: string
  readonly onPress: () => void
  readonly primary?: boolean
  readonly small?: boolean
  readonly disabled?: boolean
  readonly style?: StyleProp<ViewStyle>
  readonly testID?: string
}

export const Button = ({ text, onPress, primary = false, small = false, disabled = false, style, testID }: Props) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={[styles.base, primary ? styles.primary : styles.plain, small && styles.small, disabled && styles.disabled, style]}
  >
    <Text style={[styles.text, primary ? styles.onInk : styles.onPaper, small && styles.smallText]}>{text}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  primary: { backgroundColor: color.ink },
  plain: { backgroundColor: color.paper, borderWidth: 3, borderColor: color.ink, paddingVertical: 9 },
  small: { paddingVertical: 6, paddingHorizontal: 7 },
  disabled: { opacity: 0.55 },
  text: { fontFamily: font.sans, fontSize: 14, fontWeight: '800', letterSpacing: 1.1 },
  smallText: { fontSize: 10, letterSpacing: 0.6 },
  onInk: { color: color.paper },
  onPaper: { color: color.ink },
})
