'use client'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import MegaMenu from './MegaMenu'

interface ScrollableNavProps {
  items: string[]
}

const ScrollableNav = ({ items }: ScrollableNavProps) => {
  return (
    <div className="relative tablet:flex desktop:hidden items-center w-[30vw]">
      {/* Scrollable container */}
      <div className="overflow-x-auto scrollbar-hide w-full">
        <div className="flex space-x-12">
          {items.map((item, index) => (
            <MegaMenu 
              key={item} 
              category={item}
            />
          ))}
        </div>
      </div>
      
      {/* Gradient fade and arrow */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
        <div className="h-full w-16 bg-gradient-to-r from-transparent to-white" />
        <div className="bg-white pl-2">
          <ChevronRight className="w-4 h-4 text-black/60" />
        </div>
      </div>
    </div>
  )
}

export default ScrollableNav 