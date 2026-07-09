interface StepperProps {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format?: (v: number) => string
}

export function Stepper({ value, onChange, min, max, step = 1, format }: StepperProps) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100))
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 100) / 100))
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={dec}
        className="h-7 w-7 rounded-md bg-term-panel-2 border border-term-border text-term-text active:bg-term-border/60"
      >
        −
      </button>
      <span className="font-nums text-sm w-12 text-center text-term-text">{format ? format(value) : value}</span>
      <button
        onClick={inc}
        className="h-7 w-7 rounded-md bg-term-panel-2 border border-term-border text-term-text active:bg-term-border/60"
      >
        +
      </button>
    </div>
  )
}
