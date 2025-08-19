import { describe, it, expect } from 'vitest'

function compute(ballWeight, waterPct, fatsPct, saltPct, yeastPct){
  const w = waterPct/100, f = fatsPct/100, s = saltPct/100, y = yeastPct/100
  const sum = w + f + s + y
  const flourPerBall = ballWeight / (1 + sum)
  return Math.round(flourPerBall*10)/10
}

describe('calculate flour per ball', () => {
  it('matches known example', () => {
    // example: ball 700g, water 80, fats 4.6, salt 2.5, yeast 0.23 -> flour ≈ 374 g (from screenshot)
    const val = compute(700,80,4.6,2.5,0.23)
    expect(val).toBeGreaterThan(370)
    expect(val).toBeLessThan(380)
  })
})
