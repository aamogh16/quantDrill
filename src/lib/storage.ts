import type { ModeId, SessionRecord, Settings } from '../types'

const SETTINGS_KEY = 'qd_settings_v1'
const HISTORY_KEY = 'qd_history_v1'
const MAX_HISTORY = 1000

export const DEFAULT_SETTINGS: Settings = {
  timedSessions: true,
  enabledModes: {
    arithmetic: true,
    optiver80: true,
    percent: true,
    multiplication: true,
    fermi: true,
    sequence: true,
    evMarket: true,
    etfArb: true,
  },
  arithmetic: {
    ops: { add: true, sub: true, mul: true, div: true },
    digits: { min: 1, max: 2 },
    decimals: false,
    fractions: false,
    roundSeconds: 60,
  },
  percent: {
    roundSeconds: 60,
    includeFractions: true,
    includeChained: true,
  },
  multiplication: {
    roundSeconds: 60,
    twoByTwo: true,
    squares: true,
    doublingChains: true,
  },
  fermi: {
    secondsPerQuestion: 45,
    questionsPerSession: 6,
  },
  sequence: {
    roundSeconds: 60,
    includeTraps: true,
  },
  evMarket: {
    deckSize: 52,
    hiddenCards: 3,
    skew: 2,
    secondsPerDecision: 15,
    subMode: 'mixed',
  },
  etfArb: {
    secondsPerRound: 45,
    legs: 3,
  },
  difficultyLevels: {
    arithmetic: 1,
    optiver80: 1,
    percent: 1,
    multiplication: 1,
    fermi: 1,
    sequence: 1,
    evMarket: 1,
    etfArb: 1,
  },
}

function mergeDefaults<T>(base: T, incoming: Partial<T>): T {
  const out: T = { ...base }
  for (const key in incoming) {
    const incomingVal = incoming[key]
    const baseVal = (base as Record<string, unknown>)[key as string]
    if (
      incomingVal &&
      typeof incomingVal === 'object' &&
      !Array.isArray(incomingVal) &&
      baseVal &&
      typeof baseVal === 'object'
    ) {
      ;(out as Record<string, unknown>)[key as string] = mergeDefaults(
        baseVal,
        incomingVal as Record<string, unknown>,
      )
    } else if (incomingVal !== undefined) {
      ;(out as Record<string, unknown>)[key as string] = incomingVal
    }
  }
  return out
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return mergeDefaults(DEFAULT_SETTINGS, parsed)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = mergeDefaults(getSettings(), patch)
  saveSettings(next)
  return next
}

export function setDifficultyLevel(mode: ModeId, level: number): void {
  const settings = getSettings()
  settings.difficultyLevels[mode] = level
  saveSettings(settings)
}

export function getHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SessionRecord[]
  } catch {
    return []
  }
}

export function addSessionRecord(record: SessionRecord): void {
  const history = getHistory()
  history.push(record)
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

export function historyForMode(mode: ModeId): SessionRecord[] {
  return getHistory().filter((r) => r.mode === mode)
}

const SEEN_INSTRUCTIONS_KEY = 'qd_seen_instructions_v1'

export function hasSeenInstructions(mode: ModeId): boolean {
  try {
    const raw = localStorage.getItem(SEEN_INSTRUCTIONS_KEY)
    if (!raw) return false
    const seen = JSON.parse(raw) as Partial<Record<ModeId, boolean>>
    return !!seen[mode]
  } catch {
    return false
  }
}

export function markInstructionsSeen(mode: ModeId): void {
  try {
    const raw = localStorage.getItem(SEEN_INSTRUCTIONS_KEY)
    const seen = raw ? (JSON.parse(raw) as Partial<Record<ModeId, boolean>>) : {}
    seen[mode] = true
    localStorage.setItem(SEEN_INSTRUCTIONS_KEY, JSON.stringify(seen))
  } catch {
    // ignore
  }
}
