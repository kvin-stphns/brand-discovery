import { Location } from './locations'

type BrandType = 'Streetwear' | 'High Fashion' | 'Avant Garde' | 'Hybrid' | 'Techwear' | 'Workwear' | 'Other'
type ProductCategory = 'Tops' | 'Bottoms' | 'Outerwear' | 'Accessories' | 'Footwear'

const toSingular = (word: string) => {
  switch (word.toLowerCase()) {
    case 'accessories': return 'Accessory'
    case 'tops': return 'Top'
    case 'bottoms': return 'Bottom'
    case 'gifts': return 'Gift'
    case 'women': return 'Woman'
    case 'men': return 'Man'
    default: return word
  }
}

export const getFormattedName = (
  type: string, 
  category: string, 
  section: string, 
  index: number,
  location?: Location
) => {
  const baseCategory = toSingular(category)
  
  // Handle discover sections
  if (section.toLowerCase() === 'discover') {
    switch (type) {
      case 'designer':
        return `${baseCategory} Designer ${index + 1}`
      case 'brand':
        return `${baseCategory} Brand ${index + 1}`
      case 'product':
        return `${baseCategory} Product ${index + 1}`
    }
  }

  // Handle location-based sections
  if (section.toLowerCase() === 'location' || section.toLowerCase() === 'locations') {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1} from ${location?.name || 'Location'}`
  }

  // Handle lookbooks
  if (section.toLowerCase() === 'lookbooks') {
    switch (type) {
      case 'designer':
        return `Designer Lookbook ${index + 1}`
      case 'brand':
        return `Brand Lookbook ${index + 1}`
      case 'product':
        return `Collection Lookbook ${index + 1}`
    }
  }

  // Handle rankings
  if (['top-rated', 'recently-liked', 'most-liked', 'leaderboard'].includes(section.toLowerCase())) {
    return `${baseCategory} ${section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${type} ${index + 1}`
  }

  // Handle brand sections
  if (['alphabetical', 'newest', 'featured', 'popular'].includes(section.toLowerCase())) {
    return `${baseCategory} ${section.charAt(0).toUpperCase() + section.slice(1)} ${type} ${index + 1}`
  }

  // Regular section naming (including trending, spotlight)
  switch (section.toLowerCase()) {
    case 'spotlight':
    case 'trending':
      return `${baseCategory} ${section} ${type} ${index + 1}`
    default:
      return `${baseCategory} ${type} ${index + 1}`
  }
}

export const getFormattedLabel = (
  type: string, 
  section: string, 
  brandType?: BrandType, 
  productType?: ProductCategory, 
  brandName?: string,
  location?: Location
) => {
  const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1)
  
  // Handle location-based sections
  if (section.toLowerCase() === 'location' || section.toLowerCase() === 'locations') {
    switch (type) {
      case 'designer':
        return `${location?.name}: ${brandType} Designer`
      case 'brand':
        return `${location?.name}: ${brandType} Brand`
      case 'product':
        return `${location?.name}: ${brandName} ${toSingular(productType || '')}`
    }
  }

  // Special case for lookbooks section
  if (section.toLowerCase() === 'lookbooks') {
    switch (type) {
      case 'designer':
        return `${brandType} Designer Collection`
      case 'brand':
        return `${brandType} Collection`
      case 'product':
        return `${brandName} Collection`
    }
  }

  // Regular section labeling
  switch (type) {
    case 'designer':
      return `${sectionLabel}: ${brandType} Designer`
    case 'brand':
      return `${sectionLabel}: ${brandType} Brand`
    case 'product':
      return `${sectionLabel}: ${brandName} ${toSingular(productType || '')}`
    default:
      return sectionLabel
  }
}

export const brandTypes = [
  'Streetwear',
  'High Fashion',
  'Avant Garde',
  'Hybrid',
  'Techwear',
  'Workwear',
  'Other'
] as const

export type BrandType = typeof brandTypes[number] 