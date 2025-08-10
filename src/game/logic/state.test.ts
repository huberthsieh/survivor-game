import { describe, it, expect } from 'vitest'
import { initialState, reduce } from './state'

describe('state reducer', () => {
  it('ticks down time and tightens spawn interval', () => {
    let s = initialState()
    s = reduce(s, { type: 'TICK', dt: 10 })
    expect(s.timeLeft).toBeCloseTo(50)
    const before = s.spawn.interval
    s = reduce(s, { type: 'TICK', dt: 10 })
    expect(s.spawn.interval).toBeLessThanOrEqual(before)
  })

  it('applies damage and clamps to zero', () => {
    let s = initialState()
    s = reduce(s, { type: 'DAMAGE', value: 150 })
    expect(s.hp).toBe(0)
  })
})
