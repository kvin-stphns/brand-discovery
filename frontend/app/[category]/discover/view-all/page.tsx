'use client'
import CollectionGrid from '@/components/templates/CollectionGrid'

interface PageProps {
  params: {
    category: string
  }
}

export default function CategoryDiscoverPage({ params }: PageProps) {
  const { category } = params
  
  // Placeholder data
  const collections = Array(20).fill(null).map((_, i) => ({
    id: `collection-${i}`,
    brand: 'Brand Name',
    designer: 'Designer Name',
    image: `/placeholders/product-${(i % 4) + 1}.jpg`
  }))

  return (
    <CollectionGrid 
      items={collections} 
      title={`${category.toUpperCase()} / DISCOVER / VIEW ALL`}
    />
  )
} 