'use client'
import { useEffect, useMemo } from 'react'
import ListLayout from '@/components/templates/ListLayout'
import { getPlaceholderImage } from '@/types/placeholders'

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

  const items = useMemo(() => {
    const isBrands = section.toLowerCase() === 'brands'
    const isDesigners = section.toLowerCase() === 'designers'
    const isCategories = section.toLowerCase() === 'categories'

    if (isBrands) {
      return Array.from({ length: 24 }).map((_, i) => ({
        id: `brand-${i + 1}`,
        name: `Brand ${i + 1}`,
        category: 'Brand',
        image: getPlaceholderImage('brand', i % 4),
        href: `/brand/brand-${i + 1}`,
      }))
    }
    if (isDesigners) {
      return Array.from({ length: 24 }).map((_, i) => ({
        id: `designer-${i + 1}`,
        name: `Designer ${i + 1}`,
        category: 'Designer',
        image: getPlaceholderImage('designer', i % 4),
        href: `/designer/designer-${i + 1}`,
      }))
    }
    if (isCategories) {
      const apparel = ['Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear']
      const giftsExtras = ['Home Goods', 'Furniture', 'Art', 'Lighting', 'Tech']
      const exploreExtras = ['Home Goods', 'Furniture', 'Art', 'Lighting', 'Tech']
      let cats: string[]
      const catLower = category.toLowerCase()
      if (catLower === 'women' || catLower === 'men') {
        cats = apparel
      } else if (catLower === 'gifts') {
        cats = giftsExtras
      } else if (catLower === 'explore') {
        cats = [...apparel, ...exploreExtras]
      } else {
        cats = apparel
      }
      return cats.map((c, i) => ({
        id: `category-${i + 1}`,
        name: c,
        category: 'Category',
        image: `/placeholders/product-${(i % 4) + 1}.jpg`,
        href: `/${category}/categories/${c.toLowerCase().replace(/\s+/g, '-')}`,
      }))
    }
    // Discover view-all: show all items for Men/Women/Explore (mocked mix)
    const grid = Array.from({ length: 24 }).map((_, i) => ({
      id: `product-${i + 1}`,
      name: `Item ${i + 1}`,
      category: 'Mixed',
      image: `/placeholders/product-${(i % 4) + 1}.jpg`,
      href: `/product/product-${i + 1}`,
    }))
    return grid
  }, [category, section])

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