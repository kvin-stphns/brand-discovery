'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import LeaderboardHub from '@/components/rankings/LeaderboardHub'
import { toast } from '@/lib/toast'
import { fetchProducts } from '@/lib/api/client'

type GridItem = { id: string; name: string; image: string; type: 'product'|'brand'|'designer'; label?: string; brand?: string; price?: number }

export default function ExplorePage() {
  const [items, setItems] = useState<GridItem[]>([])
  useEffect(() => {
    Analytics.view('explore')
    let didCancel = false
    async function load() {
      try {
        const prods = await fetchProducts({ sort: '-createdAt', limit: 12 })
        if (!didCancel && prods?.length) {
          setItems(
            prods.slice(0, 12).map((p: any, idx: number) => ({
              id: String(p._id),
              type: 'product',
              name: String(p.title || ''),
              image: p.images?.[0] || `/placeholders/product-${(idx % 4) + 1}.jpg`,
              label: 'Explore',
              brand: p.brand || '',
              price: p.price?.value,
            }))
          )
        } else {
          setItems([])
        }
      } catch {
        setItems([])
      }
    }
    load()
    return () => { didCancel = true }
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
