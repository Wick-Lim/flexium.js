import { state } from 'flexium/core'

export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

export interface CartItem {
  product: Product
  quantity: number
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Wireless Mouse",
    price: 29.99,
    description: "Ergonomic wireless mouse with precision tracking",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400",
    rating: { rate: 4.5, count: 120 }
  },
  {
    id: 2,
    title: "Mechanical Keyboard",
    price: 89.99,
    description: "RGB backlit mechanical keyboard with blue switches",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
    rating: { rate: 4.8, count: 89 }
  },
  {
    id: 3,
    title: "USB-C Hub",
    price: 49.99,
    description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400",
    rating: { rate: 4.3, count: 156 }
  },
  {
    id: 4,
    title: "Laptop Stand",
    price: 39.99,
    description: "Adjustable aluminum laptop stand for better ergonomics",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    rating: { rate: 4.6, count: 203 }
  },
  {
    id: 5,
    title: "Webcam HD",
    price: 79.99,
    description: "1080p HD webcam with built-in microphone",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587825147138-346c00648e0c?w=400",
    rating: { rate: 4.4, count: 98 }
  },
  {
    id: 6,
    title: "Desk Mat",
    price: 24.99,
    description: "Large desk mat with smooth surface for mouse and keyboard",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    rating: { rate: 4.7, count: 145 }
  },
  {
    id: 7,
    title: "Monitor Stand",
    price: 59.99,
    description: "Dual monitor stand with gas spring arms",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
    rating: { rate: 4.5, count: 112 }
  },
  {
    id: 8,
    title: "Noise Cancelling Headphones",
    price: 199.99,
    description: "Premium wireless headphones with active noise cancellation",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    rating: { rate: 4.9, count: 267 }
  },
  {
    id: 9,
    title: "USB Flash Drive 64GB",
    price: 19.99,
    description: "High-speed USB 3.0 flash drive with 64GB storage",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400",
    rating: { rate: 4.2, count: 189 }
  },
  {
    id: 10,
    title: "Cable Management Kit",
    price: 14.99,
    description: "Cable clips and sleeves for organized workspace",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    rating: { rate: 4.3, count: 76 }
  }
]

// Global cart state
export function useCart() {
  return state<CartItem[]>([], { key: ['cart'] })
}

// Global products state
export function useProducts() {
  return state<Product[]>(mockProducts, { key: ['products'] })
}

// Cart actions
export function addToCart(product: Product) {
  const [cart, setCart] = useCart()
  const existingItem = cart.find(item => item.product.id === product.id)

  if (existingItem) {
    setCart(cart.map(item =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ))
  } else {
    setCart([...cart, { product, quantity: 1 }])
  }
}

export function removeFromCart(productId: number) {
  const [cart, setCart] = useCart()
  setCart(cart.filter(item => item.product.id !== productId))
}

export function updateQuantity(productId: number, quantity: number) {
  const [cart, setCart] = useCart()
  if (quantity <= 0) {
    removeFromCart(productId)
  } else {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ))
  }
}

export function getCartTotal() {
  const [cart] = useCart()
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

export function getCartItemCount() {
  const [cart] = useCart()
  return cart.reduce((count, item) => count + item.quantity, 0)
}
