# File Structure and Purpose

Complete overview of all files in the SSR example.

## Documentation Files

### README.md (330 lines)
**Purpose**: Main documentation covering:
- What SSR is and why it's useful
- How SSR works in Flexium
- Step-by-step explanation of rendering and hydration
- Key components and their responsibilities
- Usage instructions and examples
- Common issues and solutions

**Target Audience**: Developers learning SSR concepts

### QUICKSTART.md (136 lines)
**Purpose**: Get started in under 2 minutes
- Installation steps
- How to run the example
- What to expect when running
- Quick experiments to try
- Common troubleshooting

**Target Audience**: Developers who want to run it quickly

### ARCHITECTURE.md (487 lines)
**Purpose**: Deep technical dive covering:
- Complete SSR flow diagram
- How renderToString() works internally
- How hydrate() works internally
- Signal system integration
- Performance optimizations
- Security considerations
- Debugging techniques
- Future enhancements

**Target Audience**: Advanced developers and contributors

### FILES.md (this file)
**Purpose**: Directory structure and file descriptions

## Configuration Files

### package.json (26 lines)
**Purpose**: Project configuration
- Dependencies (Express, Flexium, TypeScript)
- Dev dependencies (Vite, tsx, types)
- npm scripts for dev, build, and preview
- Workspace configuration

**Key Scripts**:
- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build

### tsconfig.json (37 lines)
**Purpose**: TypeScript configuration
- Compiler options (target, module, jsx)
- Path mappings to local Flexium packages
- JSX configuration (jsxImportSource: flexium)
- Strict type checking enabled

### vite.config.ts (22 lines)
**Purpose**: Vite bundler configuration
- Resolve aliases for Flexium imports
- ESBuild JSX configuration
- Build target and minification settings

### .gitignore (23 lines)
**Purpose**: Git ignore rules
- node_modules/
- dist/
- Logs and editor files

## Source Files

### src/App.tsx (182 lines)
**Purpose**: Main application component

**Components Defined**:
1. **Counter** - Interactive counter demonstrating:
   - signal() for state
   - computed() for derived values
   - Event handlers (onClick)

2. **TodoList** - Full-featured todo app demonstrating:
   - Array state management
   - Form handling
   - List rendering with keys
   - Multiple computed values
   - CRUD operations

3. **App** - Root component with:
   - Information sections
   - Component composition
   - Feature cards

**Signals Used**:
- `count` - Counter value
- `doubled` - Computed double of count
- `todos` - Array of todo items
- `newTodoText` - Form input value
- `activeTodos` - Computed active count
- `completedTodos` - Computed completed count

### src/entry-server.tsx (16 lines)
**Purpose**: Server-side entry point
- Exports `render()` function
- Calls `renderToString(<App />)`
- Returns HTML string to server

**Used By**: server.ts on each request

### src/main.tsx (20 lines)
**Purpose**: Client-side entry point
- Imports App component
- Calls `hydrate(<App />, container)`
- Makes server-rendered HTML interactive

**Runs**: In the browser after HTML loads

### server.ts (92 lines)
**Purpose**: Express HTTP server

**Development Mode**:
- Uses Vite dev server for HMR
- Transforms code on-the-fly
- Better error messages

**Production Mode**:
- Serves pre-built bundles
- Faster, optimized

**Flow**:
1. Receives HTTP request
2. Loads entry-server.tsx
3. Calls render() to get HTML
4. Injects HTML into index.html
5. Sends to browser

## Template Files

### index.html (407 lines)
**Purpose**: HTML template and styles

**Contains**:
- HTML structure with `<div id="app">`
- Complete CSS styling (300+ lines)
- Placeholder `<!--app-html-->` for SSR injection
- Script tag to load `src/main.tsx`

**CSS Includes**:
- CSS variables for theming
- Responsive layout
- Component styles (counter, todo, buttons)
- Form elements
- Feature cards
- Media queries for mobile

## Directory Structure

```
ssr-example/
├── Documentation/
│   ├── README.md           # Main documentation
│   ├── QUICKSTART.md       # Quick start guide
│   ├── ARCHITECTURE.md     # Technical deep dive
│   └── FILES.md            # This file
│
├── Configuration/
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript config
│   ├── vite.config.ts      # Vite bundler config
│   └── .gitignore          # Git ignore rules
│
├── Source Code/
│   ├── server.ts           # Express server (development & production)
│   └── src/
│       ├── App.tsx         # Main application component
│       ├── entry-server.tsx # Server entry point (SSR)
│       └── main.tsx        # Client entry point (hydration)
│
└── Templates/
    └── index.html          # HTML template with styles
```

## Build Output (after npm run build)

```
dist/
├── client/                 # Client-side bundle
│   ├── index.html         # HTML with production assets
│   ├── assets/
│   │   ├── main-[hash].js # Client JavaScript
│   │   └── main-[hash].css # Extracted CSS (if any)
│   └── .vite/
│       └── manifest.json  # Asset manifest
│
└── server/                # Server-side bundle
    └── entry-server.js    # SSR render function
```

## File Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Request                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ server.ts                                               │
│   • Receives request                                    │
│   • Calls entry-server.tsx                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ src/entry-server.tsx                                    │
│   • Imports App.tsx                                     │
│   • Calls renderToString(<App />)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ src/App.tsx                                             │
│   • Defines components                                  │
│   • Uses signals for state                             │
│   • Returns JSX                                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ index.html (template)                                   │
│   • Receives rendered HTML                              │
│   • Includes <script src="/src/main.tsx">              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Browser                                                  │
│   • Displays HTML (fast!)                               │
│   • Downloads main.tsx                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ src/main.tsx                                            │
│   • Imports App.tsx                                     │
│   • Calls hydrate(<App />, container)                  │
│   • Attaches event handlers                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Interactive Application!                                │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts by File

### Isomorphic Code (src/App.tsx)
Code that runs on both server and client:
- ✅ Uses Flexium components
- ✅ Uses signals for state
- ✅ Conditional rendering
- ✅ Event handlers (attached only on client)

### Server-Only Code (src/entry-server.tsx)
Code that only runs on server:
- Uses `renderToString()` from 'flexium/server'
- Converts components to HTML strings
- Can fetch data before rendering

### Client-Only Code (src/main.tsx)
Code that only runs in browser:
- Uses `hydrate()` from 'flexium/dom'
- Attaches to existing DOM
- Makes HTML interactive

### Universal Code (server.ts)
Code that handles both environments:
- Serves in development and production
- Uses Vite in dev, static files in prod
- Handles SSR in both modes

## Line Count Summary

| Category | Files | Total Lines |
|----------|-------|-------------|
| Documentation | 4 | 1,440 |
| Configuration | 4 | 108 |
| Source Code | 3 | 310 |
| Template | 1 | 407 |
| **Total** | **12** | **2,265** |

## Dependencies

### Production
- **express**: HTTP server
- **flexium**: UI framework (workspace link)

### Development
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **typescript**: Type checking
- **@types/express**: Express type definitions
- **@types/node**: Node.js type definitions
- **cross-env**: Environment variables

## Next Steps

1. Read [QUICKSTART.md](./QUICKSTART.md) to run the example
2. Read [README.md](./README.md) for detailed concepts
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation details
4. Explore the source code in `src/`
5. Modify and experiment!
