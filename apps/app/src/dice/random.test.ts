import { describe, expect, it } from 'vitest'
import { parseDiceQuery, queued, randomSource } from './random'

describe('randomSource', () => {
  it('maps the generator onto 1-6, both ends included', () => {
    expect(randomSource(() => 0).next()).toBe(1)
    expect(randomSource(() => 0.999999).next()).toBe(6)
    expect(randomSource(() => 0.5).next()).toBe(4)
  })
})

describe('queued', () => {
  it('serves the queue first and the fallback after, never throwing', () => {
    const source = queued([3, 5], randomSource(() => 0))
    expect([source.next(), source.next(), source.next(), source.next()]).toEqual([3, 5, 1, 1])
  })
})

describe('parseDiceQuery', () => {
  it('reads the faces in order and drops what is not a face', () => {
    expect(parseDiceQuery('?dice=6,6,2,x,7,0,3')).toEqual([6, 6, 2, 3])
    expect(parseDiceQuery('?other=1&dice=1%2C2')).toEqual([1, 2])
    expect(parseDiceQuery('')).toEqual([])
    expect(parseDiceQuery('?dice=')).toEqual([])
  })
})
