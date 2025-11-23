import { createContext } from './context';
import { signal } from './signal';
import { h } from '../renderers/dom/h';

export interface ErrorBoundaryContextValue {
    setError: (error: any) => void;
}

export const ErrorBoundaryCtx = createContext<ErrorBoundaryContextValue | null>(null);

export function ErrorBoundary(props: { fallback: any, children: any }) {
    const error = signal<any>(null);

    const setError = (err: any) => {
            error.value = err;
    };
    
    const contextValue: ErrorBoundaryContextValue = { setError };

    return () => {
        if (error.value) {
            // Render fallback if an error occurred
            // Pass the error to the fallback component if it's a function
            if (typeof props.fallback === 'function') {
                return h(props.fallback, { error: error.value });
            }
            return props.fallback;
        }

        // Provide context to children and render them
        return h(ErrorBoundaryCtx.Provider, { value: contextValue }, props.children);
    };
}
