'use client'

import { Search, User, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="w-full border-b border-black">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Menu */}
          <div className="flex items-center space-x-8">
            {['WOMEN', 'MEN', 'GIFTS', 'EXPLORE'].map((item) => (
              <Link 
                key={item} 
                href="#" 
                className="text-sm tracking-wider hover:text-gray-600 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
          
          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="text-xl font-bold tracking-wider">
              DISCOVERY STUDIOS
            </Link>
          </div>
          
          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <User className="w-5 h-5 cursor-pointer" />
            <ShoppingBag className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 