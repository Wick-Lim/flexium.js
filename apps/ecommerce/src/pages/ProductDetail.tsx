import { state, effect } from 'flexium/core'
import { Link, router } from 'flexium/router'
import { useProducts, addToCart, type Product } from '../store'

export default function ProductDetail() {
  const r = router()
  const productId = parseInt(r.params().id)
  const [products] = useProducts()
  const [product, setProduct] = state<Product | null>(null)

  effect(() => {
    const found = products.find(p => p.id === productId)
    setProduct(found || null)
  })

  if (!product) {
    return (
      <div class="container">
        <div class="loading">Product not found</div>
        <Link to="/">Back to Products</Link>
      </div>
    )
  }

  return (
    <div class="container">
      <Link to="/">← Back to Products</Link>
      <div class="product-detail">
        <img src={product.image} alt={product.title} class="product-detail-image" />
        <h1 class="product-detail-title">{product.title}</h1>
        <div class="product-detail-price">${product.price.toFixed(2)}</div>
        <div class="product-category">{product.category}</div>
        <div class="product-rating" style="margin-bottom: 1rem;">
          {'⭐'.repeat(Math.floor(product.rating.rate))} {product.rating.rate} ({product.rating.count} reviews)
        </div>
        <p class="product-detail-description">{product.description}</p>
        <button
          class="add-to-cart-btn"
          onclick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
