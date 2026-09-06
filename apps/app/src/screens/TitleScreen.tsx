/**
 * The title page: the game's name, the adventure's, and one button.
 *
 * Shown at every launch, before the frame's header and strip; START
 * turns the leaf (components/Leaf.tsx) onto creation for a fresh
 * record, or onto wherever the saved game was. It holds no state and
 * reads none: `App` decides what START opens.
 *
 * Text and drawn rules only (spec.md, "No credited art"). Every line is
 * `packages/content` (standing rule 7): `app.title` is the game's name
 * as printed on the rulebook's cover, `ui.title.adventure` the
 * adventure's, `ui.title.start` the button.
 */
import { StyleSheet, Text, View } from 'react-native'
import { t } from '@martial-havoc/content'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'

type Props = { readonly onStart: () => void }

export const TitleScreen = ({ onStart }: Props) => (
  <View style={styles.screen} testID="title">
    <View style={styles.rule} />
    <Text style={styles.title}>{t('app.title').toUpperCase()}</Text>
    <Text style={styles.subtitle}>{t('ui.title.adventure')}</Text>
    <View style={styles.rule} />
    <Button testID="title-start" primary text={t('ui.title.start')} onPress={onStart} style={styles.start} />
  </View>
)

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  /** An ink rule above and below the names, the woodblock's one ornament. */
  rule: { height: 3, backgroundColor: color.ink },
  title: { fontFamily: font.sans, fontSize: 34, fontWeight: '800', letterSpacing: 4, color: color.ink, textAlign: 'center', lineHeight: 42 },
  subtitle: { fontFamily: font.serif, fontSize: 20, fontStyle: 'italic', color: color.ink, textAlign: 'center' },
  start: { marginTop: 28, alignSelf: 'center', minWidth: 200 },
})
