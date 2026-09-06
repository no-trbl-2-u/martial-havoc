/**
 * Making a Master, in the book's order (MH p.5-19, R01-R19).
 *
 * One step on screen at a time, each carrying the folio it comes from,
 * because the player is being walked through a procedure they may not
 * know and the citation is the promise that nothing extra is being
 * asked of them.
 *
 * Two things this screen will not do:
 *
 * 1. **It never refuses.** `spec.md`: the engine "reports the numbers
 *    and never refuses". Every pool can be overspent, every step can be
 *    skipped, and BEGIN is live from the first screen. What is outside
 *    the printed limits is listed on the last step and carried nowhere
 *    else. Yin's own printed sheet overspends (R83), so a build that
 *    blocked an overspend could not load the author's eight.
 * 2. **It holds no rule and no copy.** Every number comes from
 *    `@martial-havoc/engine` through `../state/creation.ts`; every
 *    string comes from `@martial-havoc/content`. This file arranges.
 */
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  marketItemByName,
  martialArts,
  presets,
  rituals,
  startingKitItems,
  t,
  techniqueById,
  ritualById,
  techniques,
} from '@martial-havoc/content'
import { NAMED_STARTING_ITEM } from '@martial-havoc/engine'
import { fill } from '../lib/fill'
import {
  artOf,
  equipmentOf,
  flagsOf,
  pool,
  resourcePool,
  skillAfterTraining,
  spentProficiency,
  spentResources,
} from '../state/creation'
import { CREATION_STEPS } from '../state/types'
import type { Action, CreationState, CreationStep, RecordState } from '../state/types'
import { color, font } from '../theme/tokens'
import { Button } from '../components/Button'
import { MenuButton } from '../components/MenuButton'
import { Slip } from '../components/Slip'
import { Counter } from '../components/creation/Counter'
import { Step, Value } from '../components/creation/Step'

type Props = { readonly state: RecordState; readonly dispatch: (a: Action) => void }

/** The step a player is on, and the one after it. */
const nextStep = (step: CreationStep): CreationStep =>
  CREATION_STEPS[Math.min(CREATION_STEPS.length - 1, CREATION_STEPS.indexOf(step) + 1)] ?? 'ready'
const prevStep = (step: CreationStep): CreationStep =>
  CREATION_STEPS[Math.max(0, CREATION_STEPS.indexOf(step) - 1)] ?? 'who'

/**
 * R02's one item: the Health Elixir the rule names, then every Market
 * line under 20 GP, in the Market's order. The Elixir is 25 GP and is
 * the alternative to the cap, not an instance of it, so it is looked up
 * by name rather than by the flag.
 */
const kitItems = () => {
  const named = marketItemByName(NAMED_STARTING_ITEM)
  return [...(named === undefined ? [] : [named]), ...startingKitItems.filter((i) => i !== named)]
}

export const CreationScreen = ({ state, dispatch }: Props) => {
  const c = state.creation
  if (c === null) return null
  const art = artOf(c)
  const flags = flagsOf(c)
  const stepNumber = CREATION_STEPS.indexOf(c.step) + 1

  return (
    <View style={styles.screen} testID="creation">
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        {c.step === 'who' ? (
          <>
            <Step title={t('ui.creation.who.title')} note={t('ui.creation.who.note')} testID="step-who">
              <Text style={styles.label}>{t('ui.creation.name.label')}</Text>
              {/* The one thing the player types at creation. `creation.name`
                  is the reducer's; a Master who has begun ignores it. */}
              <TextInput
                testID="creation-name"
                value={c.name}
                onChangeText={(name) => dispatch({ type: 'creation.name', name })}
                placeholder={t('ui.creation.name.placeholder')}
                placeholderTextColor={color.dim}
                autoCapitalize="words"
                autoCorrect={false}
                style={[styles.field, styles.fieldText]}
              />
              <Text style={styles.label}>{t('ui.creation.age.label')}</Text>
              {/* R01's second word. Text in, number out (`ageOf`), so a blank stays blank. */}
              <TextInput
                testID="creation-age"
                value={c.age}
                onChangeText={(age) => dispatch({ type: 'creation.age', age })}
                placeholder={t('ui.creation.age.placeholder')}
                placeholderTextColor={color.dim}
                keyboardType="number-pad"
                style={[styles.field, styles.fieldText]}
              />
              <Button
                testID="creation-roll-master"
                primary
                text={t('ui.creation.who.roll')}
                onPress={() => dispatch({ type: 'creation.roll' })}
              />
            </Step>
            <Step
              title={t('ui.creation.presets.title')}
              note={t('ui.creation.presets.note')}
              testID="step-presets"
            >
              {presets.map((p) => (
                <MenuButton
                  key={p.id}
                  testID={`preset-${p.id}`}
                  title={p.name}
                  note={`SKL ${p.skill} · END ${p.endurance} · LCK ${p.luck}`}
                  line={p.martialArt}
                  onPress={() => dispatch({ type: 'creation.preset', id: p.id })}
                />
              ))}
            </Step>
          </>
        ) : null}

        {c.step === 'standing' || (c.step !== 'who' && c.status !== null) ? (
          <Step
            title={t('ui.creation.standing.title')}
            note={t('ui.creation.standing.note')}
            testID="step-standing"
          >
            {c.status === null ? (
              <Button primary text={t('ui.creation.roll')} onPress={() => dispatch({ type: 'creation.roll' })} />
            ) : (
              <Text testID="creation-standing" style={styles.reading}>
                {fill(t('ui.creation.standing.value'), { name: c.status.name, gold: c.status.gold })}
              </Text>
            )}
          </Step>
        ) : null}

        {c.step === 'kit' ? (
          <Step title={t('ui.creation.kit.title')} note={t('ui.creation.kit.note')} testID="step-kit">
            <Text style={styles.reading}>{t('ui.creation.kit.clothing')}</Text>
            <Text style={styles.label}>{t('ui.creation.kit.weapon.label')}</Text>
            <TextInput
              testID="creation-weapon"
              value={c.weapon}
              onChangeText={(weapon) => dispatch({ type: 'creation.weapon', weapon })}
              placeholder={t('ui.creation.kit.weapon.placeholder')}
              placeholderTextColor={color.dim}
              autoCorrect={false}
              style={[styles.field, styles.fieldText]}
            />
            <Text style={styles.label}>{t('ui.creation.kit.item.label')}</Text>
            {kitItems().map((item) => (
              <MenuButton
                key={item.id}
                testID={`kit-${item.id}`}
                title={`${c.kitItemId === item.id ? '* ' : ''}${item.item}`}
                note={item.priceGp === null ? `${item.priceSp ?? 0} SP` : `${item.priceGp} GP`}
                line=""
                onPress={() => dispatch({ type: 'creation.kit', id: item.id })}
              />
            ))}
          </Step>
        ) : null}

        {c.step === 'numbers' || (c.skill !== null && c.step !== 'who') ? (
          <Step
            title={t('ui.creation.numbers.title')}
            note={t('ui.creation.numbers.note')}
            testID="step-numbers"
          >
            {c.skill === null ? (
              <Button primary text={t('ui.creation.roll')} onPress={() => dispatch({ type: 'creation.roll' })} />
            ) : (
              <View style={styles.values}>
                <Value label={t('ui.attr.skill')} value={skillAfterTraining(c)} testID="creation-skill" />
                <Value label={t('ui.attr.endurance')} value={c.endurance?.current ?? 0} testID="creation-endurance" />
                <Value label={t('ui.attr.luck')} value={c.luck?.current ?? 0} testID="creation-luck" />
              </View>
            )}
          </Step>
        ) : null}

        {c.step === 'art' ? (
          <Step title={t('ui.creation.art.title')} note={t('ui.creation.art.note')} testID="step-art">
            <Button primary text={t('ui.creation.roll')} onPress={() => dispatch({ type: 'creation.roll' })} />
            <Text style={styles.label}>{t('ui.creation.art.choose')}</Text>
            {martialArts.map((m) => (
              <MenuButton
                key={m.id}
                testID={`art-${m.id}`}
                title={m.name}
                note={m.proficiencies.join(' · ')}
                line=""
                onPress={() => dispatch({ type: 'creation.art', id: m.id })}
              />
            ))}
          </Step>
        ) : null}

        {c.step !== 'who' && c.step !== 'standing' && c.step !== 'numbers' && art !== undefined ? (
          <Slip style={styles.artSlip} testID="creation-art">
            <Text style={styles.artName}>{art.name.toUpperCase()}</Text>
            <Text style={styles.artStyle}>{art.styleText}</Text>
          </Slip>
        ) : null}

        {c.step === 'training' ? (
          <Step
            title={t('ui.creation.training.title')}
            note={t('ui.creation.training.note')}
            testID="step-training"
          >
            <Counter
              testID="creation-training"
              label={t('ui.creation.training.title')}
              value={c.training}
              onChange={(d) => dispatch({ type: 'creation.training', points: c.training + d })}
            />
            <Text style={styles.reading}>
              {fill(t('ui.creation.training.value'), {
                points: `${c.training}`,
                skill: skillAfterTraining(c),
                resources: resourcePool(c),
              })}
            </Text>
          </Step>
        ) : null}

        {c.step === 'spend' ? (
          <Step
            title={t('ui.creation.spend.title')}
            note={t('ui.creation.spend.note')}
            testID="step-spend"
          >
            <Text testID="creation-pool" style={styles.reading}>
              {fill(t('ui.creation.spend.pool'), { spent: spentProficiency(c), pool: pool(c) })}
            </Text>
            {(art?.proficiencies ?? []).map((name) => (
              <Counter
                key={name}
                testID={`proficiency-${name}`}
                label={name}
                value={c.proficiencies[name] ?? 0}
                onChange={(delta) => dispatch({ type: 'creation.proficiency', name, delta })}
              />
            ))}
          </Step>
        ) : null}

        {c.step === 'learn' ? (
          <Step
            title={t('ui.creation.techniques.title')}
            note={t('ui.creation.techniques.note')}
            testID="step-techniques"
          >
            <Text testID="creation-resources" style={styles.reading}>
              {fill(t('ui.creation.techniques.pool'), {
                spent: spentResources(c),
                pool: resourcePool(c),
              })}
            </Text>
            {/* All 36 of each (R16), in the tables' order: the book does not
                tie a Technique or a Ritual to a style, so nothing is hidden. */}
            <Text style={styles.label}>{t('ui.creation.learn.techniques')}</Text>
            {techniques.map((tech) => (
              <MenuButton
                key={tech.id}
                testID={`technique-${tech.id}`}
                title={`${c.techniqueIds.includes(tech.id) ? '* ' : ''}${tech.name}`}
                note={`${tech.cost}`}
                line={tech.effect}
                onPress={() => dispatch({ type: 'creation.technique', id: tech.id })}
              />
            ))}
            <Text style={styles.label}>{t('ui.creation.learn.rituals')}</Text>
            {rituals.map((rite) => (
              <MenuButton
                key={rite.id}
                testID={`ritual-${rite.id}`}
                title={`${c.ritualIds.includes(rite.id) ? '* ' : ''}${rite.name}`}
                note={`${rite.cost}`}
                line={rite.effect}
                onPress={() => dispatch({ type: 'creation.ritual', id: rite.id })}
              />
            ))}
          </Step>
        ) : null}

        {c.step === 'ready' ? (
          <Step title={t('ui.creation.ready.title')} note={t('ui.creation.ready.note')} testID="step-ready">
            <View style={styles.values}>
              <Value label={t('ui.attr.skill')} value={skillAfterTraining(c)} testID="ready-skill" />
              <Value label={t('ui.attr.endurance')} value={c.endurance?.current ?? 0} />
              <Value label={t('ui.attr.luck')} value={c.luck?.current ?? 0} />
              <Value label={t('ui.attr.gold')} value={c.status?.gold ?? 0} />
            </View>
            <Text style={styles.label}>{t('ui.creation.ready.learned')}</Text>
            <Text testID="ready-learned" style={styles.reading}>
              {[
                ...c.techniqueIds.map((id) => techniqueById(id)?.name),
                ...c.ritualIds.map((id) => ritualById(id)?.name),
              ]
                .filter((n): n is string => n !== undefined)
                .join(' · ')}
            </Text>
            <Text style={styles.label}>{t('ui.creation.ready.carrying')}</Text>
            <Text testID="ready-carrying" style={styles.reading}>{equipmentOf(c).join(' · ')}</Text>
          </Step>
        ) : null}

        {flags.length === 0 ? null : (
          <Slip dashed style={styles.flags} testID="creation-flags">
            <Text style={styles.flagsTitle}>{t('ui.creation.flags')}</Text>
            {flags.map((f) => (
              <Text key={f} style={styles.flag}>{f}</Text>
            ))}
          </Slip>
        )}
      </ScrollView>

      <View style={styles.foot}>
        <Text style={styles.progress}>
          {fill(t('ui.creation.step'), {
            n: stepNumber,
            total: CREATION_STEPS.length,
            name: c.step.toUpperCase(),
          })}
        </Text>
        <View style={styles.bar}>
          <Button
            testID="creation-back"
            text={t('ui.creation.back')}
            onPress={() => dispatch({ type: 'creation.step', step: prevStep(c.step) })}
            style={styles.grow}
          />
          {c.step === 'ready' ? (
            <Button
              testID="creation-begin"
              primary
              text={t('ui.creation.begin')}
              onPress={() => dispatch({ type: 'creation.begin' })}
              style={styles.grow}
            />
          ) : (
            <Button
              testID="creation-next"
              primary
              text={t('ui.creation.next')}
              onPress={() => dispatch({ type: 'creation.step', step: nextStep(c.step) })}
              style={styles.grow}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingBottom: 12 },
  label: { fontFamily: font.sans, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.dim },
  field: { borderWidth: 3, borderColor: color.ink, paddingVertical: 8, paddingHorizontal: 9 },
  fieldText: { fontFamily: font.serif, fontSize: 15, color: color.ink },
  reading: { fontFamily: font.mono, fontSize: 12, lineHeight: 17, color: color.ink },
  values: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  artSlip: { marginTop: 10, marginHorizontal: 14, padding: 9 },
  artName: { fontFamily: font.sans, fontSize: 12, fontWeight: '800', letterSpacing: 0.9, color: color.ink },
  artStyle: { fontFamily: font.serif, fontSize: 13, lineHeight: 18, marginTop: 3, color: color.ink },
  flags: { marginTop: 10, marginHorizontal: 14, padding: 9, gap: 3 },
  flagsTitle: { fontFamily: font.sans, fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.vermilion },
  flag: { fontFamily: font.mono, fontSize: 11, lineHeight: 15, color: color.ink },
  foot: { flexShrink: 0, borderTopWidth: 3, borderTopColor: color.ink, backgroundColor: color.paper, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 14, gap: 6 },
  progress: { fontFamily: font.mono, fontSize: 10, color: color.dim },
  bar: { flexDirection: 'row', gap: 7 },
  grow: { flex: 1 },
})
