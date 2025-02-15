'use client'
import Image from 'next/image'
import Link from 'next/link'

interface CategoryGridProps {
  items: Array<{
    type: string
    name: string
    image: string
  }>
  title?: string
}

export default function CategoryGrid({ items, title }: CategoryGridProps) {
  return (
    <section className="pt-[140px] w-full">
      <div className="max-w-[2000px] mx-auto">
        <h2 className="px-8 text-black text-4xl font-light tracking-[0.25em] mb-16 text-center">
          {title}
        </h2>
        
        <div className="grid grid-cols-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 border-t border-black">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className={`group relative h-[500px] flex items-center justify-center border-r border-b border-black last:border-r-0 tablet:last:border-r
                ${i >= 6 ? 'hidden desktop:flex' : ''}`}
            >
              <div className="w-full h-full bg-gray-100" />
              <span className="absolute bottom-6 text-xs font-semibold tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">
                DISCOVER
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 