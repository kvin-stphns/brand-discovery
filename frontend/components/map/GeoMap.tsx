'use client'

import React from 'react'

export default function GeoMap() {
  return (
    <div className="w-full h-[60vh] border border-black relative overflow-hidden">
      <svg viewBox="0 0 800 400" className="w-full h-full" aria-label="World map placeholder">
        <rect x="0" y="0" width="800" height="400" fill="#fafafa" />
        <g stroke="#000" strokeWidth="1" fill="none" opacity="0.25">
          <path d="M50,200 C150,50 300,100 400,180 C500,260 650,220 750,160" />
          <path d="M50,240 C200,280 300,260 450,240 C600,220 700,260 750,240" />
        </g>
        <g>
          <circle cx="220" cy="160" r="4" fill="#4FFFF4" />
          <circle cx="420" cy="190" r="4" fill="#4FFFF4" />
          <circle cx="600" cy="170" r="4" fill="#4FFFF4" />
        </g>
      </svg>
      <div className="absolute bottom-2 right-2 text-[10px] tracking-[0.15em] text-black/60">Mock locations</div>
    </div>
  )
}
