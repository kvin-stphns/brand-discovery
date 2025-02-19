'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'

export default function PopularPage() {
  const items = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    type: 'popular',
    name: `Popular Brand ${i + 1}`,
    image: `/brand-${i + 1}.jpg`,
    href: `/brands/popular-brand-${i + 1}`,
    brand: 'Popular Collection'
  }))

  return (
    <CategoryGrid 
      items={items}
      title="POPULAR"
      subtitle="BRANDS & DESIGNERS"
    />
  )
} 