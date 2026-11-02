import { memo, useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  addCartItemAtom,
  cartItemCountAtom,
  cartItemsAtom,
  cartTotalAtom,
  clearCartAtom,
  removeCartItemAtom,
} from './state/cartAtoms'
import type { CartItem, Product } from './types'
import './App.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function CartBadge() {
  const itemCount = useAtomValue(cartItemCountAtom)

  return (
    <span className="cart-badge" aria-label={`${itemCount} items in cart`}>
      {itemCount}
    </span>
  )
}

function Toolbar() {
  return (
    <nav className="toolbar" aria-label="Main navigation">
      <a href="#catalog">Shop</a>
      <a className="cart-link" href="#cart">
        Your cart <CartBadge />
      </a>
    </nav>
  )
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="ShopCart home">
        <span className="brand-mark">s.</span>
        <span>shopcart</span>
      </a>
      <Toolbar />
    </header>
  )
}

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const addItem = useSetAtom(addCartItemAtom)

  return (
    <article className="product-card">
      <div className={`product-art product-art-${product.id}`}>
        <span>{product.name.split(' ').map((word) => word[0]).join('')}</span>
      </div>
      <div className="product-copy">
        <div>
          <h3>{product.name}</h3>
          <p className="product-category">Desk essentials</p>
        </div>
        <p className="product-price">{currency.format(product.price)}</p>
      </div>
      <button
        className="button button-outline"
        type="button"
        onClick={() => addItem(product)}
      >
        Add to cart <span aria-hidden="true">＋</span>
      </button>
    </article>
  )
})

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false
  const product = value as Record<string, unknown>
  return (
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number'
  )
}

function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const response = await fetch('/api/products', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Catalog request failed (${response.status}).`)
        }

        const result: unknown = await response.json()
        if (!Array.isArray(result) || !result.every(isProduct)) {
          throw new Error('The catalog response has an invalid format.')
        }

        setProducts(result)
      } catch (cause) {
        if (cause instanceof Error && cause.name === 'AbortError') return
        setError(cause instanceof Error ? cause.message : 'Unable to load products.')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadProducts()
    return () => controller.abort()
  }, [])

  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Curated for your workspace</p>
          <h2 id="catalog-title">Make room for better.</h2>
        </div>
        <p className="section-note">Thoughtful tech, made to work beautifully.</p>
      </div>
      {error && <p className="catalog-message error-message" role="alert">{error}</p>}
      {isLoading && <p className="catalog-message" role="status">Loading products…</p>}
      {!isLoading && !error && products.length === 0 && (
        <p className="catalog-message">No products are available right now.</p>
      )}
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

const CartItemRow = memo(function CartItemRow({ item }: { item: CartItem }) {
  const removeItem = useSetAtom(removeCartItemAtom)

  return (
    <li className="cart-item">
      <div className={`cart-item-mark product-art-${item.id}`} aria-hidden="true">
        {item.name.split(' ').map((word) => word[0]).join('')}
      </div>
      <div className="cart-item-copy">
        <strong>{item.name}</strong>
        <span>Qty {item.quantity} · {currency.format(item.price)} each</span>
      </div>
      <div className="cart-item-end">
        <strong>{currency.format(item.price * item.quantity)}</strong>
        <button
          className="remove-button"
          type="button"
          aria-label={`Remove ${item.name} from cart`}
          onClick={() => removeItem(item.id)}
        >
          Remove
        </button>
      </div>
    </li>
  )
})

function CartItemsList() {
  const items = useAtomValue(cartItemsAtom)

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <span className="empty-cart-icon" aria-hidden="true">＋</span>
        <h3>Your cart is waiting</h3>
        <p>Add a few desk essentials and they’ll show up here.</p>
      </div>
    )
  }

  return (
    <ul className="cart-items-list">
      {items.map((item) => <CartItemRow key={item.id} item={item} />)}
    </ul>
  )
}

function CartHeader() {
  const itemCount = useAtomValue(cartItemCountAtom)

  return (
    <div className="cart-panel-heading">
      <div>
        <p className="eyebrow">Your selection</p>
        <h2 id="cart-title">Shopping cart</h2>
      </div>
      <div className="cart-header-actions">
        <span className="cart-count">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <ClearCartButton />
      </div>
    </div>
  )
}

const ClearCartButton = memo(function ClearCartButton() {
  const clearCart = useSetAtom(clearCartAtom)

  return (
    <button className="clear-cart-button" type="button" onClick={clearCart}>
      Clear cart
    </button>
  )
})

function CartTotal() {
  const total = useAtomValue(cartTotalAtom)

  return (
    <div className="cart-total">
      <span>Subtotal</span>
      <strong>{currency.format(total)}</strong>
    </div>
  )
}

function CheckoutButton() {
  const [message, setMessage] = useState('')

  return (
    <>
      <button
        className="button button-primary checkout-button"
        type="button"
        onClick={() => setMessage('Checkout will be available in the next milestone.')}
      >
        Continue to checkout <span aria-hidden="true">→</span>
      </button>
      {message && <p className="checkout-message" role="status">{message}</p>}
    </>
  )
}

function CartDrawer() {
  return (
    <aside className="cart-panel" id="cart" aria-labelledby="cart-title">
      <CartHeader />
      <CartItemsList />
      <CartTotal />
      <CheckoutButton />
      <p className="secure-note">Shipping and taxes calculated at checkout</p>
    </aside>
  )
}

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">The work-from-anywhere edit</p>
            <h1>A little more<br />ease in your day.</h1>
            <p>Everyday tools for the way you work, think, and create.</p>
            <a className="button button-primary hero-cta" href="#catalog">
              Explore the collection <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-keyboard"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            <div className="hero-mouse" />
            <span className="hero-sparkle sparkle-one">✳</span>
            <span className="hero-sparkle sparkle-two">✳</span>
          </div>
          <span className="hero-index">01 / 04</span>
        </section>
        <div className="shop-layout">
          <Catalog />
          <CartDrawer />
        </div>
      </main>
      <footer className="site-footer">
        <span>ShopCart</span>
        <span>Good tools. Better days.</span>
      </footer>
    </div>
  )
}

export default App
