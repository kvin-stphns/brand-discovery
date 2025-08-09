'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getPopular, type GridItem } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
import { Analytics } from '@/lib/analytics'

export default function PopularPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('popular')
    getPopular(8).then(setItems)
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