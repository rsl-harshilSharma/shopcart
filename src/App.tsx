import { memo, useEffect, useState } from 'react'
import { useCartStore, selectCartItemCount, selectCartTotal } from './state/cartStore'
import type { CartItem, Product } from './types'
import './App.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function CartBadge() {
  const itemCount = useCartStore(selectCartItemCount)

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
  const addItem = useCartStore((state) => state.addItem)

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
  const removeItem = useCartStore((state) => state.removeItem)

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
  const items = useCartStore((state) => state.items)

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
  const itemCount = useCartStore(selectCartItemCount)

  return (
    <div className="cart-panel-heading">
      <div>
        <p className="eyebrow">Your selection</p>
        <h2 id="cart-title">Shopping cart</h2>
      </div>
      <span className="cart-count">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </span>
    </div>
  )
}

function CartTotal() {
  const total = useCartStore(selectCartTotal)

  return (
    <div className="cart-total">
      <span>Subtotal</span>
      <strong>{currency.format(total)}</strong>
    </div>
  )
}

function CheckoutFeedback() {
  const status = useCartStore((state) => state.checkoutStatus)
  const error = useCartStore((state) => state.checkoutError)

  if (status === 'submitting') {
    return <p className="checkout-message" role="status">Submitting your order…</p>
  }
  if (status === 'error') {
    return <p className="checkout-message error-message" role="alert">{error ?? 'Order submission failed.'}</p>
  }
  if (status === 'success') {
    return <p className="checkout-message" role="status">Order placed successfully.</p>
  }
  return null
}

function CheckoutButton() {
  const itemCount = useCartStore(selectCartItemCount)
  const status = useCartStore((state) => state.checkoutStatus)
  const checkout = useCartStore((state) => state.checkout)

  return (
    <button
      className="button button-primary checkout-button"
      type="button"
      disabled={itemCount === 0 || status === 'submitting'}
      onClick={() => void checkout()}
    >
      {status === 'submitting' ? 'Placing order…' : 'Continue to checkout'}
      <span aria-hidden="true">→</span>
    </button>
  )
}

function CartDrawer() {
  return (
    <aside className="cart-panel" id="cart" aria-labelledby="cart-title">
      <CartHeader />
      <CartItemsList />
      <CartTotal />
      <CheckoutButton />
      <CheckoutFeedback />
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
