import { useCallback } from 'react'
import { DrillLayout } from '../../components/DrillLayout'
import { useTimedDrill } from '../../lib/useTimedDrill'
import { getSettings } from '../../lib/storage'
import { generateArithmetic } from './generate'

export function ArithmeticPlay() {
  const settings = getSettings()
  const generate = useCallback((level: number) => generateArithmetic(settings.arithmetic, level), [settings])

  const drill = useTimedDrill({
    mode: 'arithmetic',
    roundSeconds: settings.arithmetic.roundSeconds,
    initialLevel: settings.difficultyLevels.arithmetic,
    generate,
    timed: settings.timedSessions,
  })

  return (
    <DrillLayout
      title="Arithmetic Sprints"
      mode="arithmetic"
      drill={drill}
      allowDecimal={settings.arithmetic.decimals || settings.arithmetic.fractions}
      allowNegative={false}
    />
  )
}
