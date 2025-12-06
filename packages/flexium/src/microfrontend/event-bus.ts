/**
 * Cross-App Event Bus
 *
 * Provides pub/sub communication between micro frontend applications
 */

import { signal, batch } from '../core/signal'
import type { BusMessage, BusSubscriber, BusSubscriptionOptions } from './types'

/** Generate unique message ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Subscription entry
 */
interface Subscription {
  id: string
  type: string | RegExp
  subscriber: BusSubscriber
  options: BusSubscriptionOptions
  messageCount: number
}

/** All active subscriptions */
const subscriptions = new Map<string, Subscription>()

/** Subscriptions grouped by type for faster lookup */
const subscriptionsByType = new Map<string, Set<string>>()

/** Message history (for debugging and replay) */
const messageHistory = signal<BusMessage[]>([])

/** Maximum history size */
let maxHistorySize = 100

/** Current app name (set by each micro app) */
let currentAppName: string | null = null

/** Debug mode */
let debugMode = false

/**
 * Configure the event bus
 */
export function configureEventBus(config: {
  appName?: string
  maxHistory?: number
  debug?: boolean
}): void {
  if (config.appName) currentAppName = config.appName
  if (config.maxHistory !== undefined) maxHistorySize = config.maxHistory
  if (config.debug !== undefined) debugMode = config.debug
}

/**
 * Set the current app name (source for emitted events)
 */
export function setEventSource(appName: string): void {
  currentAppName = appName
}

/**
 * Emit an event to all subscribers
 */
export function emit<T = unknown>(
  type: string,
  payload: T,
  target?: string
): BusMessage<T> {
  const message: BusMessage<T> = {
    type,
    payload,
    source: currentAppName ?? undefined,
    target,
    timestamp: Date.now(),
    id: generateId(),
  }

  if (debugMode) {
    console.log(`[EventBus] Emit:`, message)
  }

  // Add to history
  batch(() => {
    const history = [...messageHistory.value, message as BusMessage]
    if (history.length > maxHistorySize) {
      history.shift()
    }
    messageHistory.value = history
  })

  // Notify subscribers
  notifySubscribers(message)

  return message
}

/**
 * Notify all matching subscribers
 */
function notifySubscribers<T>(message: BusMessage<T>): void {
  // Get subscriptions for this type
  const typeSubscriptions = subscriptionsByType.get(message.type)
  const wildcardSubscriptions = subscriptionsByType.get('*')

  const toNotify = new Set<string>()

  if (typeSubscriptions) {
    for (const id of typeSubscriptions) {
      toNotify.add(id)
    }
  }

  if (wildcardSubscriptions) {
    for (const id of wildcardSubscriptions) {
      toNotify.add(id)
    }
  }

  // Also check regex subscriptions
  for (const [id, sub] of subscriptions) {
    if (sub.type instanceof RegExp && sub.type.test(message.type)) {
      toNotify.add(id)
    }
  }

  // Notify each subscriber
  for (const id of toNotify) {
    const sub = subscriptions.get(id)
    if (!sub) continue

    // Check options
    if (sub.options.fromSource && message.source !== sub.options.fromSource) {
      continue
    }

    if (sub.options.onlyTargeted && message.target !== currentAppName) {
      continue
    }

    // Check max messages
    if (
      sub.options.maxMessages !== undefined &&
      sub.messageCount >= sub.options.maxMessages
    ) {
      // Auto-unsubscribe
      unsubscribe(id)
      continue
    }

    try {
      sub.subscriber(message as BusMessage)
      sub.messageCount++
    } catch (error) {
      console.error(`[EventBus] Subscriber error:`, error)
    }
  }
}

/**
 * Subscribe to events
 */
export function subscribe<T = unknown>(
  type: string | RegExp,
  subscriber: BusSubscriber<T>,
  options: BusSubscriptionOptions = {}
): () => void {
  const id = generateId()

  const subscription: Subscription = {
    id,
    type,
    subscriber: subscriber as BusSubscriber,
    options,
    messageCount: 0,
  }

  subscriptions.set(id, subscription)

  // Add to type index for faster lookup
  if (typeof type === 'string') {
    if (!subscriptionsByType.has(type)) {
      subscriptionsByType.set(type, new Set())
    }
    subscriptionsByType.get(type)!.add(id)
  }

  if (debugMode) {
    console.log(`[EventBus] Subscribe:`, { id, type })
  }

  // Return unsubscribe function
  return () => unsubscribe(id)
}

/**
 * Subscribe to an event once
 */
export function once<T = unknown>(
  type: string | RegExp,
  subscriber: BusSubscriber<T>
): () => void {
  return subscribe(type, subscriber, { maxMessages: 1 })
}

/**
 * Unsubscribe by subscription ID
 */
function unsubscribe(id: string): void {
  const sub = subscriptions.get(id)
  if (!sub) return

  subscriptions.delete(id)

  // Remove from type index
  if (typeof sub.type === 'string') {
    subscriptionsByType.get(sub.type)?.delete(id)
  }

  if (debugMode) {
    console.log(`[EventBus] Unsubscribe:`, { id, type: sub.type })
  }
}

/**
 * Unsubscribe all subscriptions for a specific type
 */
export function unsubscribeAll(type?: string): void {
  if (type) {
    const typeIds = subscriptionsByType.get(type)
    if (typeIds) {
      for (const id of typeIds) {
        subscriptions.delete(id)
      }
      subscriptionsByType.delete(type)
    }
  } else {
    subscriptions.clear()
    subscriptionsByType.clear()
  }
}

/**
 * Send a message directly to a specific app
 */
export function sendTo<T = unknown>(
  targetApp: string,
  type: string,
  payload: T
): BusMessage<T> {
  return emit(type, payload, targetApp)
}

/**
 * Request/Response pattern
 */
export async function request<T = unknown, R = unknown>(
  type: string,
  payload: T,
  timeout = 5000
): Promise<R> {
  return new Promise((resolve, reject) => {
    const requestId = generateId()
    const responseType = `${type}:response:${requestId}`

    const timeoutId = setTimeout(() => {
      unsubscribeResponse()
      reject(new Error(`Request "${type}" timed out after ${timeout}ms`))
    }, timeout)

    const unsubscribeResponse = subscribe<R>(responseType, (message) => {
      clearTimeout(timeoutId)
      unsubscribeResponse()
      resolve(message.payload)
    })

    emit(type, { ...payload as object, _requestId: requestId })
  })
}

/**
 * Respond to a request
 */
export function respond<T = unknown, R = unknown>(
  type: string,
  handler: (payload: T) => R | Promise<R>
): () => void {
  return subscribe<T & { _requestId?: string }>(type, async (message) => {
    const requestId = message.payload._requestId
    if (!requestId) return

    try {
      const result = await handler(message.payload)
      emit(`${type}:response:${requestId}`, result)
    } catch (error) {
      emit(`${type}:response:${requestId}`, {
        _error: error instanceof Error ? error.message : String(error),
      })
    }
  })
}

/**
 * Get message history
 */
export function getMessageHistory(): BusMessage[] {
  return messageHistory.value
}

/**
 * Get reactive message history signal
 */
export function getMessageHistorySignal(): typeof messageHistory {
  return messageHistory
}

/**
 * Clear message history
 */
export function clearMessageHistory(): void {
  messageHistory.value = []
}

/**
 * Replay messages from history
 */
export function replayMessages(
  filter?: (message: BusMessage) => boolean
): void {
  const messages = filter
    ? messageHistory.value.filter(filter)
    : messageHistory.value

  for (const message of messages) {
    notifySubscribers(message)
  }
}

/**
 * Create a typed channel for type-safe event communication
 */
export function createChannel<Events extends Record<string, unknown>>(
  prefix: string = ''
): {
  emit: <K extends keyof Events>(type: K, payload: Events[K]) => BusMessage<Events[K]>
  subscribe: <K extends keyof Events>(
    type: K,
    subscriber: BusSubscriber<Events[K]>
  ) => () => void
  once: <K extends keyof Events>(
    type: K,
    subscriber: BusSubscriber<Events[K]>
  ) => () => void
} {
  const prefixedType = (type: string) => (prefix ? `${prefix}:${type}` : type)

  return {
    emit: <K extends keyof Events>(type: K, payload: Events[K]) =>
      emit(prefixedType(type as string), payload),

    subscribe: <K extends keyof Events>(
      type: K,
      subscriber: BusSubscriber<Events[K]>
    ) => subscribe(prefixedType(type as string), subscriber),

    once: <K extends keyof Events>(
      type: K,
      subscriber: BusSubscriber<Events[K]>
    ) => once(prefixedType(type as string), subscriber),
  }
}

/**
 * Create an event bus instance (isolated from global bus)
 */
export function createEventBus(): {
  emit: typeof emit
  subscribe: typeof subscribe
  once: typeof once
  sendTo: typeof sendTo
  request: typeof request
  respond: typeof respond
  unsubscribeAll: typeof unsubscribeAll
  getMessageHistory: typeof getMessageHistory
  clearMessageHistory: typeof clearMessageHistory
  configure: typeof configureEventBus
} {
  const localSubscriptions = new Map<string, Subscription>()
  const localSubscriptionsByType = new Map<string, Set<string>>()
  const localHistory = signal<BusMessage[]>([])
  let localMaxHistorySize = 100
  let localAppName: string | null = null
  let localDebugMode = false

  const localNotifySubscribers = <T>(message: BusMessage<T>): void => {
    const typeSubscriptions = localSubscriptionsByType.get(message.type)
    const wildcardSubscriptions = localSubscriptionsByType.get('*')

    const toNotify = new Set<string>()

    if (typeSubscriptions) {
      for (const id of typeSubscriptions) toNotify.add(id)
    }
    if (wildcardSubscriptions) {
      for (const id of wildcardSubscriptions) toNotify.add(id)
    }

    for (const [id, sub] of localSubscriptions) {
      if (sub.type instanceof RegExp && sub.type.test(message.type)) {
        toNotify.add(id)
      }
    }

    for (const id of toNotify) {
      const sub = localSubscriptions.get(id)
      if (!sub) continue

      if (sub.options.fromSource && message.source !== sub.options.fromSource) continue
      if (sub.options.onlyTargeted && message.target !== localAppName) continue

      if (
        sub.options.maxMessages !== undefined &&
        sub.messageCount >= sub.options.maxMessages
      ) {
        localSubscriptions.delete(id)
        localSubscriptionsByType.get(sub.type as string)?.delete(id)
        continue
      }

      try {
        sub.subscriber(message as BusMessage)
        sub.messageCount++
      } catch (error) {
        console.error(`[EventBus] Subscriber error:`, error)
      }
    }
  }

  const localEmit = <T = unknown>(
    type: string,
    payload: T,
    target?: string
  ): BusMessage<T> => {
    const message: BusMessage<T> = {
      type,
      payload,
      source: localAppName ?? undefined,
      target,
      timestamp: Date.now(),
      id: generateId(),
    }

    if (localDebugMode) {
      console.log(`[EventBus] Emit:`, message)
    }

    batch(() => {
      const history = [...localHistory.value, message as BusMessage]
      if (history.length > localMaxHistorySize) history.shift()
      localHistory.value = history
    })

    localNotifySubscribers(message)
    return message
  }

  const localSubscribe = <T = unknown>(
    type: string | RegExp,
    subscriber: BusSubscriber<T>,
    options: BusSubscriptionOptions = {}
  ): (() => void) => {
    const id = generateId()
    const subscription: Subscription = {
      id,
      type,
      subscriber: subscriber as BusSubscriber,
      options,
      messageCount: 0,
    }

    localSubscriptions.set(id, subscription)

    if (typeof type === 'string') {
      if (!localSubscriptionsByType.has(type)) {
        localSubscriptionsByType.set(type, new Set())
      }
      localSubscriptionsByType.get(type)!.add(id)
    }

    return () => {
      localSubscriptions.delete(id)
      if (typeof type === 'string') {
        localSubscriptionsByType.get(type)?.delete(id)
      }
    }
  }

  const localOnce = <T = unknown>(
    type: string | RegExp,
    subscriber: BusSubscriber<T>
  ): (() => void) => {
    return localSubscribe(type, subscriber, { maxMessages: 1 })
  }

  return {
    emit: localEmit,
    subscribe: localSubscribe,
    once: localOnce,
    sendTo: (target, type, payload) => localEmit(type, payload, target),
    request: async <T, R>(type: string, payload: T, timeout = 5000): Promise<R> => {
      return new Promise((resolve, reject) => {
        const requestId = generateId()
        const responseType = `${type}:response:${requestId}`

        const timeoutId = setTimeout(() => {
          unsubscribeResponse()
          reject(new Error(`Request "${type}" timed out`))
        }, timeout)

        const unsubscribeResponse = localSubscribe<R>(responseType, (message) => {
          clearTimeout(timeoutId)
          unsubscribeResponse()
          resolve(message.payload)
        })

        localEmit(type, { ...payload as object, _requestId: requestId })
      })
    },
    respond: <T, R>(type: string, handler: (payload: T) => R | Promise<R>) => {
      return localSubscribe<T & { _requestId?: string }>(type, async (message) => {
        const requestId = message.payload._requestId
        if (!requestId) return
        try {
          const result = await handler(message.payload)
          localEmit(`${type}:response:${requestId}`, result)
        } catch (error) {
          localEmit(`${type}:response:${requestId}`, {
            _error: error instanceof Error ? error.message : String(error),
          })
        }
      })
    },
    unsubscribeAll: (type?: string) => {
      if (type) {
        const typeIds = localSubscriptionsByType.get(type)
        if (typeIds) {
          for (const id of typeIds) localSubscriptions.delete(id)
          localSubscriptionsByType.delete(type)
        }
      } else {
        localSubscriptions.clear()
        localSubscriptionsByType.clear()
      }
    },
    getMessageHistory: () => localHistory.value,
    clearMessageHistory: () => {
      localHistory.value = []
    },
    configure: (config) => {
      if (config.appName) localAppName = config.appName
      if (config.maxHistory !== undefined) localMaxHistorySize = config.maxHistory
      if (config.debug !== undefined) localDebugMode = config.debug
    },
  }
}
