import { create } from 'zustand'
import type { CartItem, Product } from '../types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: Product['id']) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id)
      const items = existing
        ? state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...state.items, { ...product, quantity: 1 }]

      return { items }
    })
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }))
  },
  clearCart: () => set({ items: [] }),
}))

export const selectCartItemCount = (state: Pick<CartStore, 'items'>) =>
  state.items.reduce((count, item) => count + item.quantity, 0)

export const selectCartTotal = (state: Pick<CartStore, 'items'>) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0)
