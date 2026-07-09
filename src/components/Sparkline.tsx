interface SparklineProps {
  values: number[]
  width?: number
  height?: number
}

export function Sparkline({ values, width = 96, height = 28 }: SparklineProps) {
  if (values.length < 2) {
    return <div style={{ width, height }} className="flex items-center text-term-dim text-[10px]">—</div>
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 4
  const step = (width - pad * 2) / (values.length - 1)
  const points = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return [x, y] as const
  })
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = points[points.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={path} fill="none" stroke="var(--color-term-dim)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={5} fill="var(--color-term-panel)" />
      <circle cx={lastX} cy={lastY} r={3.5} fill="var(--color-term-accent)" />
    </svg>
  )
}
