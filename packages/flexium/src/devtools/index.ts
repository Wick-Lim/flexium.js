/**
 * Flexium DevTools Integration
 *
 * Provides hooks for browser devtools extension to inspect signals,
 * effects, and component trees.
 *
 * @example
 * ```tsx
 * import { enableDevTools, getDevToolsState } from 'flexium/devtools';
 *
 * // Enable devtools in development
 * if (process.env.NODE_ENV !== 'production') {
 *   enableDevTools();
 * }
 * ```
 */

import { Signal, Computed, setDevToolsHooks } from '../core/signal';
import { ErrorCodes, logError } from '../core/errors';

export interface DevToolsState {
    enabled: boolean;
    signals: Map<number, SignalInfo>;
    effects: Map<number, EffectInfo>;
    components: Map<number, ComponentInfo>;
}

export interface SignalInfo {
    id: number;
    name?: string;
    value: unknown;
    subscribers: number;
    createdAt: number;
    lastUpdated: number;
    updateCount: number;
}

export interface EffectInfo {
    id: number;
    name?: string;
    dependencies: number[];
    lastRun: number;
    runCount: number;
    status: 'idle' | 'running' | 'error';
    error?: Error;
}

export interface ComponentInfo {
    id: number;
    name: string;
    props: Record<string, unknown>;
    signals: number[];
    effects: number[];
    children: number[];
    parent?: number;
    mountedAt: number;
}

// Global devtools state
let devToolsState: DevToolsState = {
    enabled: false,
    signals: new Map(),
    effects: new Map(),
    components: new Map()
};

let signalIdCounter = 0;
let effectIdCounter = 0;
let componentIdCounter = 0;

// Event listeners for devtools
type DevToolsEventType = 'signal-create' | 'signal-update' | 'effect-create' | 'effect-run' | 'component-mount' | 'component-unmount';
type DevToolsListener = (event: DevToolsEventType, data: unknown) => void;
const listeners: DevToolsListener[] = [];

/**
 * Enable devtools integration
 * Call this in development mode to enable signal/effect inspection
 */
export function enableDevTools(): void {
    devToolsState.enabled = true;

    // Register hooks with signal system for automatic tracking
    setDevToolsHooks({
        onSignalCreate: (signal, name) => registerSignal(signal, name),
        onSignalUpdate: (id, value) => updateSignalInfo(id, value),
        onEffectCreate: (name) => registerEffect(name),
        onEffectRun: (id, status, error) => updateEffectInfo(id, status, error),
    });

    // Expose to window for browser extension
    if (typeof window !== 'undefined') {
        (window as any).__FLEXIUM_DEVTOOLS__ = {
            getState: getDevToolsState,
            getSignals: () => Array.from(devToolsState.signals.values()),
            getEffects: () => Array.from(devToolsState.effects.values()),
            getComponents: () => Array.from(devToolsState.components.values()),
            subscribe: (listener: DevToolsListener) => {
                listeners.push(listener);
                return () => {
                    const index = listeners.indexOf(listener);
                    if (index > -1) listeners.splice(index, 1);
                };
            }
        };

        console.log('%c[Flexium DevTools] Enabled', 'color: #10b981; font-weight: bold;');
    }
}

/**
 * Disable devtools integration
 */
export function disableDevTools(): void {
    devToolsState.enabled = false;
    devToolsState.signals.clear();
    devToolsState.effects.clear();
    devToolsState.components.clear();

    // Unregister hooks
    setDevToolsHooks(null);

    if (typeof window !== 'undefined') {
        delete (window as any).__FLEXIUM_DEVTOOLS__;
    }
}

/**
 * Get current devtools state
 */
export function getDevToolsState(): DevToolsState {
    return { ...devToolsState };
}

/**
 * Check if devtools are enabled
 */
export function isDevToolsEnabled(): boolean {
    return devToolsState.enabled;
}

// Internal: emit event to listeners
function emit(event: DevToolsEventType, data: unknown): void {
    for (const listener of listeners) {
        try {
            listener(event, data);
        } catch (e) {
            logError(ErrorCodes.DEVTOOLS_LISTENER_ERROR, { event }, e);
        }
    }
}

/**
 * Register a signal with devtools
 * @internal
 */
export function registerSignal(signal: Signal<unknown> | Computed<unknown>, name?: string): number {
    if (!devToolsState.enabled) return -1;

    const id = signalIdCounter++;
    const now = Date.now();

    devToolsState.signals.set(id, {
        id,
        name,
        value: signal.peek(),
        subscribers: 0,
        createdAt: now,
        lastUpdated: now,
        updateCount: 0
    });

    emit('signal-create', { id, name });
    return id;
}

/**
 * Update signal info in devtools
 * @internal
 */
export function updateSignalInfo(id: number, value: unknown): void {
    if (!devToolsState.enabled) return;

    const info = devToolsState.signals.get(id);
    if (info) {
        info.value = value;
        info.lastUpdated = Date.now();
        info.updateCount++;
        emit('signal-update', { id, value });
    }
}

/**
 * Register an effect with devtools
 * @internal
 */
export function registerEffect(name?: string): number {
    if (!devToolsState.enabled) return -1;

    const id = effectIdCounter++;

    devToolsState.effects.set(id, {
        id,
        name,
        dependencies: [],
        lastRun: Date.now(),
        runCount: 0,
        status: 'idle'
    });

    emit('effect-create', { id, name });
    return id;
}

/**
 * Update effect info in devtools
 * @internal
 */
export function updateEffectInfo(id: number, status: 'idle' | 'running' | 'error', error?: Error): void {
    if (!devToolsState.enabled) return;

    const info = devToolsState.effects.get(id);
    if (info) {
        info.status = status;
        info.lastRun = Date.now();
        info.runCount++;
        if (error) info.error = error;
        emit('effect-run', { id, status, error });
    }
}

/**
 * Register a component with devtools
 * @internal
 */
export function registerComponent(name: string, props: Record<string, unknown>): number {
    if (!devToolsState.enabled) return -1;

    const id = componentIdCounter++;

    devToolsState.components.set(id, {
        id,
        name,
        props,
        signals: [],
        effects: [],
        children: [],
        mountedAt: Date.now()
    });

    emit('component-mount', { id, name });
    return id;
}

/**
 * Unregister a component from devtools
 * @internal
 */
export function unregisterComponent(id: number): void {
    if (!devToolsState.enabled) return;

    const info = devToolsState.components.get(id);
    if (info) {
        devToolsState.components.delete(id);
        emit('component-unmount', { id, name: info.name });
    }
}

/**
 * Create a named signal for better devtools visibility
 *
 * @example
 * ```tsx
 * import { createNamedSignal } from 'flexium/devtools';
 * import { signal } from 'flexium';
 *
 * // Shows as "count" in devtools
 * const count = createNamedSignal('count', 0, signal);
 * ```
 */
export function createNamedSignal<T>(
    name: string,
    initialValue: T,
    signalFn: (v: T) => Signal<T>
): Signal<T> {
    const s = signalFn(initialValue);

    if (devToolsState.enabled) {
        registerSignal(s, name);
    }

    return s;
}
