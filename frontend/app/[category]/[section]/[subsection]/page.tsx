'use client'

import { useEffect, useState } from 'react'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { fetchProducts } from '@/lib/api/client'

interface PageProps {
  params: {
    category: string
    section: string
    subsection: string
  }
}

type GridItem = { id: string; name: string; image: string; type: 'product'|'brand'|'designer'; label?: string; brand?: string }

export default function CategoryPage({ params }: PageProps) {
  const { category, section, subsection } = params
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const term = decodeURIComponent(subsection.replace(/-/g, ' '))
      try {
        // First attempt: query by subsection to keep page context
        let prods = await fetchProducts({ q: term, limit: 20 })
        // Fallback: if nothing matches, show freshest products
        if (!prods?.length) prods = await fetchProducts({ limit: 20 })
        if (cancelled) return
        setItems(
          (prods || []).slice(0, 20).map((p: any, i: number) => ({
            id: String(p._id),
            type: 'product',
            name: String(p.title || ''),
            image: p.images?.[0] || `/placeholders/product-${(i % 4) + 1}.jpg`,
            brand: String(p.brand || ''),
            label: section,
          }))
        )
      } catch {
        if (!cancelled) setItems([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [section, subsection])

  return (
    <CategoryGrid 
      items={items}
      title={section.toUpperCase()}
      category={category}
      section={section}
      subsection={subsection}
      gridType="product"
    />
  )
}
