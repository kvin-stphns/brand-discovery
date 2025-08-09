'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type FilterType = 'all' | 'brands' | 'designers' | 'products'

export default function LikedPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [likedItems] = useState(Array(32).fill(null))

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  return (
    <section className="w-full min-h-screen">
      {/* Fixed Title Section */}
      <div className="fixed top-0 left-0 right-0 bg-white z-30">
        <div className="mt-[155px] max-w-[2000px] mx-auto">
          <div className="px-8">
            <h2 className="text-black text-2xl tracking-[0.05em] font-bold">
              LIKED
            </h2>
            <div className="mt-4 flex space-x-6">
              {['ALL', 'BRANDS', 'DESIGNERS', 'PRODUCTS'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type.toLowerCase() as FilterType)}
                  className={`text-sm tracking-[0.15em] ${
                    filter === type.toLowerCase() ? 'text-black' : 'text-black/60'
                  } hover:text-black transition-colors`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[2000px] mx-auto border-t border-black mt-12" />
      </div>

      {/* Main Content - Grid Layout */}
      <div className="mt-[271px]">
        <div className="max-w-[2000px] mx-auto">
          <div className="grid grid-cols-4 mobile:grid-cols-4 tablet:grid-cols-6 desktop:grid-cols-8 border-t border-black">
            {likedItems.map((_, i) => (
              <Link
                key={i}
                href="#"
                className="group relative h-[250px] border-r border-b border-black last:border-r-0"
              >
                <Image
<<<<<<< Current (Your changes)
<<<<<<< Current (Your changes)
                  src={`/brand-${(i % 8) + 1}.jpg`}
=======
                  src={`/placeholders/brand-${(i % 4) + 1}.jpg`}
>>>>>>> Incoming (Background Agent changes)
=======
                  src={`/placeholders/brand-${(i % 4) + 1}.jpg`}
>>>>>>> Incoming (Background Agent changes)
                  alt={`Item ${i + 1}`}
                  fill
                  className="object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-semibold tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">
                    ITEM {i + 1}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 