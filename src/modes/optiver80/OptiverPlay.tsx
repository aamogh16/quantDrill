import { useCallback, useEffect, useRef, useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { ScoreBar } from '../../components/ScoreBar'
import { Timer, TimerBar } from '../../components/Timer'
import { ResultsScreen } from '../../components/ResultsScreen'
import { InstructionsModal } from '../../components/InstructionsModal'
import { useCountdown } from '../../lib/useCountdown'
import { useInstructionsModal } from '../../lib/useInstructionsModal'
import { addSessionRecord } from '../../lib/storage'
import { uid } from '../../lib/random'
import { generateOptiverQuestion, type McqQuestion } from './generate'

const ROUND_SECONDS = 8 * 60
const TOTAL_QUESTIONS = 80
const CORRECT_POINTS = 1
const WRONG_POINTS = -2

export function OptiverPlay() {
  const instructions = useInstructionsModal('optiver80')
  const [index, setIndex] = useState(0)
  const [question, setQuestion] = useState<McqQuestion>(() => generateOptiverQuestion())
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const savedRef = useRef(false)

  const finalize = useCallback(() => {
    if (savedRef.current) return
    savedRef.current = true
    setFinished(true)
    const total = correct + wrong
    addSessionRecord({
      id: uid(),
      mode: 'optiver80',
      timestamp: Date.now(),
      durationSec: ROUND_SECONDS,
      totalQuestions: total,
      correct,
      wrong,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      score,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct, wrong, score])
  const finalizeRef = useRef(finalize)
  finalizeRef.current = finalize

  const countdown = useCountdown(ROUND_SECONDS, {
    autoStart: true,
    onExpire: () => finalizeRef.current(),
  })

  const pick = (opt: number) => {
    if (selected !== null || finished) return
    setSelected(opt)
    const isCorrect = opt === question.answer
    if (isCorrect) {
      setCorrect((c) => c + 1)
      setScore((s) => s + CORRECT_POINTS)
    } else {
      setWrong((w) => w + 1)
      setScore((s) => s + WRONG_POINTS)
    }
  }

  useEffect(() => {
    if (selected === null) return
    const t = setTimeout(() => {
      const nextIndex = index + 1
      if (nextIndex >= TOTAL_QUESTIONS) {
        countdown.pause()
        finalizeRef.current()
        return
      }
      setIndex(nextIndex)
      setQuestion(generateOptiverQuestion())
      setSelected(null)
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const restart = () => {
    savedRef.current = false
    setIndex(0)
    setQuestion(generateOptiverQuestion())
    setCorrect(0)
    setWrong(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
    countdown.reset(ROUND_SECONDS)
    countdown.start()
  }

  if (finished) {
    const total = correct + wrong
    return (
      <>
        <TopBar title="80 in 8" onHelp={instructions.show} />
        {instructions.open && <InstructionsModal mode="optiver80" onClose={instructions.close} />}
        <ResultsScreen
          title="80 in 8 Complete"
          stats={[
            { label: 'Score', value: String(score), tone: score >= 0 ? 'green' : 'red' },
            { label: 'Answered', value: `${total}/${TOTAL_QUESTIONS}` },
            { label: 'Correct', value: String(correct), tone: 'green' },
            { label: 'Wrong', value: String(wrong), tone: 'red' },
          ]}
          onPlayAgain={restart}
        />
      </>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title="80 in 8"
        onHelp={instructions.show}
        right={<Timer remainingMs={countdown.remainingMs} totalMs={ROUND_SECONDS * 1000} />}
      />
      {instructions.open && <InstructionsModal mode="optiver80" onClose={instructions.close} />}
      <TimerBar remainingMs={countdown.remainingMs} totalMs={ROUND_SECONDS * 1000} />
      <ScoreBar
        items={[
          { label: 'Q', value: `${index + 1}/${TOTAL_QUESTIONS}`, tone: 'accent' },
          { label: 'Score', value: score, tone: score >= 0 ? 'green' : 'red' },
          { label: 'Correct', value: correct, tone: 'green' },
          { label: 'Wrong', value: wrong, tone: 'red' },
        ]}
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
        <div className="font-nums text-5xl font-semibold text-term-text">{question.prompt}</div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {question.options.map((opt) => {
            const isSelected = selected !== null && opt === selected
            const isAnswer = selected !== null && opt === question.answer
            let cls =
              'h-16 rounded-lg border font-nums text-2xl font-semibold flex items-center justify-center touch-manipulation '
            if (selected === null) {
              cls += 'bg-term-panel-2 border-term-border text-term-text active:bg-term-border/60'
            } else if (isAnswer) {
              cls += 'bg-term-green-dim border-term-green/50 text-term-green'
            } else if (isSelected) {
              cls += 'bg-term-red-dim border-term-red/50 text-term-red'
            } else {
              cls += 'bg-term-panel-2 border-term-border text-term-dim opacity-50'
            }
            return (
              <button key={opt} className={cls} onClick={() => pick(opt)} disabled={selected !== null}>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
