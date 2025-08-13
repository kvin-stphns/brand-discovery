'use client'
import Image from 'next/image'
import RankSpark from './RankSpark'

export type LeaderboardItem = {
  id: string
  rank: number
  name: string
  label: string
  score: number
  delta: number
  type: 'brand' | 'designer' | 'product'
  image: string
  spark?: number[]
}

export default function LeaderboardGrid({ items }: { items: LeaderboardItem[] }) {
  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
      {items.map((it) => (
        <div key={it.id} className="border border-black p-4 flex items-center gap-4">
          <div className="text-sm w-6">{String(it.rank).padStart(2, '0')}</div>
          <div className="relative w-16 h-16 border border-black/20">
            <Image src={it.image} alt={it.name} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="text-sm tracking-[0.15em] font-semibold">{it.name}</div>
              <div className={`text-xs ${it.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {it.delta >= 0 ? '▲' : '▼'} {Math.abs(it.delta)}
              </div>
            </div>
            <div className="text-xs text-black/60">{it.label} • Score {it.score}</div>
            <div className="mt-2">
              <RankSpark data={it.spark || [2,4,3,5,6,4,7]} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


