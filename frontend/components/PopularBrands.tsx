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

      <div className="relative max-w-[2000px] mx-auto px-8">
        <div className="mb-12">
          <h2 className="text-[#4FFFF4] text-2xl tracking-[0.25em]">
            POPULAR
          </h2>
          <div className="h-[1px] bg-[#4FFFF4] mt-4 opacity-50" />
        </div>

        <div className="grid grid-cols-2 gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="popular-brand rounded-xl bg-white/10 hover:bg-white/10 
                         backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 
                         aspect-[2/1] flex flex-col items-start justify-between p-8 
                         border border-transparent hover:border-[#4FFFF4]/50"
            >
              <span className="text-[#4FFFF4] text-sm tracking-[0.25em]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[#4FFFF4] text-sm tracking-[0.25em]">
                POPULAR BRAND
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularBrands