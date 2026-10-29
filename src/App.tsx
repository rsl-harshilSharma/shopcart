import './App.css'
import type { Product } from './types'

const products: Product[] = [
  { id: 'p1', name: 'Mechanical Keyboard', price: 120 },
  { id: 'p2', name: 'Wireless Ergonomic Mouse', price: 55 },
  { id: 'p3', name: 'USB-C Multiport Adapter', price: 35 },
  { id: 'p4', name: 'Ultra-Wide Monitor Light Bar', price: 75 },
]

function CartBadge() {
  return <span className="cart-badge">0</span>
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="ShopCart home">
        <span className="brand-mark">s.</span>
        <span>shopcart</span>
      </a>
      <nav className="toolbar" aria-label="Main navigation">
        <a href="#catalog">Shop</a>
        <a className="cart-link" href="#cart">
          Your cart <CartBadge />
        </a>
      </nav>
    </header>
  )
}

function ProductCard({ product }: { product: Product }) {
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
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>
      <button className="button button-outline" type="button" disabled>
        Add to cart
      </button>
    </article>
  )
}

function Catalog() {
  return (
    <section className="catalog" id="catalog" aria-labelledby="catalog-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Curated for your workspace</p>
          <h2 id="catalog-title">Make room for better.</h2>
        </div>
        <p className="section-note">Thoughtful tech, made to work beautifully.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function CartDrawer() {
  return (
    <aside className="cart-panel" id="cart" aria-labelledby="cart-title">
      <div className="cart-panel-heading">
        <div>
          <p className="eyebrow">Your selection</p>
          <h2 id="cart-title">Shopping cart</h2>
        </div>
        <span className="cart-count">0 items</span>
      </div>
      <div className="empty-cart">
        <span className="empty-cart-icon" aria-hidden="true">＋</span>
        <h3>Your cart is waiting</h3>
        <p>Add a few desk essentials and they’ll show up here.</p>
      </div>
      <div className="cart-total">
        <span>Subtotal</span>
        <strong>$0.00</strong>
      </div>
      <button className="button button-primary checkout-button" type="button" disabled>
        Continue to checkout <span aria-hidden="true">→</span>
      </button>
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
