// State types
export type StateSetter<T> = (newValue: T | ((prev: T) => T)) => void

export type ResourceControl = {
    refetch: () => Promise<void>
    readonly loading: boolean
    readonly error: unknown
    readonly status: 'idle' | 'loading' | 'success' | 'error'
}

export type StateAction<T> = StateSetter<T> | ResourceControl

export interface StateOptions {
    key?: unknown[]
    deps?: any[]
}

// Context types
export interface Context<T> {
    Provider: (props: { value: T; children: any }) => any
    id: symbol
    defaultValue: T
}
