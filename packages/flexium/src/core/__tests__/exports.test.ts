/**
 * Export Tests
 *
 * Tests to ensure exports align with Flexium philosophy
 */

import { describe, it, expect } from 'vitest'

describe('Core Exports', () => {
  it('should export state and effect from flexium/core', async () => {
    const core = await import('../../core')
    
    expect(core.state).toBeDefined()
    expect(core.effect).toBeDefined()
    expect(typeof core.state).toBe('function')
    expect(typeof core.effect).toBe('function')
  })

  it('should NOT export deprecated APIs from flexium/core', async () => {
    const core = await import('../../core')
    
    // These should NOT be exported from core
    expect(core.onMount).toBeUndefined()
    expect(core.onCleanup).toBeUndefined()
    expect(core.createContext).toBeUndefined()
    expect(core.context).toBeUndefined()
    expect(core.sync).toBeUndefined()
    expect(core.root).toBeUndefined()
    expect(core.untrack).toBeUndefined()
  })

  it('should export advanced APIs from flexium/advanced', async () => {
    const advanced = await import('../../advanced')
    
    expect(advanced.signal).toBeDefined()
    expect(advanced.computed).toBeDefined()
    expect(advanced.sync).toBeDefined()
    expect(advanced.root).toBeDefined()
    expect(advanced.untrack).toBeDefined()
    
    expect(typeof advanced.signal).toBe('function')
    expect(typeof advanced.computed).toBe('function')
    expect(typeof advanced.sync).toBe('function')
    expect(typeof advanced.root).toBe('function')
    expect(typeof advanced.untrack).toBe('function')
  })

  it('should NOT export deprecated APIs from flexium/advanced', async () => {
    const advanced = await import('../../advanced')
    
    // These should NOT be exported from advanced
    expect(advanced.onMount).toBeUndefined()
    expect(advanced.onCleanup).toBeUndefined()
    expect(advanced.createContext).toBeUndefined()
    expect(advanced.context).toBeUndefined()
  })
})

describe('Effect replaces onMount/onCleanup', () => {
  it('should handle mount lifecycle with effect()', async () => {
    const { effect } = await import('../../core')
    
    let mounted = false
    let cleanupCalled = false
    
    const dispose = effect(() => {
      mounted = true
      return () => {
        cleanupCalled = true
      }
    })
    
    expect(mounted).toBe(true)
    expect(cleanupCalled).toBe(false)
    
    dispose()
    expect(cleanupCalled).toBe(true)
  })

  it('should handle cleanup on unmount with effect()', async () => {
    const { effect } = await import('../../core')
    
    const cleanupCalls: string[] = []
    
    const dispose1 = effect(() => {
      cleanupCalls.push('setup1')
      return () => cleanupCalls.push('cleanup1')
    })
    
    const dispose2 = effect(() => {
      cleanupCalls.push('setup2')
      return () => cleanupCalls.push('cleanup2')
    })
    
    expect(cleanupCalls).toEqual(['setup1', 'setup2'])
    
    dispose1()
    expect(cleanupCalls).toEqual(['setup1', 'setup2', 'cleanup1'])
    
    dispose2()
    expect(cleanupCalls).toEqual(['setup1', 'setup2', 'cleanup1', 'cleanup2'])
  })

  it('should handle reactive effects with cleanup', async () => {
    const { state, effect } = await import('../../core')
    const { sync } = await import('../../advanced')
    
    const [count, setCount] = state(0)
    const cleanupCalls: number[] = []
    
    const dispose = effect(() => {
      const current = count()
      cleanupCalls.push(current)
      
      return () => {
        cleanupCalls.push(-current) // Negative indicates cleanup
      }
    })
    
    expect(cleanupCalls).toEqual([0])
    
    setCount(1)
    sync() // Ensure effect runs
    expect(cleanupCalls).toEqual([0, -0, 1]) // Cleanup old, setup new
    
    setCount(2)
    sync() // Ensure effect runs
    expect(cleanupCalls).toEqual([0, -0, 1, -1, 2])
    
    dispose()
    expect(cleanupCalls).toEqual([0, -0, 1, -1, 2, -2])
  })
})

describe('State with key replaces Context API', () => {
  it('should share state globally using key', async () => {
    const { state } = await import('../../core')
    
    // Set state in one "component"
    const [theme1, setTheme1] = state<'light' | 'dark'>('light', { key: 'app:theme' })
    
    // Access same state in another "component"
    const [theme2, setTheme2] = state<'light' | 'dark'>('light', { key: 'app:theme' })
    
    expect(theme1()).toBe('light')
    expect(theme2()).toBe('light')
    
    // Update from first component
    setTheme1('dark')
    
    // Both should see the update
    expect(theme1()).toBe('dark')
    expect(theme2()).toBe('dark')
    
    // Update from second component
    setTheme2('light')
    
    // Both should see the update
    expect(theme1()).toBe('light')
    expect(theme2()).toBe('light')
  })

  it('should support multiple global states with different keys', async () => {
    const { state } = await import('../../core')
    
    const [theme, setTheme] = state('light', { key: 'app:theme' })
    const [lang, setLang] = state('en', { key: 'app:language' })
    const [user, setUser] = state<{ name: string } | null>(null, { key: 'app:user' })
    
    // Access from different "components"
    const [theme2] = state('light', { key: 'app:theme' })
    const [lang2] = state('en', { key: 'app:language' })
    const [user2] = state<{ name: string } | null>(null, { key: 'app:user' })
    
    setTheme('dark')
    setLang('ko')
    setUser({ name: 'Alice' })
    
    expect(theme2()).toBe('dark')
    expect(lang2()).toBe('ko')
    expect(user2()?.name).toBe('Alice')
  })

  it('should isolate states with different keys', async () => {
    const { state } = await import('../../core')
    
    // Create states with different keys - they should be independent
    const [theme1, setTheme1] = state('light', { key: 'test:theme1' })
    const [theme2, setTheme2] = state('dark', { key: 'test:theme2' })
    
    // Initial values should be independent
    expect(theme1()).toBe('light')
    expect(theme2()).toBe('dark')
    
    // Update one - other should remain unchanged
    setTheme1('dark')
    expect(theme1()).toBe('dark')
    expect(theme2()).toBe('dark') // theme2's initial value
    
    // Update other - first should remain unchanged
    setTheme2('light')
    expect(theme1()).toBe('dark') // theme1's updated value
    expect(theme2()).toBe('light')
    
    // Cleanup
    state.delete('test:theme1')
    state.delete('test:theme2')
  })

  it('should support cleanup with state.delete()', async () => {
    const { state } = await import('../../core')
    
    const [temp, setTemp] = state('value', { key: 'temp:data' })
    expect(temp()).toBe('value')
    
    // Cleanup
    state.delete('temp:data')
    
    // New access should get default value
    const [temp2] = state('default', { key: 'temp:data' })
    expect(temp2()).toBe('default')
  })
})

describe('Advanced APIs', () => {
  it('should use sync() from advanced for batched updates', async () => {
    const { state, effect } = await import('../../core')
    const { sync } = await import('../../advanced')
    
    const [a, setA] = state(0)
    const [b, setB] = state(0)
    
    let effectRuns = 0
    const runValues: number[] = []
    
    effect(() => {
      const aVal = a()
      const bVal = b()
      runValues.push(aVal + bVal)
      effectRuns++
    })
    
    expect(effectRuns).toBe(1)
    expect(runValues).toEqual([0]) // Initial: 0 + 0 = 0
    
    // Without sync - may run multiple times (depends on scheduler)
    setA(1)
    setB(2)
    
    // With sync - ensures single update
    const runsBeforeSync = effectRuns
    sync(() => {
      setA(10)
      setB(20)
    })
    
    // Should have at least one more run, but sync ensures batched
    expect(effectRuns).toBeGreaterThan(runsBeforeSync)
    expect(runValues[runValues.length - 1]).toBe(30) // 10 + 20 = 30
  })

  it('should use root() from advanced for isolated scopes', async () => {
    const { effect } = await import('../../core')
    const { root } = await import('../../advanced')
    
    let outerCleanup = false
    let innerCleanup = false
    
    const disposeOuter = effect(() => {
      return () => {
        outerCleanup = true
      }
    })
    
    root((disposeRoot) => {
      const disposeInner = effect(() => {
        return () => {
          innerCleanup = true
        }
      })
      
      disposeInner()
      expect(innerCleanup).toBe(true)
    })
    
    expect(outerCleanup).toBe(false)
    disposeOuter()
    expect(outerCleanup).toBe(true)
  })

  it('should use untrack() from advanced to read without tracking', async () => {
    const { state, effect } = await import('../../core')
    const { untrack } = await import('../../advanced')
    
    const [count, setCount] = state(0)
    
    let effectRuns = 0
    
    effect(() => {
      // Read count without tracking
      untrack(() => {
        count()
      })
      effectRuns++
    })
    
    expect(effectRuns).toBe(1)
    
    // Effect should NOT re-run because count was read in untrack
    setCount(1)
    expect(effectRuns).toBe(1)
  })
})
