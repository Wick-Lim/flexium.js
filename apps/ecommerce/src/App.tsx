import { Router, Route, Link } from 'flexium/router'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import { getCartItemCount } from './store'

function Nav() {
  const cartCount = getCartItemCount()

  return (
    <header class="header">
      <div class="header-content">
        <Link to="/" class="logo">🛍️ Flexium Store</Link>
        <nav class="nav-links">
          <Link to="/">Products</Link>
          <Link to="/cart" class="cart-button">
            Cart
            {cartCount > 0 && <span class="cart-badge">{cartCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <Router>
      <Nav />
      <Route path="/" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
    </Router>
  )
}
