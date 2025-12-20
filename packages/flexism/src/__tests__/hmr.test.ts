import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HMRManager, getHMRClientScript, injectHMRScript } from '../dev/hmr'

describe('HMR Module', () => {
  describe('HMRManager', () => {
    let hmr: HMRManager

    beforeEach(() => {
      hmr = new HMRManager({
        srcDir: '/test/src',
        outDir: '/test/.output',
      })
    })

    afterEach(() => {
      hmr.stop()
    })

    describe('Client Management', () => {
      it('should add and remove clients', () => {
        const send = vi.fn()
        const close = vi.fn()

        const id = hmr.addClient(send, close)

        expect(id).toBeDefined()
        expect(hmr.clientCount).toBe(1)

        hmr.removeClient(id)
        expect(hmr.clientCount).toBe(0)
      })

      it('should send connected message on add', () => {
        const send = vi.fn()
        const close = vi.fn()

        hmr.addClient(send, close)

        expect(send).toHaveBeenCalled()
        const message = send.mock.calls[0][0]
        expect(message).toContain('connected')
      })

      it('should generate unique client IDs', () => {
        const id1 = hmr.addClient(vi.fn(), vi.fn())
        const id2 = hmr.addClient(vi.fn(), vi.fn())

        expect(id1).not.toBe(id2)
      })
    })

    describe('Broadcasting', () => {
      it('should broadcast to all clients', () => {
        const send1 = vi.fn()
        const send2 = vi.fn()

        hmr.addClient(send1, vi.fn())
        hmr.addClient(send2, vi.fn())

        // Clear the connected messages
        send1.mockClear()
        send2.mockClear()

        hmr.broadcast({
          type: 'full-reload',
          file: 'test.ts',
          timestamp: Date.now(),
        })

        expect(send1).toHaveBeenCalledTimes(1)
        expect(send2).toHaveBeenCalledTimes(1)
      })

      it('should send error to all clients', () => {
        const send = vi.fn()
        hmr.addClient(send, vi.fn())

        hmr.sendError('Build failed')

        const lastCall = send.mock.calls[send.mock.calls.length - 1][0]
        expect(lastCall).toContain('error')
        expect(lastCall).toContain('Build failed')
      })

      it('should send keep-alive to all clients', () => {
        const send = vi.fn()
        hmr.addClient(send, vi.fn())

        hmr.keepAlive()

        expect(send).toHaveBeenLastCalledWith(': keepalive\n\n')
      })

      it('should remove failed clients on broadcast', () => {
        let callCount = 0
        const failingSend = vi.fn().mockImplementation(() => {
          callCount++
          // First call is connected message - allow it
          // Subsequent calls should throw
          if (callCount > 1) {
            throw new Error('Connection closed')
          }
        })

        hmr.addClient(failingSend, vi.fn())
        expect(hmr.clientCount).toBe(1)

        hmr.broadcast({
          type: 'full-reload',
          file: 'test.ts',
          timestamp: Date.now(),
        })

        expect(hmr.clientCount).toBe(0)
      })
    })

    describe('Event Listeners', () => {
      it('should register and trigger event listeners', () => {
        const listener = vi.fn()
        hmr.on('update', listener)

        // Simulate an update event (internal)
        ;(hmr as any).emit('update', { type: 'full-reload', file: 'test.ts' })

        expect(listener).toHaveBeenCalledWith({ type: 'full-reload', file: 'test.ts' })
      })

      it('should remove event listeners', () => {
        const listener = vi.fn()
        hmr.on('update', listener)
        hmr.off('update', listener)

        ;(hmr as any).emit('update', { type: 'full-reload', file: 'test.ts' })

        expect(listener).not.toHaveBeenCalled()
      })
    })

    describe('Dependency Graph', () => {
      it('should accept dependency graph', () => {
        const graph = {
          dependencies: new Map(),
          dependents: new Map(),
        }

        // Should not throw
        hmr.setDependencyGraph(graph)
      })
    })
  })

  describe('getHMRClientScript', () => {
    it('should return JavaScript code', () => {
      const script = getHMRClientScript()

      expect(typeof script).toBe('string')
      expect(script).toContain('EventSource')
      expect(script).toContain('__hmr')
    })

    it('should use custom endpoint', () => {
      const script = getHMRClientScript({ endpoint: '/custom-hmr' })

      expect(script).toContain('/custom-hmr')
    })

    it('should include CSS update handler', () => {
      const script = getHMRClientScript()

      expect(script).toContain('updateCSS')
      expect(script).toContain('css-update')
    })

    it('should include error overlay', () => {
      const script = getHMRClientScript()

      expect(script).toContain('showError')
      expect(script).toContain('flexism-error-overlay')
    })

    it('should include reconnection logic', () => {
      const script = getHMRClientScript()

      expect(script).toContain('reconnect')
      expect(script).toContain('scheduleReconnect')
    })
  })

  describe('injectHMRScript', () => {
    it('should inject script before </body>', () => {
      const html = '<html><head></head><body><div>Content</div></body></html>'
      const result = injectHMRScript(html)

      expect(result).toContain('<script>')
      expect(result).toContain('</script></body>')
      expect(result.indexOf('<script>')).toBeLessThan(result.indexOf('</body>'))
    })

    it('should append script if no </body>', () => {
      const html = '<div>Partial HTML</div>'
      const result = injectHMRScript(html)

      expect(result).toContain('<script>')
      expect(result.endsWith('</script>')).toBe(true)
    })

    it('should use custom endpoint', () => {
      const html = '<html><body></body></html>'
      const result = injectHMRScript(html, { endpoint: '/my-hmr' })

      expect(result).toContain('/my-hmr')
    })
  })
})
