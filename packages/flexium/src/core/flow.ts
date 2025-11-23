import { VNode } from '../core/renderer';
import { StateGetter } from '../core/state';
import { signal, Signal } from './signal';

interface ForProps<T> {
  each: StateGetter<T[]>;
  children: ((item: T, index: () => number) => VNode)[];
}

/**
 * <For> component for efficient list rendering.
 * Reuses DOM nodes for items that haven't changed, avoiding full VDOM diffing.
 * 
 * @example
 * <For each={items}>
 *   {(item, index) => <div>{item.name}</div>}
 * </For>
 */
export function For<T>(props: ForProps<T>) {
  const { each, children } = props;
  const renderItem = children[0];
  
  // Cache VNodes and Index Signals by Item reference
  let cache = new Map<T, { vnode: VNode, indexSig: Signal<number> }>();

  return () => {
    const list = each() || [];
    const newCache = new Map<T, { vnode: VNode, indexSig: Signal<number> }>();
    
    const vnodes = list.map((item, i) => {
      let cached = cache.get(item);
      
      if (!cached) {
        // Create new index signal
        const indexSig = signal(i);
        
        // Create new VNode, passing index getter
        const vnode = renderItem(item, indexSig);
        
        // Ensure key is set
        if (vnode.key == null) {
            if (item != null && (item as any).id != null) {
                vnode.key = (item as any).id;
            } else if (typeof item === 'string' || typeof item === 'number') {
                vnode.key = item;
            }
        }
        
        cached = { vnode, indexSig };
      } else {
        // Update index if changed
        if (cached.indexSig.peek() !== i) {
            cached.indexSig.set(i);
        }
      }
      
      newCache.set(item, cached);
      return cached.vnode;
    });
    
    cache = newCache;
    return vnodes;
  };
}

interface ShowProps<T> {
  when: StateGetter<T | undefined | null | false>;
  fallback?: VNode | (() => VNode);
  children: VNode[] | ((item: T) => VNode)[];
}

/**
 * <Show> component for conditional rendering.
 * Renders children when the condition is truthy, otherwise renders fallback.
 * 
 * @example
 * <Show when={isLoggedIn} fallback={<div>Login</div>}>
 *   <Dashboard />
 * </Show>
 * 
 * // With callback to access truthy value
 * <Show when={user}>
 *   {(u) => <div>Hello {u.name}</div>}
 * </Show>
 */
export function Show<T>(props: ShowProps<T>) {
  return () => {
    const value = props.when();
    if (value) {
      const child = props.children[0];
      return typeof child === 'function' && props.children.length === 1 
        ? (child as Function)(value) 
        : child;
    }
    if (props.fallback) {
        return typeof props.fallback === 'function' ? (props.fallback as Function)() : props.fallback;
    }
    return null;
  };
}

interface SwitchProps {
  fallback?: VNode;
  children: VNode[];
}

interface MatchProps<T> {
  when: StateGetter<T | undefined | null | false>;
  children: VNode | ((item: T) => VNode);
}

/**
 * <Match> component to be used within <Switch>.
 * It does not render anything on its own.
 */
export function Match<T>(props: MatchProps<T>) {
  return props as any;
}

/**
 * <Switch> component for mutually exclusive conditional rendering.
 * Renders the first <Match> child whose `when` condition is truthy.
 * 
 * @example
 * <Switch fallback={<div>Not Found</div>}>
 *   <Match when={isLoading}>Loading...</Match>
 *   <Match when={error}>Error: {error}</Match>
 *   <Match when={data}>
 *     {(d) => <DataView data={d} />}
 *   </Match>
 * </Switch>
 */
export function Switch(props: SwitchProps) {
  return () => {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    
    for (const child of children.flat()) {
      if (child && (child as any).type === Match) {
        const when = (child as any).props.when;
        // Check condition (track dependency)
        const value = typeof when === 'function' ? when() : when;
        
        if (value) {
           const matchChildren = (child as any).children;
           if (matchChildren && matchChildren.length > 0) {
               const content = matchChildren[0];
               return typeof content === 'function' ? content(value) : content;
           }
           return null;
        }
      }
    }
    return props.fallback || null;
  };
}
