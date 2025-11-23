import { computed, signal } from '../core/signal';
import { createLocation, matchPath } from './core';
import { LinkProps, RouteProps, RouterContext } from './types';
import { h } from '../renderers/dom/h';

// Global context for router (simplified for now, ideally should be provided via context API if available)
let activeRouter: RouterContext | null = null;

export function useRouter(): RouterContext {
    if (!activeRouter) {
        throw new Error('useRouter must be used within a <Router> component');
    }
    return activeRouter;
}

export function Router(props: { children: any }) {
    const [location, navigate] = createLocation();
    const params = signal<Record<string, string>>({});

    activeRouter = {
        location,
        params,
        navigate
    };

    return props.children;
}

export function Route(props: RouteProps) {
    const router = useRouter();

    // Computed match state
    const match = computed(() => {
        const { matches, params } = matchPath(router.location.value.pathname, props.path);
        if (matches) {
            router.params.value = params;
        }
        return matches;
    });

    return () => {
        if (match.value) {
            // Render component
            const Component = props.component;
            return h(Component, {});
        }
        return null;
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
