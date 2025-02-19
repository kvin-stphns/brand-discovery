'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const Hero = () => {
  const [isFixed, setIsFixed] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const buttonRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translateY(${position * 0.5}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpacity(0)
          setTimeout(() => setIsFixed(false), 300)
        } else if (window.scrollY < window.innerHeight) {
          // Only show button when scrolling up and within hero section
          setIsFixed(true)
          setTimeout(() => setOpacity(1), 50)
        }
      },
      { threshold: 0.1 }
    )

    const featured = document.querySelector('#featured-section')
    if (featured) {
      observer.observe(featured)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative w-full h-screen bg-white mt-[100px] overflow-hidden">
      {/* Background Image with Parallax */}
      <div ref={backgroundRef} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src="/hero-image.jpg"
          alt="Symmetrical Crowd"
          layout="fill"
          objectFit="cover"
          priority
          className="brightness-95"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>

      {/* Content */}
      <div 
        ref={buttonRef}
        className={`
          ${isFixed ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} 
          z-10 flex flex-col items-center space-y-8 transition-all duration-300
        `}
        style={{ opacity }}
      >
        <Link href="/discover">
          <button className="px-16 py-4 border border-black hover:bg-black/40 hover:backdrop-blur-sm hover:text-[#4FFFF4] hover:border-[#4FFFF4] text-sm tracking-[0.25em] bg-black/80 text-white transition-all duration-300">
            DISCOVER
          </button>
        </Link>
      </div>
    </section>
  )
}

export default Hero