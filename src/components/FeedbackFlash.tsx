interface FeedbackFlashProps {
  status: 'correct' | 'wrong' | null
  detail?: string
}

export function FeedbackFlash({ status, detail }: FeedbackFlashProps) {
  if (!status) return null
  const isCorrect = status === 'correct'
  return (
    <div
      key={`${status}-${detail}-${Date.now()}`}
      className={`pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center animate-[flashIn_0.5s_ease-out]`}
    >
      <div
        className={`rounded-full px-4 py-1.5 text-sm font-semibold font-nums border ${
          isCorrect
            ? 'bg-term-green-dim text-term-green border-term-green/40'
            : 'bg-term-red-dim text-term-red border-term-red/40'
        }`}
      >
        {isCorrect ? '✓ CORRECT' : '✕ WRONG'}
        {detail ? ` ${detail}` : ''}
      </div>
    </div>
  )
}
