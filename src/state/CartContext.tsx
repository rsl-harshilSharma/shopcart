/* oxlint-disable react/only-export-components -- Context hooks are colocated with their provider. */
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; productId: Product['id'] }

const initialState: CartState = { items: [] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((item) => item.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }

      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: 1 }],
      }
    }
    case 'remove':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.productId),
      }
  }
}

const CartStateContext = createContext<CartState | undefined>(undefined)
const CartDispatchContext = createContext<Dispatch<CartAction> | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}

export function useCartState(): CartState {
  const state = useContext(CartStateContext)
  if (state === undefined) {
    throw new Error('useCartState must be used within a CartProvider.')
  }
  return state
}

export function useCartDispatch(): Dispatch<CartAction> {
  const dispatch = useContext(CartDispatchContext)
  if (dispatch === undefined) {
    throw new Error('useCartDispatch must be used within a CartProvider.')
  }
  return dispatch
}
