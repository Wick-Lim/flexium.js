import { activeEffect, trackEffect, triggerEffects } from './lifecycle'

export const REACTIVE_SIGNAL = Symbol('flexium.reactive')

type Dep = Set<any>
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

// WeakMap to store existing proxies to avoid duplicates
const reactiveMap = new WeakMap<object, any>()

export function reactive<T extends object>(target: T): T {
    if (target && (target as any)[REACTIVE_SIGNAL]) {
        return target
    }

    const existingProxy = reactiveMap.get(target)
    if (existingProxy) {
        return existingProxy
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            if (key === REACTIVE_SIGNAL) return true

            const res = Reflect.get(target, key, receiver)

            track(target, key)

            if (res !== null && typeof res === 'object') {
                return reactive(res)
            }

            return res
        },
        set(target, key, value, receiver) {
            const oldValue = (target as any)[key]
            const result = Reflect.set(target, key, value, receiver)

            if (result && hasChanged(value, oldValue)) {
                trigger(target, key)
            }

            return result
        }
    })

    reactiveMap.set(target, proxy)
    return proxy
}

export function track(target: object, key: unknown) {
    if (!activeEffect) return

    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }

    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }

    trackEffect(dep)
}

export function trigger(target: object, key: unknown) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return

    const dep = depsMap.get(key)
    if (dep) {
        triggerEffects(dep)
    }
}

function hasChanged(value: any, oldValue: any): boolean {
    return !Object.is(value, oldValue)
}

export function isReactive(value: unknown): boolean {
    return !!(value && (value as any)[REACTIVE_SIGNAL])
}
