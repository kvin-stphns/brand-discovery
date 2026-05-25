'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { GridCardSkeleton } from '@/components/common/Skeleton'
import { Analytics } from '@/lib/analytics'
import { formatPrice, sanitizeText } from '@/lib/format'

interface GridItem {
  id: string
  name: string
  image: string
  type: 'product' | 'brand' | 'designer'
  brand?: string
  designer?: string
  category?: string
  price?: number
  label?: string
}

interface CategoryGridProps {
  items: GridItem[]
  title: string
  category?: string
  section?: string
  subsection?: string
  subtitle?: string
  isDiscoverPage?: boolean
  gridType?: 'mixed' | 'product' | 'brand' | 'designer'
  loading?: boolean
  emptyMessage?: string
}

const getItemHref = (item: GridItem, category: string) => {
  switch (item.type) {
    case 'product':
      return `/product/${item.id}`
    case 'brand':
      return `/brand/${item.id}`
    case 'designer':
      return `/designer/${item.id}`
    default:
      return '#'
  }
}

export default function CategoryGrid({
  items,
  title,
  category,
  section,
  subsection,
  subtitle,
  isDiscoverPage = false,
  loading = false,
  emptyMessage = 'No display-ready products found.',
}: CategoryGridProps) {
  useEffect(() => {
    // Disable overscroll bounce on the entire page while this component is mounted.
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overscrollBehavior = ''
    }
  }, [isDiscoverPage])

  const isLoading = loading

  return (
    <section className="w-full min-h-screen">
      {/* Fixed Title Section */}
      <div className="fixed top-0 left-0 right-0 bg-white z-30">
        <div className="mt-[155px] max-w-[2000px] mx-auto">
          <div className="px-8">
            <h2 className="text-black text-2xl trk-tight font-bold">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 text-xs trk-mid text-gray-500">
                {subtitle}
              </p>
            ) : (
              category && section && subsection && (
                <p className="mt-2 text-xs trk-mid text-gray-500">
                  {category.toUpperCase()} / {section.toUpperCase()} / {subsection.toUpperCase().replace('-', ' ')}
                </p>
              )
            )}
          </div>
        </div>
        <div className="max-w-[2000px] mx-auto border-t border-black mt-12" />
      </div>

      {/* Main Content */}
      <div className={`${isDiscoverPage ? 'mt-[236px]' : 'mt-[260px]'}`}>
        <div className="max-w-[2000px] mx-auto">
          <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`border-r border-b border-black last:border-r-0 tablet:last:border-r ${i >= 6 ? 'tablet:hidden desktop:flex' : ''}`}>
                  <GridCardSkeleton />
                </div>
              ))
            ) : items.length === 0 ? (
              <div className="col-span-2 tablet:col-span-3 desktop:col-span-4 min-h-[360px] border-b border-black flex items-center justify-center px-8">
                <p className="text-xs trk-mid text-black/60 text-center">{emptyMessage}</p>
              </div>
            ) : (
              items.map((item, i) => (
                <Link
                  key={item.id}
                  href={getItemHref(item, category || '')}
                  className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r ${i >= 6 ? 'tablet:hidden desktop:flex' : ''
                    }`}
                  onClick={() => Analytics.nav(item.name, getItemHref(item, category || ''))}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
	                  <div className="absolute bottom-6 space-y-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.brand && (
                        <p className="text-[10px] trk-mid text-gray-700">
                          {sanitizeText(item.brand).toUpperCase()}
                        </p>
                      )}
	                    <p className="text-xs font-semibold trk-mid">
	                      {sanitizeText(item.name).toUpperCase()}
	                    </p>
                      {item.price != null && (
                        <p className="text-xs trk-mid text-gray-700">
                          {formatPrice(item.price)}
                        </p>
                      )}
	                    {item.label && (
	                      <p className="text-xs trk-mid text-gray-700">
                        {item.label}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
