import { useNavigate } from 'react-router-dom'

interface ResultStat {
  label: string
  value: string
  tone?: 'green' | 'red' | 'neutral' | 'accent'
}

interface ResultsScreenProps {
  title?: string
  stats: ResultStat[]
  onPlayAgain: () => void
  extra?: React.ReactNode
}

const toneClass: Record<string, string> = {
  neutral: 'text-term-text',
  green: 'text-term-green',
  red: 'text-term-red',
  accent: 'text-term-accent',
}

export function ResultsScreen({ title = 'Session Complete', stats, onPlayAgain, extra }: ResultsScreenProps) {
  const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10">
      <h2 className="text-lg font-semibold uppercase tracking-wide text-term-text">{title}</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-term-panel border border-term-border rounded-lg px-4 py-3 flex flex-col items-center gap-1"
          >
            <span className="text-[10px] uppercase tracking-wide text-term-dim">{s.label}</span>
            <span className={`font-nums text-xl font-semibold ${toneClass[s.tone ?? 'neutral']}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
      {extra}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={() => navigate('/')}
          className="flex-1 h-12 rounded-lg border border-term-border text-term-dim font-medium active:bg-term-panel-2"
        >
          Home
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 h-12 rounded-lg bg-term-accent text-term-bg font-semibold active:brightness-110"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
