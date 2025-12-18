import { use } from 'flexium/core'
import { Link } from 'flexium/router'
import { useProducts, addToCart, type Product } from '../store'

function ProductCard({ product }: { product: Product }) {
  return (
    <div class="product-card">
      <Link to={`/product/${product.id}`}>
        <img src={product.image} alt={product.title} class="product-image" />
        <h3 class="product-title">{product.title}</h3>
        <div class="product-category">{product.category}</div>
        <div class="product-price">${product.price.toFixed(2)}</div>
        <div class="product-rating">
          {'⭐'.repeat(Math.floor(product.rating.rate))} ({product.rating.count})
        </div>
      </Link>
      <button
        class="add-to-cart-btn"
        onclick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  )
}

export default function Products() {
  const [products] = useProducts()
  const [searchQuery, setSearchQuery] = use('')
  const [selectedCategory, setSelectedCategory] = use<string>('all')
  const [sortBy, setSortBy] = use<string>('default')

  // Get unique categories
  const categories = ['all', ...new Set(products.map((p: Product) => p.category))]

  // Filter and sort products
  const [filteredProducts] = use<Product[]>(() => {
    let filtered = [...products]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p: Product) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p: Product) => p.category === selectedCategory)
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a: Product, b: Product) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a: Product, b: Product) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filtered.sort((a: Product, b: Product) => b.rating.rate - a.rating.rate)
    }

    return filtered
  }, [products, searchQuery, selectedCategory, sortBy])

  return (
    <div class="container">
      <div class="search-bar">
        <input
          type="text"
          class="search-input"
          placeholder="Search products..."
          value={searchQuery}
          oninput={(e: any) => setSearchQuery(e.target.value)}
        />
      </div>

      <div class="filters">
        <select
          class="filter-select"
          value={selectedCategory}
          onchange={(e: any) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>

        <select
          class="filter-select"
          value={sortBy}
          onchange={(e: any) => setSortBy(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <div class="products-grid">
        {filteredProducts.map(product => (
          <ProductCard product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div class="loading">No products found</div>
      )}
    </div>
  )
}
