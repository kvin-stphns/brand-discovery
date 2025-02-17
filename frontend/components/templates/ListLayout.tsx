'use client'
import { ReactNode, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ListItemProps {
  id: string
  name: string
  category?: string
  image: string
  href: string
}

interface ListLayoutProps {
  title: string
  items: ListItemProps[]
  category: string
  section: string
  subsection: string
}

const ListLayout = ({ title, items, category, section, subsection }: ListLayoutProps) => {
  const [activeItem, setActiveItem] = useState(items[0])

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="mt-[180px] px-8 border-b border-black">
        <div className="max-w-[2000px] mx-auto pb-12">
          <h2 className="text-black text-2xl tracking-[0.05em] font-bold">
            {title}
          </h2>
          <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">
            {category.toUpperCase()} / {section.toUpperCase()} / {subsection.toUpperCase().replace('-', ' ')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* List Section - 35% */}
        <div className="w-[35%] border-r border-black">
          <div className="divide-y divide-black">
            {items.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`w-full group py-6 px-8 flex justify-between items-center text-left hover:bg-black/5 transition-colors
                  ${activeItem.id === item.id ? 'bg-black/5' : ''}`}
              >
                <div className="flex-1">
                  <h3 className="text-sm tracking-[0.25em]">{item.name}</h3>
                  {item.category && (
                    <span className="text-xs text-gray-500 tracking-[0.15em]">{item.category}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section - 65% */}
        <div className="w-[65%] h-[calc(100vh-280px)] relative">
          <Image 
            src={activeItem.image}
            alt={activeItem.name}
            fill
            className="object-cover"
          />
          <Link
            href={activeItem.href}
            className="absolute bottom-8 left-8 bg-white px-6 py-3 text-sm tracking-[0.15em] hover:bg-black hover:text-white transition-colors"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ListLayout 