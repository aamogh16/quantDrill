export type ModeId =
  | 'arithmetic'
  | 'optiver80'
  | 'percent'
  | 'multiplication'
  | 'fermi'
  | 'sequence'
  | 'evMarket'
  | 'etfArb'

export interface ModeMeta {
  id: ModeId
  name: string
  short: string
  description: string
  accent: string
  stretch?: boolean
}

export interface SessionRecord {
  id: string
  mode: ModeId
  timestamp: number
  durationSec: number
  totalQuestions: number
  correct: number
  wrong: number
  accuracy: number
  score: number
  pnl?: number
  avgTimeMs?: number
  meta?: Record<string, number | string>
}

export interface DifficultyRange {
  min: number
  max: number
}

export interface ArithmeticSettings {
  ops: { add: boolean; sub: boolean; mul: boolean; div: boolean }
  digits: DifficultyRange
  decimals: boolean
  fractions: boolean
  roundSeconds: number
}

export interface PercentSettings {
  roundSeconds: number
  includeFractions: boolean
  includeChained: boolean
}

export interface MultiplicationSettings {
  roundSeconds: number
  twoByTwo: boolean
  squares: boolean
  doublingChains: boolean
}

export interface FermiSettings {
  secondsPerQuestion: number
  questionsPerSession: number
}

export interface SequenceSettings {
  roundSeconds: number
  includeTraps: boolean
}

export interface EvMarketSettings {
  deckSize: number
  hiddenCards: number
  skew: number
  secondsPerDecision: number
  subMode: 'taking' | 'making' | 'mixed'
}

export interface EtfArbSettings {
  secondsPerRound: number
  legs: number
}

export interface Settings {
  /** When false, standard drills run with no countdown — play until you end the session manually. */
  timedSessions: boolean
  enabledModes: Record<ModeId, boolean>
  arithmetic: ArithmeticSettings
  percent: PercentSettings
  multiplication: MultiplicationSettings
  fermi: FermiSettings
  sequence: SequenceSettings
  evMarket: EvMarketSettings
  etfArb: EtfArbSettings
  difficultyLevels: Record<ModeId, number>
}
