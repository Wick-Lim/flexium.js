// Context types
export interface Context<T> {
    Provider: (props: { value: T; children: any }) => any
    id: symbol
    defaultValue: T
}
