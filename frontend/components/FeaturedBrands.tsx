'use client'
import Image from 'next/image'
import Link from 'next/link'
import { getFormattedLabel } from '@/types/gridItems'

const FeaturedBrands = () => {
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
      image: `/brand-${i + 1}.jpg`,
      category: type === 'product' ? productType : undefined,
      brand: type === 'product' ? brandName : undefined,
      designer: type === 'product' ? `Designer ${i + 1}` : undefined,
      label: getFormattedLabel(type, 'featured', brandType, productType, brandName)
    }
  })

  return (
    <section className="pt-20 w-full">
      <div className="max-w-[2000px] mx-auto">
        <div className="px-8">
          <Link href="/featured">
            <h2 className="text-black text-2xl tracking-[0.05em] font-bold mb-4 hover:text-black/60 transition-colors">
              FEATURED
            </h2>
          </Link>
          <p className="text-xs tracking-[0.15em] text-gray-500 mb-2">
            BRANDS, DESIGNERS, & PIECES
          </p>
          <p className="text-xs tracking-[0.05em] text-gray-500 mb-12">
            Curated selection of emerging talent and established innovators
          </p>
        </div>
        
        {/* Grid structure with full-width dividers, no far-left/right borders */}
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 border-t border-black">
          {items.map((item, i) => (
            <div 
              key={i}
              className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r
                ${i >= 6 ? 'hidden desktop:flex' : ''}`}
            >
              <Image
                src={item.image}
                alt={item.name}
                width={400}
                height={500}
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-6 space-y-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs font-semibold tracking-[0.15em]">
                  {item.name.toUpperCase()}
                </p>
                {item.label && (
                  <p className="text-xs tracking-[0.15em] text-gray-700">
                    {item.label}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
export default FeaturedBrands
