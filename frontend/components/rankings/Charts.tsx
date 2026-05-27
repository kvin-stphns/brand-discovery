'use client'
import React from 'react'

export function RowSparkline({ data = [] }: { data?: number[] }) {
  const width = 120
  const height = 32
  if (!data.length) {
    return <svg width={width} height={height} aria-label="trend sparkline" />
  }
  const max = Math.max(...data)
  const min = Math.min(...data)
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} aria-label="trend sparkline">
      <polyline points={points} fill="none" stroke="#4FFFF4" strokeWidth="2" />
    </svg>
  )
}

export function MomentumChart({ series = [] }: { series?: number[] }) {
  const width = 320
  const height = 120
  if (!series.length) {
    return <svg width={width} height={height} className="w-full h-[160px]" aria-label="momentum line chart" />
  }
  const max = Math.max(...series)
  const min = Math.min(...series)
  const step = width / (series.length - 1)
  const path = series.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / (max - min || 1)) * height
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} className="w-full h-[160px]" aria-label="momentum line chart">
      <path d={path} fill="none" stroke="#000" strokeWidth="1.5" />
    </svg>
  )
}

export function CategoryShareChart({ values = [] }: { values?: number[] }) {
  const total = values.reduce((a, b) => a + b, 0)
  if (!values.length || total <= 0) {
    return <div className="w-full h-[160px] flex items-end gap-2" aria-label="category share chart" />
  }
  return (
    <div className="w-full h-[160px] flex items-end gap-2" aria-label="category share chart">
      {values.map((v, i) => (
        <div key={i} className="flex-1 bg-black/10" style={{ height: `${(v / total) * 100}%` }} />
      ))}
    </div>
  )
}

export function BarChart({ values = [], labels = [] }: { values?: number[]; labels?: string[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="w-full">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <div className="w-10 text-xs">{labels[i] || `#${i+1}`}</div>
          <div className="flex-1 bg-black/10 h-3 relative">
            <div className="bg-black h-3" style={{ width: `${(v / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

type Series = { name: string; data: number[] }
export function CombinedInsightsChart({ series = [] as Series[] }: { series?: Series[] }) {
  const width = 640
  const height = 200
  const allValues = series.flatMap(s => s.data)
  const max = Math.max(...allValues, 1)
  const min = Math.min(...allValues, 0)
  const colors = ['#000', '#4FFFF4', '#888']
  const step = (dataLen: number) => (dataLen > 1 ? width / (dataLen - 1) : width)

  const paths = series.map((s, si) => {
    const stp = step(s.data.length)
    const d = s.data.map((v, i) => {
      const x = i * stp
      const y = height - ((v - min) / (max - min || 1)) * height
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    }).join(' ')
    return { d, color: colors[si % colors.length], name: s.name }
  })

  return (
    <div className="w-full">
      <svg width={width} height={height} className="w-full h-[220px]" aria-label="combined insights chart">
        {/* grid */}
        {[0,0.25,0.5,0.75,1].map((p, i) => (
          <line key={i} x1={0} x2={width} y1={height * p} y2={height * p} stroke="#000" opacity={0.06} />
        ))}
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={1.5} />
        ))}
      </svg>
      {/* legend */}
      <div className="flex gap-4 mt-2 text-xs">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block w-3 h-0.5" style={{ backgroundColor: p.color }} />
            <span className="truncate max-w-[160px]" title={p.name}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

