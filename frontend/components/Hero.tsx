'use client'
import Image from 'next/image'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center bg-white mt-[100px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-image.jpg"
          alt="Symmetrical Crowd"
          layout="fill"
          objectFit="cover"
          priority
          className="brightness-95"
        />
      </div>

      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* <h1 className="text-black text-4xl font-light tracking-[0.25em]">
          DISCOVER
        </h1> */}
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