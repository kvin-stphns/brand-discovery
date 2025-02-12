'use client'
import Image from 'next/image'

const FeaturedBrands = () => {
  return (
    <section className="pt-20 w-full">
      <div className="max-w-[2000px] mx-auto">
        <h2 className="px-8 text-black text-2xl tracking-[0.05em] font-bold mb-12">
          FEATURED
        </h2>
        
        {/* Grid structure with full-width dividers, no far-left/right borders */}
        <div className="grid grid-cols-4 border-t border-black">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="group relative h-[500px] flex items-center justify-center border-r border-b border-black"
            >
              <Image
                src={`/brand-${i + 1}.jpg`}
                alt={`Featured Brand ${i + 1}`}
                width={400}
                height={500}
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
              <span className="absolute bottom-6 text-xs font-semibold tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">
                FEATURED BRAND
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedBrands