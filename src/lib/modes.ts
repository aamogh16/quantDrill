import type { ModeMeta } from '../types'

export const MODES: ModeMeta[] = [
  {
    id: 'arithmetic',
    name: 'Arithmetic Sprints',
    short: '+ - × ÷',
    description: 'Timed add/subtract/multiply/divide drills, adjustable digits & decimals.',
    accent: '#22d3ee',
  },
  {
    id: 'optiver80',
    name: '80 in 8',
    short: 'OPTIVER',
    description: '8-minute timed sprint, 80 MCQs, +1 correct / -2 wrong. The real format.',
    accent: '#f5b942',
  },
  {
    id: 'percent',
    name: 'Percentage & Fraction',
    short: '%',
    description: 'Percent-of, fraction-to-decimal, and chained percent-change problems.',
    accent: '#22c55e',
  },
  {
    id: 'multiplication',
    name: 'Mental Multiplication',
    short: '× ×',
    description: '2x2 digit products, squares to 30, doubling/halving chains.',
    accent: '#22d3ee',
  },
  {
    id: 'fermi',
    name: 'Fermi Estimation',
    short: '~10^n',
    description: 'Estimate real-world quantities with a confidence interval, not a point guess.',
    accent: '#f5b942',
  },
  {
    id: 'sequence',
    name: 'Sequence & Pattern',
    short: '1,2,3…',
    description: 'Spot the pattern — arithmetic, geometric, recursive, and trap sequences.',
    accent: '#22c55e',
  },
  {
    id: 'evMarket',
    name: 'EV Card Market',
    short: 'BID/ASK',
    description: 'Compute fair EV of a hidden pile; take or make a market on it.',
    accent: '#f43f5e',
  },
  {
    id: 'etfArb',
    name: 'ETF Arbitrage',
    short: 'ARB',
    description: 'Buy the cheap side, sell the rich side, before the market makers close the gap.',
    accent: '#f43f5e',
    stretch: true,
  },
]

export function getMode(id: string): ModeMeta | undefined {
  return MODES.find((m) => m.id === id)
}
