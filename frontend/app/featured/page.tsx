'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'
import { toast } from '@/lib/toast'

type GridItem = { id: string; name: string; image: string; type: 'product' | 'brand' | 'designer'; label?: string; brand?: string; price?: number }

export default function FeaturedPage() {
  const [items, setItems] = useState<GridItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Analytics.view('featured')
    let didCancel = false

    async function load() {
      try {
        const prods = await fetchProducts({ sort: 'new', limit: 12 })

        if (!didCancel && prods?.length) {
          setItems(
            prods
              .filter((p: any) => p.images?.[0] && p.title && p.brand && p.price?.value)
              .slice(0, 12)
              .map((p: any) => ({ id: String(p._id), name: String(p.title || ''), image: p.images[0], type: 'product', label: p.retailer || 'Featured', brand: p.brand || '', price: p.price?.value }))
          )
        } else if (!didCancel) {
          toast('Live data unavailable', 'info')
        }
      } catch (_e) {
        if (!didCancel) toast('Live data unavailable', 'info')
      } finally {
        if (!didCancel) setLoading(false)
      }
    }
    load()
    return () => { didCancel = true }
  }, [])

  return (
    <CategoryGrid items={items} title="FEATURED" subtitle="Brands, Designers, and Pieces" gridType="mixed" loading={loading} emptyMessage="Import the demo feed to populate featured products." />
  )
} 
