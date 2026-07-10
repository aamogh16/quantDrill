import type { ModeId } from '../types'

export interface InstructionContent {
  title: string
  bullets: string[]
}

export const INSTRUCTIONS: Record<ModeId, InstructionContent> = {
  arithmetic: {
    title: 'Arithmetic Sprints',
    bullets: [
      'Solve the problem shown, type your answer on the keypad, then hit ENTER.',
      '+1 for a correct answer, -1 for a wrong one.',
      'The round runs on a timer — answer as many as you can before it hits 0.',
      'A few correct in a row ramps the difficulty up; a miss eases it back off.',
    ],
  },
  optiver80: {
    title: '80 in 8',
    bullets: [
      'The real Optiver-style format: 8 minutes, up to 80 multiple-choice questions.',
      'Tap the correct answer from the 4 options shown.',
      '+1 for correct, -2 for wrong — careless guessing costs you.',
      'The round ends when the timer hits 0 or all 80 questions are answered.',
    ],
  },
  percent: {
    title: 'Percentage & Fraction',
    bullets: [
      'Answer percent-of, fraction-to-decimal, and chained percent-change questions.',
      'For "up 12%, then down 8%" style questions, enter the net percent change — it can be negative.',
      'Type your answer and hit ENTER. Small rounding is allowed.',
    ],
  },
  multiplication: {
    title: 'Mental Multiplication',
    bullets: [
      '2-digit × 2-digit products, squares up to 30², and doubling/halving chains.',
      'For a chain like "Start at 12. Double, then half.", apply each step in order and enter the final result.',
      'Type your answer and hit ENTER.',
    ],
  },
  fermi: {
    title: 'Fermi Estimation',
    bullets: [
      "You'll get a real-world estimation question — reason about scale, don't hunt for the exact number.",
      'Enter a LOW and a HIGH bound using the number keypad and the ×10 exponent stepper.',
      'You score points if the true answer falls inside your range. Tighter ranges score more; wrong or needlessly wide ranges score less.',
    ],
  },
  sequence: {
    title: 'Sequence & Pattern',
    bullets: [
      'Work out the pattern in the sequence shown and enter the next term (or two, at higher levels).',
      "Some sequences are traps — they look like one pattern (e.g. doubling) but actually follow another. Check more than the first couple of gaps before answering.",
    ],
  },
  evMarket: {
    title: 'EV Card Market',
    bullets: [
      'A "visible hand" of cards is dealt face-up — those are known and out of the deck.',
      'A "market pile" of face-down cards is hidden. Use the visible hand to work out the average value of what remains, then multiply by the number of hidden cards to get the fair EV.',
      'Card values: number cards are face value, jack/queen/king are worth 10, and the ace is high — worth 14.',
      'Taking: you\'re shown a bid/ask quote — BUY if the ask is cheap vs. fair value, SELL if the bid is rich, PASS if neither.',
      "Making: you set your own bid/ask around your fair-value estimate. A tight spread trades more often for less edge per trade; a wide spread trades rarely but is safer.",
      'Each round reveals the hidden cards and settles your P&L against the decision you made.',
    ],
  },
  etfArb: {
    title: 'ETF Arbitrage',
    bullets: [
      "A synthetic ETF price is shown next to the NAV (the sum of its underlying legs).",
      "When they diverge, BUY the ETF if it's cheap vs. NAV, or SELL it if it's rich.",
      'The mispricing decays over the round as market makers close the gap — act fast, since a late or wrong call earns little or loses money.',
    ],
  },
}
