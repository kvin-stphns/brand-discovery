'use client'

import { useEffect } from 'react'
import CategoryGrid from '@/components/templates/CategoryGrid'
import ListLayout from '@/components/templates/ListLayout'
import { getFormattedName, getFormattedLabel } from '@/types/gridItems'
import { locations, type Location } from '@/types/locations'

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

  // Add location handling for specific sections
  const getLocationForItem = (index: number) => {
    if (!['discover', 'designers', 'rankings'].includes(section.toLowerCase()) || 
        subsection.toLowerCase() !== 'location') {
      return undefined
    }
    return locations[index % locations.length]
  }

  const getMixedItems = () => {
    return Array(20).fill(null).map((_, i) => {
      const types = ['product', 'brand', 'designer'] as const
      const type = types[i % 3]
      const brandType = brandTypes[i % brandTypes.length]
      const productType = productCategories[i % productCategories.length]
      const brandName = `Brand${i + 1}`
      const location = getLocationForItem(i)
      
      return {
        id: `item-${i}`,
        type,
        name: getFormattedName(type, category, subsection, i, location),
        image: `/placeholders/product-${(i % 4) + 1}.jpg`,
        category: type === 'product' ? toSingular(productType) : `${toSingular(category)} / ${subsection}`,
        brand: type === 'product' ? brandName : undefined,
        designer: type === 'product' ? `Designer ${i + 1}` : undefined,
        label: getFormattedLabel(type, subsection, brandType, productType, brandName, location)
      }
    })
  }

  const getRegularItems = () => {
    const type = getItemType()
    
    return Array(20).fill(null).map((_, i) => {
      const brandType = brandTypes[i % brandTypes.length]
      const brandName = `Brand${i + 1}`

      // Handle brand sections
      if (type === 'brand') {
        return {
          id: `item-${i}`,
          type,
          name: getFormattedName(type, category, subsection, i),
          image: `/placeholders/product-${(i % 4) + 1}.jpg`,
          category: `${toSingular(category)} / ${subsection}`,
          label: `${subsection}: ${brandType} Brand`
        }
      }

      // Handle designer sections
      if (type === 'designer') {
        return {
          id: `item-${i}`,
          type,
          name: getFormattedName(type, category, subsection, i),
          image: `/placeholders/product-${(i % 4) + 1}.jpg`,
          category: `${toSingular(category)} / ${subsection}`,
          label: `${subsection}: Designer`
        }
      }

      // Handle product sections
      return {
        id: `item-${i}`,
        name: `${toSingular(category)} ${subsection} ${i + 1}`,
        type,
        category: subsection,
        image: `/placeholders/product-${(i % 4) + 1}.jpg`,
        brand: brandName,
        designer: `Designer ${i + 1}`,
        label: `${brandName} ${toSingular(subsection)}`
      }
    })
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