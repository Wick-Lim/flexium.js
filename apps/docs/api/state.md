# API Reference

## Core

### `state(initialValueOrFetcher, options?)`

The unified API for all state management needs.

#### Arguments
1. **`initialValueOrFetcher`**: 
   - Value (`T`): Initial value for local/global state.
   - Function (`() => T` or `async () => T`): A function to derive state or fetch data.
2. **`options`** (optional):
   - `key` (string): Unique key for global state sharing.

#### Returns `[getter, setter]`

- **`getter()`**: Returns the current value. Accessing this tracks the dependency.
  - `.loading`: (boolean) True if an async fetcher is pending.
  - `.error`: (any) Error object if fetcher failed.
  - `.state`: ('ready' | 'pending' | ...) Current status.
  - **`.map(callback)`**: (Array only) Optimizes list rendering using `<For>`.
    ```js
    { list.map((item, i) => <Item index={i()} />) }
    ```
- **`setter(newValue)`**: Updates the value.
  - Accepts a new value or an updater function `prev => newValue`.
  - `.refetch()`: Re-runs the fetcher function (if applicable).
  - `.mutate(value)`: Manually sets the value of a resource.

---

### `effect(fn)`

Runs a side effect immediately and re-runs it whenever dependencies change.

```javascript
effect(() => {
  console.log('Current count:', count());
  
  // Optional cleanup
  return () => console.log('Cleanup');
});
```

## Utilities

- **`clearGlobalState()`**: Clears all global states from the registry. Useful for testing.