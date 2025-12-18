---
title: State Machine Example
---

# State Machine Example

State machine pattern examples including complex state transitions, guard conditions, and action handling.

## Basic State Machine

```tsx
import { use } from 'flexium/core'

type LoadingState = 'idle' | 'loading' | 'success' | 'error'

function DataLoader() {
  const [currentState, setCurrentState] = use<LoadingState>('idle')
  const [data, setData] = use<any>(null)
  const [error, setError] = use<Error | null>(null)
  
  const loadData = async () => {
    // idle -> loading
    setCurrentState('loading')
    setError(null)
    
    try {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('Failed to fetch')
      
      const d = await res.json()
      setData(d)
      
      // loading -> success
      setCurrentState('success')
    } catch (err) {
      setError(err as Error)
      
      // loading -> error
      setCurrentState('error')
    }
  }
  
  const reset = () => {
    setCurrentState('idle')
    setData(null)
    setError(null)
  }
  
  return (
    <div>
      {currentState === 'idle' && (
        <button onclick={loadData}>Load Data</button>
      )}
      
      {currentState === 'loading' && (
        <div>Loading...</div>
      )}
      
      {currentState === 'success' && (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <button onclick={reset}>Reset</button>
        </div>
      )}
      
      {currentState === 'error' && (
        <div>
          <p>Error: {error?.message}</p>
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
import { use, sync } from 'flexium/core'

type FormState =
  | { type: 'idle' }
  | { type: 'validating' }
  | { type: 'submitting' }
  | { type: 'success'; data: any }
  | { type: 'error'; message: string }

function ComplexForm() {
  const [formState, setFormState] = use<FormState>({ type: 'idle' })
  const [formData, setFormData] = use({
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
    setFormState({ type: 'validating' })
    
    const errors = validateForm(formData)
    if (errors.length > 0) {
      // validating -> error
      setFormState({ type: 'error', message: errors[0] })
      return
    }
    
    // validating -> submitting
    setFormState({ type: 'submitting' })
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error('Submission failed')
      
      const data = await res.json()
      
      // submitting -> success
      setFormState({ type: 'success', data })
    } catch (error) {
      // submitting -> error
      setFormState({ 
        type: 'error', 
        message: (error as Error).message 
      })
    }
  }
  
  const reset = () => {
    setFormState({ type: 'idle' })
    setFormData({ email: '', password: '' })
  }
  
  return (
    <div>
      {formState.type === 'idle' && (
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit() }}>
          <input
            value={formData.email}
            oninput={(e) => setFormData(prev => ({ ...prev, email: e.currentTarget.value }))}
            placeholder="Email"
          />
          <input
            type="password"
            value={formData.password}
            oninput={(e) => setFormData(prev => ({ ...prev, password: e.currentTarget.value }))}
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
          <button onclick={() => setFormState({ type: 'idle' })}>Retry</button>
        </div>
      )}
    </div>
  )
}
```

---

## State Machine with Guard Conditions

```tsx
import { use } from 'flexium/core'

type GameState =
  | { type: 'menu' }
  | { type: 'playing'; score: number; level: number }
  | { type: 'paused'; score: number; level: number }
  | { type: 'gameOver'; score: number; level: number }

function Game() {
  const [gameState, setGameState] = use<GameState>({ type: 'menu' })
  const [score, setScore] = use(0)
  const [level, setLevel] = use(1)
  
  const startGame = () => {
    // menu -> playing (guard: always allowed)
    setGameState({ type: 'playing', score: 0, level: 1 })
    setScore(0)
    setLevel(1)
  }
  
  const pauseGame = () => {
    // playing -> paused (guard: only when playing)
    if (gameState.type === 'playing') {
      setGameState({ 
        type: 'paused', 
        score: gameState.score, 
        level: gameState.level 
      })
    }
  }
  
  const resumeGame = () => {
    // paused -> playing (guard: only when paused)
    if (gameState.type === 'paused') {
      setGameState({ 
        type: 'playing', 
        score: gameState.score, 
        level: gameState.level 
      })
    }
  }
  
  const endGame = () => {
    // playing/paused -> gameOver (guard: only when playing or paused)
    if (gameState.type === 'playing' || gameState.type === 'paused') {
      setGameState({ 
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
      setScore(newScore)
      setGameState({ 
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
import { use } from 'flexium/core'

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
  const [machineState, setMachineState] = use<State>({ type: 'idle' })
  
  const dispatch = (action: Action) => {
    switch (action.type) {
      case 'LOAD':
        setMachineState({ type: 'loading' })
        // Execute async action
        fetch('/api/data')
          .then(res => res.json())
          .then(data => dispatch({ type: 'LOAD_SUCCESS', data }))
          .catch(error => dispatch({ type: 'LOAD_ERROR', error }))
        break
      
      case 'LOAD_SUCCESS':
        setMachineState({ type: 'success', data: action.data })
        break
      
      case 'LOAD_ERROR':
        setMachineState({ type: 'error', error: action.error })
        break
      
      case 'RESET':
        setMachineState({ type: 'idle' })
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
  const [machineState, setMachineState] = use(initialState)

  const dispatch = (action: TAction) => {
    setMachineState(reducer(machineState, action))
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

- [use() API](/docs/core/state) - State API documentation
- [Best Practices - Common Patterns](/docs/guide/best-practices/patterns) - State machine patterns