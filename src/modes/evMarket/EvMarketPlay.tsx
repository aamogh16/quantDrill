import { useCallback, useMemo, useRef, useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { ScoreBar } from '../../components/ScoreBar'
import { Timer, TimerBar } from '../../components/Timer'
import { ResultsScreen } from '../../components/ResultsScreen'
import { PlayingCard, HiddenCardStack } from '../../components/PlayingCard'
import { NumericKeypad } from '../../components/NumericKeypad'
import { InstructionsModal } from '../../components/InstructionsModal'
import { useCountdown } from '../../lib/useCountdown'
import { useAdaptiveDifficulty } from '../../lib/difficulty'
import { useInstructionsModal } from '../../lib/useInstructionsModal'
import { addSessionRecord, getSettings, setDifficultyLevel } from '../../lib/storage'
import { uid, choice } from '../../lib/random'
import {
  dealRound,
  deriveEvParams,
  generateAiReference,
  generateTakingQuote,
  resolveMaking,
  resolveTaking,
  type EvRound,
  type Quote,
  type TakeAction,
} from './roundLogic'

const ROUNDS_PER_SESSION = 5

type SubMode = 'taking' | 'making'
type Stage = 'decision' | 'setCenter' | 'setSpread' | 'reveal'

interface RoundOutcome {
  pnl: number
  edge: number
  win: boolean
}

interface RoundSummary {
  round: number
  subMode: SubMode
  fairEV: number
  actualValue: number
  label: string
  detail: string
  pnl: number
  edge: number
}

export function EvMarketPlay() {
  const instructions = useInstructionsModal('evMarket')
  const settings = getSettings()
  const { subMode: subModeSetting } = settings.evMarket

  const pickSubMode = useCallback(
    (): SubMode => (subModeSetting === 'mixed' ? choice<SubMode>(['taking', 'making']) : subModeSetting),
    [subModeSetting],
  )

  const difficulty = useAdaptiveDifficulty({
    initialLevel: settings.difficultyLevels.evMarket,
    onLevelChange: (lvl) => setDifficultyLevel('evMarket', lvl),
  })

  const [sessionKey, setSessionKey] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const [subMode, setSubMode] = useState<SubMode>(pickSubMode)
  const params = useMemo(
    () => deriveEvParams(settings.evMarket, difficulty.level),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIndex, sessionKey],
  )
  const round: EvRound = useMemo(
    () => dealRound(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params],
  )
  const takingQuote: Quote = useMemo(
    () => generateTakingQuote(round.fairEV, params.skew),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  )
  const aiReference = useMemo(
    () => generateAiReference(round.fairEV, params.skew),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  )

  const [stage, setStage] = useState<Stage>(subMode === 'making' ? 'setCenter' : 'decision')
  const [center, setCenter] = useState('')
  const [spread, setSpread] = useState(2)
  const [lastOutcome, setLastOutcome] = useState<{ label: string; detail: string; outcome: RoundOutcome } | null>(
    null,
  )

  const [totalPnl, setTotalPnl] = useState(0)
  const [totalEdge, setTotalEdge] = useState(0)
  const [wins, setWins] = useState(0)
  const [history, setHistory] = useState<RoundSummary[]>([])
  const [finished, setFinished] = useState(false)
  const savedRef = useRef(false)

  const finalize = useCallback(() => {
    if (savedRef.current) return
    savedRef.current = true
    setFinished(true)
    addSessionRecord({
      id: uid(),
      mode: 'evMarket',
      timestamp: Date.now(),
      durationSec: ROUNDS_PER_SESSION * settings.evMarket.secondsPerDecision,
      totalQuestions: ROUNDS_PER_SESSION,
      correct: wins,
      wrong: ROUNDS_PER_SESSION - wins,
      accuracy: Math.round((wins / ROUNDS_PER_SESSION) * 100),
      score: Math.round(totalPnl),
      pnl: Math.round(totalPnl * 100) / 100,
      meta: { avgEdge: Math.round((totalEdge / ROUNDS_PER_SESSION) * 100) / 100 },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wins, totalPnl, totalEdge])
  const finalizeRef = useRef(finalize)
  finalizeRef.current = finalize

  const applyOutcome = useCallback(
    (label: string, detail: string, outcome: RoundOutcome) => {
      setTotalPnl((p) => p + outcome.pnl)
      setTotalEdge((e) => e + outcome.edge)
      if (outcome.win) setWins((w) => w + 1)
      if (outcome.edge >= 0) difficulty.reportCorrect()
      else difficulty.reportWrong()
      setHistory((h) => [
        ...h,
        {
          round: roundIndex + 1,
          subMode,
          fairEV: round.fairEV,
          actualValue: round.actualValue,
          label,
          detail,
          pnl: outcome.pnl,
          edge: outcome.edge,
        },
      ])
      setLastOutcome({ label, detail, outcome })
      setStage('reveal')
    },
    [roundIndex, subMode, round, difficulty],
  )
  const applyOutcomeRef = useRef(applyOutcome)
  applyOutcomeRef.current = applyOutcome

  const decideTaking = useCallback(
    (action: TakeAction) => {
      const res = resolveTaking(takingQuote, round.fairEV, round.actualValue, action)
      applyOutcomeRef.current(action.toUpperCase(), `vs correct: ${res.correctAction.toUpperCase()}`, {
        pnl: res.pnl,
        edge: res.edge,
        win: res.edge >= 0,
      })
    },
    [takingQuote, round],
  )

  const makingQuote: Quote = useMemo(() => {
    const c = parseFloat(center || '0') || 0
    return { bid: Math.round((c - spread / 2) * 100) / 100, ask: Math.round((c + spread / 2) * 100) / 100 }
  }, [center, spread])

  const confirmMaking = useCallback(() => {
    const res = resolveMaking(makingQuote, round.fairEV, round.actualValue, aiReference)
    applyOutcomeRef.current(
      `Quoted ${makingQuote.bid}/${makingQuote.ask}`,
      res.traded ? (res.direction === 'ai_bought' ? 'AI bought at your ask' : 'AI sold at your bid') : 'No trade — safe',
      { pnl: res.pnl, edge: res.edge, win: !res.traded || res.edge >= 0 },
    )
  }, [makingQuote, round, aiReference])

  const countdown = useCountdown(params.secondsPerDecision, {
    autoStart: true,
    onExpire: () => {
      if (stage === 'reveal') return
      if (subMode === 'taking') decideTaking('pass')
      else confirmMaking()
    },
  })

  const nextRound = () => {
    if (roundIndex + 1 >= ROUNDS_PER_SESSION) {
      finalize()
      return
    }
    const nextMode = pickSubMode()
    const nextSeconds = deriveEvParams(settings.evMarket, difficulty.level).secondsPerDecision
    setRoundIndex((i) => i + 1)
    setSubMode(nextMode)
    setStage(nextMode === 'making' ? 'setCenter' : 'decision')
    setCenter('')
    setSpread(2)
    setLastOutcome(null)
    countdown.reset(nextSeconds)
    countdown.start()
  }

  const restart = () => {
    savedRef.current = false
    const nextMode = pickSubMode()
    difficulty.reset(settings.difficultyLevels.evMarket)
    const nextSeconds = deriveEvParams(settings.evMarket, settings.difficultyLevels.evMarket).secondsPerDecision
    setSessionKey((k) => k + 1)
    setRoundIndex(0)
    setSubMode(nextMode)
    setCenter('')
    setSpread(2)
    setLastOutcome(null)
    setTotalPnl(0)
    setTotalEdge(0)
    setWins(0)
    setHistory([])
    setFinished(false)
    setStage(nextMode === 'making' ? 'setCenter' : 'decision')
    countdown.reset(nextSeconds)
    countdown.start()
  }

  if (finished) {
    return (
      <>
        <TopBar title="EV Card Market" onHelp={instructions.show} />
        {instructions.open && <InstructionsModal mode="evMarket" onClose={instructions.close} />}
        <ResultsScreen
          title="Trading Session Complete"
          stats={[
            { label: 'P&L', value: totalPnl >= 0 ? `+${totalPnl.toFixed(2)}` : totalPnl.toFixed(2), tone: totalPnl >= 0 ? 'green' : 'red' },
            { label: 'Win Rate', value: `${Math.round((wins / ROUNDS_PER_SESSION) * 100)}%` },
            { label: 'Avg Edge', value: (totalEdge / ROUNDS_PER_SESSION).toFixed(2), tone: totalEdge >= 0 ? 'green' : 'red' },
            { label: 'Rounds', value: String(ROUNDS_PER_SESSION) },
          ]}
          onPlayAgain={restart}
          extra={
            <div className="w-full max-w-sm flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wide text-term-dim self-start">Round by round</span>
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    h.pnl >= 0 ? 'border-term-green/30 bg-term-green-dim/40' : 'border-term-red/30 bg-term-red-dim/40'
                  }`}
                >
                  <div className="flex justify-between font-nums font-semibold">
                    <span className="text-term-text">
                      Round {h.round} · {h.subMode}
                    </span>
                    <span className={h.pnl >= 0 ? 'text-term-green' : 'text-term-red'}>
                      {h.pnl >= 0 ? '+' : ''}
                      {h.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-term-dim mt-0.5 font-nums">
                    Fair EV {h.fairEV} · Actual {h.actualValue} — {h.label} ({h.detail})
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title={`EV Card Market · ${subMode === 'taking' ? 'Taking' : 'Making'}`}
        onHelp={instructions.show}
        right={<Timer remainingMs={countdown.remainingMs} totalMs={params.secondsPerDecision * 1000} />}
      />
      {instructions.open && <InstructionsModal mode="evMarket" onClose={instructions.close} />}
      <TimerBar remainingMs={countdown.remainingMs} totalMs={params.secondsPerDecision * 1000} />
      <ScoreBar
        items={[
          { label: 'Round', value: `${roundIndex + 1}/${ROUNDS_PER_SESSION}`, tone: 'accent' },
          { label: 'P&L', value: totalPnl.toFixed(1), tone: totalPnl >= 0 ? 'green' : 'red' },
          { label: 'Edge', value: totalEdge.toFixed(1), tone: totalEdge >= 0 ? 'green' : 'red' },
          { label: 'Wins', value: wins, tone: 'green' },
          { label: 'Level', value: difficulty.level, tone: 'accent' },
        ]}
      />

      <div className="flex-1 flex flex-col items-center gap-4 px-4 py-4 overflow-y-auto">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-term-dim">Visible Hand</span>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
            {round.visibleHand.map((c, i) => (
              <PlayingCard key={i} card={c} small />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-term-dim">
            Market Pile ({round.hiddenCount} hidden)
          </span>
          <HiddenCardStack count={round.hiddenCount} small />
        </div>

        {stage === 'decision' && subMode === 'taking' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm mt-2">
            <div className="font-nums text-2xl font-semibold text-term-text">
              {takingQuote.bid} / {takingQuote.ask}
            </div>
            <span className="text-xs text-term-dim">bid / ask — compute fair EV and decide</span>
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                onClick={() => decideTaking('sell')}
                className="h-16 rounded-lg bg-term-red-dim border border-term-red/40 text-term-red font-semibold active:brightness-125"
              >
                SELL
              </button>
              <button
                onClick={() => decideTaking('pass')}
                className="h-16 rounded-lg bg-term-panel-2 border border-term-border text-term-dim font-semibold active:bg-term-border/60"
              >
                PASS
              </button>
              <button
                onClick={() => decideTaking('buy')}
                className="h-16 rounded-lg bg-term-green-dim border border-term-green/40 text-term-green font-semibold active:brightness-125"
              >
                BUY
              </button>
            </div>
          </div>
        )}

        {stage === 'setCenter' && (
          <div className="flex flex-col items-center gap-3 w-full mt-2">
            <span className="text-xs text-term-dim">Estimate fair EV of the hidden pile</span>
            <div className="font-nums text-3xl font-semibold text-term-accent min-h-10">{center || '_'}</div>
            <NumericKeypad
              value={center}
              onChange={setCenter}
              onSubmit={() => center !== '' && setStage('setSpread')}
              allowDecimal
              submitLabel="SET SPREAD →"
            />
          </div>
        )}

        {stage === 'setSpread' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm mt-2">
            <span className="text-xs text-term-dim">Set your bid/ask spread width</span>
            <div className="font-nums text-2xl font-semibold text-term-text">
              {makingQuote.bid} / {makingQuote.ask}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSpread((s) => Math.max(0.5, Math.round((s - 0.5) * 10) / 10))}
                className="h-12 w-12 rounded-lg bg-term-panel-2 border border-term-border text-xl text-term-text active:bg-term-border/60"
              >
                −
              </button>
              <span className="font-nums text-lg text-term-text w-16 text-center">±{(spread / 2).toFixed(1)}</span>
              <button
                onClick={() => setSpread((s) => Math.min(20, Math.round((s + 0.5) * 10) / 10))}
                className="h-12 w-12 rounded-lg bg-term-panel-2 border border-term-border text-xl text-term-text active:bg-term-border/60"
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-term-dim text-center max-w-xs">
              Tight spread trades more often but earns less edge per trade. Wide spread trades rarely but is safer.
            </p>
            <button
              onClick={confirmMaking}
              className="h-12 w-full rounded-lg bg-term-accent text-term-bg font-semibold active:brightness-110"
            >
              QUOTE MARKET
            </button>
          </div>
        )}

        {stage === 'reveal' && lastOutcome && (
          <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-2">
            <div className="flex flex-wrap justify-center gap-1.5">
              {round.hiddenCards.map((c, i) => (
                <PlayingCard key={i} card={c} small />
              ))}
            </div>
            <div
              className={`rounded-lg border px-4 py-3 w-full text-center ${
                lastOutcome.outcome.pnl >= 0
                  ? 'bg-term-green-dim border-term-green/40 text-term-green'
                  : 'bg-term-red-dim border-term-red/40 text-term-red'
              }`}
            >
              <div className="font-nums text-lg font-semibold">
                P&L {lastOutcome.outcome.pnl >= 0 ? '+' : ''}
                {lastOutcome.outcome.pnl.toFixed(2)} · Edge {lastOutcome.outcome.edge >= 0 ? '+' : ''}
                {lastOutcome.outcome.edge.toFixed(2)}
              </div>
              <div className="text-xs mt-1 opacity-80">
                Fair EV: {round.fairEV} · Actual: {round.actualValue}
              </div>
              <div className="text-xs opacity-80">
                {lastOutcome.label} — {lastOutcome.detail}
              </div>
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
