'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getPopular } from '@/lib/api/mock'
import { useEffect, useState } from 'react'

export default function PopularPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
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