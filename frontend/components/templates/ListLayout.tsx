'use client'
import { ReactNode, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

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
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const handleItemClick = (item: ListItemProps) => {
    if (selectedItem === item.id) {
      window.location.href = item.href
    } else {
      setActiveItem(item)
      setSelectedItem(item.id)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!listContainerRef.current || !footerRef.current) return

      const footerRect = footerRef.current.getBoundingClientRect()
      const listContainer = listContainerRef.current
      
      if (footerRect.top <= window.innerHeight) {
        listContainer.style.height = `${footerRect.top - 300}px`
      } else {
        listContainer.style.height = 'calc(100vh - 300px)'
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Fixed Navigation Header */}
      <div className="fixed top-0 left-0 right-0 pt-[180px] px-8 border-b border-black bg-white z-20">
        <div className="max-w-[2000px] mx-auto pb-12">
          <h2 className="text-black text-2xl tracking-[0.05em] font-bold">
            {title}
          </h2>
          <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">
            {category.toUpperCase()} / {section.toUpperCase()} / {subsection.toUpperCase().replace('-', ' ')}
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-1 pt-[300px]">
        {/* List Section */}
        <div className="w-[35%] border-r border-black relative">
          <div 
            ref={listContainerRef}
            className="overflow-y-auto"
            style={{ height: 'calc(100vh - 300px)' }}
          >
            <div className="divide-y divide-black">
              {items.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleItemClick(item)}
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
        </div>

        {/* Preview Section */}
        <div className="w-[65%] relative">
          <div className="h-[calc(100vh-300px)] sticky top-[300px]">
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

      {/* Footer */}
      <div ref={footerRef}>
        <Footer />
      </div>
    </div>
  )
}

export default ListLayout