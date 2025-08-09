'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getFeatured } from '@/lib/api/mock'
import { useEffect, useState } from 'react'

export default function FeaturedPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
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