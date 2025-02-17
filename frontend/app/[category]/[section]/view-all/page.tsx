'use client'
import { useEffect } from 'react'
import ListLayout from '@/components/templates/ListLayout'

interface PageProps {
  params: {
    category: string
    section: string
  }
}

export default function CategoryViewAllPage({ params }: PageProps) {
  const { category, section } = params

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  // Placeholder data
  const items = Array(20)
    .fill(null)
    .map((_, i) => ({
      id: `item-${i}`,
      name: `${section.charAt(0).toUpperCase() + section.slice(1)} Item ${i + 1}`,
      category: 'Category Name',
      image: `/placeholders/product-${(i % 4) + 1}.jpg`,
      href: `/${category}/${section}/item-${i + 1}`
    }))

  return (
    <ListLayout 
      items={items} 
      title={section.toUpperCase()}
      category={category}
      section={section}
      subsection="view-all"
    />
  )
} 