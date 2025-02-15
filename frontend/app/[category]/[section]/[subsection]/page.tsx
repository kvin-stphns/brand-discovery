'use client'
import CollectionGrid from '@/components/templates/CollectionGrid'

interface PageProps {
  params: {
    category: string
    section: string
    subsection: string
  }
}

export default function CategoryPage({ params }: PageProps) {
  const { category, section, subsection } = params
  
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
      title={`${category.toUpperCase()} / ${section.toUpperCase()} / ${subsection.toUpperCase().replace('-', ' ')}`}
    />
  )
} 