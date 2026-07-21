import { useCallback } from 'react'
import { DrillLayout } from '../../components/DrillLayout'
import { useTimedDrill } from '../../lib/useTimedDrill'
import { getSettings } from '../../lib/storage'
import { generateMultiplication } from './generate'

export function MultiplicationPlay() {
  const settings = getSettings()
  const generate = useCallback(
    (level: number) => generateMultiplication(settings.multiplication, level),
    [settings],
  )

  const drill = useTimedDrill({
    mode: 'multiplication',
    roundSeconds: settings.multiplication.roundSeconds,
    initialLevel: settings.difficultyLevels.multiplication,
    generate,
    timed: settings.timedSessions,
  })

  return (
    <DrillLayout
      title="Mental Multiplication"
      mode="multiplication"
      drill={drill}
      allowDecimal
      allowNegative={false}
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
