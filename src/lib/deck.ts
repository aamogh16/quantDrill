export type Suit = '♠' | '♥' | '♦' | '♣'

export interface Card {
  rank: number // 1-13, ace=1 (can count as 1 or 11), jack/queen/king = 11/12/13
  suit: Suit
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']

export function cardValue(card: Card, aceHigh = false): number {
  if (card.rank >= 11) return 10
  if (card.rank === 1) return aceHigh ? 11 : 1
  return card.rank
}

export function cardLabel(card: Card): string {
  const labels: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
  return labels[card.rank] ?? String(card.rank)
}

export function buildDeck(size: number): Card[] {
  const full: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) full.push({ rank, suit })
  }
  if (size >= 52) return full
  // Trim evenly across ranks to hit the requested deck size (keeps value distribution representative).
  const fraction = size / 52
  const trimmed: Card[] = []
  const perSuit = Math.max(1, Math.round((size / 4) | 0))
  for (const suit of SUITS) {
    const cardsOfSuit = full.filter((c) => c.suit === suit)
    const take = Math.round(cardsOfSuit.length * fraction) || perSuit
    trimmed.push(...cardsOfSuit.slice(0, Math.min(cardsOfSuit.length, take)))
  }
  return trimmed.slice(0, size)
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const copy = [...deck]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
