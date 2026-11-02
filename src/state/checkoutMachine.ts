import { assign, emit, fromPromise, setup } from 'xstate'
import type { CartItem, CheckoutResult } from '../types'

interface CheckoutContext {
  items: CartItem[]
  error: string | null
  order: CheckoutResult | null
}

type CheckoutEvent =
  | { type: 'CART_CHANGED'; items: CartItem[] }
  | { type: 'SUBMIT' }
  | { type: 'CANCEL' }

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

function isOrder(value: unknown): value is { id: string | number; total: number; items: CartItem[] } {
  if (typeof value !== 'object' || value === null) return false
  const order = value as Record<string, unknown>
  return (
    (typeof order.id === 'string' || typeof order.id === 'number') &&
    typeof order.total === 'number' &&
    Array.isArray(order.items) &&
    order.items.every(isCartItem)
  )
}

const submitOrder = fromPromise<CheckoutResult, CartItem[]>(async ({ input, signal }) => {
  const items = input.map((item) => ({ ...item }))
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, total, createdAt: new Date().toISOString() }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Payment failed (${response.status}). Please try again.`)
  }

  const result: unknown = await response.json()
  if (!isOrder(result)) {
    throw new Error('The payment response has an invalid format.')
  }

  return {
    id: String(result.id),
    items: result.items,
    total: result.total,
  }
})

export const checkoutMachine = setup({
  types: {
    context: {} as CheckoutContext,
    events: {} as CheckoutEvent,
    emitted: {} as { type: 'ORDER_COMPLETED'; order: CheckoutResult },
  },
  actors: {
    submitOrder,
  },
  guards: {
    hasCartItems: ({ context }) => context.items.length > 0,
    hasIncomingCartItems: ({ event }) =>
      event.type === 'CART_CHANGED' && event.items.length > 0,
  },
  actions: {
    syncCart: assign(({ event }) =>
      event.type === 'CART_CHANGED' ? { items: event.items } : {},
    ),
    clearError: assign({ error: null }),
    storeOrder: assign(({ event }) => ({
      order: event.output,
      error: null,
    })),
    storeError: assign(({ event }) => ({
      error: event.error instanceof Error ? event.error.message : 'Payment could not be completed.',
    })),
  },
}).createMachine({
  id: 'checkout',
  initial: 'reviewing',
  context: {
    items: [],
    error: null,
    order: null,
  },
  states: {
    reviewing: {
      on: {
        CART_CHANGED: { actions: 'syncCart' },
        SUBMIT: {
          guard: 'hasCartItems',
          target: 'submitting',
          actions: 'clearError',
        },
      },
    },
    submitting: {
      invoke: {
        src: 'submitOrder',
        input: ({ context }) => context.items,
        onDone: {
          target: 'success',
          actions: [
            'storeOrder',
            emit(({ event }) => ({
              type: 'ORDER_COMPLETED',
              order: event.output,
            })),
          ],
        },
        onError: {
          target: 'reviewing',
          actions: 'storeError',
        },
      },
      on: {
        CANCEL: {
          target: 'reviewing',
          actions: 'clearError',
        },
        CART_CHANGED: { actions: 'syncCart' },
      },
    },
    success: {
      on: {
        CART_CHANGED: [
          {
            guard: 'hasIncomingCartItems',
            target: 'reviewing',
            actions: 'syncCart',
          },
          { actions: 'syncCart' },
        ],
      },
    },
  },
})
