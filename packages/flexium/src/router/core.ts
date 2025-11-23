import { signal, Signal } from '../core/signal';
import { Location } from './types';

export function createLocation(): [Signal<Location>, (path: string) => void] {
    const getLoc = (): Location => ({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        query: parseQuery(window.location.search)
    });

    const loc = signal(getLoc());

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        loc.value = getLoc();
    };

    window.addEventListener('popstate', () => {
        loc.value = getLoc();
    });

    return [loc, navigate];
}

function parseQuery(search: string): Record<string, string> {
    const params = new URLSearchParams(search);
    const query: Record<string, string> = {};
    params.forEach((value, key) => {
        query[key] = value;
    });
    return query;
}

export function matchPath(
    pathname: string,
    routePath: string
): { matches: boolean; params: Record<string, string> } {
    const paramNames: string[] = [];
    const regexPath = routePath.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPath}$`);
    const match = pathname.match(regex);

    if (!match) {
        return { matches: false, params: {} };
    }

    const params: Record<string, string> = {};
    match.slice(1).forEach((value, index) => {
        params[paramNames[index]] = value;
    });

    return { matches: true, params };
}
