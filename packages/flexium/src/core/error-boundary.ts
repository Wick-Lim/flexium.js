import { createContext, useContext } from './context';
import { signal } from './signal';
import { h } from '../renderers/dom/h';

export interface ErrorBoundaryContextValue {
    setError: (error: Error | unknown) => void;
    clearError: () => void;
    retry: () => void;
}

export interface ErrorBoundaryProps {
    /** Fallback UI to render when an error occurs. Can be a VNode or a function that receives error info */
    fallback: any | ((props: { error: Error; reset: () => void }) => any);
    /** Children to render */
    children: any;
    /** Callback when an error is caught */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Callback when error is reset */
    onReset?: () => void;
}

export interface ErrorInfo {
    componentStack?: string;
    timestamp: number;
}

export const ErrorBoundaryCtx = createContext<ErrorBoundaryContextValue | null>(null);

/**
 * ErrorBoundary - Catches errors in child components and displays a fallback UI
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={({ error, reset }) => (
 *     <div>
 *       <p>Something went wrong: {error.message}</p>
 *       <button onClick={reset}>Try Again</button>
 *     </div>
 *   )}
 *   onError={(error) => console.error('Caught:', error)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
    const { fallback, children, onError, onReset } = props;

    const error = signal<Error | null>(null);
    const errorInfo = signal<ErrorInfo | null>(null);
    const retryCount = signal(0);

    const setError = (err: Error | unknown) => {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        const info: ErrorInfo = {
            timestamp: Date.now(),
            componentStack: (err as any)?.componentStack
        };

        error.value = errorObj;
        errorInfo.value = info;

        // Call onError callback if provided
        if (onError) {
            try {
                onError(errorObj, info);
            } catch (callbackError) {
                console.error('Error in onError callback:', callbackError);
            }
        }
    };

    const clearError = () => {
        error.value = null;
        errorInfo.value = null;
    };

    const retry = () => {
        clearError();
        retryCount.value++;
        if (onReset) {
            try {
                onReset();
            } catch (callbackError) {
                console.error('Error in onReset callback:', callbackError);
            }
        }
    };

    const contextValue: ErrorBoundaryContextValue = {
        setError,
        clearError,
        retry
    };

    // Create a wrapper that catches render errors
    const safeRender = (content: any) => {
        try {
            return typeof content === 'function' ? content() : content;
        } catch (renderError) {
            setError(renderError);
            return null;
        }
    };

    return () => {
        if (error.value) {
            // Render fallback if an error occurred
            if (typeof fallback === 'function') {
                return h(fallback, {
                    error: error.value,
                    errorInfo: errorInfo.value,
                    reset: retry,
                    retryCount: retryCount.value
                });
            }
            return fallback;
        }

        // Provide context to children and render them with error catching
        return h(ErrorBoundaryCtx.Provider, { value: contextValue },
            safeRender(children)
        );
    };
}

/**
 * Hook to access the nearest ErrorBoundary context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { setError } = useErrorBoundary();
 *
 *   const handleClick = async () => {
 *     try {
 *       await riskyOperation();
 *     } catch (err) {
 *       setError(err);
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Do Something</button>;
 * }
 * ```
 */
export function useErrorBoundary(): ErrorBoundaryContextValue {
    const ctx = useContext(ErrorBoundaryCtx);
    if (!ctx) {
        // Return a no-op implementation if not within an ErrorBoundary
        return {
            setError: (err) => {
                console.error('Uncaught error (no ErrorBoundary):', err);
                throw err;
            },
            clearError: () => {},
            retry: () => {}
        };
    }
    return ctx;
}
