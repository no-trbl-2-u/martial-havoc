/**
 * One step of creation: its title, the rule it comes from, and the
 * controls that answer it.
 *
 * Every step looks the same on purpose. Creation runs in the book's
 * order (R02-R19) and the player is being walked through a procedure
 * they may not know; a step that changes shape every screen makes the
 * procedure look longer than it is.
 *
 * The `note` says in plain words what the step asks; the `source` is
 * the folio it comes from, folded behind a tap. At no point during
 * creation is the player asked for something the book did not ask for,
 * and the citation is one tap away saying so.
 */
import { StyleSheet, Text, View } from 'react-native'
import { color, font } from '../../theme/tokens'
import { Slip } from '../Slip'
import { Source } from '../Source'

export const Step = ({
  title,
  note,
  source,
  children,
  testID,
}: {
  readonly title: string
  readonly note: string
  readonly source?: string
  readonly children: React.ReactNode
  readonly testID?: string
}) => (
  <Slip style={styles.slip} testID={testID}>
    <View style={styles.head}>
      <Text style={styles.title}>{title}</Text>
    </View>
    <View style={styles.noteRow}>
      <Text style={styles.note}>{note}</Text>
      {source === undefined ? null : <Source cite={source} />}
    </View>
    <View style={styles.body}>{children}</View>
  </Slip>
)

/** A rolled number, shown large enough to read across a table. */
export const Value = ({ label, value, testID }: {
  readonly label: string
  readonly value: string | number
  readonly testID?: string
}) => (
  <View style={styles.value}>
    <Text style={styles.valueLabel}>{label}</Text>
    <Text testID={testID} style={styles.valueNumber}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  slip: { marginTop: 10, marginHorizontal: 14 },
  head: { paddingVertical: 6, paddingHorizontal: 9, backgroundColor: color.ink },
  title: { fontFamily: font.sans, fontSize: 11, fontWeight: '800', letterSpacing: 0.9, color: color.paper },
  noteRow: {
    borderBottomWidth: 2,
    borderBottomColor: color.ink,
    paddingVertical: 5,
    paddingHorizontal: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  note: {
    flexShrink: 1,
    fontFamily: font.mono,
    fontSize: 10,
    lineHeight: 14,
    color: color.dim,
  },
  body: { padding: 9, gap: 7 },
  value: { alignItems: 'center', minWidth: 60 },
  valueLabel: { fontFamily: font.sans, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.dim },
  valueNumber: { fontFamily: font.sans, fontSize: 26, fontWeight: '800', lineHeight: 30, color: color.ink },
})
