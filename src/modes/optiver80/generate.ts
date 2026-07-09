import { randInt, choice, shuffle } from '../../lib/random'

export interface McqQuestion {
  prompt: string
  answer: number
  options: number[]
}

type Op = '+' | '−' | '×' | '÷'

function buildDistractors(answer: number, scale: number): number[] {
  const deltas = [1, 2, 3, 5, 10, 11, scale, scale + 1, -1, -2, -3, -5, -10, -11, -scale]
  const seen = new Set([answer])
  const options: number[] = []
  const pool = shuffle(deltas)
  for (const d of pool) {
    const candidate = answer + d
    if (!seen.has(candidate)) {
      seen.add(candidate)
      options.push(candidate)
    }
    if (options.length === 3) break
  }
  while (options.length < 3) {
    const candidate = answer + randInt(-scale * 2 - 5, scale * 2 + 5)
    if (!seen.has(candidate)) {
      seen.add(candidate)
      options.push(candidate)
    }
  }
  return options
}

export function generateOptiverQuestion(): McqQuestion {
  const op = choice<Op>(['+', '−', '×', '÷'])
  let a: number, b: number, answer: number

  switch (op) {
    case '+':
      a = randInt(10, 99)
      b = randInt(10, 99)
      answer = a + b
      break
    case '−':
      a = randInt(10, 99)
      b = randInt(10, 99)
      if (a < b) [a, b] = [b, a]
      answer = a - b
      break
    case '×':
      a = randInt(2, 12)
      b = randInt(10, 30)
      answer = a * b
      break
    case '÷': {
      b = randInt(2, 12)
      const multiple = randInt(2, 20)
      a = b * multiple
      answer = multiple
      break
    }
  }

  const scale = Math.max(2, Math.round(Math.abs(answer) * 0.08))
  const distractors = buildDistractors(answer, scale)
  const options = shuffle([answer, ...distractors])

  return { prompt: `${a} ${op} ${b}`, answer, options }
}
