'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getPopular } from '@/lib/api/mock'
import { useEffect, useState } from 'react'
<<<<<<< Current (Your changes)

export default function PopularPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    getPopular(8).then(setItems)
  }, [])
=======
import type { GridItem } from '@/lib/api/mock'
import { Analytics } from '@/lib/analytics'
import { GridCardSkeleton } from '@/components/common/Skeleton'

export default function PopularPage() {
  const [items, setItems] = useState<GridItem[]>([])

  useEffect(() => {
    Analytics.view('POPULAR')
    getPopular(8).then(setItems)
  }, [])

  if (items.length === 0) {
    return (
      <div className="max-w-[2000px] mx-auto mt=[260px] px-8">
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-r border-b border-black last:border-r-0 tablet:last:border-r">
              <GridCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }
>>>>>>> Incoming (Background Agent changes)

  return (
    <CategoryGrid 
      items={items}
      title="POPULAR"
      subtitle="Brands, Designers, and Pieces"
      gridType="mixed"
    />
  )
} 