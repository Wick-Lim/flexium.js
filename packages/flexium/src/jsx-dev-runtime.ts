import { jsx, Fragment } from './jsx-runtime'

export { Fragment }
export function jsxDEV(type: any, props: any, key: any, isStaticChildren: boolean, source: any, self: any) {
    return jsx(type, props, key)
}
