
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

export function useHook<T>(factory: () => T): T {
    const component = currentComponent
    if (!component) {
        // Fallback for standalone usage (no hook persistence)
        return factory()
    }

    const index = component.hookIndex++

    if (index < component.hooks.length) {
        return component.hooks[index]
    }

    const hook = factory()
    component.hooks.push(hook)
    return hook
}
