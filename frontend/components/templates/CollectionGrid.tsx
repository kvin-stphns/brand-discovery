'use client'
import Image from 'next/image'
import Link from 'next/link'

interface CollectionItem {
  id: string
  brand: string
  designer: string
  image: string
}

interface CollectionGridProps {
  items: CollectionItem[]
  title?: string
}

export default function CollectionGrid({ items, title }: CollectionGridProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-[140px] px-8 max-w-[2000px] mx-auto">
        {title && (
          <h1 className="text-4xl font-light tracking-[0.25em] text-center mb-16">
            {title}
          </h1>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {items.map((item) => (
            <Link 
              key={item.id} 
              href={`/product/${item.id}`} 
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] relative mb-4 bg-gray-100">
                <Image
                  src={item.image}
                  alt={`${item.brand} by ${item.designer}`}
                  fill
                  className="object-cover transition-all duration-300 group-hover:opacity-90"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm tracking-[0.25em] group-hover:text-gray-500 transition-colors">
                  {item.brand}
                </p>
                <p className="text-sm text-gray-500">{item.designer}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 