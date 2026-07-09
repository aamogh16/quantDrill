import { buildDeck, cardValue, shuffleDeck, type Card } from '../../lib/deck'
import type { EvMarketSettings } from '../../types'

export interface EvRound {
  visibleHand: Card[]
  hiddenCount: number
  fairEV: number
  hiddenCards: Card[]
  actualValue: number
}

export function dealRound(settings: EvMarketSettings): EvRound {
  const deck = shuffleDeck(buildDeck(settings.deckSize))
  const handSize = Math.max(4, Math.min(10, Math.floor(deck.length * 0.35)))
  const visibleHand = deck.slice(0, handSize)
  const remaining = deck.slice(handSize)
  const hiddenCount = Math.max(1, Math.min(settings.hiddenCards, remaining.length))
  const hiddenCards = remaining.slice(0, hiddenCount)

  const avgValue = remaining.reduce((s, c) => s + cardValue(c), 0) / remaining.length
  const fairEV = Math.round(avgValue * hiddenCount * 100) / 100
  const actualValue = hiddenCards.reduce((s, c) => s + cardValue(c), 0)

  return { visibleHand, hiddenCount, fairEV, hiddenCards, actualValue }
}

export interface Quote {
  bid: number
  ask: number
}

export function generateTakingQuote(fairEV: number, skew: number): Quote {
  const spread = Math.max(0.5, Math.round(fairEV * 0.08 * 10) / 10)
  const shiftMagnitude = Math.max(0.3, skew) * (0.4 + Math.random() * 1.4)
  const shift = (Math.random() < 0.5 ? -1 : 1) * shiftMagnitude
  const mid = fairEV + shift
  const bid = Math.round((mid - spread / 2) * 100) / 100
  const ask = Math.round((mid + spread / 2) * 100) / 100
  return { bid, ask }
}

export type TakeAction = 'buy' | 'sell' | 'pass'

export interface TakeResolution {
  correctAction: TakeAction
  edge: number
  pnl: number
}

export function resolveTaking(quote: Quote, fairEV: number, actualValue: number, action: TakeAction): TakeResolution {
  const edgeIfBuy = fairEV - quote.ask
  const edgeIfSell = quote.bid - fairEV
  const correctAction: TakeAction =
    edgeIfBuy > 0 && edgeIfBuy >= edgeIfSell ? 'buy' : edgeIfSell > 0 && edgeIfSell > edgeIfBuy ? 'sell' : 'pass'

  const edge =
    action === 'pass' ? -Math.max(0, edgeIfBuy, edgeIfSell) : action === 'buy' ? edgeIfBuy : edgeIfSell
  const pnl = action === 'buy' ? actualValue - quote.ask : action === 'sell' ? quote.bid - actualValue : 0

  return { correctAction, edge: Math.round(edge * 100) / 100, pnl: Math.round(pnl * 100) / 100 }
}

export function generateAiReference(fairEV: number, skew: number): number {
  const noiseFraction = (Math.random() * 2 - 1) * Math.max(0.5, skew) * 0.03
  return Math.round(fairEV * (1 + noiseFraction) * 100) / 100
}

export interface MakeResolution {
  traded: boolean
  direction: 'ai_bought' | 'ai_sold' | null
  edge: number
  pnl: number
}

export function resolveMaking(
  quote: Quote,
  fairEV: number,
  actualValue: number,
  aiReference: number,
): MakeResolution {
  if (quote.ask < aiReference) {
    const edge = quote.ask - fairEV
    const pnl = quote.ask - actualValue
    return { traded: true, direction: 'ai_bought', edge: Math.round(edge * 100) / 100, pnl: Math.round(pnl * 100) / 100 }
  }
  if (quote.bid > aiReference) {
    const edge = fairEV - quote.bid
    const pnl = actualValue - quote.bid
    return { traded: true, direction: 'ai_sold', edge: Math.round(edge * 100) / 100, pnl: Math.round(pnl * 100) / 100 }
  }
  return { traded: false, direction: null, edge: 0, pnl: 0 }
}
