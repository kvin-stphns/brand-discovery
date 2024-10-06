'use client'

import { useState, useEffect } from 'react'
import { Search, User, ShoppingBag, ChevronRight, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const brandData = [
  { id: 1, name: 'Eco Chic', image: '/placeholder.svg', category: 'Tops', votes: 120 },
  { id: 2, name: 'Urban Threads', image: '/placeholder.svg', category: 'Bottoms', votes: 95 },
  { id: 3, name: 'Cozy Couture', image: '/placeholder.svg', category: 'Outerwear', votes: 150 },
  { id: 4, name: 'Boho Bliss', image: '/placeholder.svg', category: 'Accessories', votes: 80 },
  { id: 5, name: 'Minimalist Maven', image: '/placeholder.svg', category: 'Tops', votes: 110 },
  { id: 6, name: 'Denim Dreams', image: '/placeholder.svg', category: 'Bottoms', votes: 130 },
]

const categories = [
  { name: 'Tops', subcategories: ['T-Shirts', 'Blouses', 'Sweaters'] },
  { name: 'Bottoms', subcategories: ['Jeans', 'Skirts', 'Shorts'] },
  { name: 'Outerwear', subcategories: ['Jackets', 'Coats', 'Blazers'] },
  { name: 'Accessories', subcategories: ['Bags', 'Jewelry', 'Scarves'] },
]

export function LuxeFashionDiscovery() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [brands, setBrands] = useState(brandData)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || brand.category === selectedCategory)
  )

  const handleVote = (id: number) => {
    setBrands(brands.map(brand => 
      brand.id === id ? { ...brand, votes: brand.votes + 1 } : brand
    ))
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
          <div className="flex space-x-6">
            <a href="#" className="text-sm font-light hover:underline">WOMEN</a>
            <a href="#" className="text-sm font-light hover:underline">MEN</a>
            <a href="#" className="text-sm font-light hover:underline">GIFTS</a>
            <a href="#" className="text-sm font-light hover:underline">EXPLORE</a>
          </div>
          <h1 className="text-2xl font-bold">LUXE DISCOVER</h1>
          <div className="flex space-x-6">
            <User className="w-5 h-5" />
            <ShoppingBag className="w-5 h-5" />
          </div>
        </nav>
        <div className="px-8 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full p-2 pl-10 border-b border-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="pt-32 px-8 flex">
        {/* Sidebar */}
        <aside className="w-64 pr-8">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          {categories.map((category) => (
            <div
              key={category.name}
              className="mb-2 relative"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button
                className="text-left w-full py-2 flex justify-between items-center hover:bg-gray-100 transition-colors"
                onClick={() => setSelectedCategory(category.name)}
              >
                <span>{category.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {hoveredCategory === category.name && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute left-full top-0 ml-2 bg-white shadow-lg p-4 z-10"
                  >
                    {category.subcategories.map((subcat) => (
                      <button
                        key={subcat}
                        className="block w-full text-left py-2 hover:bg-gray-100 transition-colors"
                        onClick={() => setSelectedCategory(subcat)}
                      >
                        {subcat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </aside>

        {/* Brand grid */}
        <main className="flex-1">
          <div className="grid grid-cols-3 gap-8">
            {filteredBrands.map((brand) => (
              <motion.div
                key={brand.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold">{brand.name}</h3>
                  <p className="text-sm">{brand.category}</p>
                </div>
                <button
                  onClick={() => handleVote(brand.id)}
                  className="absolute bottom-4 right-4 bg-white text-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="container mx-auto px-8 flex justify-between text-sm text-gray-500">
          <a href="#" className="hover:underline">Login</a>
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Store Locations</a>
          <a href="#" className="hover:underline">Terms & Conditions</a>
        </div>
      </footer>
    </div>
  )
}