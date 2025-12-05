# IDE Setup Guide

Complete guide to setting up your development environment for Flexium.

## Table of Contents

- [Visual Studio Code](#visual-studio-code)
- [WebStorm / IntelliJ IDEA](#webstorm--intellij-idea)
- [TypeScript Configuration](#typescript-configuration)
- [Debugging Setup](#debugging-setup)
- [Code Snippets](#code-snippets)
- [Troubleshooting](#troubleshooting)

---

## Visual Studio Code

### Recommended Extensions

Install these extensions for the best Flexium development experience:

#### Essential Extensions

1. **TypeScript and JavaScript**
   - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) (if using Vue-style SFC)
   - Built-in TypeScript support (comes with VSCode)

2. **Code Quality**
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Linting
   - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatting
   - [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) - Inline error highlighting

3. **Productivity**
   - [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense) - Autocomplete file paths
   - [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag) - Rename paired tags
   - [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer-2) - Colorize matching brackets
   - [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Git superpowers

#### Optional but Helpful

4. **Development Tools**
   - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - Test APIs
   - [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) - See bundle size impact
   - [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight) - Highlight TODO comments
   - [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) - Enhanced comment styling

### Quick Install

```bash
# Install all essential extensions at once
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
code --install-extension christian-kohler.path-intellisense
code --install-extension formulahendry.auto-rename-tag
code --install-extension eamodio.gitlens
```

### VSCode Settings

The `.vscode/settings.json` file in this project provides optimal settings for Flexium development.

**Key Features:**
- TypeScript strict mode enabled
- Auto-format on save with Prettier
- ESLint integration
- Import organization
- Tailored for JSX development

See [`.vscode/settings.json`](../.vscode/settings.json) for the full configuration.

### Workspace Settings

To customize for your workspace, create `.vscode/settings.json` (local, gitignored):

```json
{
  "editor.fontSize": 14,
  "terminal.integrated.fontSize": 13,
  "workbench.colorTheme": "Your Preferred Theme"
}
```

---

## WebStorm / IntelliJ IDEA

### Setup Steps

1. **Enable TypeScript Support**
   - Go to `Settings > Languages & Frameworks > TypeScript`
   - Select TypeScript version: `Project TypeScript` (uses local node_modules version)
   - Enable TypeScript Language Service

2. **Configure Code Style**
   - Go to `Settings > Editor > Code Style > TypeScript`
   - Click "Set from..." and choose "Prettier"
   - Check "Run on save"

3. **Enable ESLint**
   - Go to `Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
   - Select "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

4. **JSX Support**
   - JSX is automatically recognized in `.tsx` files
   - For custom JSX pragma, ensure `tsconfig.json` has:
     ```json
     {
       "compilerOptions": {
         "jsx": "react-jsx",
         "jsxImportSource": "flexium"
       }
     }
     ```

### Recommended Plugins

- **Prettier** - Code formatting
- **Rainbow Brackets** - Bracket colorization
- **GitToolBox** - Enhanced Git integration
- **Key Promoter X** - Learn keyboard shortcuts

---

## TypeScript Configuration

### Project Setup

Your `tsconfig.json` should include these settings for Flexium:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Options Explained

- **`jsx: "react-jsx"`** - Use the modern JSX transform (no need to import `h`)
- **`jsxImportSource: "flexium"`** - Tell TypeScript to use Flexium's JSX runtime
- **`strict: true`** - Enable all strict type checking
- **`moduleResolution: "bundler"`** - Modern module resolution for bundlers
- **`sourceMap: true`** - Enable debugging with source maps

### Path Aliases (Optional)

For cleaner imports, add path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

Usage:
```typescript
// Instead of: import { something } from '../../../utils/helper'
import { something } from '@utils/helper'
```

---

## Debugging Setup

### VSCode Debugging

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:8000",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Debugging Workflow

1. **Set Breakpoints** - Click in the gutter next to line numbers
2. **Start Debugging** - Press `F5` or click "Run and Debug"
3. **Inspect Variables** - Hover over variables to see values
4. **Step Through Code** - Use `F10` (step over), `F11` (step into)
5. **Watch Expressions** - Add signals to the watch panel

### Debugging Signals

To debug signal values:

```typescript
import { signal, effect } from 'flexium/core'

const count = signal(0)

// Add an effect to log changes (can set breakpoint here)
effect(() => {
  console.log('Count changed:', count.value)
  debugger // Breakpoint here to inspect
})
```

### Browser DevTools

**Useful Tips:**
1. Enable source maps in browser DevTools
2. Use `debugger;` statement for instant breakpoints
3. Use `console.table()` to visualize signal states
4. Install React DevTools (may work for component inspection)

---

## Code Snippets

Flexium provides VSCode code snippets for common patterns.

**Location:** `.vscode/flexium.code-snippets`

### Available Snippets

Type these prefixes and press `Tab`:

| Prefix | Description | Expands To |
|--------|-------------|------------|
| `fsig` | Create a signal | `const name = signal(value)` |
| `fcomp` | Create a computed | `const name = computed(() => ...)` |
| `feff` | Create an effect | `effect(() => { ... })` |
| `fbatch` | Batch updates | `batch(() => { ... })` |
| `fcomponent` | Component boilerplate | Full component structure |
| `frow` | Row layout | `<Row>...</Row>` with props |
| `fcol` | Column layout | `<Column>...</Column>` with props |
| `fmotion` | Motion animation | `<Motion>...</Motion>` with props |
| `fform` | Form with validation | Full form component |

### Custom Snippets

You can add your own snippets to `.vscode/flexium.code-snippets`:

```json
{
  "My Custom Pattern": {
    "prefix": "fmypattern",
    "body": [
      "const ${1:name} = signal(${2:initialValue})",
      "",
      "effect(() => {",
      "  console.log('${1:name}:', ${1:name}.value)",
      "})"
    ],
    "description": "My custom Flexium pattern"
  }
}
```

---

## Troubleshooting

### TypeScript Errors

**Problem:** "Cannot find module 'flexium' or its corresponding type declarations"

**Solution:**
1. Run `npm install` to ensure Flexium is installed
2. Build the project: `npm run build`
3. Restart TypeScript server: `Cmd+Shift+P` > "TypeScript: Restart TS Server"

---

**Problem:** JSX types not recognized

**Solution:**
Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

---

**Problem:** "Property 'value' does not exist on type Signal"

**Solution:**
This usually means TypeScript can't infer the signal type. Add explicit types:
```typescript
// Instead of:
const count = signal(0)

// Use:
const count: Signal<number> = signal(0)
// Or let inference work:
const count = signal<number>(0)
```

---

### ESLint / Prettier Conflicts

**Problem:** ESLint and Prettier fight over formatting

**Solution:**
1. Install `eslint-config-prettier`:
   ```bash
   npm install -D eslint-config-prettier
   ```

2. Update `.eslintrc.json`:
   ```json
   {
     "extends": [
       "eslint:recommended",
       "prettier" // Must be last
     ]
   }
   ```

---

### Import Resolution Issues

**Problem:** Imports not resolving correctly

**Solution:**
1. Check `tsconfig.json` has correct `moduleResolution`
2. Ensure paths match your bundler's configuration
3. For Vite, add to `vite.config.ts`:
   ```typescript
   export default {
     resolve: {
       alias: {
         '@': '/src',
       }
     }
   }
   ```

---

### Performance Issues in IDE

**Problem:** VSCode/WebStorm is slow with Flexium projects

**Solutions:**
1. Exclude unnecessary folders from search:
   ```json
   {
     "files.exclude": {
       "node_modules": true,
       "dist": true,
       ".git": true
     },
     "search.exclude": {
       "node_modules": true,
       "dist": true
     }
   }
   ```

2. Increase TypeScript memory:
   ```json
   {
     "typescript.tsserver.maxTsServerMemory": 4096
   }
   ```

3. Disable extensions you don't need

---

### Source Maps Not Working

**Problem:** Breakpoints don't hit or show wrong line

**Solutions:**
1. Ensure `tsconfig.json` has `"sourceMap": true`
2. Check bundler generates source maps (Vite, webpack, etc.)
3. Clear browser cache
4. Restart debugger

---

## Quick Reference

### Essential Keyboard Shortcuts (VSCode)

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Quick Open File | `Ctrl+P` | `Cmd+P` |
| Find in Files | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Go to Definition | `F12` | `F12` |
| Peek Definition | `Alt+F12` | `Option+F12` |
| Rename Symbol | `F2` | `F2` |
| Format Document | `Shift+Alt+F` | `Shift+Option+F` |
| Toggle Terminal | `` Ctrl+` `` | `` Cmd+` `` |
| Start Debugging | `F5` | `F5` |

---

## Next Steps

1. Install recommended extensions
2. Review code snippets in `.vscode/flexium.code-snippets`
3. Configure debugging with `.vscode/launch.json`
4. Read [BEST_PRACTICES.md](./BEST_PRACTICES.md) for coding patterns
5. Check out [FAQ.md](./FAQ.md) for common questions

---

**Need help?** Open an issue or check the [FAQ](./FAQ.md).
