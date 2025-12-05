# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.3] - 2025-12-05

### Flexium Signature API - The "F" Identity

This release introduces Flexium's signature API naming convention, centered around the "F" prefix.

#### Added
- **`f()` JSX factory function** - Replaces `h()` as the primary JSX factory
  - `h()` remains as a deprecated alias for backward compatibility
  - Usage: `jsxFactory: "f"` in tsconfig.json
- **`FNode` type** - Flexium Node, the core element descriptor type
  - Not a Virtual DOM - immediately converts to real DOM with fine-grained reactivity
  - `VNode` remains as a deprecated alias
- **`isFNode()` utility** - Type guard for FNode
- **`createFNode()` utility** - Creates FNode with consistent shape for JS engine optimization

#### Changed
- **Renamed core types for Flexium branding:**
  - `VNode` → `FNode` (deprecated alias maintained)
  - `VNodeChild` → `FNodeChild` (deprecated alias maintained)
  - `isVNode` → `isFNode` (deprecated alias maintained)
  - `createVNode` → `createFNode` (deprecated alias maintained)
- **Updated JSX runtime** - Uses FNode internally
- **Removed VNode from public API** - `flexium/dom` no longer exports VNode type

#### Migration Guide
```tsx
// Before
import { h } from 'flexium/dom'
import type { VNode } from 'flexium/dom'

// After
import { f } from 'flexium/dom'
import type { FNode } from 'flexium/core'

// Or use automatic JSX runtime (recommended)
// tsconfig.json: { "jsx": "react-jsx", "jsxImportSource": "flexium" }
```

## [0.3.2] - 2025-12-05

### DX Improvements & DevTools Enhancement

#### Added
- **Standardized Error Code System** - All Flexium errors now follow FLXxxx format
  - Error codes from FLX101 to FLX702 covering all error categories
  - Contextual information in error messages
  - Actionable suggestions for fixing issues
  - New `errors.ts` module with `logError()`, `logWarning()`, and `FlexiumError` class
- **DevTools Auto-Registration** - Signals and effects are now automatically tracked
  - No manual registration required after `enableDevTools()`
  - Hook-based system avoids circular dependencies
  - Effect name support via `options.name` parameter
- **DevTools Documentation** - New `/guide/devtools` page with:
  - Browser console API reference
  - Event subscription guide
  - Custom tool building examples

#### Changed
- **`__DEV__` default value** - Changed from `true` to `false`
  - Production builds no longer emit hydration warnings by default
  - Set `__DEV__` explicitly in vite.config.ts for development warnings
- **Error messages updated** across all modules:
  - `signal.ts` - Effect and cleanup errors
  - `Form.ts` - Validation and submission errors
  - `Button.ts` - Handler and accessibility warnings
  - `error-boundary.ts` - Callback and render errors
  - `devtools/index.ts` - Listener errors

#### Fixed
- **`advanced.mjs` build output** - Entry point now correctly generates in dist/

### API Simplification & Doc Overhaul - 2025-11-23

#### Changed
- **Simplified Reactivity API**: Unified state management under `state()`.
  - `state()` now handles local, global, async, and derived state.
  - `createStore` has been removed and consolidated into `state()`.
  - `batch` and `untrack` removed from public API (handled automatically internally).
- **Documentation Structure**: Major overhaul of `apps/docs`.
  - Restructured sidebar into `Core API`, `Cross-Platform Guides`, and `Advanced`.
  - Added dedicated guides for `Row`, `Column` (Layout Primitives) and `Control Flow` (`For`, `Show`).
  - Removed deprecated documentation (`store.md`, etc.).

#### Removed
- `createStore` API (use `state()` instead).
- `batch` and `untrack` form public exports.

### JSX Runtime & Metadata Updates - 2025-11-22

#### Added
- **Automatic JSX Runtime** - React 17+ style JSX transformation
  - `/jsx-runtime` export for automatic JSX (no h import needed)
  - `/jsx-dev-runtime` export for development mode
  - Full TypeScript support with proper JSX types
  - Comprehensive JSX Guide documentation
- **Enhanced package.json metadata**
  - Extended keywords for better npm discoverability
  - Repository, homepage, and bugs URLs
  - Author information
- **CHANGELOG.md** - Following Keep a Changelog format
- **Example READMEs** - Individual README files for each example with:
  - How to run instructions
  - What the example demonstrates
  - Detailed feature breakdowns
  - Beginner-friendly explanations

### Documentation Improvements - 2025-11-21

#### Added
- **NEW_USER_GUIDE.md** - Comprehensive step-by-step guide for new users
  - Complete installation walkthrough
  - Common issues and solutions section
  - FAQ covering frequent questions
  - Next steps and learning resources
  - Performance tips and debugging guide

#### Fixed
- **README.md** - Added CORS troubleshooting and HTTP server instructions
  - Documented the need for HTTP server instead of file:// protocol
  - Added Python and Node.js HTTP server setup instructions
  - Expanded "Known Issues & Troubleshooting" section

- **playground/README.md** - Enhanced with detailed troubleshooting
  - CORS policy error solutions (most common issue)
  - Module not found error fixes
  - Counter not updating checklist
  - Port conflicts resolution

#### Verified
- Counter demo (`playground/counter-demo.html`) confirmed working
- All reactive features functioning correctly:
  - Signal creation and updates
  - Effect tracking and execution
  - DOM rendering with h() and render()
  - Event handlers responding properly
  - Console logging for debugging

#### Lessons Learned
- ES6 modules require HTTP server (CORS policy)
- file:// protocol causes security errors with module imports
- Clear documentation is as important as working code
- New users need explicit setup instructions with troubleshooting

---

## [0.1.0] - 2025-11-19

### Added - Initial Release

#### Core Reactivity System
- **signal()** - Create reactive primitive values with automatic dependency tracking
- **computed()** - Memoized derived values that automatically update when dependencies change
- **effect()** - Side effects with automatic cleanup and dependency tracking
- **batch()** - Batch multiple signal updates for performance optimization
- **untrack()** - Read signals without establishing dependencies
- **root()** - Create disposal scopes for memory management

#### DOM Renderer
- **h()** - JSX factory function for creating virtual DOM nodes
- **render()** - Simple render function for mounting to DOM
- **createRoot()** - Root management API with update/unmount capabilities
- **createReactiveRoot()** - Reactive rendering with automatic signal integration
- Platform-agnostic renderer interface for future Canvas/React Native support

#### Layout Primitives
- **Row** - Horizontal flex container with responsive props
- **Column** - Vertical flex container with responsive props
- **Stack** - Overlapping layers with absolute positioning
- **Grid** - Responsive grid layout with breakpoints
- **Spacer** - Flexible spacing component

#### UX Components
- **Motion** - Declarative animations using Web Animations API
  - Spring physics support
  - Transform props (x, y, scale, rotate, opacity)
  - Layout animations with ResizeObserver
- **Form** - Signal-based form state management
  - Built-in validation (sync + async)
  - Field-level state tracking
  - Nested field support
- **Input** - Controlled input with validation and accessibility
- **Button** - Unified onPress handler with variants and loading states
- **Text** - Semantic typography with responsive sizing

#### Build System
- TypeScript configuration with strict mode
- tsup bundling (ESM + CJS + type declarations)
- Tree-shaking enabled
- Source maps generated
- Bundle size: ~25KB total (core: 175 bytes, DOM: 8.6KB, primitives: 16KB)

#### Development Tools
- 6 specialized AI agents for different development domains
- Slash commands for rapid development workflow
- Comprehensive documentation and examples

#### Documentation
- Complete API documentation
- Migration guide from React/Vue/Svelte
- Architecture documentation
- Quick start guides
- Working playground demo

### Fixed

#### Signal System
- Fixed signal dependency tracking to properly clear stale dependencies
- Fixed computed signals not updating when multiple dependencies change
- Fixed effect cleanup not being called on disposal
- Fixed batch() not properly deferring updates

#### DOM Renderer
- Fixed event handlers not being properly removed on unmount
- Fixed style prop handling for nested objects
- Fixed children not being properly flattened
- Fixed text nodes not updating reactively

#### Build System
- Fixed TypeScript strict mode errors across codebase
- Fixed module resolution for sub-path exports
- Fixed source map generation

### Known Limitations

1. **Reactive Integration**: Components require manual effect() calls for reactive updates. Automatic reactive bindings are in development.

2. **Reconciliation**: Current reconciliation is simple and index-based. Key-based diffing for efficient list updates is planned.

3. **Testing**: Core signal system has comprehensive tests. Integration tests for full component system needed.

4. **Type Exports**: Package.json shows warnings about "types" condition ordering in exports. This is non-breaking and will be fixed in next release.

5. **SSR**: Server-side rendering not yet implemented.

6. **Canvas/React Native**: Renderers planned but not yet implemented.

### Performance Characteristics

- Signal creation: < 1ms
- Signal update: < 0.1ms (1000 signals)
- Bundle size: 25KB total (core: 175 bytes)
- Zero runtime dependencies
- Tree-shakeable exports

### Breaking Changes

N/A - Initial release

---

## [Unreleased]

### Planned for v0.2.0
- Automatic reactive bindings for all components
- Key-based reconciliation for list updates
- Comprehensive integration test suite
- Performance benchmarks vs React/Vue/Svelte
- Canvas renderer (alpha)

### Planned for v0.3.0
- React Native renderer (alpha)
- Gesture component
- Portal component (modals, tooltips)
- Transition groups (list animations)

### Planned for v1.0.0
- Stable API
- Production-ready all renderers
- DevTools extension
- Full accessibility primitives
- Router library
- npm publication

---

## Development Notes

This project is built with an AI agent development system. Each component is designed and implemented by specialized agents:

1. **Signal System Architect** - Core reactivity engine
2. **Layout & Style System** - Flex-first primitives
3. **UX Components Specialist** - Motion, Form, Gesture
4. **Cross-Renderer Architect** - Multi-platform support
5. **Build & Package Config** - Build system and npm publishing
6. **Documentation & Examples** - Developer experience

For more information, see `.claude/agents/README.md`.

---

[0.1.0]: https://github.com/Wick-Lim/flexium.js/releases/tag/v0.1.0
