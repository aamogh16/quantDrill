import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title: string
  onExit?: () => void
  onHelp?: () => void
  right?: React.ReactNode
}

export function TopBar({ title, onExit, onHelp, right }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-term-border bg-term-panel/80 backdrop-blur sticky top-0 z-20">
      <button
        onClick={() => (onExit ? onExit() : navigate('/'))}
        aria-label="Back"
        className="text-term-dim hover:text-term-text text-xl leading-none px-1 -ml-1"
      >
        ←
      </button>
      <h1 className="text-sm font-semibold tracking-wide uppercase text-term-text">{title}</h1>
      <div className="min-w-6 flex items-center justify-end gap-3">
        {onHelp && (
          <button
            onClick={onHelp}
            aria-label="How to play"
            className="h-5 w-5 rounded-full border border-term-dim text-term-dim text-xs leading-none flex items-center justify-center active:text-term-text active:border-term-text"
          >
            ?
          </button>
        )}
        {right}
      </div>
    </div>
  )
}
