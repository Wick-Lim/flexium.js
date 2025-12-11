import { Link } from 'flexium/router'
import { useCart, removeFromCart, updateQuantity, getCartTotal } from '../store'

export default function Cart() {
  const [cart] = useCart()
  const total = getCartTotal()

  if (cart.length === 0) {
    return (
      <div class="container">
        <div class="cart-page">
          <div class="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/">Browse Products</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div class="container">
      <div class="cart-page">
        <h1>Shopping Cart</h1>
        {cart.map(item => (
          <div class="cart-item">
            <img src={item.product.image} alt={item.product.title} class="cart-item-image" />
            <div class="cart-item-details">
              <div class="cart-item-title">{item.product.title}</div>
              <div class="cart-item-price">${item.product.price.toFixed(2)} each</div>
            </div>
            <div class="quantity-controls">
              <button
                class="quantity-btn"
                onclick={() => updateQuantity(item.product.id, item.quantity - 1)}
              >
                −
              </button>
              <span class="quantity-value">{item.quantity}</span>
              <button
                class="quantity-btn"
                onclick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div style="min-width: 100px; text-align: right; font-weight: 600;">
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
            <button
              class="remove-btn"
              onclick={() => removeFromCart(item.product.id)}
            >
              Remove
            </button>
          </div>
        ))}
        <div class="cart-total">
          <div class="total-label">Total:</div>
          <div class="total-amount">${total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
