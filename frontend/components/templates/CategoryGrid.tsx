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
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

interface CategoryGridProps {
  items: Array<{
    type: string
    name: string
    image: string
  }>
  title?: string
}

export default function CategoryGrid({ items, title }: CategoryGridProps) {
  const [exploreLinks, setExploreLinks] = useState(allExploreLinks)

  useEffect(() => {
    setExploreLinks(shuffleArray(allExploreLinks))
  }, [])

  return (
    <section className="w-full">
      <div className="mt-[180px] max-w-[2000px] mx-auto">
        <h2 className="px-8 text-black text-2xl tracking-[0.05em] font-bold mb-12">
          {title}
        </h2>
        
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 border-t border-black">
          {exploreLinks.map((link, i) => (
            <Link 
              key={i}
              href={`/${link.category}/${link.name.toLowerCase().replace(' ', '-')}`}
              className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r
                ${i >= 6 ? 'tablet:hidden desktop:flex' : ''}`}
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
          ))}
        </div>
      </div>
    </section>
  )
} 