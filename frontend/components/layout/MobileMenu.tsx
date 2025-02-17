'use client'
import { useState, useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: string[]
}

const topLinks = ['Discover', 'Brands', 'Categories', 'Designers', 'Rankings']
const bottomLinks = ['Login', 'Liked Items', 'Saved Items', 'Submissions', 'About']
const discoverLinks = ['View All', 'Spotlight', 'Trending', 'Lookbooks', 'Location', 'Random']
const brandLinks = ['View All', 'Alphabetical', 'Newest', 'Featured', 'Popular', 'Random']
const categoryLinks = ['View All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear']
const designerLinks = ['View All', 'Trending', 'Spotlight', 'Lookbooks', 'Locations', 'Random']
const rankingLinks = ['Top Rated', 'Recently Liked', 'Most Liked', 'Leaderboard', 'Locations']

export default function MobileMenu({ isOpen, onClose, items }: MobileMenuProps) {
  const [activeLayer0, setActiveLayer0] = useState<string | null>(null)
  const [activeLayer1, setActiveLayer1] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      setActiveLayer0(null)
      setActiveLayer1(null)
    }
  }, [isOpen])

  const getLayer2Links = (category: string) => {
    switch (category) {
      case 'Discover': return discoverLinks
      case 'Brands': return brandLinks
      case 'Categories': return categoryLinks
      case 'Designers': return designerLinks
      case 'Rankings': return rankingLinks
      default: return []
    }
  }

  const handleBack = () => {
    if (activeLayer1) {
      setActiveLayer1(null)
    } else if (activeLayer0) {
      setActiveLayer0(null)
    }
  }

  const handleHeaderAction = () => {
    if (activeLayer1 || activeLayer0) {
      handleBack()
    } else {
      onClose()
    }
  }

  const handleLayer2Click = (link: string) => {
    if (!activeLayer0 || !activeLayer1) return
    
    const formattedLink = link.toLowerCase().replace(' ', '-')
    const path = `/${activeLayer0.toLowerCase()}/${activeLayer1.toLowerCase()}/${formattedLink}`
    router.push(path)
    onClose()
  }

  return (
    <div 
      className={`fixed inset-0 bg-white z-[9999] transform transition-transform duration-300 overflow-hidden ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-black">
        <h1 className="text-lg tracking-tight font-bold">
          <span className="block mobile:inline">DISCOVERY</span>
          <span className="block mobile:inline mobile:ml-1">STUDIOS</span>
        </h1>
        <button 
          onClick={handleHeaderAction}
          className="hover:opacity-70 transition-opacity flex items-center"
        >
          {activeLayer0 || activeLayer1 ? (
            <>
              <ArrowLeft className="w-[18px] h-[18px] mr-2" />
              <span className="text-sm tracking-[0.25em]">BACK</span>
            </>
          ) : (
            <X className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>

      {/* Layer 0 - Main Menu */}
      <div className={`absolute inset-0 top-[88px] transform transition-transform duration-300 ${
        activeLayer0 ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-[calc(100vh-88px)]">
          {items.map((item, index) => (
            <button
              key={item}
              onClick={() => setActiveLayer0(item)}
              className={`flex-1 flex items-center justify-center text-sm tracking-[0.25em] hover:text-gray-500 transition-colors
                ${index < items.length - 1 ? 'border-b border-black' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Layer 1 - Category Menu */}
      <div className={`absolute inset-0 top-[88px] transform transition-transform duration-300 ${
        !activeLayer0 ? 'translate-x-full' : activeLayer1 ? '-translate-x-full' : 'translate-x-0'
      }`}>
        {activeLayer0 && (
          <div className="flex flex-col h-[calc(100vh-88px)]">
            <div className="flex-1 py-12">
              {topLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => setActiveLayer1(link)}
                  className="w-full px-12 py-4 text-left text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
            <div className="py-8">
              {bottomLinks.map((link) => (
                <button
                  key={link}
                  className="w-full px-12 py-2 text-left text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Layer 2 - Subcategory Menu */}
      <div className={`absolute inset-0 top-[88px] transform transition-transform duration-300 ${
        activeLayer1 ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {activeLayer1 && (
          <div className="h-[calc(100vh-88px)] py-12">
            {getLayer2Links(activeLayer1).map((link) => (
              <button
                key={link}
                onClick={() => handleLayer2Click(link)}
                className="w-full px-12 py-4 text-left text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}