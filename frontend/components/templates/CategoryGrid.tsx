'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

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

const shuffleArray = (array: any[]) => {
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
  gridType?: 'mixed' | 'brand' | 'designer' | 'product'
}

const getItemHref = (item: GridItem, category: string) => {
  switch (item.type) {
    case 'product':
      return `/product/${item.id}`
    case 'brand':
      return `/${category}/brands/${item.name.toLowerCase().replace(' ', '-')}`
    case 'designer':
      return `/${category}/designers/${item.name.toLowerCase().replace(' ', '-')}`
    default:
      return '#'
  }
}

const getGridItemType = (section: string, subsection?: string) => {
  switch (section.toLowerCase()) {
    case 'categories':
      return 'product'
    case 'brands':
      return 'brand'
    case 'designers':
      return 'designer'
    case 'discover':
    case 'rankings':
      return 'mixed'
    default:
      return 'product'
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
  gridType
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
              exploreLinks.map((link, i) => (
                <Link
                  key={i}
                  href={`/explore/discover/${link.name.toLowerCase().replace(' ', '-')}`}
                  className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r ${
                    i >= 6 ? 'tablet:hidden desktop:flex' : ''
                  }`}
                >
                  <Image
                    src={`/brand-${i + 1}.jpg`}
                    alt={link.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <span className="absolute bottom-6 text-xs font-semibold tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">
                    {link.name.toUpperCase()}
                  </span>
                </Link>
              ))
            ) : (
              items.map((item, i) => (
                <Link
                  key={item.id}
                  href={getItemHref(item, category || '')}
                  className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r ${
                    i >= 6 ? 'tablet:hidden desktop:flex' : ''
                  }`}
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