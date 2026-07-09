interface StatItem {
  label: string
  value: string | number
  tone?: 'neutral' | 'green' | 'red' | 'accent'
}

const toneClass: Record<string, string> = {
  neutral: 'text-term-text',
  green: 'text-term-green',
  red: 'text-term-red',
  accent: 'text-term-accent',
}

export function ScoreBar({ items }: { items: StatItem[] }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-term-border bg-term-panel text-xs font-nums">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <span className="text-term-dim uppercase tracking-wide text-[10px]">{item.label}</span>
          <span className={`text-sm font-semibold ${toneClass[item.tone ?? 'neutral']}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
