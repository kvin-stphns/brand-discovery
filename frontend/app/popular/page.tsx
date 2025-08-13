'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getPopular, type GridItem } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'
import { toast } from '@/lib/toast'

export default function PopularPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('popular')
    let didCancel = false
    async function load() {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 2000)
      try {
        const prods = await fetchProducts({ sort: '-createdAt', limit: 12 } as any)
        if (!didCancel && prods?.length) {
          setItems(
            prods.slice(0, 12).map((p: any, idx: number) => ({ id: p._id, name: p.name, image: p.images?.[0] || `/placeholders/product-${(idx % 4) + 1}.jpg`, type: 'product', label: 'Popular' })) as any
          )
        } else {
          const mock = await getPopular(12)
          setItems(mock)
          toast('Live data temporarily unavailable', 'info')
        }
      } catch (_e) {
        const mock = await getPopular(12)
        setItems(mock)
        toast('Live data temporarily unavailable', 'info')
      } finally {
        clearTimeout(t)
      }
    }
    load()
    return () => { didCancel = true }
  }, [])

  return (
    <CategoryGrid items={items} title="POPULAR" subtitle="Brands, Designers, and Pieces" gridType="mixed" />
  )
} 