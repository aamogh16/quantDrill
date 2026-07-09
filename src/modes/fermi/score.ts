export interface FermiResult {
  score: number
  contained: boolean
  logRatio: number
}

export function scoreFermi(low: number, high: number, answer: number): FermiResult {
  const lo = Math.max(1e-9, Math.min(low, high))
  const hi = Math.max(lo * 1.0001, Math.max(low, high))
  const contained = answer >= lo && answer <= hi
  const logRatio = Math.log10(hi / lo)

  if (contained) {
    const score = Math.max(10, Math.round(100 - logRatio * 18))
    return { score, contained, logRatio }
  }
  const distanceLog = answer < lo ? Math.log10(lo / Math.max(answer, 1e-9)) : Math.log10(answer / hi)
  const score = -Math.min(100, Math.round(30 + distanceLog * 25))
  return { score, contained, logRatio }
}

export function formatMagnitude(n: number): string {
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
