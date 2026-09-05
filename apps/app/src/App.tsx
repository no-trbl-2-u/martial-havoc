/**
 * The garden's placeholder screen.
 *
 * Phase 1 ships exactly one screen: the project name and the licence
 * line, both read from `@martial-havoc/content` (no copy lives in a
 * component — agents.md rule 7). Phase 8 (The UI) replaces this screen;
 * it is not the app's shell and must not grow one.
 *
 * Phase 2 shipped the tables and the creation engine behind it and
 * deliberately left the screen alone: the build plan gives the UI to
 * Phase 8, which is also where a random dice source is injected.
 */
import { t } from '@martial-havoc/content'
import { StyleSheet, Text, View } from 'react-native'

/** Root component; a pure function of the content package. */
export const App = () => (
  <View style={styles.root} testID="garden">
    <Text style={styles.title} accessibilityRole="header">
      {t('app.title')}
    </Text>
    <Text style={styles.tagline}>{t('app.tagline')}</Text>
    <Text style={styles.note}>{t('app.garden')}</Text>
    <Text style={styles.licence}>{t('app.licence')}</Text>
  </View>
)

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 32, fontWeight: '700' },
  tagline: { fontSize: 16, lineHeight: 24 },
  note: { fontSize: 14, fontStyle: 'italic' },
  licence: { fontSize: 12, lineHeight: 18, opacity: 0.7 },
})
