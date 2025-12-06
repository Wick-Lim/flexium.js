import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  emit,
  subscribe,
  once,
  unsubscribeAll,
  sendTo,
  request,
  respond,
  getMessageHistory,
  clearMessageHistory,
  createChannel,
  createEventBus,
  configureEventBus,
  setEventSource,
} from '../event-bus'

describe('Event Bus', () => {
  beforeEach(() => {
    unsubscribeAll()
    clearMessageHistory()
    configureEventBus({ appName: 'test-app', debug: false })
  })

  describe('emit and subscribe', () => {
    it('should emit events to subscribers', () => {
      const callback = vi.fn()
      subscribe('test-event', callback)

      emit('test-event', { data: 'hello' })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test-event',
          payload: { data: 'hello' },
        })
      )
    })

    it('should support multiple subscribers', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      subscribe('multi-event', callback1)
      subscribe('multi-event', callback2)

      emit('multi-event', 'test')

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })

    it('should return unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = subscribe('unsub-event', callback)

      emit('unsub-event', 'first')
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()

      emit('unsub-event', 'second')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should support regex patterns', () => {
      const callback = vi.fn()
      subscribe(/user:.*/, callback)

      emit('user:login', { userId: '123' })
      emit('user:logout', {})
      emit('order:create', {})

      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should include source in message', () => {
      const callback = vi.fn()
      setEventSource('source-app')
      subscribe('source-test', callback)

      emit('source-test', 'data')

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'source-app',
        })
      )
    })
  })

  describe('once', () => {
    it('should only receive one message', () => {
      const callback = vi.fn()
      once('once-event', callback)

      emit('once-event', 'first')
      emit('once-event', 'second')

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendTo', () => {
    it('should set target in message', () => {
      const callback = vi.fn()
      subscribe('targeted-event', callback)

      sendTo('target-app', 'targeted-event', { data: 'test' })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'target-app',
        })
      )
    })
  })

  describe('request/respond', () => {
    it('should support request/response pattern', async () => {
      respond('get-user', async (payload: { id: string }) => {
        return { name: 'John', id: payload.id }
      })

      const result = await request<{ id: string }, { name: string; id: string }>(
        'get-user',
        { id: '123' }
      )

      expect(result).toEqual({ name: 'John', id: '123' })
    })

    it('should timeout if no response', async () => {
      await expect(
        request('no-responder', {}, 100)
      ).rejects.toThrow('timed out')
    })
  })

  describe('message history', () => {
    it('should track message history', () => {
      emit('history-1', 'data1')
      emit('history-2', 'data2')

      const history = getMessageHistory()

      expect(history).toHaveLength(2)
      expect(history[0].type).toBe('history-1')
      expect(history[1].type).toBe('history-2')
    })

    it('should clear message history', () => {
      emit('clear-test', 'data')
      expect(getMessageHistory()).toHaveLength(1)

      clearMessageHistory()
      expect(getMessageHistory()).toHaveLength(0)
    })
  })

  describe('createChannel', () => {
    it('should create a typed channel', () => {
      type Events = {
        login: { userId: string }
        logout: {}
      }

      const channel = createChannel<Events>('auth')
      const callback = vi.fn()

      channel.subscribe('login', callback)
      channel.emit('login', { userId: '123' })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth:login',
          payload: { userId: '123' },
        })
      )
    })
  })

  describe('createEventBus', () => {
    it('should create an isolated event bus', () => {
      const bus = createEventBus()
      const globalCallback = vi.fn()
      const localCallback = vi.fn()

      subscribe('isolated-event', globalCallback)
      bus.subscribe('isolated-event', localCallback)

      bus.emit('isolated-event', 'local')
      emit('isolated-event', 'global')

      expect(localCallback).toHaveBeenCalledTimes(1)
      expect(globalCallback).toHaveBeenCalledTimes(1)

      // Check they received different messages
      expect(localCallback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: 'local' })
      )
      expect(globalCallback).toHaveBeenCalledWith(
        expect.objectContaining({ payload: 'global' })
      )
    })
  })

  describe('subscription options', () => {
    it('should filter by source', () => {
      const callback = vi.fn()
      setEventSource('app-a')
      subscribe('source-filter', callback, { fromSource: 'app-a' })

      emit('source-filter', 'from-a')

      setEventSource('app-b')
      emit('source-filter', 'from-b')

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should limit max messages', () => {
      const callback = vi.fn()
      subscribe('max-messages', callback, { maxMessages: 2 })

      emit('max-messages', 'first')
      emit('max-messages', 'second')
      emit('max-messages', 'third')

      expect(callback).toHaveBeenCalledTimes(2)
    })
  })
})
