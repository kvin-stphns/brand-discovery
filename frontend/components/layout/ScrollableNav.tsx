'use client'
import { useState, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import MegaMenu from './MegaMenu'

interface ScrollableNavProps {
  items: string[]
}

const ScrollableNav = ({ items }: ScrollableNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showGradient, setShowGradient] = useState(true)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowGradient(scrollLeft < scrollWidth - clientWidth - 50) // Allow 50px overscroll
  }

  return (
    <div className="relative tablet:flex desktop:hidden items-center w-[30vw]">
      {/* Scrollable container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-hide w-full"
      >
        <div className="flex space-x-12 pr-16"> {/* Added padding for overscroll */}
          {items.map((item, index) => (
            <MegaMenu 
              key={item} 
              category={item}
            />
          ))}
        </div>
      </div>
      
      {/* Gradient fade and arrow */}
      {showGradient && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
          <div className="h-full w-16 bg-gradient-to-r from-transparent to-white" />
          <div className="bg-white pl-2">
            <ChevronRight className="w-4 h-4 text-black/60" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ScrollableNav 