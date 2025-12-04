import { computed } from '../core/signal';
import { createLocation } from './core';
import { createRoutesFromChildren, matchRoutes } from './utils';
import { LinkProps, RouteProps, RouterContext } from './types';
import { h } from '../renderers/dom/h';
import { RouterCtx, RouteDepthCtx } from './context';
import { useContext } from '../core/context';
import type { VNodeChild } from '../core/renderer';

// Helper to use Router Context
export function useRouter(): RouterContext {
    const ctx = useContext(RouterCtx);
    if (!ctx) {
        throw new Error('useRouter must be used within a <Router> component');
    }
    return ctx;
}

export function Router(props: { children: VNodeChild }) {
    const [location, navigate] = createLocation();
    
    // Parse route configuration from children
    const routes = createRoutesFromChildren(props.children);
    
    // Compute matches
    const matches = computed(() => {
        const loc = location();
        return matchRoutes(routes, loc.pathname) || [];
    });
    
    const params = computed(() => {
        const m = matches();
        if (m.length > 0) {
            // Merge params from all matches? Usually leaf params are most important.
            // Or combine them.
            return m[m.length - 1].params;
        }
        return {};
    });

    const routerContext: RouterContext = {
        location,
        params,
        navigate,
        matches
    };

    // Provide Context
    // We use a manual Provider wrapper because `Router` returns the root component
    // But Flexium context is stack-based.
    // We can wrap the result in a Provider component if we had one.
    // Or `mountReactive` supports context via `pushProvider` if the component has `_contextId`.
    // But `createContext` returns an object with `Provider` component.
    
    return () => {
        const ms = matches();
        // console.log('Router render, matches:', ms.length);
        
        // No match? Render nothing or 404?
        // Ideally user provides a "*" route.
        if (ms.length === 0) return null;
        
        const rootMatch = ms[0];
        const RootComponent = rootMatch.route.component;
        
        // We need to provide RouterCtx AND RouteDepthCtx (0 + 1 = 1 for next outlet)
        // Wait, Outlet at depth 0 should render match[0]?
        // No, Router renders match[0] (Root Layout).
        // Root Layout contains Outlet. Outlet renders match[1].
        // So Outlet needs depth 1.
        
        return h(RouterCtx.Provider, { value: routerContext }, [
            h(RouteDepthCtx.Provider, { value: 1 }, [
                h(RootComponent, { params: rootMatch.params })
            ])
        ]);
    };
}

/**
 * Route configuration component.
 * Doesn't render anything directly; used by Router to build the route tree.
 */
export function Route(_props: RouteProps) {
    return null; 
}

/**
 * Renders the child route content.
 */
export function Outlet() {
    const router = useContext(RouterCtx);
    const depth = useContext(RouteDepthCtx); // Default 0
    
    // Safety check
    if (!router) return null;
    
    return () => {
        const ms = router.matches();
        
        // Check if we have a match at this depth
        if (depth >= ms.length) return null;
        
        const match = ms[depth];
        const Component = match.route.component;
        
        // Render component and provide next depth
        return h(RouteDepthCtx.Provider, { value: depth + 1 }, [
            h(Component, { params: match.params })
        ]);
    };
}

export function Link(props: LinkProps) {
    const router = useRouter();

    const handleClick = (e: Event) => {
        e.preventDefault();
        router.navigate(props.to);
    };

    return h('a', {
        href: props.to,
        class: props.class,
        onclick: handleClick
    }, props.children);
}
