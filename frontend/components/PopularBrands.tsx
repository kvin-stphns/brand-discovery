'use client'
import Image from 'next/image'

const PopularBrands = () => {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0">
        <Image
          src="/popular-bg.jpg"
          alt="Popular Background"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="relative max-w-[2000px] mx-auto">
        <div className="px-8 mb-12">
          <h2 className="text-[#4FFFF4] text-2xl tracking-[0.25em] font-bold">
            POPULAR
          </h2>
        </div>
        {/* Full-width divider */}
        <div className="w-full h-[1px] bg-[#4FFFF4] opacity-50 mb-12" />

        <div className="px-8">
          <div className="grid grid-cols-2 gap-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="popular-brand rounded-xl bg-white/10 hover:bg-white/10 
                         backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 
                         aspect-[2/1] flex flex-col items-start justify-between p-8 
                         border border-transparent hover:border-[#4FFFF4]/50"
              >
                <span className="text-[#4FFFF4] text-sm tracking-[0.25em] font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[#4FFFF4] text-sm tracking-[0.25em] font-bold">
                  POPULAR BRAND
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PopularBrands