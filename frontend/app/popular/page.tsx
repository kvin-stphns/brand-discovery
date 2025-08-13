'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import type { GridItem } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'
import { fetchRankings } from '@/lib/api/client'
import { toast } from '@/lib/toast'

export default function PopularPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('popular')
    fetchRankings()
      .then((rows) => {
        setItems(
          rows.slice(0, 8).map((r) => ({
            id: r.id,
            type: 'brand',
            name: r.name,
            image: '/placeholders/brand-default.jpg',
          })) as GridItem[]
        )
      })
      .catch(() => {
        toast('Failed to load popular', 'error')
        setItems([])
      })
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