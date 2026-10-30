import { create } from 'zustand'
import type { CartItem, CheckoutResult, Product } from '../types'

export type CheckoutStatus = 'idle' | 'submitting' | 'success' | 'error'

interface CartStore {
  items: CartItem[]
  checkoutStatus: CheckoutStatus
  checkoutError: string | null
  addItem: (product: Product) => void
  removeItem: (productId: Product['id']) => void
  clearCart: () => void
  checkout: () => Promise<CheckoutResult | null>
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number'
  )
}

function isCheckoutResult(
  value: unknown,
): value is { id: string | number; items: CartItem[]; total: number } {
  if (typeof value !== 'object' || value === null) return false
  const result = value as Record<string, unknown>
  return (
    (typeof result.id === 'string' || typeof result.id === 'number') &&
    typeof result.total === 'number' &&
    Array.isArray(result.items) &&
    result.items.every(isCartItem)
  )
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  checkoutStatus: 'idle',
  checkoutError: null,
  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id)
      const items = existing
        ? state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...state.items, { ...product, quantity: 1 }]

      return { items, checkoutStatus: 'idle', checkoutError: null }
    })
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
      checkoutStatus: 'idle',
      checkoutError: null,
    }))
  },
  clearCart: () => set({ items: [], checkoutStatus: 'idle', checkoutError: null }),
  checkout: async () => {
    const { items } = get()
    if (items.length === 0) {
      const message = 'Add an item to your cart before checking out.'
      set({ checkoutStatus: 'error', checkoutError: message })
      return null
    }

    const orderItems = items.map((item) => ({ ...item }))
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    set({ checkoutStatus: 'submitting', checkoutError: null })

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          total,
          createdAt: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error(`Order submission failed (${response.status}).`)
      }

      const result: unknown = await response.json()
      if (!isCheckoutResult(result)) {
        throw new Error('The order response has an invalid format.')
      }

      const order: CheckoutResult = {
        id: String(result.id),
        items: result.items,
        total: result.total,
      }
      set({ checkoutStatus: 'success', checkoutError: null })
      return order
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to submit your order.'
      set({ checkoutStatus: 'error', checkoutError: message })
      return null
    }
  },
}))

export const selectCartItemCount = (state: Pick<CartStore, 'items'>) =>
  state.items.reduce((count, item) => count + item.quantity, 0)

export const selectCartTotal = (state: Pick<CartStore, 'items'>) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0)
