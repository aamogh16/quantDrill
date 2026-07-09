import { NumericKeypad } from '../../components/NumericKeypad'
import { formatMagnitude } from './score'

interface MagnitudeInputProps {
  label: string
  mantissa: string
  exponent: number
  onMantissaChange: (v: string) => void
  onExponentChange: (v: number) => void
  onSubmit: () => void
  accent?: string
}

export function MagnitudeInput({
  label,
  mantissa,
  exponent,
  onMantissaChange,
  onExponentChange,
  onSubmit,
  accent = 'var(--color-term-accent)',
}: MagnitudeInputProps) {
  const value = (parseFloat(mantissa || '0') || 0) * 10 ** exponent

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <span className="text-xs uppercase tracking-wide text-term-dim">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-nums text-3xl font-semibold" style={{ color: accent }}>
          {mantissa || '0'}
        </span>
        <span className="font-nums text-lg text-term-dim whitespace-nowrap">
          × 10<sup className="text-xs">{exponent}</sup>
        </span>
        <div className="flex flex-col gap-1 ml-1">
          <button
            className="h-6 w-8 rounded bg-term-panel-2 border border-term-border text-term-text text-xs active:bg-term-border/60"
            onClick={() => onExponentChange(Math.min(15, exponent + 1))}
          >
            +
          </button>
          <button
            className="h-6 w-8 rounded bg-term-panel-2 border border-term-border text-term-text text-xs active:bg-term-border/60"
            onClick={() => onExponentChange(Math.max(-3, exponent - 1))}
          >
            −
          </button>
        </div>
      </div>
      <span className="font-nums text-xs text-term-dim">≈ {formatMagnitude(value)}</span>
      <NumericKeypad
        value={mantissa}
        onChange={onMantissaChange}
        onSubmit={onSubmit}
        allowDecimal
        allowNegative={false}
        submitLabel="CONFIRM"
      />
    </div>
  )
}
