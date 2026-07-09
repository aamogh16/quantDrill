import { useMemo } from 'react'
import { TopBar } from '../components/TopBar'
import { Sparkline } from '../components/Sparkline'
import { getHistory } from '../lib/storage'
import { MODES } from '../lib/modes'
import type { SessionRecord } from '../types'

function trendValue(r: SessionRecord): number {
  return r.pnl !== undefined ? r.pnl : r.score
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

export function Stats() {
  const history = getHistory()

  const overview = useMemo(() => {
    const totalSessions = history.length
    const totalQ = history.reduce((a, h) => a + h.totalQuestions, 0)
    const totalCorrect = history.reduce((a, h) => a + h.correct, 0)
    const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0
    return { totalSessions, accuracy }
  }, [history])

  const byMode = useMemo(() => {
    return MODES.map((mode) => {
      const records = history.filter((r) => r.mode === mode.id).sort((a, b) => a.timestamp - b.timestamp)
      if (records.length === 0) return { mode, records: [] as SessionRecord[] }
      return { mode, records }
    }).filter((m) => m.records.length > 0)
  }, [history])

  return (
    <>
      <TopBar title="Stats" />
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-term-panel border border-term-border rounded-lg px-4 py-3 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-term-dim">Total Sessions</span>
            <span className="font-nums text-2xl font-semibold text-term-text">{overview.totalSessions}</span>
          </div>
          <div className="bg-term-panel border border-term-border rounded-lg px-4 py-3 flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-term-dim">Overall Accuracy</span>
            <span className="font-nums text-2xl font-semibold text-term-accent">{overview.accuracy}%</span>
          </div>
        </div>

        {byMode.length === 0 && (
          <p className="text-center text-sm text-term-dim mt-10">
            No sessions yet — play a drill and your stats will show up here.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {byMode.map(({ mode, records }) => {
            const recent = records.slice(-20)
            const last = recent[recent.length - 1]
            const prev = recent.length > 1 ? recent[recent.length - 2] : undefined
            const delta = prev ? trendValue(last) - trendValue(prev) : undefined
            const avgAccuracy = Math.round(recent.reduce((a, r) => a + r.accuracy, 0) / recent.length)
            const hasPnl = recent.some((r) => r.pnl !== undefined)

            return (
              <div key={mode.id} className="bg-term-panel border border-term-border rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-term-text">{mode.name}</span>
                  <span className="text-[10px] text-term-dim font-nums">{records.length} sessions</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wide text-term-dim">
                      {hasPnl ? 'Last P&L' : 'Last Score'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-nums text-xl font-semibold text-term-text">{fmt(trendValue(last))}</span>
                      {delta !== undefined && (
                        <span className={`font-nums text-xs ${delta >= 0 ? 'text-term-green' : 'text-term-red'}`}>
                          {delta >= 0 ? '▲' : '▼'} {fmt(Math.abs(delta))}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-term-dim font-nums">avg accuracy {avgAccuracy}%</span>
                  </div>
                  <Sparkline values={recent.map(trendValue)} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
