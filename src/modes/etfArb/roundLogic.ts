import { randFloat, choice } from '../../lib/random'

export interface EtfRound {
  legs: number[]
  nav: number
  gap0: number
  decayPerSec: number
}

export function dealEtfRound(legCount: number, secondsPerRound: number): EtfRound {
  const legs = Array.from({ length: legCount }, () => randFloat(15, 90, 2))
  const nav = Math.round(legs.reduce((a, b) => a + b, 0) * 100) / 100
  const magnitude = randFloat(0.02, 0.07, 3)
  const sign = choice([-1, 1])
  const gap0 = Math.round(nav * magnitude * sign * 100) / 100
  // gap decays to ~5% of its initial value by the end of the round
  const decayPerSec = Math.log(20) / secondsPerRound
  return { legs, nav, gap0, decayPerSec }
}

export function gapAt(round: EtfRound, elapsedSec: number): number {
  return Math.round(round.gap0 * Math.exp(-round.decayPerSec * elapsedSec) * 100) / 100
}

export type ArbAction = 'buy' | 'sell' | 'pass'

export function resolveArb(gapNow: number, action: ArbAction): number {
  if (action === 'buy') return Math.round(-gapNow * 100) / 100
  if (action === 'sell') return Math.round(gapNow * 100) / 100
  return 0
}
