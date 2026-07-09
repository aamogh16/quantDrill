# QuantDrill

A mobile-first, offline-first PWA for quant/trading interview prep — mental math sprints and trading-simulation drills, in the spirit of tradermath.org and Jane Street's Figgie.

## Drill modes

1. **Arithmetic Sprints** — timed +/-/×/÷ with adjustable digit count, decimals, fractions
2. **80 in 8** — the Optiver-style format: 8 minutes, 80 MCQs, +1/-2 scoring
3. **Percentage & Fraction Estimation** — percent-of, fraction-to-decimal, chained percent-change
4. **Mental Multiplication** — 2x2 digit products, squares to 30, doubling/halving chains
5. **Fermi Estimation** — confidence-interval estimation, scored on containment + tightness
6. **Sequence & Pattern Recognition** — arithmetic/geometric/recursive/interleaved sequences, with traps
7. **EV Card Market** — market-taking and market-making against a hidden card pile, tracked like a trading blotter
8. **ETF Arbitrage** (stretch) — trade a synthetic ETF against its underlying legs before the mispricing closes

## Stack

Vite + React + TypeScript, Tailwind CSS v4, `vite-plugin-pwa` for the service worker/manifest, `react-router-dom` (hash routing) for navigation. No backend — all settings and session history live in `localStorage`.

## Development

```bash
npm install
npm run dev       # dev server
npm run build     # typecheck + production build (dist/)
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

The production build is fully offline-capable: the service worker precaches the app shell, so it keeps working after the first load with no network connection.
