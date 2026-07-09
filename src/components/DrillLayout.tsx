import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { ScoreBar } from './ScoreBar'
import { Timer, TimerBar } from './Timer'
import { NumericKeypad } from './NumericKeypad'
import { FeedbackFlash } from './FeedbackFlash'
import { ResultsScreen } from './ResultsScreen'
import { InstructionsModal } from './InstructionsModal'
import { useInstructionsModal } from '../lib/useInstructionsModal'
import type { TimedDrillState } from '../lib/useTimedDrill'
import type { ModeId } from '../types'

interface DrillLayoutProps {
  title: string
  mode: ModeId
  drill: TimedDrillState
  allowDecimal?: boolean
  allowNegative?: boolean
  renderPrompt?: (prompt: string) => ReactNode
  resultsExtra?: ReactNode
  submitLabel?: string
}

export function DrillLayout({
  title,
  mode,
  drill,
  allowDecimal = true,
  allowNegative = false,
  renderPrompt,
  resultsExtra,
  submitLabel,
}: DrillLayoutProps) {
  const instructions = useInstructionsModal(mode)

  if (drill.finished) {
    const total = drill.correct + drill.wrong
    return (
      <>
        <TopBar title={title} onHelp={instructions.show} />
        {instructions.open && <InstructionsModal mode={mode} onClose={instructions.close} />}
        <ResultsScreen
          stats={[
            { label: 'Score', value: String(drill.score), tone: drill.score >= 0 ? 'green' : 'red' },
            { label: 'Accuracy', value: `${total > 0 ? Math.round((drill.correct / total) * 100) : 0}%` },
            { label: 'Correct', value: String(drill.correct), tone: 'green' },
            { label: 'Wrong', value: String(drill.wrong), tone: 'red' },
          ]}
          onPlayAgain={drill.restart}
          extra={resultsExtra}
        />
      </>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        title={title}
        onHelp={instructions.show}
        right={<Timer remainingMs={drill.remainingMs} totalMs={drill.totalMs} />}
      />
      {instructions.open && <InstructionsModal mode={mode} onClose={instructions.close} />}
      <TimerBar remainingMs={drill.remainingMs} totalMs={drill.totalMs} />
      <ScoreBar
        items={[
          { label: 'Score', value: drill.score, tone: drill.score >= 0 ? 'green' : 'red' },
          { label: 'Correct', value: drill.correct, tone: 'green' },
          { label: 'Wrong', value: drill.wrong, tone: 'red' },
          { label: 'Streak', value: drill.streak, tone: 'accent' },
          { label: 'Level', value: drill.level, tone: 'accent' },
        ]}
      />
      <FeedbackFlash status={drill.feedback?.status ?? null} detail={drill.feedback?.detail} />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
        {renderPrompt ? (
          renderPrompt(drill.question.prompt)
        ) : (
          <div className="font-nums text-4xl font-semibold text-center text-term-text">
            {drill.question.prompt}
          </div>
        )}
        {drill.totalParts > 1 && (
          <div className="text-xs text-term-dim uppercase tracking-wide">
            Term {drill.partIndex + 1} of {drill.totalParts}
          </div>
        )}
        <div className="font-nums text-3xl text-term-accent min-h-10">{drill.input || '_'}</div>
      </div>
      <div className="px-4 pb-6 pt-2">
        <NumericKeypad
          value={drill.input}
          onChange={drill.setInput}
          onSubmit={drill.submit}
          allowDecimal={allowDecimal}
          allowNegative={allowNegative}
          submitLabel={submitLabel}
        />
      </div>
    </div>
  )
}
