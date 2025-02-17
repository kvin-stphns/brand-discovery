'use client'
import ListLayout from '@/components/templates/ListLayout'

interface PageProps {
  params: {
    category: string
  }
}

export default function CategoryDiscoverPage({ params }: PageProps) {
  const { category } = params
  
  // Placeholder data
  const items = Array(20).fill(null).map((_, i) => ({
    id: `item-${i}`,
    name: `Discover Item ${i + 1}`,
    category: 'Category Name',
    image: `/placeholders/product-${(i % 4) + 1}.jpg`,
    href: `/discover/item-${i + 1}`
  }))

  return (
    <ListLayout 
      items={items} 
      title="DISCOVER"
      category={category}
      section="discover"
      subsection="view-all"
    />
  )
} 