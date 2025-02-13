'use client'

import { useState } from 'react'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import ScrollableNav from './ScrollableNav'
import MobileMenu from './MobileMenu'
import MegaMenu from './MegaMenu'

const menuItems = ['WOMEN', 'MEN', 'GIFTS', 'EXPLORE']

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <>
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={menuItems}
      />
      
      <header className="fixed top-0 left-0 right-0 bg-white z-[1001]">
        <div className="max-w-[2000px] mx-auto px-8">
          <nav className="py-6">
            {/* Top section */}
            <div className="relative flex items-center justify-between mb-6">
              {/* Desktop Navigation */}
              <div className="hidden desktop:flex space-x-12 z-[500]">
                {menuItems.map((item) => (
                  <MegaMenu key={item} category={item} />
                ))}
              </div>

              {/* Tablet Navigation */}
              <div className="hidden tablet:block desktop:hidden">
                <ScrollableNav items={menuItems} />
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="tablet:hidden hover:opacity-70 transition-opacity"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-[18px] h-[18px]" />
                ) : (
                  <Menu className="w-[18px] h-[18px]" />
                )}
              </button>
              
              {/* Logo */}
              <h1 className="absolute left-1/2 -translate-x-1/2 text-lg tracking-tight font-bold z-[1002] text-center">
                <span className="mobile:inline block">DISCOVERY</span>
                <span className="mobile:inline block mobile:ml-1">STUDIOS</span>
              </h1>
              
              {/* User Actions */}
              <div className="flex items-center space-x-8">
                <button className="hover:opacity-70 transition-opacity">
                  <User className="w-[18px] h-[18px]" />
                </button>
                <button className="hover:opacity-70 transition-opacity">
                  <ShoppingBag className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="fixed left-0 right-0 border-t border-black z-[1003]" />

            {/* Search section */}
            <div className="relative pt-6 z-[1003]">
              <div className="flex items-center">
                <Search className="w-4 h-4 text-black/60" />
                <input
                  type="text"
                  placeholder="WHAT DO YOU DESIRE?"
                  className="w-full pl-3 text-sm tracking-[0.25em] placeholder:text-black/60 focus:outline-none"
                />
              </div>
            </div>
          </nav>
        </div>
        <div className="fixed left-0 right-0 border-t border-black z-[1003]" />
      </header>
    </>
  )
}

export default Navigation 