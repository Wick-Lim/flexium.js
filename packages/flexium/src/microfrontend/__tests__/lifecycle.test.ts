import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerMicroApp,
  unregisterMicroApp,
  getMicroApp,
  getAllMicroApps,
  mountMicroApp,
  unmountMicroApp,
  loadMicroApp,
  updateMicroApp,
  configureOrchestrator,
  defineMicroApp,
  checkAppActivity,
} from '../lifecycle'

describe('Micro Frontend Lifecycle', () => {
  beforeEach(() => {
    // Clear all registered apps
    const apps = getAllMicroApps()
    for (const [name] of apps) {
      try {
        unregisterMicroApp(name)
      } catch {
        // Ignore cleanup errors
      }
    }
  })

  describe('registerMicroApp', () => {
    it('should register a micro app with lifecycle', () => {
      const lifecycle = defineMicroApp({
        mount: vi.fn(),
        unmount: vi.fn(),
      })

      const app = registerMicroApp({
        name: 'test-app',
        lifecycle,
      })

      expect(app.name).toBe('test-app')
      expect(app.state).toBe('unloaded')
      expect(app.lifecycle).toBe(lifecycle)
    })

    it('should throw error when registering duplicate app', () => {
      registerMicroApp({
        name: 'duplicate-app',
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
        },
      })

      expect(() => {
        registerMicroApp({
          name: 'duplicate-app',
          lifecycle: {
            mount: vi.fn(),
            unmount: vi.fn(),
          },
        })
      }).toThrow('already registered')
    })

    it('should store app in registry', () => {
      registerMicroApp({
        name: 'registry-test',
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
        },
      })

      const app = getMicroApp('registry-test')
      expect(app).toBeDefined()
      expect(app?.name).toBe('registry-test')
    })
  })

  describe('unregisterMicroApp', () => {
    it('should unregister a micro app', async () => {
      registerMicroApp({
        name: 'to-unregister',
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
        },
      })

      expect(getMicroApp('to-unregister')).toBeDefined()

      await unregisterMicroApp('to-unregister')

      expect(getMicroApp('to-unregister')).toBeUndefined()
    })

    it('should throw error when unregistering non-existent app', async () => {
      await expect(unregisterMicroApp('non-existent')).rejects.toThrow(
        'not registered'
      )
    })
  })

  describe('loadMicroApp', () => {
    it('should load app with local lifecycle', async () => {
      const lifecycle = {
        mount: vi.fn(),
        unmount: vi.fn(),
      }

      registerMicroApp({
        name: 'load-test',
        lifecycle,
      })

      const loadedLifecycle = await loadMicroApp('load-test')

      expect(loadedLifecycle).toBe(lifecycle)
      expect(getMicroApp('load-test')?.state).toBe('loaded')
    })

    it('should throw error when loading non-existent app', async () => {
      await expect(loadMicroApp('non-existent')).rejects.toThrow('not registered')
    })
  })

  describe('mountMicroApp', () => {
    it('should mount an app to a container', async () => {
      const container = document.createElement('div')
      container.id = 'test-container'
      document.body.appendChild(container)

      const mountFn = vi.fn()
      const unmountFn = vi.fn()

      registerMicroApp({
        name: 'mount-test',
        container: '#test-container',
        lifecycle: {
          mount: mountFn,
          unmount: unmountFn,
        },
      })

      await mountMicroApp('mount-test')

      expect(mountFn).toHaveBeenCalled()
      expect(getMicroApp('mount-test')?.state).toBe('mounted')

      document.body.removeChild(container)
    })

    it('should call bootstrap before mount if provided', async () => {
      const container = document.createElement('div')
      container.id = 'bootstrap-container'
      document.body.appendChild(container)

      const bootstrapFn = vi.fn()
      const mountFn = vi.fn()

      registerMicroApp({
        name: 'bootstrap-test',
        container: '#bootstrap-container',
        lifecycle: {
          bootstrap: bootstrapFn,
          mount: mountFn,
          unmount: vi.fn(),
        },
      })

      await mountMicroApp('bootstrap-test')

      expect(bootstrapFn).toHaveBeenCalled()
      expect(mountFn).toHaveBeenCalled()

      document.body.removeChild(container)
    })
  })

  describe('unmountMicroApp', () => {
    it('should unmount a mounted app', async () => {
      const container = document.createElement('div')
      container.id = 'unmount-container'
      document.body.appendChild(container)

      const unmountFn = vi.fn()

      registerMicroApp({
        name: 'unmount-test',
        container: '#unmount-container',
        lifecycle: {
          mount: vi.fn(),
          unmount: unmountFn,
        },
      })

      await mountMicroApp('unmount-test')
      await unmountMicroApp('unmount-test')

      expect(unmountFn).toHaveBeenCalled()
      expect(getMicroApp('unmount-test')?.state).toBe('loaded')

      document.body.removeChild(container)
    })
  })

  describe('updateMicroApp', () => {
    it('should call update lifecycle with new props', async () => {
      const container = document.createElement('div')
      container.id = 'update-container'
      document.body.appendChild(container)

      const updateFn = vi.fn()

      registerMicroApp({
        name: 'update-test',
        container: '#update-container',
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
          update: updateFn,
        },
        props: { count: 0 },
      })

      await mountMicroApp('update-test')
      await updateMicroApp('update-test', { count: 1 })

      expect(updateFn).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }))

      document.body.removeChild(container)
    })
  })

  describe('checkAppActivity', () => {
    it('should return true when no activeWhen is specified', () => {
      registerMicroApp({
        name: 'always-active',
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
        },
      })

      expect(checkAppActivity('always-active')).toBe(true)
    })

    it('should check string activeWhen', () => {
      registerMicroApp({
        name: 'path-active',
        activeWhen: '/dashboard',
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
        },
      })

      const mockLocation = { pathname: '/dashboard/users' } as Location
      expect(checkAppActivity('path-active', mockLocation)).toBe(true)

      const otherLocation = { pathname: '/settings' } as Location
      expect(checkAppActivity('path-active', otherLocation)).toBe(false)
    })

    it('should check function activeWhen', () => {
      registerMicroApp({
        name: 'fn-active',
        activeWhen: (location) => location.pathname.includes('admin'),
        lifecycle: {
          mount: vi.fn(),
          unmount: vi.fn(),
        },
      })

      const adminLocation = { pathname: '/admin/dashboard' } as Location
      expect(checkAppActivity('fn-active', adminLocation)).toBe(true)

      const userLocation = { pathname: '/user/profile' } as Location
      expect(checkAppActivity('fn-active', userLocation)).toBe(false)
    })
  })

  describe('configureOrchestrator', () => {
    it('should configure default container', async () => {
      const container = document.createElement('div')
      container.id = 'default-container'
      document.body.appendChild(container)

      configureOrchestrator({
        defaultContainer: '#default-container',
      })

      const mountFn = vi.fn()

      registerMicroApp({
        name: 'default-container-test',
        lifecycle: {
          mount: mountFn,
          unmount: vi.fn(),
        },
      })

      await mountMicroApp('default-container-test')

      expect(mountFn).toHaveBeenCalled()

      document.body.removeChild(container)
    })
  })

  describe('defineMicroApp', () => {
    it('should return the same lifecycle object', () => {
      const lifecycle = {
        mount: vi.fn(),
        unmount: vi.fn(),
        bootstrap: vi.fn(),
        update: vi.fn(),
      }

      const defined = defineMicroApp(lifecycle)

      expect(defined).toBe(lifecycle)
    })
  })
})
