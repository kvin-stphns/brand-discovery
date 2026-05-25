import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  name: string
  brand?: string
  retailer?: string
  source?: string
  price: number
  currency?: string
  size?: string
  image?: string
  qty: number
}

type CartState = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>) => void
  remove: (id: string, size?: string) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const existing = get().items.find((i) => i.id === item.id && i.size === item.size)
        if (existing) {
          set({ items: get().items.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i)) })
        } else {
          set({ items: [...get().items, { ...item, qty: 1 }] })
        }
      },
      remove: (id, size) => set({ items: get().items.filter((i) => !(i.id === id && i.size === size)) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'ds-cart' }
  )
)
