'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Bookmark, ChevronRight } from 'lucide-react'
import { fetchDesigner, fetchProducts } from '@/lib/api/client'
import { sanitizeText } from '@/lib/format'

interface PageProps {
  params: {
    id: string
  }
}

export default function DesignerPage({ params }: PageProps) {
  const { id } = params
  const [isMobile, setIsMobile] = useState(false)
  const [designer, setDesigner] = useState<any | null>(null)
  const [productsCount, setProductsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchDesigner(id),
      fetchProducts({ designerId: /^[0-9a-fA-F]{24}$/.test(id) ? id : undefined, q: /^[0-9a-fA-F]{24}$/.test(id) ? undefined : id, limit: 12 }),
    ])
      .then(([designerDoc, products]) => {
        if (cancelled) return
        setDesigner(designerDoc)
        setProductsCount(products.length)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const name = sanitizeText(designer?.name || (loading ? 'Loading designer' : 'Designer unavailable'))

  return (
    <>
      <div className="fixed top-[98px] lg:top-[103px] md:top-[103px] left-0 right-0 bg-white z-[1000] h-[40px] border-y border-black pt-[2px] md:pt-0">
        <div className="max-w-[2000px] mx-auto h-full flex items-center px-8">
          <Link href="/" className="text-xs tracking-[0.15em] text-gray-500 hover:text-black transition-colors">
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <span className="text-xs tracking-[0.15em]">{name.toUpperCase()}</span>
        </div>
      </div>

      <main className={`min-h-screen bg-white ${isMobile ? 'pt-[137px]' : 'pt-[140px]'}`}>
        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row">
          <div className={`${isMobile ? 'w-full' : 'w-[40%]'} relative`}>
            <div className={`${isMobile ? '' : 'sticky top-[140px]'} h-[calc(100vh-140px)] flex flex-col justify-between pr-8`}>
              <div className="relative flex-1 border-b border-black/10">
                {designer?.image ? (
                  <Image src={designer.image} alt={name} fill className="object-contain" priority />
                ) : (
                  <div className="h-full flex items-center justify-center px-8 text-center text-xs tracking-[0.18em] text-black/50">
                    DESIGNER IMAGE PENDING APPROVED ASSET
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px bg-black" />

          <div className={`${isMobile ? 'w-full pb-32 border-t border-black' : 'w-[60%]'}`}>
            <div className="max-w-2xl pt-6 px-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-lg tracking-[0.15em] mb-1 font-bold">{name.toUpperCase()}</h1>
                  <p className="text-sm tracking-[0.1em] text-gray-500">{productsCount} display-ready products</p>
                </div>
                <div className="flex space-x-4">
                  <button aria-label="Like designer" className="hover:text-[#4FFFF4] transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button aria-label="Save designer" className="hover:text-[#4FFFF4] transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6 pb-20">
                <div>
                  <h2 className="text-sm tracking-[0.15em] mb-2">ABOUT</h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {designer ? 'Designer profile data is connected to the live catalog and ready for richer partner-provided copy.' : 'This designer record is not available yet.'}
                  </p>
                </div>

                <Link
                  href="/explore"
                  className="block w-full bg-black text-white py-4 text-sm tracking-[0.15em] text-center hover:bg-gray-900 transition-colors"
                >
                  VIEW CATALOG
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
