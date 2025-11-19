'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchProducts } from '@/lib/api/client'
import { toast } from '@/lib/toast'

type GridItem = { id: string; name: string; image: string; type: 'product' | 'brand' | 'designer'; label?: string; brand?: string; price?: number }

export default function FeaturedPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('featured')
    let didCancel = false

    async function load() {
      try {
        let prods = await fetchProducts({ sort: '-createdAt', limit: 12 })

        // Auto-scrape if empty (Demo Mode)
        if (!prods?.length && !didCancel) {
          toast('Initializing demo data... (this may take 10s)', 'info')
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/scrape`, { method: 'POST' })
            // Retry fetch
            prods = await fetchProducts({ sort: '-createdAt', limit: 12 })
          } catch (err) {
            console.error('Auto-scrape failed', err)
          }
        }

        if (!didCancel && prods?.length) {
          setItems(
            prods.slice(0, 12).map((p: any, idx: number) => ({ id: String(p._id), name: String(p.title || ''), image: p.images?.[0] || `/placeholders/product-${(idx % 4) + 1}.jpg`, type: 'product', label: 'Featured', brand: p.brand || '', price: p.price?.value }))
          )
        } else if (!didCancel) {
          toast('Live data unavailable', 'info')
        }
      } catch (_e) {
        if (!didCancel) toast('Live data unavailable', 'info')
      }
    }
    load()
    return () => { didCancel = true }
  }, [])

  return (
    <CategoryGrid items={items} title="FEATURED" subtitle="Brands, Designers, and Pieces" gridType="mixed" />
  )
} 
