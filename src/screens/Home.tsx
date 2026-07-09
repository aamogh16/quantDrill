import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ModeCard } from '../components/ModeCard'
import { MODES } from '../lib/modes'
import { getHistory, getSettings } from '../lib/storage'

const PATHS: Record<string, string> = {
  arithmetic: '/play/arithmetic',
  optiver80: '/play/optiver80',
  percent: '/play/percent',
  multiplication: '/play/multiplication',
  fermi: '/play/fermi',
  sequence: '/play/sequence',
  evMarket: '/play/ev-market',
  etfArb: '/play/etf-arb',
}

export function Home() {
  const settings = useMemo(() => getSettings(), [])
  const todayStats = useMemo(() => {
    const history = getHistory()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const today = history.filter((h) => h.timestamp >= startOfDay.getTime())
    const totalQ = today.reduce((a, h) => a + h.totalQuestions, 0)
    const totalCorrect = today.reduce((a, h) => a + h.correct, 0)
    const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : null
    return { sessions: today.length, accuracy }
  }, [])

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-term-text">
            Quant<span className="text-term-accent">Drill</span>
          </h1>
          <p className="text-xs text-term-dim mt-0.5 font-nums">
            {todayStats.sessions > 0
              ? `Today: ${todayStats.sessions} sessions · ${todayStats.accuracy}% acc`
              : 'Offline mental math & trading drills'}
          </p>
        </div>
        <div className="flex gap-3 text-term-dim text-lg">
          <Link to="/stats" aria-label="Stats" className="active:text-term-accent">
            📊
          </Link>
          <Link to="/settings" aria-label="Settings" className="active:text-term-accent">
            ⚙️
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-2.5">
        {MODES.filter((m) => settings.enabledModes[m.id]).map((mode) => (
          <ModeCard key={mode.id} mode={mode} to={PATHS[mode.id]} />
        ))}
      </div>
    </div>
  )
}
