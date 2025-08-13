'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { type GridItem } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'
import { toast } from '@/lib/toast'
import { USE_LIVE } from '@/lib/api/liveToggle'

export default function FeaturedPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('featured')
    let didCancel = false
    async function load() {
      try {
        const prods = await fetchProducts({ sort: '-createdAt', limit: 12, source: 'farfetch,ssense' } as any)
        if (!didCancel && prods?.length) {
          setItems(
            prods.slice(0, 12).map((p: any, idx: number) => ({ id: p._id, name: p.name, image: p.images?.[0] || `/placeholders/product-${(idx % 4) + 1}.jpg`, type: 'product', label: 'Featured' })) as any
          )
        } else {
          if (USE_LIVE) toast('Live data unavailable', 'info')
        }
      } catch (_e) {
        if (USE_LIVE) toast('Live data unavailable', 'info')
      }
    }
    load()
    return () => { didCancel = true }
  }, [])

  return (
    <CategoryGrid items={items} title="FEATURED" subtitle="Brands, Designers, and Pieces" gridType="mixed" />
  )
} 