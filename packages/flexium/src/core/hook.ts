
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
    // The new implementation uses `activeComponent` which is not defined in the original document.
    // Assuming `activeComponent` is intended to be `currentComponent` or a similar global state,
    // but to faithfully apply the provided code edit, `activeComponent` is used as written.
    // This might lead to a `ReferenceError` if `activeComponent` is not defined elsewhere.
    const activeComponent = currentComponent // Assuming activeComponent refers to currentComponent for compilation purposes.
    // If activeComponent is a different concept, this line should be adjusted by the user.

    if (!activeComponent) {
        // Outside component: just run factory
        return factory()
    }

    // The new implementation expects activeComponent to have an 'instance' property.
    // The original `ComponentInstance` is directly the instance.
    // Adjusting to match the original `ComponentInstance` structure.
    const instance = activeComponent
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
