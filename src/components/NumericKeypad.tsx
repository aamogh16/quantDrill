interface NumericKeypadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  allowDecimal?: boolean
  allowNegative?: boolean
  submitLabel?: string
  disabled?: boolean
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  allowDecimal = true,
  allowNegative = false,
  submitLabel = 'ENTER',
  disabled = false,
}: NumericKeypadProps) {
  const press = (key: string) => {
    if (disabled) return
    if (key === 'back') {
      onChange(value.slice(0, -1))
      return
    }
    if (key === 'clear') {
      onChange('')
      return
    }
    if (key === '-') {
      if (!allowNegative) return
      onChange(value.startsWith('-') ? value.slice(1) : `-${value}`)
      return
    }
    if (key === '.') {
      if (!allowDecimal || value.includes('.')) return
      onChange(value === '' || value === '-' ? `${value}0.` : `${value}.`)
      return
    }
    onChange(value + key)
  }

  const btnClass =
    'h-14 rounded-lg bg-term-panel-2 border border-term-border text-term-text text-xl font-nums font-medium active:bg-term-border/60 select-none touch-manipulation'

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto">
      {KEYS.map((k) => (
        <button key={k} className={btnClass} onClick={() => press(k)} disabled={disabled}>
          {k}
        </button>
      ))}
      <button
        className={btnClass}
        onClick={() => press(allowNegative ? '-' : 'clear')}
        disabled={disabled}
      >
        {allowNegative ? '±' : 'C'}
      </button>
      <button className={btnClass} onClick={() => press('0')} disabled={disabled}>
        0
      </button>
      <button
        className={btnClass}
        onClick={() => press(allowDecimal ? '.' : 'back')}
        disabled={disabled}
      >
        {allowDecimal ? '.' : '⌫'}
      </button>
      {allowDecimal && (
        <button className={`${btnClass} col-span-1`} onClick={() => press('back')} disabled={disabled}>
          ⌫
        </button>
      )}
      <button
        className={`h-14 rounded-lg bg-term-green-dim border border-term-green/40 text-term-green text-base font-semibold active:brightness-125 touch-manipulation ${
          allowDecimal ? 'col-span-2' : 'col-span-3'
        }`}
        onClick={onSubmit}
        disabled={disabled}
      >
        {submitLabel}
      </button>
    </div>
  )
}
