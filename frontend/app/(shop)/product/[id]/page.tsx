'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Bookmark, ChevronRight } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { hrefFor } from '@/lib/nav'
import { fetchProduct } from '@/lib/api/client'
import { toast } from '@/lib/toast'
import { useParams } from 'next/navigation'

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const params = useParams<{ id: string }>()
  const { add } = useCart()
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    document.body.style.overscrollBehavior = 'none'
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    let didCancel = false
    async function load() {
      if (!params?.id) return
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 2000)
      try {
        const p = await fetchProduct(params.id)
        if (!didCancel) setProduct(p)
        if (!p) toast('Live data temporarily unavailable', 'info')
      } catch (_e) {
        if (!didCancel) toast('Live data temporarily unavailable', 'info')
      } finally {
        clearTimeout(t)
      }
    }
    load()
    return () => { didCancel = true }
  }, [params?.id])

  const images = product?.images?.length ? product.images : [
    '/placeholders/product-1.jpg',
    '/placeholders/product-2.jpg',
    '/placeholders/product-3.jpg',
    '/placeholders/product-4.jpg',
  ]

  const title = product?.name || 'PRODUCT NAME'
  const brandName = product?.brandId ? 'BRAND' : 'BRAND NAME'
  const price = product?.price || 299

  return (
    <>
      <div className="fixed top-[98px] lg:top-[103px] md:top-[103px] left-0 right-0 bg-white z-[1000] h-[40px] border-y border-black pt-[2px] md:pt-0">
        <div className="max-w-[2000px] mx-auto h-full flex items-center px-8">
          <Link href="/" className="text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <Link href={hrefFor('discover', 'women', 'view all')} className="text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
            DISCOVER
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <span className="text-xs tracking-[0.15em]">{title}</span>
        </div>
      </div>

      <main className={`min-h-screen bg-white ${isMobile ? 'pt-[137px]' : 'pt-[140px]'}`}>
        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row">
          <div className={`${isMobile ? 'w-full' : 'w-[40%]'} relative`}>
            <div className={`${isMobile ? '' : 'sticky top-[140px]'} h-[calc(100vh-140px)] flex flex-col justify-between pr-8`}>
              <div className="relative flex-1">
                <Image
                  src={images[selectedImage]}
                  alt="Product Image"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="h-20 grid grid-cols-4 border-t border-black mt-4 -mr-8">
                {images.slice(0,4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative border-r last:border-r-0 border-black ${selectedImage === index ? 'ring-1 ring-black' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`${isMobile ? 'w-full pb-32 border-t border-black' : 'w-[60%] relative'}`}>
            <div className="max-w-2xl pt-6 px-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-lg tracking-[0.15em] mb-1 font-bold">{title}</h1>
                  <p className="text-sm tracking-[0.1em] text-gray-500">{brandName}</p>
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

              <p className="text-base tracking-[0.1em] mb-6">${price}.00</p>

              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full mb-6 px-4 py-2 border border-black/20 bg-transparent tracking-[0.1em] text-sm appearance-none">
                <option value="">SELECT SIZE</option>
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <div className="space-y-6">
                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">DESCRIPTION</h2>
                  <p className="text-sm leading-relaxed text-gray-600">Product description placeholder text. This will be replaced with actual product details.</p>
                </div>
              </div>

              {!isMobile && (
                <div className="absolute bottom-0 left-8 right-8 pb-8">
                  <button
                    className="w-full bg-black text-white py-4 text-sm tracking-[0.15em]"
                    onClick={() => {
                      if (!selectedSize) {
                        alert('Please select a size')
                        return
                      }
                      add({ id: product?._id || 'product-1', name: title, price, size: selectedSize, image: images[selectedImage] })
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              )}
            </div>
          </div>

          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50">
              <button
                className="w-full bg-black text-white py-4 text-sm tracking-[0.15em]"
                onClick={() => {
                  if (!selectedSize) { alert('Please select a size'); return }
                  add({ id: product?._id || 'product-1', name: title, price, size: selectedSize, image: images[selectedImage] })
                }}
              >
                ADD TO CART
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
} 