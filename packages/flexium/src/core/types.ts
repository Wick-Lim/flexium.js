// Context types
export interface Context<T> {
    Provider: (props: { value: T; children: any }) => any
    id: symbol
    defaultValue: T
}

// Ref types
export interface RefObject<T> {
  current: T | null
}

export type RefCallback<T> = (instance: T | null) => void

export type Ref<T> = RefObject<T> | RefCallback<T> | null

export type ForwardedRef<T> = RefCallback<T> | RefObject<T> | null
