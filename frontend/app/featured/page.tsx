'use client'
import CategoryGrid from '@/components/templates/CategoryGrid'

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

export default function FeaturedPage() {
  const items = Array.from({ length: 8 }).map((_, i) => {
    const types = ['product', 'brand', 'designer'] as const
    const type = types[i % 3]
    const brandType = brandTypes[i % brandTypes.length]
    const productType = productCategories[i % productCategories.length]
    const brandName = `Brand${i + 1}`

    return {
      id: `item-${i}`,
      type,
      name: `Featured ${type} ${i + 1}`,
      image: `/placeholders/product-${(i % 4) + 1}.jpg`,
      category: type === 'product' ? productType : undefined,
      brand: type === 'product' ? brandName : undefined,
      designer: type === 'product' ? `Designer ${i + 1}` : undefined,
      label: type === 'designer' 
        ? `Featured: ${brandType} Designer`
        : type === 'brand'
        ? `Featured: ${brandType} Brand`
        : `Featured: ${brandName} ${toSingular(productType)}`
    }
  })

  return (
    <CategoryGrid 
      items={items}
      title="FEATURED"
      subtitle="Brands, Designers, and Pieces"
      gridType="mixed"
    />
  )
} 