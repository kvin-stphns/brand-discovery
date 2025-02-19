'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const PopularBrands = () => {
  const backgroundRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      lastScrollY.current = window.scrollY

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (backgroundRef.current) {
            const isMobile = window.innerWidth <= 768
            const parallaxFactor = isMobile ? 0.15 : 0.25 // Gentler parallax effect
            const yOffset = lastScrollY.current * parallaxFactor
            backgroundRef.current.style.transform = `translate3d(0, ${yOffset}px, 0)`
          }
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative py-20 overflow-hidden">
      <div 
        ref={backgroundRef}
        className="absolute inset-0 will-change-transform"
        style={{ 
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          top: '-50%', // Moved up by 50%
          height: '150%' // Increased height to compensate for higher positioning
        }}
      >
        <Image
          src="/popular-bg-5.jpg"
          alt="Popular Background"
          fill
          quality={100}
          sizes="100vw"
          className="object-cover object-center scale-110" // Slight scale up to prevent edge visibility
          priority
        />
      </div>

      <div className="relative max-w-[2000px] mx-auto">
        <Link href="/popular">
          <h2 className="px-8 text-[#4FFFF4] text-2xl tracking-[0.25em] font-bold mb-4 hover:text-[#4FFFF4]/60 transition-colors">
            POPULAR
          </h2>
        </Link>
        <p className="px-8 text-xs tracking-[0.15em] text-[#4FFFF4] mb-2">
          BRANDS & DESIGNERS
        </p>
        <p className="px-8 text-xs tracking-[0.05em] text-[#4FFFF4] mb-12">
          Trending and most viewed across the platform
        </p>
        {/* Full-width divider */}
        <div className="w-full h-[1px] bg-[#4FFFF4] opacity-50 mb-12" />

        <div className="px-8 tablet:px-16 desktop:px-24">
          <div className="grid grid-cols-2 gap-4 tablet:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="popular-brand rounded-xl bg-white/10 hover:bg-white/10 
                         backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300 
                         aspect-[2/1] flex flex-col items-start justify-between p-4 tablet:p-8 
                         border border-transparent hover:border-[#4FFFF4]/50"
              >
                <span className="text-[#4FFFF4] text-sm tracking-[0.25em] font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[#4FFFF4] text-[10px] tablet:text-sm tracking-[0.25em] font-medium tablet:font-bold">
                  POPULAR
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