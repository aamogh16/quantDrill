import { useCallback } from 'react'
import { DrillLayout } from '../../components/DrillLayout'
import { useTimedDrill } from '../../lib/useTimedDrill'
import { getSettings } from '../../lib/storage'
import { generatePercent } from './generate'

export function PercentPlay() {
  const settings = getSettings()
  const generate = useCallback((level: number) => generatePercent(settings.percent, level), [settings])

  const drill = useTimedDrill({
    mode: 'percent',
    roundSeconds: settings.percent.roundSeconds,
    initialLevel: settings.difficultyLevels.percent,
    generate,
    timed: settings.timedSessions,
  })

  return (
    <DrillLayout
      title="Percentage & Fraction"
      mode="percent"
      drill={drill}
      allowDecimal
      allowNegative
      renderPrompt={(prompt) => (
        <div
          className={`font-nums font-semibold text-center text-term-text px-2 ${
            prompt.length > 24 ? 'text-xl leading-snug' : 'text-4xl'
          }`}
        >
          {prompt}
        </div>
      )}
    />
  )
}
