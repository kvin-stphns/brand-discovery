'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'
import { toast } from '@/lib/toast'

type GridItem = { id: string; name: string; image: string; type: 'product'|'brand'|'designer'; label?: string; brand?: string; price?: number }

export default function PopularPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('popular')
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
              label: 'Popular',
              brand: p.brand || '',
              price: p.price?.value,
            }))
          )
        } else {
          toast('No results', 'info')
          setItems([])
        }
      } catch {
        toast('No results', 'error')
        setItems([])
      }
    }
    load()
    return () => { didCancel = true }
  }, [])

  return (
    <CategoryGrid 
      items={items}
      title="POPULAR"
      subtitle="Brands, Designers, and Pieces"
      gridType="mixed"
    />
  )
}
