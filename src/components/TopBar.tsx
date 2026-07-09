import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title: string
  onExit?: () => void
  right?: React.ReactNode
}

export function TopBar({ title, onExit, right }: TopBarProps) {
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
      <div className="min-w-6 flex justify-end">{right}</div>
    </div>
  )
}
