export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? 'bg-term-accent' : 'bg-term-border'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-term-bg transition-all ${checked ? 'left-5' : 'left-0.5'}`}
      />
    </button>
  )
}
