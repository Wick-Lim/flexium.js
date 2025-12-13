
export interface ComponentInstance {
    hooks: any[]
    hookIndex: number
}

let currentComponent: ComponentInstance | null = null

export function getComponent(): ComponentInstance | null {
    return currentComponent
}

export function runWithComponent<T>(component: ComponentInstance, fn: () => T): T {
    const prev = currentComponent
    currentComponent = component
    component.hookIndex = 0
    try {
        return fn()
    } finally {
        currentComponent = prev
    }
}

export function hook<T>(factory: () => T): T {
    if (!currentComponent) {
        // Outside component: just run factory
        return factory()
    }

    const instance = currentComponent
    const { hooks, hookIndex } = instance

    if (hookIndex < hooks.length) {
        // Return existing hook
        instance.hookIndex++
        return hooks[hookIndex] as T
    }

    // Create new hook
    const value = factory()
    hooks.push(value)
    instance.hookIndex++

    return value
}
