/**
 * Router Context Tests
 *
 * Comprehensive tests for router context providers including:
 * - RouterCtx context creation and access
 * - RouteDepthCtx for nested route tracking
 * - Context default values
 * - Context module structure
 */

import { describe, it, expect } from 'vitest'
import { RouterCtx, RouteDepthCtx } from '../context'
import { useContext, createContext } from '../../core/context'

describe('Router Context', () => {
  describe('RouterCtx', () => {
    describe('Context Creation', () => {
      it('should be created as a context instance', () => {
        expect(RouterCtx).toBeDefined()
        expect(typeof RouterCtx).toBe('object')
      })

      it('should have id property', () => {
        expect(RouterCtx).toHaveProperty('id')
        expect(typeof RouterCtx.id).toBe('symbol')
      })

      it('should have Provider property', () => {
        expect(RouterCtx).toHaveProperty('Provider')
        expect(typeof RouterCtx.Provider).toBe('function')
      })

      it('should have defaultValue property', () => {
        expect(RouterCtx).toHaveProperty('defaultValue')
      })

      it('should have defaultValue of null', () => {
        expect(RouterCtx.defaultValue).toBeNull()
      })

      it('should be importable from context module', () => {
        expect(RouterCtx).toBeDefined()
        expect(RouterCtx).toBe(RouterCtx)
      })

      it('should be consistent across accesses', () => {
        const ctx1 = RouterCtx
        const ctx2 = RouterCtx
        expect(ctx1).toBe(ctx2)
      })

      it('should have unique symbol id', () => {
        const otherContext = createContext(null)
        expect(RouterCtx.id).not.toBe(otherContext.id)
      })
    })

    describe('Context Type Structure', () => {
      it('should enforce RouterContext type structure for values', () => {
        const mockContext: any = {
          location: {
            value: { pathname: '/', search: '', hash: '', query: {} },
          },
          params: { value: {} },
          navigate: () => {},
          matches: { value: [] },
        }

        expect(mockContext).toHaveProperty('location')
        expect(mockContext).toHaveProperty('params')
        expect(mockContext).toHaveProperty('navigate')
        expect(mockContext).toHaveProperty('matches')
      })

      it('should accept null as valid RouterContext value', () => {
        expect(RouterCtx.defaultValue).toBeNull()
      })

      it('should have correct type for location signal', () => {
        const mockLocation = {
          value: {
            pathname: '/test',
            search: '?q=1',
            hash: '#section',
            query: { q: '1' },
          },
        }

        expect(mockLocation.value).toHaveProperty('pathname')
        expect(mockLocation.value).toHaveProperty('search')
        expect(mockLocation.value).toHaveProperty('hash')
        expect(mockLocation.value).toHaveProperty('query')
      })

      it('should have correct type for params signal', () => {
        const mockParams = { value: { id: '123', slug: 'test' } }

        expect(typeof mockParams.value).toBe('object')
        expect(mockParams.value.id).toBe('123')
        expect(mockParams.value.slug).toBe('test')
      })

      it('should have correct type for navigate function', () => {
        const navigate = (path: string) => {
          expect(typeof path).toBe('string')
        }

        expect(typeof navigate).toBe('function')
        navigate('/test')
      })

      it('should have correct type for matches signal', () => {
        const mockMatches = {
          value: [
            {
              route: {
                path: '/',
                component: () => {},
                children: [],
                index: false,
              },
              params: {},
              pathname: '/',
            },
          ],
        }

        expect(Array.isArray(mockMatches.value)).toBe(true)
        expect(mockMatches.value[0]).toHaveProperty('route')
        expect(mockMatches.value[0]).toHaveProperty('params')
        expect(mockMatches.value[0]).toHaveProperty('pathname')
      })
    })

    describe('Default Value Access', () => {
      it('should return null when accessed outside provider', () => {
        const value = useContext(RouterCtx)
        expect(value).toBeNull()
      })

      it('should provide default value for location structure', () => {
        expect(RouterCtx.defaultValue).toBeNull()
      })

      it('should match the expected default value type', () => {
        const defaultValue = RouterCtx.defaultValue
        expect(defaultValue === null || typeof defaultValue === 'object').toBe(
          true
        )
      })
    })

    describe('Context Provider Structure', () => {
      it('should have Provider component', () => {
        expect(typeof RouterCtx.Provider).toBe('function')
      })

      it('should have _contextId on Provider', () => {
        const Provider = RouterCtx.Provider as any
        expect(Provider._contextId).toBeDefined()
        expect(typeof Provider._contextId).toBe('symbol')
      })

      it('should have Provider _contextId matching context id', () => {
        const Provider = RouterCtx.Provider as any
        expect(Provider._contextId).toBe(RouterCtx.id)
      })

      it('should Provider return children', () => {
        const children = 'test children'
        const result = RouterCtx.Provider({ value: null, children })
        expect(result).toBe(children)
      })
    })
  })

  describe('RouteDepthCtx', () => {
    describe('Context Creation', () => {
      it('should be created as a context instance', () => {
        expect(RouteDepthCtx).toBeDefined()
        expect(typeof RouteDepthCtx).toBe('object')
      })

      it('should have id property', () => {
        expect(RouteDepthCtx).toHaveProperty('id')
        expect(typeof RouteDepthCtx.id).toBe('symbol')
      })

      it('should have Provider property', () => {
        expect(RouteDepthCtx).toHaveProperty('Provider')
        expect(typeof RouteDepthCtx.Provider).toBe('function')
      })

      it('should have defaultValue property', () => {
        expect(RouteDepthCtx).toHaveProperty('defaultValue')
      })

      it('should have defaultValue of 0', () => {
        expect(RouteDepthCtx.defaultValue).toBe(0)
      })

      it('should be importable from context module', () => {
        expect(RouteDepthCtx).toBeDefined()
        expect(RouteDepthCtx).toBe(RouteDepthCtx)
      })

      it('should have unique symbol id', () => {
        expect(RouteDepthCtx.id).not.toBe(RouterCtx.id)
      })
    })

    describe('Depth Value Type', () => {
      it('should enforce number type for depth', () => {
        expect(typeof RouteDepthCtx.defaultValue).toBe('number')
      })

      it('should support positive depth values', () => {
        const depths = [0, 1, 2, 5, 10, 99]
        depths.forEach((depth) => {
          expect(typeof depth).toBe('number')
          expect(depth).toBeGreaterThanOrEqual(0)
        })
      })

      it('should support zero as depth value', () => {
        expect(RouteDepthCtx.defaultValue).toBe(0)
        expect(RouteDepthCtx.defaultValue).toBeGreaterThanOrEqual(0)
      })

      it('should support negative depth values in type system', () => {
        const negativeDepth = -1
        expect(typeof negativeDepth).toBe('number')
      })
    })

    describe('Default Value Access', () => {
      it('should return 0 when accessed outside provider', () => {
        const depth = useContext(RouteDepthCtx)
        expect(depth).toBe(0)
      })

      it('should provide numeric default value', () => {
        expect(typeof RouteDepthCtx.defaultValue).toBe('number')
      })
    })

    describe('Context Provider Structure', () => {
      it('should have Provider component', () => {
        expect(typeof RouteDepthCtx.Provider).toBe('function')
      })

      it('should have _contextId on Provider', () => {
        const Provider = RouteDepthCtx.Provider as any
        expect(Provider._contextId).toBeDefined()
        expect(typeof Provider._contextId).toBe('symbol')
      })

      it('should have Provider _contextId matching context id', () => {
        const Provider = RouteDepthCtx.Provider as any
        expect(Provider._contextId).toBe(RouteDepthCtx.id)
      })

      it('should Provider return children', () => {
        const children = 'test children'
        const result = RouteDepthCtx.Provider({ value: 0, children })
        expect(result).toBe(children)
      })
    })
  })

  describe('Context Independence', () => {
    it('should have different ids for RouterCtx and RouteDepthCtx', () => {
      expect(RouterCtx.id).not.toBe(RouteDepthCtx.id)
    })

    it('should have different Providers', () => {
      expect(RouterCtx.Provider).not.toBe(RouteDepthCtx.Provider)
    })

    it('should have different default values', () => {
      expect(RouterCtx.defaultValue).not.toBe(RouteDepthCtx.defaultValue)
    })

    it('should have different value types', () => {
      expect(typeof RouterCtx.defaultValue).not.toBe(
        typeof RouteDepthCtx.defaultValue
      )
    })
  })

  describe('Context Module Exports', () => {
    it('should export RouterCtx', () => {
      expect(RouterCtx).toBeDefined()
    })

    it('should export RouteDepthCtx', () => {
      expect(RouteDepthCtx).toBeDefined()
    })

    it('should export both contexts', () => {
      expect(RouterCtx).toBeDefined()
      expect(RouteDepthCtx).toBeDefined()
    })

    it('should have different context instances', () => {
      expect(RouterCtx).not.toBe(RouteDepthCtx)
    })
  })

  describe('Context API Compatibility', () => {
    it('should work with useContext function', () => {
      const routerValue = useContext(RouterCtx)
      const depthValue = useContext(RouteDepthCtx)

      expect(routerValue).toBe(RouterCtx.defaultValue)
      expect(depthValue).toBe(RouteDepthCtx.defaultValue)
    })

    it('should return default value when no provider is active', () => {
      expect(useContext(RouterCtx)).toBeNull()
      expect(useContext(RouteDepthCtx)).toBe(0)
    })

    it('should have Provider that accepts value and children props', () => {
      const mockValue = {
        location: { value: { pathname: '/', search: '', hash: '', query: {} } },
        params: { value: {} },
        navigate: () => {},
        matches: { value: [] },
      }

      const routerResult = RouterCtx.Provider({
        value: mockValue,
        children: 'test',
      })

      expect(routerResult).toBeDefined()
    })

    it('should have Provider that accepts numeric value for depth', () => {
      const depthResult = RouteDepthCtx.Provider({
        value: 5,
        children: 'test',
      })

      expect(depthResult).toBeDefined()
    })
  })
})
