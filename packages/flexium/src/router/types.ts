
export interface Location {
  pathname: string
  search: string
  hash: string
  query: Record<string, string>
}

export interface RouteDefinition {
  path: string
  component: any // Component function
  children?: RouteDefinition[]
  beforeEnter?: (params: Record<string, string>) => boolean | void
}

export interface RouteMatch {
  route: RouteDefinition
  params: Record<string, string>
  pathname: string // Matched part
}

export interface RouterContext {
  location: Location
  navigate: (path: string) => void
  matches: RouteMatch[]
  params: Record<string, string>
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
