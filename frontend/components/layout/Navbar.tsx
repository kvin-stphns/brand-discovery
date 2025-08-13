'use client'

import { useEffect, useState } from 'react'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import ScrollableNav from './ScrollableNav'
import MobileMenu from './MobileMenu'
import MegaMenu from './MegaMenu'
import Link from 'next/link'
import { useCart } from '@/lib/store/cart'
import CartDrawer from '@/components/ui/CartDrawer'
import { useRouter } from 'next/navigation'

function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return (
    <>
      <button className="hidden desktop:inline px-3 py-1 border border-black text-xs tracking-[0.15em] hover:bg-black hover:text-white transition-colors">
        CONNECT WALLET
      </button>
      <Link href="#" aria-label="Connect Wallet" className="inline desktop:hidden hover:opacity-70 transition-opacity">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7a2 2 0 012-2h12a2 2 0 012 2v3h-5a3 3 0 100 6h5v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm14 6a1 1 0 110 2h-3a1 1 0 110-2h3z" stroke="currentColor" strokeWidth="1.5"/></svg>
      </Link>
    </>
  )
}

const menuItems = ['WOMEN', 'MEN', 'GIFTS', 'EXPLORE']

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const { items } = useCart()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const h = setTimeout(async () => {
      if (!q) { setResults(null); return }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        if (res.ok) setResults(await res.json())
      } catch {}
    }, 300)
    return () => clearTimeout(h)
  }, [q])

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  
  return (
    <>
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={menuItems}
      />
      
      <header className="fixed top-0 left-0 right-0 bg-white z-[1001]">
        <div className="max-w-[2000px] mx-auto px-8">
          <nav className="py-5 pb-1.5">
            {/* Top section */}
            <div className="relative flex items-center justify-between mb-4">
              {/* Desktop Navigation */}
              <div className="hidden desktop:flex space-x-12 z-[500]">
                {menuItems.map((item) => (
                  <MegaMenu key={item} category={item} />
                ))}
              </div>

              {/* Tablet Navigation */}
              <div className="hidden tablet:block desktop:hidden">
                <ScrollableNav items={menuItems} />
              </div>

              {/* Mobile Menu Button */}
              <button 
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className="tablet:hidden hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80 rounded"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-[18px] h-[18px]" />
                ) : (
                  <Menu className="w-[18px] h-[18px]" />
                )}
              </button>
              
              {/* Logo */}
              <Link href="/" aria-label="Home" className="absolute left-1/2 -translate-x-1/2 text-lg tracking-tight font-bold z-[1002] text-center">
                <span className="mobile:inline block">DISCOVERY</span>
                <span className="mobile:inline block mobile:ml-1">STUDIOS</span>
              </Link>
              
              {/* User Actions */}
              <div className="flex items-center space-x-4 tablet:space-x-8">
                <Link href="/login" aria-label="Account" className="hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80 rounded">
                  <User className="w-[18px] h-[18px]" />
                </Link>
                <button aria-label="Bag" className="relative hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80 rounded" onClick={() => setShowCart(true)}>
                  <ShoppingBag className="w-[18px] h-[18px]" />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 text-[10px] leading-3 px-1.5 py-0.5 bg-black text-white rounded">
                      {count}
                    </span>
                  )}
                </button>
                <ConnectWalletButton />
              </div>
            </div>

            {/* Divider */}
            <div className="fixed left-0 right-0 border-t border-black z-[1003]" />

            {/* Search section */}
            <div className="relative pt-2.5 pb-1 z-[1003]">
              <div className="flex items-center h-6">
                <Search className="w-3.5 h-3.5 text-black/60" />
                <input
                  id="global-search"
                  type="search"
                  placeholder="WHAT DO YOU DESIRE?"
                  className="w-full pl-3 text-xs tracking-[0.25em] placeholder:text-black/60 focus:outline-none flex-1 leading-6"
                  value={q}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setTimeout(() => setOpen(false), 200)}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              {open && results && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-black/20 shadow-sm text-xs">
                  {['brands','designers','products'].map((k) => (
                    <div key={k}>
                      {(results[k]||[]).slice(0, k==='products'?6:4).map((it: any) => (
                        <button key={it._id} className="w-full text-left px-3 py-2 hover:bg-black/5" onMouseDown={() => router.push(k==='products'?`/product/${it._id}`:k==='brands'?`/brand/${it._id}`:`/designer/${it._id}`)}>
                          {it.name}
                        </button>
                      ))}
                    </div>
                  ))}
                  {(!results.brands?.length && !results.designers?.length && !results.products?.length) && (
                    <div className="px-3 py-2 text-black/60">No results</div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
        <div className="fixed left-0 right-0 border-t border-black z-[1003]" />
      </header>

      <CartDrawer open={showCart} onClose={() => setShowCart(false)} />
    </>
  )
}

export default Navigation 