'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'

type GridItem = { id: string; name: string; image: string; type: 'product'|'brand'|'designer'; label?: string; brand?: string; price?: number }

export default function DiscoverPage() {
  const [items, setItems] = useState<GridItem[]>([])
  useEffect(() => {
    Analytics.view('discover')
    let cancelled = false
    async function load() {
      try {
        const prods = await fetchProducts({ limit: 8 })
        if (cancelled) return
        setItems((prods || []).slice(0, 8).map((p: any, i: number) => ({
          id: String(p._id),
          type: 'product',
          name: String(p.title || ''),
          image: p.images?.[0] || `/placeholders/product-${(i % 4) + 1}.jpg`,
          brand: p.brand || '',
          price: p.price?.value,
        })))
      } catch {
        if (!cancelled) setItems([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <CategoryGrid 
      items={items}
      title="DISCOVER"
    />
  )
}
