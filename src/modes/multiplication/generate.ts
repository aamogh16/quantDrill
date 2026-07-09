import { randInt, choice } from '../../lib/random'
import type { MultiplicationSettings } from '../../types'
import type { DrillQuestion } from '../../lib/useTimedDrill'

function twoByTwo(level: number): DrillQuestion {
  const a = level <= 3 ? choice([10, 20, 30, 40, 50, 60, 70, 80, 90]) : randInt(11, 99)
  const b = randInt(11, 99)
  return { prompt: `${a} × ${b}`, answers: [a * b] }
}

function square(level: number): DrillQuestion {
  const n = level <= 4 ? randInt(2, 15) : randInt(16, 30)
  return { prompt: `${n}²`, answers: [n * n] }
}

function doublingChain(level: number): DrillQuestion {
  const steps = level <= 3 ? 2 : level <= 7 ? 3 : 4
  const start = randInt(4, 96)
  let value = start
  const ops: string[] = []
  for (let i = 0; i < steps; i++) {
    const doubleIt = Math.random() < 0.5
    if (doubleIt) {
      value *= 2
      ops.push('double')
    } else {
      value /= 2
      ops.push('half')
    }
  }
  const answer = Math.round(value * 100) / 100
  return {
    prompt: `Start at ${start}. ${ops.join(', then ')}. Result?`,
    answers: [answer],
    tolerance: 0.05,
  }
}

export function generateMultiplication(settings: MultiplicationSettings, level: number): DrillQuestion {
  const types: Array<() => DrillQuestion> = []
  if (settings.twoByTwo) types.push(() => twoByTwo(level))
  if (settings.squares) types.push(() => square(level))
  if (settings.doublingChains) types.push(() => doublingChain(level))
  const gen = types.length ? choice(types) : () => twoByTwo(level)
  return gen()
}
