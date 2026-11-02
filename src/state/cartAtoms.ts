import { atom } from 'jotai'
import type { CartItem, Product } from '../types'

export const cartItemsAtom = atom<CartItem[]>([])

export const cartItemCountAtom = atom((get) =>
  get(cartItemsAtom).reduce((count, item) => count + item.quantity, 0),
)

export const cartTotalAtom = atom((get) =>
  get(cartItemsAtom).reduce((total, item) => total + item.price * item.quantity, 0),
)

export const addCartItemAtom = atom(null, (get, set, product: Product) => {
  const items = get(cartItemsAtom)
  const existing = items.find((item) => item.id === product.id)

  set(
    cartItemsAtom,
    existing
      ? items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...items, { ...product, quantity: 1 }],
  )
})

export const removeCartItemAtom = atom(null, (get, set, productId: Product['id']) => {
  set(
    cartItemsAtom,
    get(cartItemsAtom).filter((item) => item.id !== productId),
  )
})

export const clearCartAtom = atom(null, (_get, set) => {
  set(cartItemsAtom, [])
})
