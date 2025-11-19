'use client'
import Image from 'next/image'
import Link from 'next/link'
import { getFormattedLabel } from '@/types/gridItems'
import { useEffect, useState } from 'react'
import { fetchProducts } from '@/lib/api/client'
import { toast } from '@/lib/toast'
import { GridCardSkeleton } from '@/components/common/Skeleton'

type Item = { id: string; type: 'product' | 'brand' | 'designer'; name: string; image: string; category?: string; brand?: string; designer?: string; label?: string }

const FeaturedBrands = () => {
  const brandTypes = ['Streetwear', 'High Fashion', 'Avant Garde', 'Hybrid', 'Techwear', 'Workwear', 'Other'] as const
  const productCategories = ['Tops', 'Bottoms', 'Outerwear', 'Accessories'] as const

  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let didCancel = false
    async function load() {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 2000)
      try {
        const prods = await fetchProducts({ sort: 'new', limit: 8 } as any)
        if (!didCancel && prods && prods.length) {
          const mapped: Item[] = prods.slice(0, 8).map((p: any, i: number) => ({
            id: String(p._id),
            type: 'product',
            name: String(p.title || ''),
            image: String(p.images?.[0] || ''),
            category: productCategories[i % productCategories.length],
            brand: p.brand ? String(p.brand) : undefined,
            label: getFormattedLabel('product', 'featured', brandTypes[i % brandTypes.length], productCategories[i % productCategories.length], String(p.brand || '')),
          }))
          setItems(mapped)
        } else {
          // no items: keep empty so skeletons/empty state render
        }
      } catch (_e) {
        if (!didCancel) {
          // keep empty; skeletons will show briefly
        }
      } finally {
        clearTimeout(t)
      }
    }
    load()
    return () => { didCancel = true }
  }, [])

  return (
    <section className="pt-20 w-full">
      <div className="max-w-[2000px] mx-auto">
        <div className="px-8">
          <Link href="/featured">
            <h2 className="text-black text-2xl tracking-[0.05em] font-bold mb-4 hover:text-black/60 transition-colors">FEATURED</h2>
          </Link>
          <p className="text-xs tracking-[0.15em] text-gray-500 mb-2">BRANDS, DESIGNERS, & PIECES</p>
          <p className="text-xs tracking-[0.05em] text-gray-500 mb-12">Curated selection of emerging talent and established innovators</p>
        </div>
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 border-t border-black">
          {items.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`border-r border-b border-black last:border-r-0 tablet:last:border-r ${i >= 6 ? 'hidden desktop:flex' : ''}`}>
                <GridCardSkeleton />
              </div>
            ))
            : items.map((item, i) => (
              <Link
                key={i}
                href={item.type === 'brand' ? `/brand/${item.id}` : item.type === 'designer' ? `/designer/${item.id}` : `/product/${item.id}`}
                className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r ${i >= 6 ? 'hidden desktop:flex' : ''}`}
              >
                <Image
                  src={item.image || `/placeholders/product-${(i % 4) + 1}.jpg`}
                  alt={item.name}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
                <div className="absolute bottom-6 space-y-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-semibold tracking-[0.15em]">{item.name.toUpperCase()}</p>
                  {item.label && <p className="text-xs tracking-[0.15em] text-gray-700">{item.label}</p>}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  )
}
export default FeaturedBrands
