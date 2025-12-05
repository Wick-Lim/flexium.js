import { Signal, Computed } from '../core/signal';
import type { VNodeChild } from '../core/renderer';

export interface Location {
    pathname: string;
    search: string;
    hash: string;
    query: Record<string, string>;
}

export interface RouterContext {
    location: Signal<Location> | Computed<Location>;
    params: Signal<Record<string, string>> | Computed<Record<string, string>>;
    navigate: (path: string) => void;
    // Matches for the current URL (ordered by depth)
    matches: Signal<RouteMatch[]> | Computed<RouteMatch[]>;
}
export interface RouteProps {
    path?: string; // path can be optional for layout routes or index
    index?: boolean;
    component: Function;
    children?: VNodeChild; // Nested routes
    beforeEnter?: (params: Record<string, string>) => boolean | Promise<boolean>;
}

export interface RouteMatch {
    route: RouteDef;
    params: Record<string, string>;
    pathname: string; // Matched portion of the URL
}

// Internal definition of a route
export interface RouteDef {
    path: string;
    index: boolean;
    component: Function;
    children: RouteDef[];
    beforeEnter?: (params: Record<string, string>) => boolean | Promise<boolean>;
    // We might need the original VNode props if we want to support other props
}

export interface LinkProps {
    to: string;
    class?: string;
    children?: VNodeChild;
}

