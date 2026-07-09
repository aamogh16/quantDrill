import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { ScoreBar } from '../../components/ScoreBar'
import { Timer, TimerBar } from '../../components/Timer'
import { ResultsScreen } from '../../components/ResultsScreen'
import { InstructionsModal } from '../../components/InstructionsModal'
import { useCountdown } from '../../lib/useCountdown'
import { useInstructionsModal } from '../../lib/useInstructionsModal'
import { addSessionRecord, getSettings } from '../../lib/storage'
import { uid, shuffle } from '../../lib/random'
import { FERMI_QUESTIONS, type FermiQuestion } from './questions'
import { scoreFermi, formatMagnitude, type FermiResult } from './score'
import { MagnitudeInput } from './MagnitudeInput'

type Stage = 'low' | 'high' | 'reveal'

interface Bound {
  mantissa: string
  exponent: number
}

const EMPTY_BOUND: Bound = { mantissa: '', exponent: 0 }

export function FermiPlay() {
  const instructions = useInstructionsModal('fermi')
  const settings = getSettings()
  const { secondsPerQuestion, questionsPerSession } = settings.fermi

  const [sessionKey, setSessionKey] = useState(0)
  const deck = useMemo(
    () => shuffle(FERMI_QUESTIONS).slice(0, questionsPerSession),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionsPerSession, sessionKey],
  )
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<Stage>('low')
  const [low, setLow] = useState<Bound>(EMPTY_BOUND)
  const [high, setHigh] = useState<Bound>(EMPTY_BOUND)
  const [lastResult, setLastResult] = useState<FermiResult | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [finished, setFinished] = useState(false)
  const savedRef = useRef(false)

  const question: FermiQuestion = deck[index]

  const boundValue = (b: Bound) => (parseFloat(b.mantissa || '0') || 0) * 10 ** b.exponent

  const resolve = useCallback(
    (loBound: Bound, hiBound: Bound) => {
      const loVal = boundValue(loBound)
      const hiVal = boundValue(hiBound) || loVal
      const result = scoreFermi(loVal || 0, hiVal || 0, question.answer)
      setLastResult(result)
      setTotalScore((s) => s + result.score)
      if (result.contained) setHits((h) => h + 1)
      setStage('reveal')
    },
    [question],
  )
  const resolveRef = useRef(resolve)
  resolveRef.current = resolve

  const countdown = useCountdown(secondsPerQuestion, {
    autoStart: true,
    onExpire: () => {
      if (stage !== 'reveal') resolveRef.current(low, high)
    },
  })

  const finalize = useCallback(() => {
    if (savedRef.current) return
    savedRef.current = true
    setFinished(true)
    addSessionRecord({
      id: uid(),
      mode: 'fermi',
      timestamp: Date.now(),
      durationSec: secondsPerQuestion * questionsPerSession,
      totalQuestions: questionsPerSession,
      correct: hits,
      wrong: questionsPerSession - hits,
      accuracy: Math.round((hits / questionsPerSession) * 100),
      score: totalScore,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hits, totalScore, secondsPerQuestion, questionsPerSession])

  const confirmLow = () => {
    setStage('high')
  }

  const confirmHigh = () => {
    resolve(low, high)
  }

  const nextQuestion = () => {
    if (index + 1 >= deck.length) {
      finalize()
      return
    }
    setIndex((i) => i + 1)
    setLow(EMPTY_BOUND)
    setHigh(EMPTY_BOUND)
    setLastResult(null)
    setStage('low')
    countdown.reset(secondsPerQuestion)
    countdown.start()
  }

  const restart = () => {
    savedRef.current = false
    setSessionKey((k) => k + 1)
    setIndex(0)
    setLow(EMPTY_BOUND)
    setHigh(EMPTY_BOUND)
    setLastResult(null)
    setTotalScore(0)
    setHits(0)
    setStage('low')
    setFinished(false)
    countdown.reset(secondsPerQuestion)
    countdown.start()
  }

  useEffect(() => {
    if (stage === 'high' && high.mantissa === '' && low.mantissa !== '') {
      setHigh({ mantissa: low.mantissa, exponent: low.exponent })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  if (finished) {
    return (
      <>
        <TopBar title="Fermi Estimation" onHelp={instructions.show} />
        {instructions.open && <InstructionsModal mode="fermi" onClose={instructions.close} />}
        <ResultsScreen
          title="Estimation Session Complete"
          stats={[
            { label: 'Score', value: String(totalScore), tone: totalScore >= 0 ? 'green' : 'red' },
            { label: 'Hit Rate', value: `${Math.round((hits / questionsPerSession) * 100)}%` },
            { label: 'Hits', value: `${hits}/${questionsPerSession}`, tone: 'green' },
            { label: 'Misses', value: String(questionsPerSession - hits), tone: 'red' },
          ]}
          onPlayAgain={restart}
        />
      </>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="Fermi Estimation"
        onHelp={instructions.show}
        right={<Timer remainingMs={countdown.remainingMs} totalMs={secondsPerQuestion * 1000} />}
      />
      {instructions.open && <InstructionsModal mode="fermi" onClose={instructions.close} />}
      <TimerBar remainingMs={countdown.remainingMs} totalMs={secondsPerQuestion * 1000} />
      <ScoreBar
        items={[
          { label: 'Q', value: `${index + 1}/${deck.length}`, tone: 'accent' },
          { label: 'Score', value: totalScore, tone: totalScore >= 0 ? 'green' : 'red' },
          { label: 'Hits', value: hits, tone: 'green' },
        ]}
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5 py-4">
        <p className="text-center text-base text-term-text leading-snug max-w-sm">{question.prompt}</p>

        {stage !== 'reveal' && (
          <MagnitudeInput
            label={stage === 'low' ? 'LOW ESTIMATE' : 'HIGH ESTIMATE'}
            mantissa={stage === 'low' ? low.mantissa : high.mantissa}
            exponent={stage === 'low' ? low.exponent : high.exponent}
            onMantissaChange={(v) =>
              stage === 'low' ? setLow({ ...low, mantissa: v }) : setHigh({ ...high, mantissa: v })
            }
            onExponentChange={(v) =>
              stage === 'low' ? setLow({ ...low, exponent: v }) : setHigh({ ...high, exponent: v })
            }
            onSubmit={stage === 'low' ? confirmLow : confirmHigh}
            accent={stage === 'low' ? '#22d3ee' : '#f5b942'}
          />
        )}

        {stage === 'reveal' && lastResult && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <div
              className={`rounded-lg border px-4 py-3 w-full text-center ${
                lastResult.contained
                  ? 'bg-term-green-dim border-term-green/40 text-term-green'
                  : 'bg-term-red-dim border-term-red/40 text-term-red'
              }`}
            >
              <div className="font-nums text-lg font-semibold">
                {lastResult.contained ? '✓ IN RANGE' : '✕ OUT OF RANGE'} · {lastResult.score >= 0 ? '+' : ''}
                {lastResult.score}
              </div>
              <div className="text-xs mt-1 opacity-80">
                True answer: {formatMagnitude(question.answer)} {question.unit}
              </div>
              <div className="text-xs opacity-80">
                Your range: {formatMagnitude(boundValue(low))}–{formatMagnitude(boundValue(high))}
              </div>
            </div>
            <button
              onClick={nextQuestion}
              className="h-12 w-full rounded-lg bg-term-accent text-term-bg font-semibold active:brightness-110"
            >
              {index + 1 >= deck.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
