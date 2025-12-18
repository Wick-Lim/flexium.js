import { useState } from 'flexium/core'

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
  },
  {
    id: 11,
    title: "Portable SSD 1TB",
    price: 149.99,
    description: "Ultra-fast portable SSD with USB-C connectivity",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400",
    rating: { rate: 4.7, count: 234 }
  },
  {
    id: 12,
    title: "Wireless Charger",
    price: 34.99,
    description: "Fast wireless charging pad for smartphones",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1591290619762-0cccd7c0fb02?w=400",
    rating: { rate: 4.4, count: 158 }
  },
  {
    id: 13,
    title: "Ergonomic Office Chair",
    price: 299.99,
    description: "Premium mesh office chair with lumbar support",
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
    rating: { rate: 4.6, count: 312 }
  },
  {
    id: 14,
    title: "LED Desk Lamp",
    price: 44.99,
    description: "Adjustable LED desk lamp with touch control",
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    rating: { rate: 4.5, count: 187 }
  },
  {
    id: 15,
    title: "Bluetooth Speaker",
    price: 69.99,
    description: "Portable waterproof Bluetooth speaker with 12-hour battery",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    rating: { rate: 4.6, count: 276 }
  },
  {
    id: 16,
    title: "Mechanical Pencil Set",
    price: 12.99,
    description: "Professional mechanical pencil set for drawing and writing",
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1590143869540-8c18b7d8c33b?w=400",
    rating: { rate: 4.3, count: 92 }
  },
  {
    id: 17,
    title: "Smart Watch",
    price: 249.99,
    description: "Fitness tracking smartwatch with heart rate monitor",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    rating: { rate: 4.5, count: 428 }
  },
  {
    id: 18,
    title: "Notebook Set",
    price: 18.99,
    description: "Premium hardcover notebook set with dotted pages",
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?w=400",
    rating: { rate: 4.7, count: 145 }
  },
  {
    id: 19,
    title: "Webcam Cover",
    price: 7.99,
    description: "Privacy webcam cover for laptop and desktop",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1585076800883-5f05d7d18c82?w=400",
    rating: { rate: 4.2, count: 63 }
  },
  {
    id: 20,
    title: "Monitor Light Bar",
    price: 79.99,
    description: "LED monitor light bar with auto-dimming",
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=400",
    rating: { rate: 4.8, count: 201 }
  }
]

// Global cart state
export function useCart() {
  return useState<CartItem[]>([], { key: ['cart'] })
}

// Global products state
export function useProducts() {
  return useState<Product[]>(mockProducts, { key: ['products'] })
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
