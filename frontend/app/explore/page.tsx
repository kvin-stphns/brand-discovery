'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { mockList, type GridItem } from '@/lib/api/mock'
import { Analytics } from '@/lib/analytics'
import LeaderboardHub from '@/components/rankings/LeaderboardHub'

export default function ExplorePage() {
  const [items, setItems] = useState<GridItem[]>([])
  useEffect(() => {
    Analytics.view('explore')
    mockList('mixed', 12).then(setItems)
  }, [])
  return (
    <div className="pt-0">
      <CategoryGrid items={items} title="EXPLORE" subtitle="Mixed feed across categories" gridType="mixed" />
      <div className="max-w-[2000px] mx-auto px-8 mt-16">
        <h2 className="text-black text-2xl tracking-[0.05em] font-bold mb-4">EXPLORE RANKINGS</h2>
        <p className="text-xs tracking-[0.15em] text-gray-500 mb-6">Global mix with Women, Men, and Gifts filters</p>
        <LeaderboardHub initialMode="leaderboard" variant="global" />
      </div>
    </div>
  )
}