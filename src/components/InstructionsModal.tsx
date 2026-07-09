import type { ModeId } from '../types'
import { INSTRUCTIONS } from '../lib/instructions'

interface InstructionsModalProps {
  mode: ModeId
  onClose: () => void
}

export function InstructionsModal({ mode, onClose }: InstructionsModalProps) {
  const content = INSTRUCTIONS[mode]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-term-panel border border-term-border rounded-xl max-w-sm w-full p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-term-text">{content.title}</h2>
        <ul className="flex flex-col gap-2.5">
          {content.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm text-term-dim leading-snug">
              <span className="text-term-accent shrink-0">›</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="h-12 rounded-lg bg-term-accent text-term-bg font-semibold active:brightness-110"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
