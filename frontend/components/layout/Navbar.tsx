'use client'

import { Search, User, ShoppingBag } from 'lucide-react'

const Navigation = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="max-w-[2000px] mx-auto">
        <nav className="px-8 py-4 border-b border-black/5">
          <div className="flex items-center justify-between mb-4 relative">
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
            
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg tracking-[0.25em] font-light">
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

          <div className="divider"></div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="WHAT DO YOU DESIRE?"
              className="w-full py-2 pl-7 text-sm tracking-[0.25em] placeholder:text-black/60 focus:outline-none"
            />
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60" />
          </div>

          <div className="divider"></div>
        </nav>
      </div>
    </header>
  )
}

export default Navigation 