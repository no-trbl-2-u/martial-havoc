/**
 * Fixed-dice tests for the headcount of an encounter (MH p.58; I-05b,
 * I-09, I-34).
 *
 * The whole point of the Headcount shape is that only one of the four
 * Oracle cells draws a die, so each test below asserts the dice cost as
 * well as the number: a Subordinate that quietly ate a d6 would shift
 * every scripted sequence after it.
 */
import { describe, expect, it } from 'vitest'
import { fromSequence } from '../dice/sources'
import { attackOf, bandOf, enemyCount } from './count'

describe('enemyCount (MH p.58, the Oracle No. of enemies row)', () => {
  it('rolls 1d6 for a Minion and reports the face it read', () => {
    expect(enemyCount('Minion')(fromSequence([4]))).toEqual({ count: 4, face: 4 })
  })

  it('gives a Subordinate three, with no die drawn', () => {
    // An empty sequence proves the cost: a source with nothing in it
    // throws the moment anything asks it for a face.
    expect(enemyCount('Subordinate')(fromSequence([]))).toEqual({ count: 3, face: null })
  })

  it('gives a Warrior two and a Boss one', () => {
    expect(enemyCount('Warrior')(fromSequence([])).count).toBe(2)
    expect(enemyCount('Boss')(fromSequence([])).count).toBe(1)
  })
})

describe('attackOf (I-09, and the roster shapes)', () => {
  it('takes a printed integer as it stands', () => {
    expect(attackOf(5)).toBe(5)
  })

  it('reads a printed range at its low end', () => {
    expect(attackOf('2-4')).toBe(2)
  })

  it('reads a blank as 1 — the roster mode', () => {
    expect(attackOf(null)).toBe(1)
  })

  it('falls back to 1 on a cell it cannot read rather than throwing', () => {
    expect(attackOf('many')).toBe(1)
  })
})

describe('bandOf (I-05b)', () => {
  it('makes a band of five from the Woodgatherers ATT 5', () => {
    expect(bandOf(5)).toBe(5)
  })

  it('never fields fewer than one', () => {
    expect(bandOf(0)).toBe(1)
    expect(bandOf(null)).toBe(1)
  })
})
