'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import type { GridItem } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchBrands } from '@/lib/api/client'
import { toast } from '@/lib/toast'

export default function FeaturedPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('featured')
    fetchBrands()
      .then((brands) => {
        setItems(
          brands.slice(0, 8).map((b) => ({
            id: b._id,
            type: 'brand',
            name: b.name,
            image: b.image || '/placeholders/brand-default.jpg',
          })) as GridItem[]
        )
      })
      .catch(() => {
        toast('Failed to load featured brands', 'error')
        setItems([])
      })
  }, [])

  return (
    <CategoryGrid 
      items={items}
      title="FEATURED"
      subtitle="Brands, Designers, and Pieces"
      gridType="mixed"
    />
  )
} 