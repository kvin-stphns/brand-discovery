'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { useEffect, useState } from 'react'
import { mockList, type GridItem } from '@/lib/api/mock'
import { Analytics } from '@/lib/analytics'

export default function ExplorePage() {
  const [items, setItems] = useState<GridItem[]>([])
  useEffect(() => {
    Analytics.view('explore')
    mockList('mixed', 12).then(setItems)
  }, [])
  return (
    <CategoryGrid items={items} title="EXPLORE" subtitle="Mixed feed across categories" gridType="mixed" />
  )
}