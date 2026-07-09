import { useCallback, useEffect, useRef, useState } from 'react'

interface CountdownOptions {
  onExpire?: () => void
  autoStart?: boolean
}

export interface Countdown {
  remainingMs: number
  running: boolean
  start: () => void
  pause: () => void
  reset: (seconds?: number) => void
}

export function useCountdown(totalSeconds: number, opts: CountdownOptions = {}): Countdown {
  const { onExpire, autoStart = false } = opts
  const [remainingMs, setRemainingMs] = useState(totalSeconds * 1000)
  const [running, setRunning] = useState(autoStart)
  const endAtRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const tick = useCallback(() => {
    const msLeft = Math.max(0, endAtRef.current - Date.now())
    setRemainingMs(msLeft)
    if (msLeft <= 0) {
      setRunning(false)
      onExpireRef.current?.()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (!running) return
    endAtRef.current = Date.now() + remainingMs
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(
    (seconds?: number) => {
      setRunning(false)
      setRemainingMs((seconds ?? totalSeconds) * 1000)
    },
    [totalSeconds],
  )

  return { remainingMs, running, start, pause, reset }
}
