'use client'

import { Search, User, ShoppingBag } from 'lucide-react'

const Navigation = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="max-w-[2000px] mx-auto px-8">
        <nav className="py-6">
          {/* Top section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-12">
              {['WOMEN', 'MEN', 'GIFTS', 'EXPLORE'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            
            {/* Logo: Bold with tighter kerning */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg tracking-tight font-bold">
              DISCOVERY STUDIOS
            </h1>
            
            <div className="flex items-center space-x-8">
              <button className="hover:opacity-70 transition-opacity">
                <User className="w-[18px] h-[18px]" />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <ShoppingBag className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Full-width divider outside max-width container */}
          <div className="fixed left-0 right-0 border-t border-black" />

          {/* Search section */}
          <div className="relative pt-6">
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
      <div className="divider"></div>
    </header>
  )
}

export default Navigation 