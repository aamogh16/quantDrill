import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { ScoreBar } from '../../components/ScoreBar'
import { ResultsScreen } from '../../components/ResultsScreen'
import { addSessionRecord, getSettings } from '../../lib/storage'
import { uid } from '../../lib/random'
import { dealEtfRound, gapAt, resolveArb, type ArbAction, type EtfRound } from './roundLogic'

const ROUNDS_PER_SESSION = 10

export function EtfArbPlay() {
  const settings = getSettings()
  const { secondsPerRound, legs } = settings.etfArb

  const [sessionKey, setSessionKey] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const round: EtfRound = useMemo(
    () => dealEtfRound(legs, secondsPerRound),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIndex, sessionKey],
  )

  const [elapsed, setElapsed] = useState(0)
  const [resolved, setResolved] = useState<{ action: ArbAction; pnl: number; gapAtAction: number } | null>(null)
  const [totalPnl, setTotalPnl] = useState(0)
  const [wins, setWins] = useState(0)
  const [finished, setFinished] = useState(false)
  const savedRef = useRef(false)
  const startRef = useRef(performance.now())

  useEffect(() => {
    startRef.current = performance.now()
    setElapsed(0)
    const interval = setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000)
    }, 150)
    return () => clearInterval(interval)
  }, [roundIndex, sessionKey])

  const currentGap = resolved ? resolved.gapAtAction : gapAt(round, elapsed)
  const etfPrice = Math.round((round.nav + currentGap) * 100) / 100

  const finalize = useCallback(() => {
    if (savedRef.current) return
    savedRef.current = true
    setFinished(true)
    addSessionRecord({
      id: uid(),
      mode: 'etfArb',
      timestamp: Date.now(),
      durationSec: ROUNDS_PER_SESSION * secondsPerRound,
      totalQuestions: ROUNDS_PER_SESSION,
      correct: wins,
      wrong: ROUNDS_PER_SESSION - wins,
      accuracy: Math.round((wins / ROUNDS_PER_SESSION) * 100),
      score: Math.round(totalPnl),
      pnl: Math.round(totalPnl * 100) / 100,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wins, totalPnl, secondsPerRound])
  const finalizeRef = useRef(finalize)
  finalizeRef.current = finalize

  useEffect(() => {
    if (resolved) return
    if (elapsed >= secondsPerRound) {
      setResolved({ action: 'pass', pnl: 0, gapAtAction: gapAt(round, secondsPerRound) })
    }
  }, [elapsed, resolved, round, secondsPerRound])

  const act = (action: ArbAction) => {
    if (resolved) return
    const gapNow = gapAt(round, elapsed)
    const pnl = resolveArb(gapNow, action)
    setTotalPnl((p) => p + pnl)
    if (pnl > 0) setWins((w) => w + 1)
    setResolved({ action, pnl, gapAtAction: gapNow })
  }

  const nextRound = () => {
    if (roundIndex + 1 >= ROUNDS_PER_SESSION) {
      finalize()
      return
    }
    setRoundIndex((i) => i + 1)
    setResolved(null)
  }

  const restart = () => {
    savedRef.current = false
    setSessionKey((k) => k + 1)
    setRoundIndex(0)
    setResolved(null)
    setTotalPnl(0)
    setWins(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <>
        <TopBar title="ETF Arbitrage" />
        <ResultsScreen
          title="Arb Session Complete"
          stats={[
            { label: 'P&L', value: totalPnl >= 0 ? `+${totalPnl.toFixed(2)}` : totalPnl.toFixed(2), tone: totalPnl >= 0 ? 'green' : 'red' },
            { label: 'Win Rate', value: `${Math.round((wins / ROUNDS_PER_SESSION) * 100)}%` },
            { label: 'Rounds', value: String(ROUNDS_PER_SESSION) },
            { label: 'Legs', value: String(legs) },
          ]}
          onPlayAgain={restart}
        />
      </>
    )
  }

  const gapColor = currentGap > 0.05 ? 'text-term-red' : currentGap < -0.05 ? 'text-term-green' : 'text-term-dim'

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="ETF Arbitrage" />
      <ScoreBar
        items={[
          { label: 'Round', value: `${roundIndex + 1}/${ROUNDS_PER_SESSION}`, tone: 'accent' },
          { label: 'P&L', value: totalPnl.toFixed(1), tone: totalPnl >= 0 ? 'green' : 'red' },
          { label: 'Wins', value: wins, tone: 'green' },
        ]}
      />

      <div className="flex-1 flex flex-col items-center gap-5 px-4 py-5">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide text-term-dim">Synthetic ETF</span>
          <span className="font-nums text-4xl font-semibold text-term-text">{etfPrice.toFixed(2)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide text-term-dim">NAV (sum of legs)</span>
          <span className="font-nums text-2xl text-term-accent">{round.nav.toFixed(2)}</span>
          <div className="flex gap-2 mt-1">
            {round.legs.map((leg, i) => (
              <span key={i} className="font-nums text-xs text-term-dim border border-term-border rounded px-1.5 py-0.5">
                {leg.toFixed(2)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide text-term-dim">Gap (closing fast)</span>
          <span className={`font-nums text-2xl font-semibold ${gapColor}`}>
            {currentGap > 0 ? '+' : ''}
            {currentGap.toFixed(2)}
          </span>
        </div>

        {!resolved ? (
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-2">
            <button
              onClick={() => act('sell')}
              className="h-16 rounded-lg bg-term-red-dim border border-term-red/40 text-term-red font-semibold active:brightness-125"
            >
              SELL ETF
            </button>
            <button
              onClick={() => act('pass')}
              className="h-16 rounded-lg bg-term-panel-2 border border-term-border text-term-dim font-semibold active:bg-term-border/60"
            >
              PASS
            </button>
            <button
              onClick={() => act('buy')}
              className="h-16 rounded-lg bg-term-green-dim border border-term-green/40 text-term-green font-semibold active:brightness-125"
            >
              BUY ETF
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-2">
            <div
              className={`rounded-lg border px-4 py-3 w-full text-center ${
                resolved.pnl >= 0
                  ? 'bg-term-green-dim border-term-green/40 text-term-green'
                  : 'bg-term-red-dim border-term-red/40 text-term-red'
              }`}
            >
              <div className="font-nums text-lg font-semibold">
                {resolved.action.toUpperCase()} · P&L {resolved.pnl >= 0 ? '+' : ''}
                {resolved.pnl.toFixed(2)}
              </div>
              <div className="text-xs mt-1 opacity-80">Gap at decision: {resolved.gapAtAction.toFixed(2)}</div>
            </div>
            <button
              onClick={nextRound}
              className="h-12 w-full rounded-lg bg-term-accent text-term-bg font-semibold active:brightness-110"
            >
              {roundIndex + 1 >= ROUNDS_PER_SESSION ? 'See Results' : 'Next Round'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
