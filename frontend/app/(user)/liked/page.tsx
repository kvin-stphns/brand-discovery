'use client'
import { useState, useEffect } from 'react'

type FilterType = 'all' | 'brands' | 'designers' | 'products'

export default function LikedPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [likedItems] = useState<any[]>([])

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

      {/* Main Content - Empty State (no placeholders) */}
      <div className="mt-[271px]">
        <div className="max-w-[2000px] mx-auto py-24 px-8 text-center text-sm tracking-[0.15em] text-black/70">
          {likedItems.length === 0 ? 'No liked items yet.' : null}
        </div>
      </div>
    </section>
  )
}
