import { RouteDef, RouteMatch } from './types';

/**
 * Flatten the children of <Router> or <Route> into a route configuration tree.
 * Note: This assumes `children` are VNodes representing <Route> components.
 */
export function createRoutesFromChildren(children: any): RouteDef[] {
    const routes: RouteDef[] = [];
    
    const childArray = Array.isArray(children) ? children : [children];
    // console.log('Parsing children:', childArray.length);
    
    for (const child of childArray) {
        if (!child || !child.props) {
            continue;
        }
        
        const { path, index, component } = child.props;
        const nestedChildren = child.children;
        
        const route: RouteDef = {
            path: path || '',
            index: !!index,
            component,
            children: nestedChildren ? createRoutesFromChildren(nestedChildren) : []
        };
        
        routes.push(route);
    }
    
    return routes;
}

/**
 * Match a URL against a route tree.
 * Returns an array of matches (from root to leaf).
 */
export function matchRoutes(routes: RouteDef[], location: string): RouteMatch[] | null {
    // console.log('Matching routes:', routes.length, 'against', location);
    for (const route of routes) {
        const result = matchRouteBranch(route, location, '');
        if (result) return result;
    }
    return null;
}

function matchRouteBranch(route: RouteDef, location: string, parentPath: string): RouteMatch[] | null {
    let fullPath = parentPath;
    if (route.path) {
        fullPath = parentPath.replace(/\/$/, '') + '/' + route.path.replace(/^\//, '');
    }
    
    const isLeaf = route.children.length === 0;
    const matcher = compilePath(fullPath, !isLeaf); 
    const match = location.match(matcher);
    
    // console.log('Checking branch:', fullPath, 'leaf:', isLeaf, 'match:', !!match, 'regex:', matcher);
    
    if (match) {
        const [matchedPath, ...paramValues] = match;
        const paramsObj = extractParams(fullPath, paramValues);
        
        const currentMatch: RouteMatch = {
            route,
            params: paramsObj,
            pathname: matchedPath
        };
        
        if (isLeaf) {
            // Exact match required for leaf
            if (matchedPath === location) return [currentMatch];
            return null;
        }
        
        // Has children: try to match one of them
        // If no children match, and this route is an index route?
        // Or if this route matches partially, maybe an index child matches the rest?
        
        for (const child of route.children) {
            const childMatches = matchRouteBranch(child, location, fullPath);
            if (childMatches) {
                return [currentMatch, ...childMatches];
            }
        }
        
        // If no children matched, but we matched exactly this layout route?
        // E.g. /users matches /users layout, and maybe it renders index?
        if (matchedPath === location) {
             // Check for index route
             const indexRoute = route.children.find(c => c.index);
             if (indexRoute) {
                 return [currentMatch, { route: indexRoute, params: {}, pathname: matchedPath }];
             }
             // Just the layout? Maybe.
             return [currentMatch];
        }
    }
    
    return null;
}

function compilePath(path: string, prefix: boolean): RegExp {
    // Simple regex conversion
    const paramNames: string[] = [];
    let regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });
    
    // If path is exactly "/", and we want prefix matching, it should match everything
    if (regexPath === '/' && prefix) {
        return new RegExp('^');
    }
    
    // If prefix matching allowed, ensure we match segment boundary
    return new RegExp(`^${regexPath}${prefix ? '(?:/|$)' : '$'}`);
}

function extractParams(path: string, values: string[]): Record<string, string> {
    const params: Record<string, string> = {};
    let i = 0;
    // Re-parse to find param names... inefficient but works
    path.replace(/:([^/]+)/g, (_, paramName) => {
        params[paramName] = values[i++];
        return '';
    });
    return params;
}
