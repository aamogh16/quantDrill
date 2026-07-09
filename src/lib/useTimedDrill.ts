import { useCallback, useEffect, useRef, useState } from 'react'
import type { ModeId, SessionRecord } from '../types'
import { useAdaptiveDifficulty } from './difficulty'
import { useCountdown } from './useCountdown'
import { addSessionRecord, setDifficultyLevel } from './storage'
import { uid } from './random'

export interface DrillQuestion {
  prompt: string
  answers: number[]
  tolerance?: number
  meta?: Record<string, number | string>
}

interface UseTimedDrillOptions {
  mode: ModeId
  roundSeconds: number
  initialLevel: number
  generate: (level: number) => DrillQuestion
  correctPoints?: number
  wrongPoints?: number
}

export type Feedback = { status: 'correct' | 'wrong'; detail?: string; key: number } | null

export function useTimedDrill({
  mode,
  roundSeconds,
  initialLevel,
  generate,
  correctPoints = 1,
  wrongPoints = -1,
}: UseTimedDrillOptions) {
  const generateRef = useRef(generate)
  generateRef.current = generate

  const difficulty = useAdaptiveDifficulty({
    initialLevel,
    onLevelChange: (lvl) => setDifficultyLevel(mode, lvl),
  })
  const levelRef = useRef(difficulty.level)
  levelRef.current = difficulty.level

  const [question, setQuestion] = useState<DrillQuestion>(() => generateRef.current(initialLevel))
  const [input, setInput] = useState('')
  const [enteredParts, setEnteredParts] = useState<number[]>([])
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [finished, setFinished] = useState(false)
  const questionStartRef = useRef(performance.now())
  const timeSpentRef = useRef<number[]>([])
  const feedbackKeyRef = useRef(0)

  const finalize = useCallback(() => {
    setFinished(true)
    const total = correct + wrong
    const avgTimeMs =
      timeSpentRef.current.length > 0
        ? Math.round(timeSpentRef.current.reduce((a, b) => a + b, 0) / timeSpentRef.current.length)
        : undefined
    const record: SessionRecord = {
      id: uid(),
      mode,
      timestamp: Date.now(),
      durationSec: roundSeconds,
      totalQuestions: total,
      correct,
      wrong,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      score,
      avgTimeMs,
    }
    addSessionRecord(record)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct, wrong, score, mode, roundSeconds])

  const finalizeRef = useRef(finalize)
  finalizeRef.current = finalize

  const countdown = useCountdown(roundSeconds, {
    autoStart: true,
    onExpire: () => finalizeRef.current(),
  })

  const nextQuestion = useCallback(() => {
    setQuestion(generateRef.current(levelRef.current))
    setInput('')
    setEnteredParts([])
    questionStartRef.current = performance.now()
  }, [])

  const submit = useCallback(() => {
    if (finished || input === '' || input === '-') return
    const value = parseFloat(input)
    if (Number.isNaN(value)) return

    const parts = [...enteredParts, value]
    if (parts.length < question.answers.length) {
      setEnteredParts(parts)
      setInput('')
      return
    }

    const tolerance = question.tolerance ?? 0.01
    const isCorrect = parts.every((p, i) => Math.abs(p - question.answers[i]) <= tolerance)
    timeSpentRef.current.push(performance.now() - questionStartRef.current)

    if (isCorrect) {
      setCorrect((c) => c + 1)
      setScore((s) => s + correctPoints)
      difficulty.reportCorrect()
      feedbackKeyRef.current += 1
      setFeedback({ status: 'correct', key: feedbackKeyRef.current })
    } else {
      setWrong((w) => w + 1)
      setScore((s) => s + wrongPoints)
      difficulty.reportWrong()
      feedbackKeyRef.current += 1
      setFeedback({
        status: 'wrong',
        detail: `ans: ${question.answers.join(', ')}`,
        key: feedbackKeyRef.current,
      })
    }
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, input, enteredParts, question, correctPoints, wrongPoints, difficulty, nextQuestion])

  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(() => setFeedback(null), 550)
    return () => clearTimeout(t)
  }, [feedback])

  const restart = useCallback(() => {
    setCorrect(0)
    setWrong(0)
    setScore(0)
    setFinished(false)
    setFeedback(null)
    timeSpentRef.current = []
    difficulty.reset(initialLevel)
    countdown.reset(roundSeconds)
    countdown.start()
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLevel, roundSeconds])

  return {
    question,
    input,
    setInput,
    submit,
    partIndex: enteredParts.length,
    totalParts: question.answers.length,
    correct,
    wrong,
    score,
    feedback,
    finished,
    remainingMs: countdown.remainingMs,
    totalMs: roundSeconds * 1000,
    level: difficulty.level,
    streak: difficulty.streak,
    restart,
  }
}

export type TimedDrillState = ReturnType<typeof useTimedDrill>
