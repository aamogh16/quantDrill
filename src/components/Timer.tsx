interface TimerProps {
  remainingMs: number
  totalMs: number
}

export function Timer({ remainingMs, totalMs }: TimerProps) {
  const pct = totalMs > 0 ? remainingMs / totalMs : 0
  const totalSec = Math.ceil(remainingMs / 1000)
  const mm = Math.floor(totalSec / 60)
  const ss = totalSec % 60
  const label = totalMs >= 60_000 ? `${mm}:${ss.toString().padStart(2, '0')}` : `${ss}s`

  const color = pct <= 0.15 ? 'text-term-red' : pct <= 0.35 ? 'text-term-amber' : 'text-term-accent'

  return (
    <div className="flex items-center gap-2 font-nums tabular-nums">
      <span className={`text-lg font-semibold ${color}`}>{label}</span>
    </div>
  )
}

export function TimerBar({ remainingMs, totalMs }: TimerProps) {
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0
  const color = pct <= 0.15 ? 'bg-term-red' : pct <= 0.35 ? 'bg-term-amber' : 'bg-term-accent'
  return (
    <div className="h-1 w-full bg-term-border overflow-hidden">
      <div
        className={`h-full ${color} transition-[width] duration-150 ease-linear`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  )
}
