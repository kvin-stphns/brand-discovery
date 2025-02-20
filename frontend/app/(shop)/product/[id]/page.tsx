'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Bookmark, ChevronRight } from 'lucide-react'

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Handle mobile detection and viewport adjustments
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    document.body.style.overscrollBehavior = 'none'
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  // Placeholder images array
  const images = [
    '/product-1.jpg',
    '/product-2.jpg',
    '/product-3.jpg',
    '/product-4.jpg',
  ]

  return (
    <>
      {/* Breadcrumb - Attached to Nav */}
      <div className="fixed top-[100px] left-0 right-0 bg-white z-[1000] h-[40px] border-y border-black">
        <div className="max-w-[2000px] mx-auto h-full flex items-center px-8">
          <Link href="/" className="text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <Link href="/discover" className="text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
            DISCOVER
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <span className="text-xs tracking-[0.15em]">PRODUCT NAME</span>
        </div>
      </div>

      <main className="min-h-screen bg-white pt-[140px]">
        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row">
          {/* Left side - Images */}
          <div className={`${isMobile ? 'w-full' : 'w-[40%]'} relative`}>
            <div className={`${isMobile ? '' : 'sticky top-[140px]'} h-[calc(100vh-140px)] flex flex-col justify-between pr-8`}>
              {/* Preview Image */}
              <div className="relative flex-1">
                <Image
                  src={images[selectedImage]}
                  alt="Product Image"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              {/* Thumbnails */}
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

          {/* Product Info Section */}
          <div className={`${isMobile ? 'w-full px-4 pb-32 border-t border-black' : 'w-[60%] pl-8'}`}>
            <div className="max-w-2xl pt-6">
              {/* Header with actions */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-lg tracking-[0.15em] mb-1">PRODUCT NAME</h1>
                  <p className="text-sm tracking-[0.1em] text-gray-500">BRAND NAME</p>
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

              {/* Price */}
              <p className="text-base tracking-[0.1em] mb-6">$299.00</p>

              {/* Size Selection */}
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full mb-6 px-4 py-2 border border-black/20 bg-transparent tracking-[0.1em] text-sm appearance-none"
              >
                <option value="">SELECT SIZE</option>
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              {/* Product Details */}
              <div className="space-y-6 pb-20">
                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">DESCRIPTION</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Product description placeholder text. This will be replaced with actual product details.
                  </p>
                </div>

                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">DETAILS & FIT</h2>
                  <ul className="text-sm leading-relaxed text-gray-600 space-y-1">
                    <li>• Detail point 1</li>
                    <li>• Detail point 2</li>
                    <li>• Detail point 3</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">SHIPPING</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Shipping information placeholder text.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Buy Button Overlay */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50">
              <button className="w-full bg-black text-white py-4 text-sm tracking-[0.15em]">
                ADD TO CART
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
} 