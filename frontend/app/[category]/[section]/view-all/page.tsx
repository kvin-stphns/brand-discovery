'use client'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import ListLayout from '@/components/templates/ListLayout'
import { fetchProducts } from '@/lib/api/client'

interface PageProps {
  params: {
    category: string
    section: string
  }
}

const GIFT_CATEGORIES = ['Home', 'Tech', 'Art', 'Decor', 'Lighting']

export default function CategoryViewAllPage({ params }: PageProps) {
  const { category, section } = params
  const [liveItems, setLiveItems] = useState<Array<{ id: string; name: string; category?: string; image: string; href: string }>>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadTriggerRef = useRef<HTMLDivElement | null>(null)

  // Logic Matrix: Determine filters based on Active Section (Layer 1)
  const filters = useMemo(() => {
    const f: any = { limit: 24 }
    const catLower = category.toLowerCase()

    if (catLower === 'men') {
      f.gender = 'Men'
    } else if (catLower === 'women') {
      f.gender = 'Women'
    } else if (catLower === 'gifts') {
      f.category = GIFT_CATEGORIES.join(',')
    } else if (catLower === 'explore') {
      // No specific filters, aggregate all
    }

    // Layer 2 Deep Linking Support
    // If section is a specific category (e.g. 'tops'), we should filter by that too.
    // However, the current routing structure is [category]/[section]/view-all.
    // 'section' here is usually 'discover', 'brands', 'categories', etc.
    // If the user navigated to Men > Categories > Tops, the URL might be different.
    // Based on the current file path `[category]/[section]/view-all`, this page seems to be for "View All" of a section.
    // If `section` is 'categories', we might need to look at query params or context.
    // For now, we stick to the Phase 1 Logic Matrix which focuses on the Top-Level Section.

    return f
  }, [category, section])

  const loadMore = useCallback(async (reset = false) => {
    if (loading) return
    if (!reset && !hasMore) return

    setLoading(true)
    try {
      const nextPage = reset ? 1 : page + 1
      const prods = await fetchProducts({ ...filters, page: nextPage })

      const newItems = (prods || []).map((p: any, i: number) => ({
        id: String(p._id),
        name: String(p.title || ''),
        category: p.brand || 'Product',
        image: p.images?.[0] || `/placeholders/product-${(i % 4) + 1}.jpg`,
        href: `/product/${p._id}`,
      }))

      if (reset) {
        setLiveItems(newItems)
        setPage(1)
      } else {
        setLiveItems(prev => [...prev, ...newItems])
        setPage(nextPage)
      }

      if (prods.length < (filters.limit || 24)) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    } catch (err) {
      console.error('Failed to load products', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page, hasMore, loading])

  // Initial Load
  useEffect(() => {
    loadMore(true)
  }, [filters])

  // Infinite Scroll Observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore()
      }
    }, { threshold: 0.1 })

    if (loadTriggerRef.current) {
      observerRef.current.observe(loadTriggerRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  if (!liveItems.length && loading) {
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
    <>
      <ListLayout
        items={liveItems}
        title={section.toUpperCase()}
        category={category}
        section={section}
        subsection="view-all"
      >
        {/* Load Trigger */}
        <div ref={loadTriggerRef} className="h-20 w-full flex items-center justify-center">
          {loading && <span className="text-xs tracking-widest text-gray-400">LOADING MORE...</span>}
        </div>
      </ListLayout>
    </>
  )
}
