---
title: State Machine Example
---

# State Machine Example

State machine pattern examples including complex state transitions, guard conditions, and action handling.

## Basic State Machine

```tsx
import { state } from 'flexium/core'

type LoadingState = 'idle' | 'loading' | 'success' | 'error'

function DataLoader() {
  const currentState = state<LoadingState>('idle')
  const data = state<any>(null)
  const error = state<Error | null>(null)
  
  const loadData = async () => {
    // idle -> loading
    currentState.set('loading')
    error.set(null)
    
    try {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('Failed to fetch')
      
      const d = await res.json()
      data.set(d)
      
      // loading -> success
      currentState.set('success')
    } catch (err) {
      error.set(err as Error)
      
      // loading -> error
      currentState.set('error')
    }
  }
  
  const reset = () => {
    currentState.set('idle')
    data.set(null)
    error.set(null)
  }
  
  return (
    <div>
      {currentState.valueOf() === 'idle' && (
        <button onclick={loadData}>Load Data</button>
      )}
      
      {currentState.valueOf() === 'loading' && (
        <div>Loading...</div>
      )}
      
      {currentState.valueOf() === 'success' && (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <button onclick={reset}>Reset</button>
        </div>
      )}
      
      {currentState.valueOf() === 'error' && (
        <div>
          <p>Error: {error.valueOf()?.message}</p>
          <button onclick={loadData}>Retry</button>
          <button onclick={reset}>Reset</button>
        </div>
      )}
    </div>
  )
}
```

---

## Complex State Machine (Form Submission)

```tsx
import { state, sync } from 'flexium/core'

type FormState = 
  | { type: 'idle' }
  | { type: 'validating' }
  | { type: 'submitting' }
  | { type: 'success'; data: any }
  | { type: 'error'; message: string }

function ComplexForm() {
  const formState = state<FormState>({ type: 'idle' })
  const formData = state({
    email: '',
    password: ''
  })
  
  const validateForm = (data: typeof formData): string[] => {
    const errors: string[] = []
    if (!data.email) errors.push('Email is required')
    if (!data.password) errors.push('Password is required')
    return errors
  }
  
  const handleSubmit = async () => {
    // idle -> validating
    formState.set({ type: 'validating' })
    
    const errors = validateForm(formData)
    if (errors.length > 0) {
      // validating -> error
      formState.set({ type: 'error', message: errors[0] })
      return
    }
    
    // validating -> submitting
    formState.set({ type: 'submitting' })
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('Submission failed')
      
      const data = await res.json()
      
      // submitting -> success
      formState.set({ type: 'success', data })
    } catch (error) {
      // submitting -> error
      formState.set({ 
        type: 'error', 
        message: (error as Error).message 
      })
    }
  }
  
  const reset = () => {
    formState.set({ type: 'idle' })
    formData.set({ email: '', password: '' })
  }
  
  return (
    <div>
      {formState.type === 'idle' && (
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit() }}>
          <input
            value={formData.email}
            oninput={(e) => formData.set(prev => ({ ...prev, email: e.currentTarget.value }))}
            placeholder="Email"
          />
          <input
            type="password"
            value={formData.password}
            oninput={(e) => formData.set(prev => ({ ...prev, password: e.currentTarget.value }))}
            placeholder="Password"
          />
          <button type="submit">Submit</button>
        </form>
      )}
      
      {formState.type === 'validating' && (
        <div>Validating...</div>
      )}
      
      {formState.type === 'submitting' && (
        <div>Submitting...</div>
      )}
      
      {formState.type === 'success' && (
        <div>
          <p>Success!</p>
          <pre>{JSON.stringify(formState.data, null, 2)}</pre>
          <button onclick={reset}>Start Over</button>
        </div>
      )}
      
      {formState.type === 'error' && (
        <div>
          <p>Error: {formState.message}</p>
          <button onclick={() => formState.set({ type: 'idle' })}>Retry</button>
        </div>
      )}
    </div>
  )
}
```

---

## State Machine with Guard Conditions

```tsx
import { state } from 'flexium/core'

type GameState = 
  | { type: 'menu' }
  | { type: 'playing'; score: number; level: number }
  | { type: 'paused'; score: number; level: number }
  | { type: 'gameOver'; score: number; level: number }

function Game() {
  const gameState = state<GameState>({ type: 'menu' })
  const score = state(0)
  const level = state(1)
  
  const startGame = () => {
    // menu -> playing (guard: always allowed)
    gameState.set({ type: 'playing', score: 0, level: 1 })
    score.set(0)
    level.set(1)
  }
  
  const pauseGame = () => {
    // playing -> paused (guard: only when playing)
    if (gameState.type === 'playing') {
      gameState.set({ 
        type: 'paused', 
        score: gameState.score, 
        level: gameState.level 
      })
    }
  }
  
  const resumeGame = () => {
    // paused -> playing (guard: only when paused)
    if (gameState.type === 'paused') {
      gameState.set({ 
        type: 'playing', 
        score: gameState.score, 
        level: gameState.level 
      })
    }
  }
  
  const endGame = () => {
    // playing/paused -> gameOver (guard: only when playing or paused)
    if (gameState.type === 'playing' || gameState.type === 'paused') {
      gameState.set({ 
        type: 'gameOver', 
        score: gameState.score, 
        level: gameState.level 
      })
    }
  }
  
  const increaseScore = (points: number) => {
    // Only increase score when playing
    if (gameState.type === 'playing') {
      const newScore = gameState.score + points
      score.set(newScore)
      gameState.set({ 
        type: 'playing', 
        score: newScore, 
        level: gameState.level 
      })
    }
  }
  
  return (
    <div>
      {gameState.type === 'menu' && (
        <div>
          <h1>Game Menu</h1>
          <button onclick={startGame}>Start Game</button>
        </div>
      )}
      
      {gameState.type === 'playing' && (
        <div>
          <h2>Playing</h2>
          <p>Score: {gameState.score}</p>
          <p>Level: {gameState.level}</p>
          <button onclick={pauseGame}>Pause</button>
          <button onclick={endGame}>End Game</button>
          <button onclick={() => increaseScore(10)}>Score +10</button>
        </div>
      )}
      
      {gameState.type === 'paused' && (
        <div>
          <h2>Paused</h2>
          <p>Score: {gameState.score}</p>
          <p>Level: {gameState.level}</p>
          <button onclick={resumeGame}>Resume</button>
          <button onclick={endGame}>End Game</button>
        </div>
      )}
      
      {gameState.type === 'gameOver' && (
        <div>
          <h2>Game Over</h2>
          <p>Final Score: {gameState.score}</p>
          <p>Final Level: {gameState.level}</p>
          <button onclick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  )
}
```

---

## Action-Based State Machine

```tsx
import { state } from 'flexium/core'

type Action = 
  | { type: 'LOAD' }
  | { type: 'LOAD_SUCCESS'; data: any }
  | { type: 'LOAD_ERROR'; error: Error }
  | { type: 'RESET' }

type State = 
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; data: any }
  | { type: 'error'; error: Error }

function ActionBasedStateMachine() {
  const machineState = state<State>({ type: 'idle' })
  
  const dispatch = (action: Action) => {
    switch (action.type) {
      case 'LOAD':
        machineState.set({ type: 'loading' })
        // Execute async action
        fetch('/api/data')
          .then(res => res.json())
          .then(data => dispatch({ type: 'LOAD_SUCCESS', data }))
          .catch(error => dispatch({ type: 'LOAD_ERROR', error }))
        break
      
      case 'LOAD_SUCCESS':
        machineState.set({ type: 'success', data: action.data })
        break
      
      case 'LOAD_ERROR':
        machineState.set({ type: 'error', error: action.error })
        break
      
      case 'RESET':
        machineState.set({ type: 'idle' })
        break
    }
  }
  
  return (
    <div>
      {machineState.type === 'idle' && (
        <button onclick={() => dispatch({ type: 'LOAD' })}>Load</button>
      )}
      
      {machineState.type === 'loading' && (
        <div>Loading...</div>
      )}
      
      {machineState.type === 'success' && (
        <div>
          <pre>{JSON.stringify(machineState.data, null, 2)}</pre>
          <button onclick={() => dispatch({ type: 'RESET' })}>Reset</button>
        </div>
      )}
      
      {machineState.type === 'error' && (
        <div>
          <p>Error: {machineState.error.message}</p>
          <button onclick={() => dispatch({ type: 'LOAD' })}>Retry</button>
          <button onclick={() => dispatch({ type: 'RESET' })}>Reset</button>
        </div>
      )}
    </div>
  )
}
```

---

## State Machine Utility Function

```tsx
// utils/stateMachine.ts
export function createStateMachine<TState, TAction>(
  initialState: TState,
  reducer: (state: TState, action: TAction) => TState
) {
  const machineState = state(initialState)
  
  const dispatch = (action: TAction) => {
    machineState.set(reducer(machineState, action))
  }
  
  return [machineState, dispatch] as const
}

// Usage example
type CounterAction = 
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }

type CounterState = { count: number }

function Counter() {
  const [state, dispatch] = createStateMachine<CounterState, CounterAction>(
    { count: 0 },
    (state, action) => {
      switch (action.type) {
        case 'INCREMENT':
          return { count: state.count + 1 }
        case 'DECREMENT':
          return { count: state.count - 1 }
        case 'RESET':
          return { count: 0 }
        default:
          return state
      }
    }
  )
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onclick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onclick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onclick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  )
}
```

---

## Related Documentation

- [state() API](/docs/core/state) - State API documentation
- [Best Practices - Common Patterns](/docs/guide/best-practices/patterns) - State machine patterns