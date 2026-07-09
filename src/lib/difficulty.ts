import { useCallback, useRef, useState } from 'react'

export const MIN_LEVEL = 1
export const MAX_LEVEL = 10

interface AdaptiveOptions {
  initialLevel?: number
  streakToRamp?: number
  missesToEase?: number
  onLevelChange?: (level: number) => void
}

export interface AdaptiveDifficulty {
  level: number
  streak: number
  reportCorrect: () => void
  reportWrong: () => void
  reset: (level?: number) => void
}

/** Ramps difficulty up after a streak of correct/profitable answers, eases off after misses. */
export function useAdaptiveDifficulty(opts: AdaptiveOptions = {}): AdaptiveDifficulty {
  const { streakToRamp = 3, missesToEase = 1, onLevelChange } = opts
  const [level, setLevel] = useState(
    () => Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, opts.initialLevel ?? MIN_LEVEL)),
  )
  const [streak, setStreak] = useState(0)
  const missRun = useRef(0)

  const reportCorrect = useCallback(() => {
    missRun.current = 0
    setStreak((s) => {
      const next = s + 1
      if (next >= streakToRamp) {
        setLevel((lvl) => {
          const bumped = Math.min(MAX_LEVEL, lvl + 1)
          if (bumped !== lvl) onLevelChange?.(bumped)
          return bumped
        })
        return 0
      }
      return next
    })
  }, [streakToRamp, onLevelChange])

  const reportWrong = useCallback(() => {
    setStreak(0)
    missRun.current += 1
    if (missRun.current >= missesToEase) {
      missRun.current = 0
      setLevel((lvl) => {
        const eased = Math.max(MIN_LEVEL, lvl - 1)
        if (eased !== lvl) onLevelChange?.(eased)
        return eased
      })
    }
  }, [missesToEase, onLevelChange])

  const reset = useCallback((lvl?: number) => {
    setStreak(0)
    missRun.current = 0
    if (lvl !== undefined) setLevel(Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, lvl)))
  }, [])

  return { level, streak, reportCorrect, reportWrong, reset }
}
