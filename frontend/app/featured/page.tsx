'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'

export default function FeaturedPage() {
  const items = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    type: 'featured',
    name: `Featured Brand ${i + 1}`,
    image: `/brand-${i + 1}.jpg`,
    href: `/brands/featured-brand-${i + 1}`,
    brand: 'Featured Collection'
  }))

  return (
    <CategoryGrid 
      items={items}
      title="FEATURED"
      category="BRANDS & DESIGNERS"
    />
  )
} 