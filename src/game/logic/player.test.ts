import { describe, it, expect } from 'vitest'
import { velocityFromInput } from './player'

describe('player velocity', () => {
  it('scales by speed', () => {
    const v = velocityFromInput({ x: 1, y: 0 }, 200)
    expect(v).toEqual({ x: 200, y: 0 })
  })
})
