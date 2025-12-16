export interface RefObject<T> {
  current: T | null
}

export type RefCallback<T> = (instance: T | null) => void

export type Ref<T> = RefObject<T> | RefCallback<T> | null

export type ForwardedRef<T> = RefCallback<T> | RefObject<T> | null
