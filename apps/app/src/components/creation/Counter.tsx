/**
 * A number with a minus and a plus: Training points, and each
 * Proficiency's value.
 *
 * Neither is ceilinged. `spec.md` is explicit that creation reports and
 * never refuses, so the plus keeps working past the pool and the flag
 * list says what that costs. The minus floors at zero because a
 * negative Proficiency is not a thing the book has, rather than a limit
 * being enforced.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { color, font } from '../../theme/tokens'

export const Counter = ({
  label,
  value,
  onChange,
  testID,
}: {
  readonly label: string
  readonly value: number
  readonly onChange: (delta: number) => void
  readonly testID?: string
}) => (
  <View style={styles.row}>
    <Text style={styles.label} numberOfLines={1}>{label}</Text>
    <View style={styles.controls}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} minus`}
        testID={testID === undefined ? undefined : `${testID}-minus`}
        onPress={() => onChange(-1)}
        style={styles.step}
      >
        <Text style={styles.stepText}>-</Text>
      </Pressable>
      <Text testID={testID} style={styles.value}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} plus`}
        testID={testID === undefined ? undefined : `${testID}-plus`}
        onPress={() => onChange(1)}
        style={styles.step}
      >
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { flexShrink: 1, fontFamily: font.sans, fontSize: 13, fontWeight: '800', letterSpacing: 0.3, color: color.ink },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  step: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: color.ink,
    backgroundColor: color.paper,
  },
  stepText: { fontFamily: font.sans, fontSize: 17, fontWeight: '800', lineHeight: 20, color: color.ink },
  value: { minWidth: 24, textAlign: 'center', fontFamily: font.sans, fontSize: 17, fontWeight: '800', color: color.ink },
})
