/** The stitched binding down the left of the frame: drawn geometry only. */
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { color } from '../theme/tokens'

const KNOTS = [150, 320, 490, 660]

export const Binding = () => (
  <View style={styles.strip}>
    <Svg width={26} height="100%" viewBox="0 0 26 844" preserveAspectRatio="none">
      <Path d="M13 40 V804" stroke={color.paper} strokeWidth={2} />
      <G fill={color.ink}>
        {KNOTS.map((y) => <Circle key={y} cx={13} cy={y} r={5} />)}
      </G>
      <G fill="none" stroke={color.paper} strokeWidth={2}>
        {KNOTS.map((y) => <Path key={y} d={`M13 ${y} q10 -18 0 -36`} />)}
      </G>
    </Svg>
  </View>
)

const styles = StyleSheet.create({
  strip: { width: 26, backgroundColor: color.binding },
})
