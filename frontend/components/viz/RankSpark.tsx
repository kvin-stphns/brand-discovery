'use client'

import React from 'react'

export default function RankSpark({ data = [2,4,3,5,6,4,7] }: { data?: number[] }) {
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
