'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Bookmark, ChevronRight } from 'lucide-react'

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  
  useEffect(() => {
    document.body.style.overscrollBehavior = 'none'
    return () => {
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
      {/* Breadcrumb */}
      <div className="fixed top-[100px] left-0 right-0 bg-white z-40">
        <div className="h-[40px] border-y border-black">
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
      </div>

      <div className="min-h-screen bg-white pt-[140px]">
        <div className="max-w-[2000px] mx-auto flex border-t border-black">
          {/* Left side - Images (40%) */}
          <div className="w-[40%] pr-8 sticky top-[140px] h-[calc(100vh-140px)] flex flex-col">
            <div className="relative flex-1 border-b border-black">
              <Image
                src={images[selectedImage]}
                alt="Product Image"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            <div className="flex h-20 relative">
              {/* Background grid lines that span full width */}
              <div className="absolute inset-0 flex">
                {Array(images.length).fill(null).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-black last:border-r-0" />
                ))}
              </div>
              
              {/* Thumbnails */}
              <div className="flex w-full relative">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-1 aspect-[3/4] 
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
          <div className="w-px bg-black h-auto" />

          {/* Right side - Product Info (60%) */}
          <div className="w-[60%] pl-8">
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

              {/* Add to Cart Button */}
              <button className="w-full py-2.5 bg-black text-white hover:bg-black/80 transition-colors tracking-[0.15em] text-sm mb-8">
                ADD TO CART
              </button>

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
        </div>
      </div>
    </>
  )
} 