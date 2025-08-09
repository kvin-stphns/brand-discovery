'use client'

import CategoryGrid from '@/components/templates/CategoryGrid'
import RankSpark from '@/components/viz/RankSpark'

export default function RankingsPage() {
  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: `rank-${i}`,
    name: `Top Brand ${i + 1}`,
    image: `/placeholders/brand-${(i % 4) + 1}.jpg`,
    type: 'brand' as const,
    label: `Score ${(100 - i * 3)}`
  }))

  return (
    <div>
      <div className="pt-[155px] px-8 max-w-[2000px] mx-auto">
        <h1 className="text-2xl tracking-[0.05em] font-bold mb-4">RANKINGS</h1>
        <RankSpark />
      </div>
      <CategoryGrid items={items} title="RANKINGS" />
    </div>
  )
}
