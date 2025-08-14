'use client'
import Image from 'next/image'
import { RankingListItem } from '@/lib/rankings/types'
import { sanitizeText } from '@/lib/format'

export default function RankingsList({ items }: { items: RankingListItem[] }) {
  return (
    <div className="divide-y border border-black">
      {items.map((it) => (
        <div key={it.id} className="flex items-center gap-4 p-4">
          <div className="w-10 text-sm">{String(it.rank).padStart(2, '0')}</div>
          <div className="relative w-16 h-16 border border-black/20">
            <Image src={it.image || '/placeholders/brand-1.jpg'} alt={sanitizeText(it.name)} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="text-sm tracking-[0.15em] font-semibold">{sanitizeText(it.name)}</div>
            <div className="text-xs text-black/60">{it.type.toUpperCase()}</div>
          </div>
          <div className="text-xs tracking-[0.15em]">{it.metric}</div>
        </div>
      ))}
    </div>
  )
}


