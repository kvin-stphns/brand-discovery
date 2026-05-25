'use client'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/lib/store/cart'
import { formatPrice, sanitizeText } from '@/lib/format'
import { getCheckoutRedirectUrlById } from '@/lib/api/client'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, clear, remove } = useCart()
  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.retailer || item.source || 'Retailer'
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1100]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-[320px] bg-white border-l border-black p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm tracking-[0.25em]">CART</h2>
          <button aria-label="Close cart" onClick={onClose} className="hover:opacity-70">
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-black/60">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-5">
              {Object.entries(groups).map(([retailer, group]) => (
                <section key={retailer} aria-label={`${retailer} cart items`}>
                  <div className="mb-2 text-[10px] tracking-[0.18em] text-black/60">{sanitizeText(retailer).toUpperCase()}</div>
                  <ul className="space-y-3">
                    {group.map((it) => (
                      <li key={`${it.id}-${it.size}`} className="text-xs grid grid-cols-[56px_1fr] gap-3">
                        <div className="relative h-16 w-14 border border-black/10 bg-black/5">
                          {it.image ? (
                            <Image src={it.image} alt={`${it.brand ? `${it.brand} ` : ''}${it.name}`} fill className="object-cover" sizes="56px" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          {it.brand && <div className="text-[10px] tracking-[0.16em] text-black/60 truncate">{sanitizeText(it.brand).toUpperCase()}</div>}
                          <div className="tracking-[0.08em] leading-snug">{sanitizeText(it.name)}{it.size ? ` (${sanitizeText(it.size)})` : ''}</div>
                          <div className="mt-1 text-black/60">{formatPrice(it.price, it.currency)} x {it.qty}</div>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <button className="text-[10px] underline" onClick={() => remove(it.id, it.size)}>remove</button>
                            <a
                              href={getCheckoutRedirectUrlById(it.id, 'checkout')}
                              className="text-[10px] border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
                            >
                              CHECKOUT
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="mt-5 flex justify-between">
              <button className="text-xs underline" onClick={clear}>Clear</button>
              {items.length === 1 ? (
                <a className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors" href={getCheckoutRedirectUrlById(items[0].id, 'checkout')}>Checkout</a>
              ) : (
                <span className="text-[10px] tracking-[0.12em] text-black/50">CHECK OUT BY RETAILER</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

