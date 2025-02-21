'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'
import { getPlaceholderImage } from '@/types/placeholders'

const brandTypes = [
  'Streetwear',
  'High Fashion',
  'Avant Garde',
  'Hybrid',
  'Techwear',
  'Workwear',
  'Other'
] as const

const productCategories = ['Tops', 'Bottoms', 'Outerwear', 'Accessories'] as const

const toSingular = (word: string) => {
  switch (word.toLowerCase()) {
    case 'accessories': return 'Accessory'
    case 'tops': return 'Top'
    case 'bottoms': return 'Bottom'
    case 'outerwear': return 'Outerwear'
    default: return word
  }
}

export default function PopularPage() {
  const items = Array.from({ length: 8 }).map((_, i) => {
    const types = ['product', 'brand', 'designer'] as const
    const type = types[i % 3]
    const brandType = brandTypes[i % brandTypes.length]
    const productType = productCategories[i % productCategories.length]
    const brandName = `Brand${i + 1}`

    return {
      id: `item-${i}`,
      type,
      name: `Popular ${type} ${i + 1}`,
      image: getPlaceholderImage(type, i % 4),
      category: type === 'product' ? productType : undefined,
      brand: type === 'product' ? brandName : undefined,
      designer: type === 'product' ? `Designer ${i + 1}` : undefined,
      label: type === 'designer' 
        ? `Popular: ${brandType} Designer`
        : type === 'brand'
        ? `Popular: ${brandType} Brand`
        : `Popular: ${brandName} ${toSingular(productType)}`
    }
  })

  return (
    <CategoryGrid 
      items={items}
      title="POPULAR"
      subtitle="Brands, Designers, and Pieces"
      gridType="mixed"
    />
  )
} 