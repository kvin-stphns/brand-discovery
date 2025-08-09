'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getFeatured, type GridItem } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'

export default function FeaturedPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('featured')
    getFeatured(8).then(setItems)
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