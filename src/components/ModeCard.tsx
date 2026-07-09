import { useNavigate } from 'react-router-dom'
import type { ModeMeta } from '../types'

export function ModeCard({ mode, to, disabled }: { mode: ModeMeta; to: string; disabled?: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => !disabled && navigate(to)}
      disabled={disabled}
      className={`text-left w-full rounded-xl border border-term-border bg-term-panel px-4 py-3.5 flex flex-col gap-1 active:bg-term-panel-2 transition-colors ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-term-text">{mode.name}</span>
        <span className="font-nums text-xs" style={{ color: mode.accent }}>
          {mode.short}
        </span>
      </div>
      <p className="text-xs text-term-dim leading-snug">{mode.description}</p>
      {mode.stretch && (
        <span className="mt-1 self-start text-[10px] uppercase tracking-wide text-term-amber border border-term-amber/40 rounded px-1.5 py-0.5">
          Stretch
        </span>
      )}
    </button>
  )
}
