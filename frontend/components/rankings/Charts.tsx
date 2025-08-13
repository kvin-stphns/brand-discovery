'use client'
import React from 'react'

export function RowSparkline({ data = [2,4,3,5,6,4,7] }: { data?: number[] }) {
  const width = 120
  const height = 32
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

export function MomentumChart({ series = [5,7,6,8,9,7,10,9,11,12] }: { series?: number[] }) {
  const width = 320
  const height = 120
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

export function CategoryShareChart({ values = [40,30,20,10] }: { values?: number[] }) {
  const total = values.reduce((a, b) => a + b, 0)
  return (
    <div className="w-full h-[160px] flex items-end gap-2" aria-label="category share chart">
      {values.map((v, i) => (
        <div key={i} className="flex-1 bg-black/10" style={{ height: `${(v / total) * 100}%` }} />
      ))}
    </div>
  )
}


