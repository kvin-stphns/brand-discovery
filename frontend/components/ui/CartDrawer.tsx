'use client'
import { X } from 'lucide-react'
import { useCart } from '@/lib/store/cart'
import { getCheckoutRedirectUrlById } from '@/lib/api/client'
import { formatPrice, sanitizeText } from '@/lib/format'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, clear, remove } = useCart()
  const checkoutHref = items[0]?.id ? getCheckoutRedirectUrlById(items[0].id, 'checkout') : '#'

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
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={`${it.id}-${it.size}`} className="text-xs flex justify-between items-center">
                  <div>
                    {it.brand && <div className="text-black/60">{sanitizeText(it.brand)}</div>}
                    <div>{sanitizeText(it.name)}{it.size ? ` (${sanitizeText(it.size)})` : ''}</div>
                    <div className="text-black/60">{formatPrice(it.price, it.currency)} x{it.qty}</div>
                  </div>
                  <button className="text-[10px] underline" onClick={() => remove(it.id, it.size)}>remove</button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <button className="text-xs underline" onClick={clear}>Clear</button>
              <a className="text-xs border border-black px-3 py-1" href={checkoutHref} target="_blank" rel="noopener noreferrer">Checkout</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

