import { useCallback } from 'react'
import { DrillLayout } from '../../components/DrillLayout'
import { useTimedDrill } from '../../lib/useTimedDrill'
import { getSettings } from '../../lib/storage'
import { generateSequence } from './generate'

export function SequencePlay() {
  const settings = getSettings()
  const generate = useCallback((level: number) => generateSequence(settings.sequence, level), [settings])

  const drill = useTimedDrill({
    mode: 'sequence',
    roundSeconds: settings.sequence.roundSeconds,
    initialLevel: settings.difficultyLevels.sequence,
    generate,
  })

  return (
    <DrillLayout
      title="Sequence & Pattern"
      drill={drill}
      allowDecimal
      allowNegative
      renderPrompt={(prompt) => (
        <div
          className={`font-nums font-semibold text-center text-term-text px-2 ${
            prompt.length > 28 ? 'text-xl leading-snug' : 'text-2xl'
          }`}
        >
          {prompt}
        </div>
      )}
    />
  )
}
