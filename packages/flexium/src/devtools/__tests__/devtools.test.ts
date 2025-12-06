import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  enableDevTools,
  disableDevTools,
  getDevToolsState,
  isDevToolsEnabled,
  registerSignal,
  updateSignalInfo,
  registerEffect,
  updateEffectInfo,
  registerComponent,
  unregisterComponent,
  createNamedSignal,
} from '../index'
import { signal } from '../../core/signal'

describe('DevTools', () => {
  beforeEach(() => {
    disableDevTools()
  })

  afterEach(() => {
    disableDevTools()
  })

  describe('enableDevTools', () => {
    it('should enable devtools', () => {
      expect(isDevToolsEnabled()).toBe(false)
      enableDevTools()
      expect(isDevToolsEnabled()).toBe(true)
    })

    it('should expose __FLEXIUM_DEVTOOLS__ on window', () => {
      enableDevTools()
      expect((window as any).__FLEXIUM_DEVTOOLS__).toBeDefined()
      expect((window as any).__FLEXIUM_DEVTOOLS__.getState).toBeDefined()
      expect((window as any).__FLEXIUM_DEVTOOLS__.getSignals).toBeDefined()
      expect((window as any).__FLEXIUM_DEVTOOLS__.getEffects).toBeDefined()
      expect((window as any).__FLEXIUM_DEVTOOLS__.getComponents).toBeDefined()
      expect((window as any).__FLEXIUM_DEVTOOLS__.subscribe).toBeDefined()
    })

    it('should log to console when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      enableDevTools()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Flexium DevTools]'),
        expect.any(String)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('disableDevTools', () => {
    it('should disable devtools', () => {
      enableDevTools()
      expect(isDevToolsEnabled()).toBe(true)
      disableDevTools()
      expect(isDevToolsEnabled()).toBe(false)
    })

    it('should remove __FLEXIUM_DEVTOOLS__ from window', () => {
      enableDevTools()
      expect((window as any).__FLEXIUM_DEVTOOLS__).toBeDefined()
      disableDevTools()
      expect((window as any).__FLEXIUM_DEVTOOLS__).toBeUndefined()
    })

    it('should clear all tracked signals, effects, and components', () => {
      enableDevTools()
      const sig = signal(0)
      registerSignal(sig, 'test')
      registerEffect('testEffect')
      registerComponent('TestComponent', {})

      const state = getDevToolsState()
      // Signal may be auto-registered, so check for at least 1
      expect(state.signals.size).toBeGreaterThanOrEqual(1)
      expect(state.effects.size).toBeGreaterThanOrEqual(1)
      expect(state.components.size).toBe(1)

      disableDevTools()
      const clearedState = getDevToolsState()
      expect(clearedState.signals.size).toBe(0)
      expect(clearedState.effects.size).toBe(0)
      expect(clearedState.components.size).toBe(0)
    })
  })

  describe('getDevToolsState', () => {
    it('should return a copy of the state', () => {
      enableDevTools()
      const state1 = getDevToolsState()
      const state2 = getDevToolsState()
      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
    })

    it('should return enabled status', () => {
      expect(getDevToolsState().enabled).toBe(false)
      enableDevTools()
      expect(getDevToolsState().enabled).toBe(true)
    })
  })

  describe('registerSignal', () => {
    it('should return -1 when devtools are disabled', () => {
      const sig = signal(0)
      const id = registerSignal(sig, 'count')
      expect(id).toBe(-1)
    })

    it('should register signal and return id when enabled', () => {
      enableDevTools()
      const sig = signal(42)
      const id = registerSignal(sig, 'count')
      expect(id).toBeGreaterThanOrEqual(0)

      const state = getDevToolsState()
      expect(state.signals.has(id)).toBe(true)
    })

    it('should store signal info correctly', () => {
      enableDevTools()
      const sig = signal('hello')
      const id = registerSignal(sig, 'greeting')

      const state = getDevToolsState()
      const info = state.signals.get(id)

      expect(info).toBeDefined()
      expect(info!.name).toBe('greeting')
      expect(info!.value).toBe('hello')
      expect(info!.subscribers).toBe(0)
      expect(info!.updateCount).toBe(0)
      expect(info!.createdAt).toBeLessThanOrEqual(Date.now())
    })

    it('should assign unique ids to multiple signals', () => {
      enableDevTools()
      const sig1 = signal(1)
      const sig2 = signal(2)
      const id1 = registerSignal(sig1, 'a')
      const id2 = registerSignal(sig2, 'b')
      expect(id1).not.toBe(id2)
    })
  })

  describe('updateSignalInfo', () => {
    it('should do nothing when devtools are disabled', () => {
      const sig = signal(0)
      const id = registerSignal(sig, 'count')
      updateSignalInfo(id, 10)
      // No error should be thrown
    })

    it('should update signal value and metadata', () => {
      enableDevTools()
      const sig = signal(0)
      const id = registerSignal(sig, 'count')

      const before = getDevToolsState().signals.get(id)!
      expect(before.value).toBe(0)
      expect(before.updateCount).toBe(0)

      updateSignalInfo(id, 5)

      const after = getDevToolsState().signals.get(id)!
      expect(after.value).toBe(5)
      expect(after.updateCount).toBe(1)
      expect(after.lastUpdated).toBeGreaterThanOrEqual(before.lastUpdated)
    })

    it('should increment update count on each update', () => {
      enableDevTools()
      const sig = signal(0)
      const id = registerSignal(sig, 'count')

      updateSignalInfo(id, 1)
      updateSignalInfo(id, 2)
      updateSignalInfo(id, 3)

      const info = getDevToolsState().signals.get(id)!
      expect(info.updateCount).toBe(3)
    })
  })

  describe('registerEffect', () => {
    it('should return -1 when devtools are disabled', () => {
      const id = registerEffect('myEffect')
      expect(id).toBe(-1)
    })

    it('should register effect and return id when enabled', () => {
      enableDevTools()
      const id = registerEffect('myEffect')
      expect(id).toBeGreaterThanOrEqual(0)

      const state = getDevToolsState()
      expect(state.effects.has(id)).toBe(true)
    })

    it('should store effect info correctly', () => {
      enableDevTools()
      const id = registerEffect('myEffect')

      const info = getDevToolsState().effects.get(id)!
      expect(info.name).toBe('myEffect')
      expect(info.dependencies).toEqual([])
      expect(info.runCount).toBe(0)
      expect(info.status).toBe('idle')
      expect(info.error).toBeUndefined()
    })
  })

  describe('updateEffectInfo', () => {
    it('should update effect status and run count', () => {
      enableDevTools()
      const id = registerEffect('myEffect')

      updateEffectInfo(id, 'running')
      let info = getDevToolsState().effects.get(id)!
      expect(info.status).toBe('running')
      expect(info.runCount).toBe(1)

      updateEffectInfo(id, 'idle')
      info = getDevToolsState().effects.get(id)!
      expect(info.status).toBe('idle')
      expect(info.runCount).toBe(2)
    })

    it('should store error on error status', () => {
      enableDevTools()
      const id = registerEffect('myEffect')
      const error = new Error('Test error')

      updateEffectInfo(id, 'error', error)

      const info = getDevToolsState().effects.get(id)!
      expect(info.status).toBe('error')
      expect(info.error).toBe(error)
    })
  })

  describe('registerComponent', () => {
    it('should return -1 when devtools are disabled', () => {
      const id = registerComponent('MyComponent', { foo: 'bar' })
      expect(id).toBe(-1)
    })

    it('should register component and return id when enabled', () => {
      enableDevTools()
      const id = registerComponent('MyComponent', { foo: 'bar' })
      expect(id).toBeGreaterThanOrEqual(0)

      const state = getDevToolsState()
      expect(state.components.has(id)).toBe(true)
    })

    it('should store component info correctly', () => {
      enableDevTools()
      const props = { count: 5, name: 'test' }
      const id = registerComponent('Counter', props)

      const info = getDevToolsState().components.get(id)!
      expect(info.name).toBe('Counter')
      expect(info.props).toEqual(props)
      expect(info.signals).toEqual([])
      expect(info.effects).toEqual([])
      expect(info.children).toEqual([])
      expect(info.parent).toBeUndefined()
      expect(info.mountedAt).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('unregisterComponent', () => {
    it('should do nothing when devtools are disabled', () => {
      unregisterComponent(0)
      // No error should be thrown
    })

    it('should remove component from tracked components', () => {
      enableDevTools()
      const id = registerComponent('MyComponent', {})

      expect(getDevToolsState().components.has(id)).toBe(true)
      unregisterComponent(id)
      expect(getDevToolsState().components.has(id)).toBe(false)
    })

    it('should do nothing for non-existent component id', () => {
      enableDevTools()
      unregisterComponent(9999)
      // No error should be thrown
    })
  })

  describe('createNamedSignal', () => {
    it('should create a signal with the given value', () => {
      const sig = createNamedSignal('count', 42, signal)
      expect(sig.value).toBe(42)
    })

    it('should register signal with name when devtools are enabled', () => {
      enableDevTools()
      const sig = createNamedSignal('count', 42, signal)

      const state = getDevToolsState()
      const signals = Array.from(state.signals.values())
      const found = signals.find((s) => s.name === 'count')
      expect(found).toBeDefined()
      expect(found!.value).toBe(42)
    })

    it('should work without devtools enabled', () => {
      const sig = createNamedSignal('count', 10, signal)
      expect(sig.value).toBe(10)
      sig.set(20)
      expect(sig.value).toBe(20)
    })
  })

  describe('window API', () => {
    it('getSignals should return array of signal infos', () => {
      enableDevTools()
      const initialCount = (window as any).__FLEXIUM_DEVTOOLS__.getSignals().length
      const sig1 = signal(1)
      const sig2 = signal(2)

      const signals = (window as any).__FLEXIUM_DEVTOOLS__.getSignals()
      expect(Array.isArray(signals)).toBe(true)
      // Signals are auto-registered when devtools enabled
      expect(signals.length).toBeGreaterThanOrEqual(initialCount + 2)
    })

    it('getEffects should return array of effect infos', () => {
      enableDevTools()
      registerEffect('effect1')
      registerEffect('effect2')

      const effects = (window as any).__FLEXIUM_DEVTOOLS__.getEffects()
      expect(Array.isArray(effects)).toBe(true)
      expect(effects.length).toBe(2)
    })

    it('getComponents should return array of component infos', () => {
      enableDevTools()
      registerComponent('A', {})
      registerComponent('B', {})

      const components = (window as any).__FLEXIUM_DEVTOOLS__.getComponents()
      expect(Array.isArray(components)).toBe(true)
      expect(components.length).toBe(2)
    })

    it('subscribe should allow listening to events and unsubscribe', () => {
      enableDevTools()
      const listener = vi.fn()

      const unsubscribe = (window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)
      // Manually register to trigger event
      registerEffect('testEffect')

      expect(listener).toHaveBeenCalledWith('effect-create', expect.any(Object))

      const callCountBeforeUnsubscribe = listener.mock.calls.length
      unsubscribe()
      // This should not trigger listener since we unsubscribed
      registerEffect('testEffect2')
      // No new calls after unsubscribe
      expect(listener).toHaveBeenCalledTimes(callCountBeforeUnsubscribe)
    })
  })

  describe('event emission', () => {
    it('should emit signal-create event', () => {
      enableDevTools()
      const listener = vi.fn()
      ;(window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)

      const sig = signal(0)
      registerSignal(sig, 'count')

      expect(listener).toHaveBeenCalledWith('signal-create', { id: expect.any(Number), name: 'count' })
    })

    it('should emit signal-update event', () => {
      enableDevTools()
      const listener = vi.fn()
      ;(window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)

      const sig = signal(0)
      const id = registerSignal(sig, 'count')
      updateSignalInfo(id, 5)

      expect(listener).toHaveBeenCalledWith('signal-update', { id, value: 5 })
    })

    it('should emit effect-create event', () => {
      enableDevTools()
      const listener = vi.fn()
      ;(window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)

      registerEffect('myEffect')

      expect(listener).toHaveBeenCalledWith('effect-create', { id: expect.any(Number), name: 'myEffect' })
    })

    it('should emit effect-run event', () => {
      enableDevTools()
      const listener = vi.fn()
      ;(window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)

      const id = registerEffect('myEffect')
      updateEffectInfo(id, 'running')

      expect(listener).toHaveBeenCalledWith('effect-run', { id, status: 'running', error: undefined })
    })

    it('should emit component-mount event', () => {
      enableDevTools()
      const listener = vi.fn()
      ;(window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)

      registerComponent('MyComponent', {})

      expect(listener).toHaveBeenCalledWith('component-mount', { id: expect.any(Number), name: 'MyComponent' })
    })

    it('should emit component-unmount event', () => {
      enableDevTools()
      const listener = vi.fn()
      ;(window as any).__FLEXIUM_DEVTOOLS__.subscribe(listener)

      const id = registerComponent('MyComponent', {})
      unregisterComponent(id)

      expect(listener).toHaveBeenCalledWith('component-unmount', { id, name: 'MyComponent' })
    })
  })
})
