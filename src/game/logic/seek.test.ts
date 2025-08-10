import { describe, it, expect } from 'vitest'
import { calculateSeekVelocity } from './seek'

describe('seek velocity', () => {
  it('points toward player and has magnitude ~= speed', () => {
    const v = calculateSeekVelocity({ x: 0, y: 0, speed: 100 }, { x: 100, y: 0 })
    expect(Math.round(v.x)).toBe(100)
    expect(Math.round(v.y)).toBe(0)
  })
})
