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
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Analytics.view('explore')
    let didCancel = false
    async function load() {
      try {
        const prods = await fetchProducts({ sort: 'new', limit: 12 })
        if (!didCancel && prods?.length) {
          setItems(
            prods.filter((p: any) => p.images?.[0] && p.title && p.brand && p.price?.value).slice(0, 12).map((p: any) => ({
              id: String(p._id),
              type: 'product',
              name: String(p.title || ''),
              image: p.images[0],
              label: p.retailer || 'Explore',
              brand: p.brand || '',
              price: p.price?.value,
            }))
          )
        } else {
          setItems([])
        }
      } catch {
        setItems([])
      } finally {
        if (!didCancel) setLoading(false)
      }
    }
    load()
    return () => { didCancel = true }
  }, [])
  return (
    <div className="pt-0">
      <CategoryGrid items={items} title="EXPLORE" subtitle="Mixed feed across categories" gridType="mixed" loading={loading} emptyMessage="Import product feed data to explore the catalog." />
      <div className="max-w-[2000px] mx-auto px-8 mt-16">
        <h2 className="text-black text-2xl tracking-[0.05em] font-bold mb-4">EXPLORE RANKINGS</h2>
        <p className="text-xs tracking-[0.15em] text-gray-500 mb-6">Global mix with Women, Men, and Gifts filters</p>
        <LeaderboardHub initialMode="leaderboard" variant="global" />
      </div>
    </div>
  )
}
