/** A paper slip with an ink border: the woodblock's one container. */
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { border, color } from '../theme/tokens'

type Props = {
  readonly children?: ReactNode
  /** Dashed marks what is optional or ours. */
  readonly dashed?: boolean
  readonly borderColor?: string
  readonly style?: StyleProp<ViewStyle>
  readonly testID?: string
}

export const Slip = ({ children, dashed = false, borderColor = color.ink, style, testID }: Props) => (
  <View
    testID={testID}
    style={[styles.slip, dashed && styles.dashed, { borderColor }, style]}
  >
    {children}
  </View>
)

const styles = StyleSheet.create({
  slip: { backgroundColor: color.paper, borderWidth: border, borderColor: color.ink },
  dashed: { borderStyle: 'dashed' },
})
