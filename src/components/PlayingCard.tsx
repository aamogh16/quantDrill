import type { Card } from '../lib/deck'
import { cardLabel } from '../lib/deck'

const RED_SUITS = new Set(['♥', '♦'])

export function PlayingCard({ card, small }: { card: Card; small?: boolean }) {
  const isRed = RED_SUITS.has(card.suit)
  return (
    <div
      className={`rounded-md border border-term-border bg-term-panel-2 flex flex-col items-center justify-center font-nums font-semibold ${
        small ? 'w-9 h-12 text-sm' : 'w-12 h-16 text-base'
      } ${isRed ? 'text-term-red' : 'text-term-text'}`}
    >
      <span>{cardLabel(card)}</span>
      <span className="text-lg leading-none">{card.suit}</span>
    </div>
  )
}

export function HiddenCardStack({ count, small }: { count: number; small?: boolean }) {
  return (
    <div className="flex -space-x-4">
      {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
        <div
          key={i}
          className={`rounded-md border border-term-border bg-term-panel-2 flex items-center justify-center text-term-dim ${
            small ? 'w-9 h-12 text-xs' : 'w-12 h-16 text-sm'
          }`}
          style={{ zIndex: i }}
        >
          ?
        </div>
      ))}
    </div>
  )
}
