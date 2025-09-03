'use client'
import { useEffect, useMemo, useState } from 'react'
import ListLayout from '@/components/templates/ListLayout'
import { fetchProducts } from '@/lib/api/client'

interface PageProps {
  params: {
    category: string
    section: string
  }
}

export default function CategoryViewAllPage({ params }: PageProps) {
  const { category, section } = params
  const [liveItems, setLiveItems] = useState<Array<{ id: string; name: string; category?: string; image: string; href: string }>>([])

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const prods = await fetchProducts({ limit: 24 })
        if (cancelled) return
        setLiveItems(
          (prods || []).map((p: any, i: number) => ({
            id: String(p._id),
            name: String(p.title || ''),
            category: 'Product',
            image: p.images?.[0] || `/placeholders/product-${(i % 4) + 1}.jpg`,
            href: `/product/${p._id}`,
          }))
        )
      } catch {
        if (!cancelled) setLiveItems([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [category, section])

  if (!liveItems.length) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-0 left-0 right-0 pt-[155px] px-8 border-b border-black bg-white z-20">
          <div className="max-w-[2000px] mx-auto pb-12">
            <h2 className="text-black text-2xl tracking-[0.05em] font-bold">{section.toUpperCase()}</h2>
            <p className="mt-2 text-xs tracking-[0.15em] text-gray-500">{category.toUpperCase()} / {section.toUpperCase()} / VIEW ALL</p>
          </div>
        </div>
        <div className="pt-[260px] px-8 max-w-[2000px] mx-auto text-center text-sm tracking-[0.15em] text-black/70">Loading…</div>
      </div>
    )
  }

  return (
    <ListLayout 
      items={liveItems} 
      title={section.toUpperCase()}
      category={category}
      section={section}
      subsection="view-all"
    />
  )
}
