'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'

type GridItem = { id: string; name: string; image: string; type: 'product' | 'brand' | 'designer'; label?: string; brand?: string; price?: number }

export default function DiscoverPage() {
  const [items, setItems] = useState<GridItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Analytics.view('discover')
    let cancelled = false
    fetchProducts({ sort: 'new', limit: 16 })
      .then((products) => {
        if (cancelled) return
        setItems(
          (products || [])
            .filter((p: any) => p.images?.[0] && p.title && p.brand && p.price?.value)
            .slice(0, 16)
            .map((p: any) => ({
              id: String(p._id),
              type: 'product',
              name: String(p.title || ''),
              image: p.images[0],
              label: p.retailer || 'Discover',
              brand: p.brand || '',
              price: p.price?.value,
            }))
        )
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <CategoryGrid
      items={items}
      title="DISCOVER"
      isDiscoverPage={false}
      loading={loading}
      emptyMessage="Import demo feed data to activate discovery."
    />
  )
}
