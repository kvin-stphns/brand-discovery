'use client'

import { useEffect } from 'react'
import CategoryGrid from '@/components/templates/CategoryGrid'
import ListLayout from '@/components/templates/ListLayout'

interface PageProps {
  params: {
    category: string
    section: string
    subsection: string
  }
}

export default function CategoryPage({ params }: PageProps) {
  const { category, section, subsection } = params
  
  // If it's a view-all page, use ListLayout
  if (subsection === 'view-all') {
    const items = Array(20).fill(null).map((_, i) => ({
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

  // For all other subsections, use CategoryGrid
  const items = Array(20).fill(null).map((_, i) => ({
    id: `item-${i}`,
    name: `${section.charAt(0).toUpperCase() + section.slice(1)} Item ${i + 1}`,
    category: 'Category Name',
    image: `/placeholders/product-${(i % 4) + 1}.jpg`,
    href: `/${category}/${section}/item-${i + 1}`
  }))

  return (
    <CategoryGrid 
      items={items}
      title={section.toUpperCase()}
      category={category}
      section={section}
      subsection={subsection}
    />
  )
} 