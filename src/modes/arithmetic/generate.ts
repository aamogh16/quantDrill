import { randInt, choice, digitsRange } from '../../lib/random'
import type { ArithmeticSettings } from '../../types'
import type { DrillQuestion } from '../../lib/useTimedDrill'

type Op = 'add' | 'sub' | 'mul' | 'div'

function digitsForLevel(settings: ArithmeticSettings, level: number): number {
  const { min, max } = settings.digits
  if (max <= min) return min
  return Math.round(min + ((max - min) * (level - 1)) / 9)
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

const FRACTIONS: [number, number][] = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8],
]

function generateFractionQuestion(): DrillQuestion {
  const [n1, d1] = choice(FRACTIONS)
  const asPercent = Math.random() < 0.5
  if (asPercent) {
    return {
      prompt: `${n1}/${d1} as a decimal = ?`,
      answers: [Math.round((n1 / d1) * 100) / 100],
      tolerance: 0.01,
    }
  }
  const [n2, d2] = choice(FRACTIONS)
  const sum = n1 / d1 + n2 / d2
  return {
    prompt: `${n1}/${d1} + ${n2}/${d2} = ? (decimal)`,
    answers: [Math.round(sum * 100) / 100],
    tolerance: 0.02,
  }
}

export function generateArithmetic(settings: ArithmeticSettings, level: number): DrillQuestion {
  if (settings.fractions && Math.random() < 0.25) {
    return generateFractionQuestion()
  }

  const digits = digitsForLevel(settings, level)
  const ops = (['add', 'sub', 'mul', 'div'] as Op[]).filter((o) => settings.ops[o])
  const op: Op = ops.length ? choice(ops) : 'add'
  const range = digitsRange(digits)
  const useDecimal = settings.decimals && (op === 'add' || op === 'sub') && Math.random() < 0.4

  let a = randInt(Math.max(range.min, 1), range.max)
  let b = randInt(Math.max(range.min, 1), range.max)
  let answer: number
  let symbol: string
  let tolerance = 0.01

  switch (op) {
    case 'add': {
      if (useDecimal) {
        a = Math.round((a + Math.random()) * 10) / 10
        b = Math.round((b + Math.random()) * 10) / 10
        tolerance = 0.05
      }
      answer = Math.round((a + b) * 100) / 100
      symbol = '+'
      break
    }
    case 'sub': {
      if (useDecimal) {
        a = Math.round((a + Math.random()) * 10) / 10
        b = Math.round((b + Math.random()) * 10) / 10
        tolerance = 0.05
      }
      if (a < b) [a, b] = [b, a]
      answer = Math.round((a - b) * 100) / 100
      symbol = '−'
      break
    }
    case 'mul': {
      const mulRange = digitsRange(Math.min(digits, 3))
      a = randInt(Math.max(mulRange.min, 2), mulRange.max)
      b = randInt(Math.max(range.min, 2), range.max)
      answer = a * b
      symbol = '×'
      break
    }
    case 'div': {
      b = randInt(2, Math.max(2, Math.min(range.max, 12)))
      if (settings.decimals && Math.random() < 0.4) {
        a = randInt(Math.max(range.min, 1), range.max)
        answer = Math.round((a / b) * 100) / 100
        tolerance = 0.05
      } else {
        const multiple = randInt(1, Math.max(1, Math.floor(range.max / b)))
        a = multiple * b
        answer = multiple
      }
      symbol = '÷'
      break
    }
  }

  return { prompt: `${formatNum(a)} ${symbol} ${formatNum(b)}`, answers: [answer], tolerance }
}
