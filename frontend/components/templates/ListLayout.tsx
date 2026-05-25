'use client'
import { useEffect, useState, useRef } from 'react'
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
  children?: React.ReactNode
}

const ListLayout = ({ title, items, category, section, subsection, children }: ListLayoutProps) => {
  const [activeItem, setActiveItem] = useState(items[0])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeItem && items.length > 0) setActiveItem(items[0])
  }, [activeItem, items])

  const handleItemClick = (item: ListItemProps) => {
    if (selectedItem === item.id) {
      window.location.href = item.href
    } else {
      setActiveItem(item)
      setSelectedItem(item.id)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Navigation Header */}
      <div className="fixed top-0 left-0 right-0 pt-[155px] px-8 border-b border-black bg-white z-20">
        <div className="max-w-[2000px] mx-auto pb-12">
          <h2 className="text-black text-2xl tracking-[0.05em] font-bold">
            {title}
          </h2>
          <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">
            {category.toUpperCase()} / {section.toUpperCase()} / {subsection.toUpperCase().replace('-', ' ')}
          </p>
        </div>
      </div>

      {/* Main Content Container with Full-Height Border */}
      <div className="flex flex-1 relative border-b border-black">
        <div className="absolute top-0 left-[35%] w-px h-full bg-black" />

        {/* List Section */}
        <div className="w-[35%]">
          <div
            ref={listContainerRef}
            className="pt-[260px] overflow-y-auto"
            style={{ height: 'calc(100vh)' }}
          >
            <div className="divide-y divide-black border-b border-black">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full group py-6 px-8 flex justify-between items-center text-left hover:bg-black/5 transition-colors
                    ${activeItem?.id === item.id ? 'bg-black/5' : ''}`}
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
            {children}
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-[65%] pt-[260px] border-l border-black">
          <div className="h-[calc(100vh-260px)] relative">
            {activeItem ? (
              <Image
                src={activeItem.image}
                alt={activeItem.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm tracking-widest text-gray-400">
                SELECT AN ITEM
              </div>
            )}
            {activeItem && (
              <Link
                href={activeItem.href}
                className="absolute bottom-8 left-8 bg-white px-6 py-3 text-sm tracking-[0.15em] hover:bg-black hover:text-white transition-colors"
              >
                VIEW DETAILS
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListLayout
