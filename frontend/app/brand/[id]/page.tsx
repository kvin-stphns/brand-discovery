'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Bookmark, ChevronRight } from 'lucide-react'
import { brandTypes } from '@/types/gridItems'

interface PageProps {
  params: {
    id: string
  }
}

export default function BrandPage({ params }: PageProps) {
  const { id } = params
  const [selectedImage, setSelectedImage] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const brandType = brandTypes[0] // For static demo, will be dynamic later

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Placeholder images array - will be dynamic later
  const images = [
    '/placeholders/brand-1.jpg',
    '/placeholders/brand-2.jpg',
    '/placeholders/brand-3.jpg',
    '/placeholders/brand-4.jpg',
  ]

  return (
    <>
      {/* Breadcrumb */}
      <div className="fixed top-[98px] lg:top-[103px] md:top-[103px] left-0 right-0 bg-white z-[1000] h-[40px] border-y border-black pt-[2px] md:pt-0">
        <div className="max-w-[2000px] mx-auto h-full flex items-center px-8">
          <Link href="/" className="text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <span className="text-xs tracking-[0.15em]">BRAND {id}</span>
        </div>
      </div>

      <main className={`min-h-screen bg-white ${isMobile ? 'pt-[137px]' : 'pt-[140px]'}`}>
        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row">
          {/* Left side - Images */}
          <div className={`${isMobile ? 'w-full' : 'w-[40%]'} relative`}>
            <div className={`${isMobile ? '' : 'sticky top-[140px]'} h-[calc(100vh-140px)] flex flex-col justify-between pr-8`}>
              <div className="relative flex-1">
                <Image
                  src={images[selectedImage]}
                  alt={`Brand ${id}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="h-20 grid grid-cols-4 border-t border-black mt-4 -mr-8">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative border-r last:border-r-0 border-black
                      ${selectedImage === index ? 'ring-1 ring-black' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden md:block w-px bg-black" />

          {/* Brand Info Section */}
          <div className={`${isMobile ? 'w-full pb-32 border-t border-black' : 'w-[60%]'}`}>
            <div className="max-w-2xl pt-6 px-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-lg tracking-[0.15em] mb-1 font-bold">BRAND {id}</h1>
                  <p className="text-sm tracking-[0.1em] text-gray-500">{brandType} Brand</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm tracking-[0.1em] text-gray-500">Location: Tokyo, Japan</p>
                    <p className="text-sm tracking-[0.1em] text-gray-500">Founded: 2018</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="hover:text-[#4FFFF4] transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="hover:text-[#4FFFF4] transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 pb-20">
                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">ABOUT</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    A premium fashion brand focused on creating unique pieces that blend style with functionality.
                  </p>
                </div>

                <Link
                  href={`/brand/${id}/products`}
                  className="block w-full bg-black text-white py-4 text-sm tracking-[0.15em] text-center hover:bg-gray-900 transition-colors"
                >
                  VIEW ALL PRODUCTS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
