'use client'
import GeoMap from '@/components/map/GeoMap'
import { MapRankingPoint } from '@/lib/rankings/types'

export default function MapLeaderboard({ points }: { points: MapRankingPoint[] }) {
  return (
    <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
      <div className="desktop:col-span-2">
        <GeoMap points={points} />
      </div>
      <div className="desktop:col-span-1 border border-black divide-y">
        {points.map((p) => (
          <div key={p.name} className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm tracking-[0.15em] font-semibold">{p.name}</div>
              <div className="text-xs text-black/60">Score {p.score} • #{p.rank}</div>
            </div>
            <a className="text-xs underline" href={p.externalUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
          </div>
        ))}
      </div>
    </div>
  )
}

