import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  sharedState,
  watchSharedState,
  getSharedState,
  setSharedState,
  deleteSharedState,
  getSharedStateKeys,
  getSharedStateInfo,
  clearAllSharedStates,
  createStateStore,
  createStateSnapshot,
  restoreStateSnapshot,
  configureStateBridge,
} from '../state-bridge'

describe('State Bridge', () => {
  beforeEach(() => {
    clearAllSharedStates()
    configureStateBridge({ appName: 'test-app', debug: false })
  })

  describe('sharedState', () => {
    it('should create a shared state with initial value', () => {
      const [getValue, setValue] = sharedState('counter', 0)

      expect(getValue()).toBe(0)

      setValue(5)
      expect(getValue()).toBe(5)
    })

    it('should share state between multiple accessors', () => {
      const [getValue1, setValue1] = sharedState('shared', 'initial')
      const [getValue2, setValue2] = sharedState('shared')

      expect(getValue1()).toBe('initial')
      expect(getValue2()).toBe('initial')

      setValue1('updated')
      expect(getValue1()).toBe('updated')
      expect(getValue2()).toBe('updated')
    })

    it('should support functional updates', () => {
      const [getValue, setValue] = sharedState('func-update', 10)

      setValue((prev) => prev + 5)
      expect(getValue()).toBe(15)

      setValue((prev) => prev * 2)
      expect(getValue()).toBe(30)
    })

    it('should validate state updates', () => {
      const [getValue, setValue] = sharedState('validated', 0, {
        validate: (value) => typeof value === 'number' && value >= 0,
      })

      setValue(10)
      expect(getValue()).toBe(10)

      // Invalid update should be rejected
      setValue(-5)
      expect(getValue()).toBe(10) // Still 10
    })
  })

  describe('getSharedState', () => {
    it('should get existing state', () => {
      sharedState('existing', { name: 'test' })

      const value = getSharedState('existing')
      expect(value).toEqual({ name: 'test' })
    })

    it('should return undefined for non-existent state', () => {
      const value = getSharedState('non-existent')
      expect(value).toBeUndefined()
    })
  })

  describe('setSharedState', () => {
    it('should set existing state', () => {
      sharedState('settable', 'initial')

      const result = setSharedState('settable', 'updated')
      expect(result).toBe(true)
      expect(getSharedState('settable')).toBe('updated')
    })

    it('should return false for non-existent state', () => {
      const result = setSharedState('non-existent', 'value')
      expect(result).toBe(false)
    })
  })

  describe('watchSharedState', () => {
    it('should watch for state changes', () => {
      const callback = vi.fn()
      const [, setValue] = sharedState('watched', 0)

      watchSharedState('watched', callback)

      setValue(1)
      setValue(2)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('deleteSharedState', () => {
    it('should delete existing state', () => {
      sharedState('deletable', 'value')
      expect(getSharedStateKeys()).toContain('deletable')

      const result = deleteSharedState('deletable')
      expect(result).toBe(true)
      expect(getSharedStateKeys()).not.toContain('deletable')
    })

    it('should return false for non-existent state', () => {
      const result = deleteSharedState('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('getSharedStateKeys', () => {
    it('should return all state keys', () => {
      sharedState('key1', 'value1')
      sharedState('key2', 'value2')
      sharedState('key3', 'value3')

      const keys = getSharedStateKeys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })
  })

  describe('getSharedStateInfo', () => {
    it('should return state metadata', () => {
      configureStateBridge({ appName: 'app-a' })
      sharedState('info-test', 'value')

      const info = getSharedStateInfo('info-test')
      expect(info).toBeDefined()
      expect(info?.exists).toBe(true)
      expect(info?.subscribers).toContain('app-a')
      expect(info?.version).toBe(0)
    })

    it('should return null for non-existent state', () => {
      const info = getSharedStateInfo('non-existent')
      expect(info).toBeNull()
    })
  })

  describe('createStateStore', () => {
    it('should create a namespaced store', () => {
      const store = createStateStore('user', {
        name: 'John',
        age: 30,
        active: true,
      })

      expect(store.get('name')).toBe('John')
      expect(store.get('age')).toBe(30)
      expect(store.get('active')).toBe(true)
    })

    it('should set individual values', () => {
      const store = createStateStore('settings', {
        theme: 'light',
        language: 'en',
      })

      store.set('theme', 'dark')
      expect(store.get('theme')).toBe('dark')
    })

    it('should get all values', () => {
      const store = createStateStore('config', {
        a: 1,
        b: 2,
      })

      const all = store.getAll()
      expect(all).toEqual({ a: 1, b: 2 })
    })

    it('should set all values', () => {
      const store = createStateStore('batch', {
        x: 0,
        y: 0,
      })

      store.setAll({ x: 10, y: 20 })
      expect(store.getAll()).toEqual({ x: 10, y: 20 })
    })

    it('should reset to initial values', () => {
      const store = createStateStore('resettable', {
        count: 0,
      })

      store.set('count', 100)
      expect(store.get('count')).toBe(100)

      store.reset()
      expect(store.get('count')).toBe(0)
    })
  })

  describe('state snapshots', () => {
    it('should create a snapshot of all states', () => {
      sharedState('snap1', 'value1')
      sharedState('snap2', 'value2')

      const snapshot = createStateSnapshot()

      expect(snapshot).toEqual({
        snap1: 'value1',
        snap2: 'value2',
      })
    })

    it('should restore states from snapshot', () => {
      sharedState('restore1', 'initial1')
      sharedState('restore2', 'initial2')

      const snapshot = {
        restore1: 'restored1',
        restore2: 'restored2',
      }

      restoreStateSnapshot(snapshot)

      expect(getSharedState('restore1')).toBe('restored1')
      expect(getSharedState('restore2')).toBe('restored2')
    })
  })

  describe('clearAllSharedStates', () => {
    it('should clear all states', () => {
      sharedState('clear1', 'value')
      sharedState('clear2', 'value')

      clearAllSharedStates()

      expect(getSharedStateKeys()).toHaveLength(0)
    })
  })
})
