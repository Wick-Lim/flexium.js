export type FNodeChild = FNode | string | number | boolean | null | undefined | FNodeChild[] | (() => FNode)

export interface FNode {
    type: string | Function
    props: Record<string, any>
    children: FNodeChild[]
    key?: any
}
