'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'

export default function DiscoverPage() {
  const items = Array.from({ length: 8 }).map((_, i) => ({
    type: 'discover',
    name: `Discover ${i + 1}`,
    image: `/brand-${i + 1}.jpg`
  }))

  return (
    <CategoryGrid 
      items={items}
      title="DISCOVER"
      isDiscoverPage={true}
    />
  )
} 