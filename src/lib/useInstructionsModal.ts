import { useCallback, useState } from 'react'
import type { ModeId } from '../types'
import { hasSeenInstructions, markInstructionsSeen } from './storage'

export function useInstructionsModal(mode: ModeId) {
  const [open, setOpen] = useState(() => !hasSeenInstructions(mode))

  const close = useCallback(() => {
    setOpen(false)
    markInstructionsSeen(mode)
  }, [mode])

  const show = useCallback(() => setOpen(true), [])

  return { open, show, close }
}
