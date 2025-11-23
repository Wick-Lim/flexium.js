import { Signal } from '../core/signal';

export interface Location {
    pathname: string;
    search: string;
    hash: string;
    query: Record<string, string>;
}

export interface RouteProps {
    path: string;
    component: () => any; // Component function
}

export interface RouterContext {
    location: Signal<Location>;
    params: Signal<Record<string, string>>;
    navigate: (path: string) => void;
}

export interface LinkProps {
    to: string;
    class?: string;
    children?: any;
}
