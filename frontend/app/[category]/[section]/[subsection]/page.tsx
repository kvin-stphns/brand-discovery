'use client'

import { useEffect, useState, useMemo } from 'react'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { fetchProducts } from '@/lib/api/client'

interface PageProps {
  params: {
    category: string
    section: string
    subsection: string
  }
}

type GridItem = { id: string; name: string; image: string; type: 'product' | 'brand' | 'designer'; label?: string; brand?: string }

export default function CategoryPage({ params }: PageProps) {
  const { category, section, subsection } = params
  const [items, setItems] = useState<GridItem[]>([])

  // Logic Matrix for Layer 1
  const layer1Filter = useMemo(() => {
    const f: any = {}
    const catLower = category.toLowerCase()
    if (catLower === 'men') f.gender = 'Men'
    else if (catLower === 'women') f.gender = 'Women'
    return f
  }, [category])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const term = decodeURIComponent(subsection.replace(/-/g, ' '))
      try {
        // Layer 2 Filtering
        const filters: any = { ...layer1Filter, limit: 20 }

        if (section === 'categories') {
          filters.category = term
        } else if (section === 'brands') {
          // Try to filter by brand name (q) or brandId if subsection is ID
          // Since we don't have ID resolution here easily without another call, we use 'q' which searches title and brand
          // Ideally, we should have a way to lookup brand by slug. 
          // For now, assuming 'q' is sufficient or subsection is the ID if it's hex.
          const isHex = /^[0-9a-fA-F]{24}$/.test(subsection)
          if (isHex) filters.brandId = subsection
          else filters.q = term
        } else if (section === 'designers') {
          const isHex = /^[0-9a-fA-F]{24}$/.test(subsection)
          if (isHex) filters.designerId = subsection
          else filters.q = term
        } else {
          filters.q = term
        }

        let prods = await fetchProducts(filters)

        // Fallback (only if no specific filters matched and we got 0 results, maybe try broader search)
        // But strict filtering is requested. So if 0, show 0.
        // However, the original code had a fallback to "freshest products". 
        // We should probably NOT fallback to random products if we want "ONLY Men's Tops".
        // If 0 results, it means 0 results.

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
  }, [category, section, subsection, layer1Filter])

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
