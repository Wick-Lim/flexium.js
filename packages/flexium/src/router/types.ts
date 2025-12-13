import { StateGetter } from '../core/state'

export interface Location {
  pathname: string
  search: string
  hash: string
  query: Record<string, string>
}

export interface RouteDef {
  path: string
  component: any // Component function
  children?: RouteDef[]
  beforeEnter?: (params: Record<string, string>) => boolean | void
}

export interface RouteMatch {
  route: RouteDef
  params: Record<string, string>
  pathname: string // Matched part
}

export interface RouterContext {
  location: StateGetter<Location>
  navigate: (path: string) => void
  matches: StateGetter<RouteMatch[]>
  params: StateGetter<Record<string, string>>
}

export interface RouteProps {
  path: string
  component: any
  children?: any
  beforeEnter?: (params: Record<string, string>) => boolean | void
}

export interface LinkProps {
  to: string
  class?: string
  children?: any
}
