import { randInt, choice } from '../../lib/random'
import type { PercentSettings } from '../../types'
import type { DrillQuestion } from '../../lib/useTimedDrill'

const NICE_PERCENTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90]
const NICE_BASES = [10, 20, 40, 50, 80, 100, 150, 200, 250, 400, 500, 800, 1000]
const FRACTIONS: [number, number][] = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
  [1, 8], [3, 8], [5, 8], [7, 8], [1, 6], [5, 6], [1, 10], [3, 10], [7, 10],
]

function percentOf(level: number): DrillQuestion {
  let pct: number
  let base: number
  if (level <= 3) {
    pct = choice(NICE_PERCENTS)
    base = choice(NICE_BASES)
  } else if (level <= 7) {
    pct = randInt(1, 99)
    base = randInt(10, 1000)
  } else {
    pct = Math.round((randInt(1, 995) / 10) * 10) / 10
    base = randInt(50, 5000)
  }
  const answer = Math.round(base * (pct / 100) * 100) / 100
  return {
    prompt: `${pct}% of ${base} = ?`,
    answers: [answer],
    tolerance: Math.max(0.5, Math.abs(answer) * 0.01),
  }
}

function fractionToDecimal(): DrillQuestion {
  const [n, d] = choice(FRACTIONS)
  return {
    prompt: `${n}/${d} as a decimal = ?`,
    answers: [Math.round((n / d) * 1000) / 1000],
    tolerance: 0.01,
  }
}

function percentChange(level: number): DrillQuestion {
  const steps = level >= 8 ? 3 : 2
  const changes: number[] = []
  for (let i = 0; i < steps; i++) {
    const magnitude = level <= 3 ? choice([5, 10, 15, 20, 25]) : randInt(3, 45)
    const sign = Math.random() < 0.5 ? 1 : -1
    changes.push(sign * magnitude)
  }
  let multiplier = 1
  for (const c of changes) multiplier *= 1 + c / 100
  const netPercent = Math.round((multiplier - 1) * 1000) / 10

  const desc = changes
    .map((c) => (c >= 0 ? `up ${c}%` : `down ${Math.abs(c)}%`))
    .join(', then ')
  return {
    prompt: `Stock goes ${desc}. Net % change?`,
    answers: [netPercent],
    tolerance: 0.3,
  }
}

export function generatePercent(settings: PercentSettings, level: number): DrillQuestion {
  const roll = Math.random()
  if (settings.includeChained && roll < 0.35) return percentChange(level)
  if (settings.includeFractions && roll < 0.6) return fractionToDecimal()
  return percentOf(level)
}
