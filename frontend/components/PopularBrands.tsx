'use client'
import Image from 'next/image'

const PopularBrands = () => {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 backdrop-blur-sm">
        <Image
          src="/popular-bg.jpg"
          alt="Popular Background"
          layout="fill"
          objectFit="cover"
          className="mix-blend-overlay"
        />
      </div>

      <div className="relative max-w-[2000px] mx-auto px-8">
        <h2 className="text-[#4FFFF4] text-2xl tracking-[0.25em] mb-12">
          POPULAR
        </h2>
        <div className="grid grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="popular-brand">
              <span className="text-[#4FFFF4] text-sm tracking-[0.25em]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-white text-sm tracking-[0.25em]">
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