import { h } from 'flexium'
import './Counter.css'

interface CounterProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  onReset: () => void
}

export function Counter({ value, onIncrement, onDecrement, onReset }: CounterProps) {
  return (
    <div class="counter-component">
      <div class="counter-display">
        <div class="counter-value">{value}</div>
        <div class="counter-label">Count</div>
      </div>

      <div class="counter-buttons">
        <button class="counter-btn counter-btn-primary" onclick={onIncrement}>
          + Increment
        </button>
        <button class="counter-btn counter-btn-secondary" onclick={onDecrement}>
          - Decrement
        </button>
        <button class="counter-btn counter-btn-reset" onclick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
