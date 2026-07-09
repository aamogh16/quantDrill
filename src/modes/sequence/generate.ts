import { randInt, choice } from '../../lib/random'
import type { SequenceSettings } from '../../types'
import type { DrillQuestion } from '../../lib/useTimedDrill'

function nextCount(level: number): number {
  return level > 6 ? 2 : 1
}

function buildQuestion(terms: number[], nAsk: number): DrillQuestion {
  const visible = terms.slice(0, terms.length - nAsk)
  const answers = terms.slice(terms.length - nAsk)
  return {
    prompt: `${visible.join(', ')}, ?${nAsk === 2 ? ', ?' : ''}`,
    answers,
    tolerance: 0.01,
  }
}

function arithmeticSeq(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const a = randInt(level <= 3 ? 1 : 1, level <= 3 ? 20 : 200)
  const d = choice([-1, 1]) * randInt(level <= 3 ? 1 : 2, level <= 3 ? 9 : 25)
  const visibleCount = 5
  const terms: number[] = []
  for (let i = 0; i < visibleCount + nAsk; i++) terms.push(a + i * d)
  return buildQuestion(terms, nAsk)
}

function geometricSeq(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const a = randInt(1, level <= 3 ? 5 : 9)
  const ratios = level <= 5 ? [2, 3] : [2, 3, 4, 0.5]
  const r = choice(ratios)
  const visibleCount = 4
  const terms: number[] = []
  let value = a
  for (let i = 0; i < visibleCount + nAsk; i++) {
    terms.push(Math.round(value * 100) / 100)
    value *= r
  }
  return buildQuestion(terms, nAsk)
}

function recursiveSeq(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const t0 = randInt(1, level <= 4 ? 5 : 12)
  const t1 = randInt(1, level <= 4 ? 8 : 15)
  const visibleCount = 6
  const terms = [t0, t1]
  for (let i = 2; i < visibleCount + nAsk; i++) terms.push(terms[i - 1] + terms[i - 2])
  return buildQuestion(terms, nAsk)
}

function interleavedSeq(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const aStart = randInt(1, 10)
  const aStep = randInt(1, level <= 4 ? 5 : 12)
  const bStart = randInt(10, 40)
  const bStep = choice([-1, 1]) * randInt(2, level <= 4 ? 6 : 15)
  const pairs = 4
  const merged: number[] = []
  for (let i = 0; i < pairs + 1; i++) {
    merged.push(aStart + i * aStep)
    merged.push(bStart + i * bStep)
  }
  const totalNeeded = pairs * 2 + nAsk
  return buildQuestion(merged.slice(0, totalNeeded), nAsk)
}

function trapQuadratic(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const a = randInt(1, 4)
  const fd = randInt(1, 3)
  const dd = randInt(1, level <= 5 ? 2 : 4)
  const visibleCount = 5
  const terms = [a]
  let diff = fd
  for (let i = 1; i < visibleCount + nAsk; i++) {
    terms.push(terms[i - 1] + diff)
    diff += dd
  }
  return buildQuestion(terms, nAsk)
}

function trapAlternatingRatio(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const a = randInt(1, level <= 5 ? 4 : 8)
  const r1 = choice([2, 3])
  const r2 = choice([2, 3].filter((r) => r !== r1))
  const visibleCount = 5
  const terms = [a]
  for (let i = 1; i < visibleCount + nAsk; i++) {
    const r = i % 2 === 1 ? r1 : r2
    terms.push(terms[i - 1] * r)
  }
  return buildQuestion(terms, nAsk)
}

function trapOffsetFibonacci(level: number): DrillQuestion {
  const nAsk = nextCount(level)
  const t0 = randInt(1, 5)
  const t1 = randInt(1, 7)
  const k = choice([-2, -1, 1, 2])
  const visibleCount = 6
  const terms = [t0, t1]
  for (let i = 2; i < visibleCount + nAsk; i++) terms.push(terms[i - 1] + terms[i - 2] + k)
  return buildQuestion(terms, nAsk)
}

const BASE_GENERATORS = [arithmeticSeq, geometricSeq, recursiveSeq, interleavedSeq]
const TRAP_GENERATORS = [trapQuadratic, trapAlternatingRatio, trapOffsetFibonacci]

export function generateSequence(settings: SequenceSettings, level: number): DrillQuestion {
  const useTrap = settings.includeTraps && Math.random() < Math.min(0.4, 0.1 + level * 0.03)
  const gen = choice(useTrap ? TRAP_GENERATORS : BASE_GENERATORS)
  return gen(level)
}
