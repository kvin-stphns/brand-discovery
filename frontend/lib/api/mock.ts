import { getPlaceholderImage } from '@/types/placeholders'

export type EntityKind = 'brand' | 'designer' | 'product' | 'mixed'

const brandTypes = [
  'Streetwear',
  'High Fashion',
  'Avant Garde',
  'Hybrid',
  'Techwear',
  'Workwear',
  'Other',
] as const

const productCategories = ['Tops', 'Bottoms', 'Outerwear', 'Accessories'] as const

function toSingular(word: string) {
  switch (word.toLowerCase()) {
    case 'accessories':
      return 'Accessory'
    case 'tops':
      return 'Top'
    case 'bottoms':
      return 'Bottom'
    default:
      return word
  }
}

export type GridItem = {
  id: string
  name: string
  image: string
  type: 'product' | 'brand' | 'designer' | 'mixed'
  brand?: string
  designer?: string
  category?: string
  price?: number
  label?: string
}

export async function mockList(kind: EntityKind, n = 12): Promise<GridItem[]> {
  const items = Array.from({ length: n }).map((_, i) => {
    const kinds = kind === 'mixed' ? (['product', 'brand', 'designer'] as const) : ([kind] as const)
    const type = kinds[i % kinds.length]
    const brandType = brandTypes[i % brandTypes.length]
    const productType = productCategories[i % productCategories.length]
    const brandName = `Brand${i + 1}`
    const label =
      type === 'designer'
        ? `${brandType} Designer`
        : type === 'brand'
        ? `${brandType} Brand`
        : `${brandName} ${toSingular(productType)}`

    return {
      id: `${type}-${i + 1}`,
      type,
      name: `${type[0].toUpperCase() + type.slice(1)} ${i + 1}`,
      image: getPlaceholderImage(type as any, i % 4),
      category: type === 'product' ? productType : undefined,
      brand: type === 'product' ? brandName : undefined,
      designer: type === 'product' ? `Designer ${i + 1}` : undefined,
      label,
    }
  })
  return Promise.resolve(items)
}

export async function getFeatured(count = 12) {
  return mockList('mixed', count)
}

export async function getPopular(count = 12) {
  return mockList('mixed', count)
}
