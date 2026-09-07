/**
 * The player's passage: always present, never required (spec.md,
 * Horizon). A dashed slip says optional; the keep button appears only
 * once there is something to keep.
 */
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { promptFor, t } from '@martial-havoc/content'
import type { PromptMoment } from '@martial-havoc/content'
import { fill } from '../lib/fill'
import { color, font } from '../theme/tokens'
import { Slip } from './Slip'

type Props = {
  readonly draft: string
  readonly written: number
  /**
   * The moment the app is asking about, or null (Phase 10j).
   *
   * A prompt replaces the standing placeholder with a question and
   * marks the slip, so a player reads the question at the moment it is
   * about. It is never a requirement: the field behaves exactly as it
   * always has, and walking on dismisses it.
   */
  readonly prompt: PromptMoment | null
  readonly onDraft: (text: string) => void
  readonly onKeep: () => void
  readonly onDismiss: () => void
}

export const FreeText = ({ draft, written, prompt, onDraft, onKeep, onDismiss }: Props) => {
  const question = prompt === null ? undefined : promptFor(prompt)?.text
  return (
  <Slip dashed borderColor={question === undefined ? undefined : color.vermilion} style={styles.slip}>
    <View style={styles.head}>
      <Text style={styles.label}>{fill(t('ui.passage.heading'), { n: written })}</Text>
      <Text style={styles.label}>{t('ui.passage.optional')}</Text>
    </View>
    {question === undefined ? null : (
      <View style={styles.head}>
        <Text testID="passage-prompt" style={styles.question}>
          {question}
        </Text>
        <Text accessibilityRole="button" testID="passage-dismiss" onPress={onDismiss} style={styles.label}>
          {t('ui.passage.dismiss')}
        </Text>
      </View>
    )}
    <TextInput
      testID="passage"
      multiline
      numberOfLines={2}
      value={draft}
      onChangeText={onDraft}
      placeholder={question ?? t('ui.passage.placeholder')}
      placeholderTextColor={color.dim}
      style={styles.input}
    />
    {draft.trim().length === 0 ? null : (
      <Text accessibilityRole="button" onPress={onKeep} style={styles.keep}>
        {t('ui.passage.keep')}
      </Text>
    )}
  </Slip>
  )
}

const styles = StyleSheet.create({
  slip: { borderWidth: 2, paddingVertical: 7, paddingHorizontal: 9 },
  head: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, color: color.ink },
  input: { marginTop: 5, minHeight: 40, fontFamily: font.serif, fontSize: 14, lineHeight: 20, color: color.ink, backgroundColor: color.paper },
  question: { flexShrink: 1, marginTop: 5, fontFamily: font.serif, fontSize: 14, lineHeight: 19, fontStyle: 'italic', color: color.vermilion },
  keep: { alignSelf: 'flex-start', marginTop: 4, backgroundColor: color.ink, color: color.paper, paddingVertical: 5, paddingHorizontal: 9, fontFamily: font.sans, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
})
