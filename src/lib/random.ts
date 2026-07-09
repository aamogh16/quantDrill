export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randFloat(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min
  const factor = 10 ** decimals
  return Math.round(v * factor) / factor
}

export function choice<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function digitsRange(digits: number): { min: number; max: number } {
  if (digits <= 1) return { min: 0, max: 9 }
  return { min: 10 ** (digits - 1), max: 10 ** digits - 1 }
}
