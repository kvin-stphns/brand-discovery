'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GridCardSkeleton } from '@/components/common/Skeleton'
import { Analytics } from '@/lib/analytics'

const allExploreLinks = [
  { name: 'Spotlight', category: 'discover' },
  { name: 'Featured', category: 'brands' },
  { name: 'Trending', category: 'designers' },
  { name: 'Lookbooks', category: 'discover' },
  { name: 'Top Rated', category: 'rankings' },
  { name: 'Accessories', category: 'categories' },
  { name: 'Random', category: 'brands' },
  { name: 'Location', category: 'discover' }
]

<<<<<<< Current (Your changes)
const shuffleArray = <T,>(array: T[]): T[] => {
=======
function shuffleArray<T>(array: T[]): T[] {
>>>>>>> Incoming (Background Agent changes)
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

interface GridItem {
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

interface CategoryGridProps {
  items: GridItem[]
  title: string
  category?: string
  section?: string
  subsection?: string
  subtitle?: string
  isDiscoverPage?: boolean
  gridType?: 'mixed' | 'product' | 'brand' | 'designer'
}

const getItemHref = (item: GridItem) => {
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
}: CategoryGridProps) {
  const [exploreLinks, setExploreLinks] = useState(allExploreLinks)

  useEffect(() => {
    // Disable overscroll bounce on the entire page while this component is mounted.
    document.body.style.overscrollBehavior = 'none'
    if (isDiscoverPage) {
      setExploreLinks(shuffleArray(allExploreLinks))
    }
    return () => {
      document.body.style.overscrollBehavior = ''
    }
  }, [isDiscoverPage])

  const isLoading = !isDiscoverPage && items.length === 0

  return (
    <section className="w-full min-h-screen">
      {/* Fixed Title Section */}
      <div className="fixed top-0 left-0 right-0 bg-white z-30">
        <div className="mt-[155px] max-w-[2000px] mx-auto">
          <div className="px-8">
            <h2 className="text-black text-2xl tracking-[0.05em] font-bold">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">
                {subtitle}
              </p>
            ) : (
              category && section && subsection && (
                <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">
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
            {isDiscoverPage ? (
              exploreLinks.map((link, i) => {
                const slug = link.name.toLowerCase().replace(/\s+/g, '-')
                const defaultCategory = 'women'
                const href = slug === 'view-all'
                  ? `/${defaultCategory}/${link.category}/view-all`
                  : `/${defaultCategory}/${link.category}/${slug}`
                return (
                  <Link
                    key={i}
                    href={href}
                    className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r ${
                      i >= 6 ? 'tablet:hidden desktop:flex' : ''
                    }`}
                    onClick={() => Analytics.nav(link.name, href)}
                  >
                    <Image
                      src={`/placeholders/brand-${i + 1}.jpg`}
                      alt={link.name}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <span className="absolute bottom-6 text-xs font-semibold tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">
                      {link.name.toUpperCase()}
                    </span>
                  </Link>
                )
              })
            ) : isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`border-r border-b border-black last:border-r-0 tablet:last:border-r ${i >= 6 ? 'tablet:hidden desktop:flex' : ''}`}>
                  <GridCardSkeleton />
                </div>
              ))
            ) : (
              items.map((item, i) => (
                <Link
                  key={item.id}
                  href={getItemHref(item)}
                  className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r ${
                    i >= 6 ? 'tablet:hidden desktop:flex' : ''
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
                    <p className="text-xs font-semibold tracking-[0.15em]">
                      {item.name.toUpperCase()}
                    </p>
                    {item.label && (
                      <p className="text-xs tracking-[0.15em] text-gray-700">
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