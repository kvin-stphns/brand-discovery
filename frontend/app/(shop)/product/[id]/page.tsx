'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Bookmark, ChevronRight, ExternalLink } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { hrefFor } from '@/lib/nav'
import { fetchProduct, getCheckoutRedirectUrlById } from '@/lib/api/client'
import { sanitizeText, formatPrice } from '@/lib/format'

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sizeError, setSizeError] = useState('')
  const { add } = useCart()

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

  // Load product by route param (id)
  useEffect(() => {
    const id = window.location.pathname.split('/').pop() || ''
    let cancelled = false
    setLoading(true)
    fetchProduct(id)
      .then((p) => {
        if (cancelled) return
        setProduct(p)
        setError(p ? '' : 'Product unavailable')
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null)
          setError('Product unavailable')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const images = (product?.images?.length ? product.images : ['/placeholders/product-1.jpg'])
    .filter((img: string) => {
      // Filter out known bad domains that cause next/image crashes
      if (img.includes('bat.bing.com') || img.includes('googleadservices') || img.includes('doubleclick')) return false
      return true
    })

  // If all images were filtered out, show placeholder
  if (images.length === 0) images.push('/placeholders/product-1.jpg')

  const productName = sanitizeText(product?.title || 'Product')
  const brandName = sanitizeText(product?.brand || '')
  const retailerName = sanitizeText(product?.retailer || product?.source || '')
  const sizes = Array.isArray(product?.sizes) ? product.sizes.filter(Boolean) : []
  const details = Array.isArray(product?.details) ? product.details.filter(Boolean) : []
  const addCurrentProduct = () => {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError('Select a size to add this item.')
      return
    }
    if (!product?._id) return
    setSizeError('')
    add({
      id: String(product._id),
      name: productName,
      brand: brandName,
      retailer: retailerName,
      source: product?.source,
      price: Number(product?.price?.value || 0),
      currency: product?.price?.currency || 'USD',
      size: selectedSize || undefined,
      image: images[selectedImage],
    })
  }

  return (
    <>
      {/* Breadcrumb - Attached to Nav */}
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
              <span className="text-xs tracking-[0.15em]">{productName}</span>
        </div>
      </div>

      <main className={`min-h-screen bg-white ${isMobile ? 'pt-[137px]' : 'pt-[140px]'}`}>
        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row">
          {/* Left side - Images */}
          <div className={`${isMobile ? 'w-full' : 'w-[40%]'} relative`}>
            <div className={`${isMobile ? '' : 'sticky top-[140px]'} h-[calc(100vh-140px)] flex flex-col justify-between pr-8`}>
              {/* Preview Image */}
              <div className="relative flex-1">
                <Image
                  src={images[selectedImage] || '/placeholders/product-1.jpg'}
                  alt={`${brandName ? `${brandName} ` : ''}${productName}`}
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholders/product-1.jpg';
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div className="h-20 grid grid-flow-col auto-cols-max gap-0 overflow-x-auto border-t border-black mt-4 -mr-8 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1} for ${productName}`}
                    className={`relative w-20 h-full border-r border-black last:border-r-0
                      ${selectedImage === index ? 'ring-1 ring-black z-10' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <Image
                      src={img || '/placeholders/product-1.jpg'}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholders/product-1.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider (exact solid black) */}
          <div className="hidden md:block self-stretch w-px bg-black" />

          {/* Product Info Section */}
          <div className={`${isMobile ? 'w-full pb-32 border-t border-black' : 'w-[60%] relative'}`}>
            <div className="max-w-2xl pt-6 px-8">
              {/* Header with actions */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-lg tracking-[0.15em] mb-1 font-bold">{loading ? 'LOADING PRODUCT' : productName}</h1>
                  <p className="text-sm tracking-[0.1em] text-gray-500">{brandName || 'DISCOVERY STUDIOS'}</p>
                  {retailerName && <p className="text-xs tracking-[0.15em] text-gray-400 mt-1">{retailerName.toUpperCase()}</p>}
                </div>
                <div className="flex space-x-4">
                  <button aria-label="Like product" className="hover:text-[#4FFFF4] transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button aria-label="Save product" className="hover:text-[#4FFFF4] transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 border border-black px-4 py-3 text-xs tracking-[0.12em] text-black/70">
                  {error}
                </div>
              )}

              {/* Price */}
              <p className="text-base tracking-[0.1em] mb-6">{formatPrice(product?.price?.value, product?.price?.currency)}</p>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <label htmlFor="product-size" className="sr-only">Select size</label>
                  <select
                    id="product-size"
                    value={selectedSize}
                    onChange={(e) => { setSelectedSize(e.target.value); setSizeError('') }}
                    className="w-full px-4 py-2 border border-black/20 bg-transparent tracking-[0.1em] text-sm appearance-none"
                  >
                    <option value="">SELECT SIZE</option>
                    {sizes.map((size: string) => (
                      <option key={size} value={size}>{sanitizeText(size)}</option>
                    ))}
                  </select>
                  {sizeError && <p className="mt-2 text-xs tracking-[0.1em] text-red-700">{sizeError}</p>}
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">DESCRIPTION</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {sanitizeText(product?.description || 'Description is unavailable for this feed item.')}
                  </p>
                </div>

                {details.length > 0 && (
                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">DETAILS & FIT</h2>
                  <ul className="text-sm leading-relaxed text-gray-600 space-y-1">
                    {details.map((detail: string) => <li key={detail}>- {sanitizeText(detail)}</li>)}
                  </ul>
                </div>
                )}

                {(product?.availability || product?.color || product?.sku) && (
                  <div>
                    <h2 className="text-sm tracking-[0.15em] mb-2">PRODUCT DATA</h2>
                    <dl className="text-sm leading-relaxed text-gray-600 space-y-1">
                      {product?.availability && <div><dt className="inline text-black/70">Availability: </dt><dd className="inline">{sanitizeText(String(product.availability).replace(/_/g, ' '))}</dd></div>}
                      {product?.color && <div><dt className="inline text-black/70">Color: </dt><dd className="inline">{sanitizeText(product.color)}</dd></div>}
                      {product?.sku && <div><dt className="inline text-black/70">SKU: </dt><dd className="inline">{sanitizeText(product.sku)}</dd></div>}
                    </dl>
                  </div>
                )}

                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">SHIPPING</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {sanitizeText(product?.shipping || 'Shipping details are provided by the retailer at checkout.')}
                  </p>
                </div>

                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">RETURNS</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {sanitizeText(product?.returns || 'Return policy is confirmed by the retailer at checkout.')}
                  </p>
                </div>
              </div>

              {/* Checkout via affiliate preview (opens in new tab) */}
              <div className="mt-8">
                <a
                  href={product?._id ? getCheckoutRedirectUrlById(String(product._id), 'product') : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors text-sm tracking-[0.15em]"
                >
                  CHECK OUT WITH RETAILER <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Add desktop add to cart button */}
              {!isMobile && (
                <div className="absolute bottom-0 left-8 right-8 pb-8">
                  <button
                    className="w-full bg-black text-white py-4 text-sm tracking-[0.15em]"
                    onClick={addCurrentProduct}
                    disabled={!product?._id}
                  >
                    ADD TO CART
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Buy Button Overlay */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50">
              <button
                className="w-full bg-black text-white py-4 text-sm tracking-[0.15em]"
                onClick={addCurrentProduct}
                disabled={!product?._id}
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
