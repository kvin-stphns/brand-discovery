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
  
  const getItemType = () => {
    switch (section.toLowerCase()) {
      case 'categories': return 'product'
      case 'brands': return 'brand'
      case 'designers': return 'designer'
      case 'discover':
      case 'rankings':
        return 'mixed'
      default:
        return 'product'
    }
  }

  const toSingular = (word: string) => {
    switch (word.toLowerCase()) {
      case 'accessories': return 'Accessory'
      case 'tops': return 'Top'
      case 'bottoms': return 'Bottom'
      case 'gifts': return 'Gift'
      default: return word
    }
  }

  const productCategories = ['Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear'] as const

  const brandTypes = [
    'Streetwear',
    'High Fashion',
    'Avant Garde',
    'Hybrid',
    'Techwear',
    'Workwear',
    'Other'
  ] as const

  const getMixedItems = () => {
    return Array(20).fill(null).map((_, i) => {
      const types = ['product', 'brand', 'designer'] as const
      const type = types[i % 3]
      const brandType = brandTypes[i % brandTypes.length]
      const productType = productCategories[i % productCategories.length]
      
      const getName = () => {
        switch (type) {
          case 'designer':
            return `${toSingular(category)} Designer ${i + 1}`
          case 'brand':
            return `${toSingular(category)} Brand ${i + 1}`
          case 'product':
            return `${toSingular(category)} ${toSingular(productType)} ${i + 1}`
        }
      }

      const getLabel = () => {
        switch (type) {
          case 'designer':
            return `Trending: Designer`
          case 'brand':
            return `Trending: ${brandType} Brand`
          case 'product':
            return `Trending: ${toSingular(productType)}`
        }
      }

      return {
        id: `item-${i}`,
        type,
        name: getName(),
        image: `/placeholders/product-${(i % 4) + 1}.jpg`,
        category: type === 'product' ? toSingular(productType) : `${toSingular(category)} / ${subsection}`,
        brand: type === 'product' ? `${toSingular(category)} Brand` : undefined,
        designer: type === 'product' ? `${toSingular(category)} Designer` : undefined,
        label: getLabel()
      }
    })
  }

  const getRegularItems = () => {
    return Array(20).fill(null).map((_, i) => ({
      id: `item-${i}`,
      name: section === 'categories' 
        ? `${subsection} ${i + 1}` 
        : `${section.slice(0, -1)} ${i + 1}`,
      type: getItemType(),
      category: subsection,
      image: `/placeholders/product-${(i % 4) + 1}.jpg`,
      brand: section === 'categories' ? subsection : undefined,
      designer: section === 'categories' ? `Designer ${i + 1}` : undefined
    }))
  }

  const items = ['discover', 'rankings'].includes(section.toLowerCase())
    ? getMixedItems()
    : getRegularItems()

  return (
    <CategoryGrid 
      items={items}
      title={section.toUpperCase()}
      category={category}
      section={section}
      subsection={subsection}
      gridType={getItemType()}
    />
  )
} 