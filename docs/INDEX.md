# Flexium Documentation Index

Complete guide to all Flexium documentation and resources.

## Getting Started

**New to Flexium?** Start here:

1. [README.md](../README.md) - Project overview and quick start
2. [DEVELOPER_EXPERIENCE.md](./DEVELOPER_EXPERIENCE.md) - Complete setup guide
3. [IDE_SETUP.md](./IDE_SETUP.md) - Configure your editor
4. [Examples](../examples/) - Working code examples

## Core Documentation

### Essential Reading

| Document | Description | Audience |
|----------|-------------|----------|
| [API.md](./API.md) | Complete API reference | All developers |
| [BEST_PRACTICES.md](./BEST_PRACTICES.md) | Patterns and best practices | All developers |
| [FAQ.md](./FAQ.md) | Common questions and troubleshooting | All developers |
| [RECIPES.md](./RECIPES.md) | "How do I..." cookbook | All developers |

### Developer Resources

| Document | Description | Audience |
|----------|-------------|----------|
| [IDE_SETUP.md](./IDE_SETUP.md) | VSCode and WebStorm setup | All developers |
| [DEVELOPER_EXPERIENCE.md](./DEVELOPER_EXPERIENCE.md) | Development workflow | All developers |
| [MIGRATION.md](./MIGRATION.md) | Migrate from React/Vue/Svelte | Existing framework users |

### Project Information

| Document | Description | Audience |
|----------|-------------|----------|
| [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) | Current status and roadmap | Contributors, users |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution guidelines | Contributors |
| [CHANGELOG.md](../CHANGELOG.md) | Version history | All users |

## GitHub Resources

Located in `.github/` directory:

| File | Purpose |
|------|---------|
| [ISSUE_TEMPLATE.md](../.github/ISSUE_TEMPLATE.md) | Bug reports and feature requests |
| [PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) | PR submission guidelines |
| [CONTRIBUTING_QUICK_START.md](../.github/CONTRIBUTING_QUICK_START.md) | Quick start for contributors |
| [FUNDING.yml](../.github/FUNDING.yml) | Funding and sponsorship info |

## VSCode Configuration

Located in `.vscode/` directory:

| File | Purpose |
|------|---------|
| [settings.json](../.vscode/settings.json) | Project settings |
| [extensions.json](../.vscode/extensions.json) | Recommended extensions |
| [launch.json](../.vscode/launch.json) | Debug configurations |
| [tasks.json](../.vscode/tasks.json) | Build and test tasks |
| [flexium.code-snippets](../.vscode/flexium.code-snippets) | Code snippets |
| [README.md](../.vscode/README.md) | VSCode setup guide |

## Examples

Located in `examples/` directory:

| Example | Description | Demonstrates |
|---------|-------------|--------------|
| [Counter](../examples/counter/) | Simple counter | Basic signals and reactivity |
| [Todo App](../examples/todo/) | Todo list with filters | State management, lists, Motion |
| [Dashboard](../examples/dashboard/) | Responsive dashboard | Grid layout, data fetching |
| [Simple Counter](../examples/simple-counter/) | Minimal standalone demo | Getting started |

## Documentation by Topic

### Reactivity

- **Signals:** [API.md#signal](./API.md), [BEST_PRACTICES.md#signal-patterns](./BEST_PRACTICES.md#signal-patterns)
- **Computed:** [API.md#computed](./API.md), [FAQ.md#when-should-i-use-signal-vs-computed](./FAQ.md#signals--reactivity)
- **Effects:** [API.md#effect](./API.md), [RECIPES.md#data-fetching](./RECIPES.md#data-fetching)
- **Batching:** [API.md#batch](./API.md), [BEST_PRACTICES.md#use-batch-for-multiple-updates](./BEST_PRACTICES.md#signal-patterns)

### Components

- **Component Structure:** [BEST_PRACTICES.md#component-structure](./BEST_PRACTICES.md#component-structure)
- **Props vs Signals:** [BEST_PRACTICES.md#props-vs-signals](./BEST_PRACTICES.md#component-structure)
- **Event Handling:** [FAQ.md#how-do-i-handle-events](./FAQ.md#components--jsx)
- **Conditional Rendering:** [FAQ.md#can-i-use-conditional-rendering](./FAQ.md#components--jsx)

### Layout & UI

- **Row/Column:** [API.md#layout-primitives](./API.md), Examples: [Dashboard](../examples/dashboard/)
- **Grid:** [API.md#grid](./API.md), [RECIPES.md#lists--tables](./RECIPES.md#lists--tables)
- **Motion:** [API.md#motion](./API.md), [RECIPES.md#animations](./RECIPES.md#animations)
- **Form:** [API.md#form](./API.md), [RECIPES.md#forms--validation](./RECIPES.md#forms--validation)

### Development

- **Testing:** [BEST_PRACTICES.md#testing-strategies](./BEST_PRACTICES.md#testing-strategies)
- **Debugging:** [IDE_SETUP.md#debugging-setup](./IDE_SETUP.md#debugging-setup)
- **Performance:** [BEST_PRACTICES.md#performance-tips](./BEST_PRACTICES.md#performance-tips)
- **Code Quality:** [DEVELOPER_EXPERIENCE.md#code-quality-tools](./DEVELOPER_EXPERIENCE.md#code-quality-tools)

### Migration

- **From React:** [MIGRATION.md#from-react](./MIGRATION.md), [FAQ.md#how-do-i-migrate-from-react](./FAQ.md#migration--comparison)
- **From Vue:** [MIGRATION.md#from-vue](./MIGRATION.md)
- **From Svelte:** [MIGRATION.md#from-svelte](./MIGRATION.md)

## Quick Reference

### Installation

```bash
npm install flexium
```

### Basic Usage

```typescript
import { signal, computed, effect } from 'flexium'
import { render } from 'flexium/dom'

const count = signal(0)
const doubled = computed(() => count.value * 2)

effect(() => console.log('Count:', count.value))

const App = () => (
  <div>
    <p>Count: {count.value}</p>
    <p>Doubled: {doubled.value}</p>
    <button onclick={() => count.value++}>Increment</button>
  </div>
)

render(<App />, document.getElementById('root')!)
```

### Code Snippets (VSCode)

- `fsig` - Signal
- `fcomp` - Computed
- `feff` - Effect
- `fcomponent` - Component
- `frow` - Row layout
- `fcol` - Column layout
- `fmotion` - Motion animation
- `fform` - Form with validation

See [.vscode/flexium.code-snippets](../.vscode/flexium.code-snippets) for all snippets.

### Common Commands

```bash
npm run dev        # Watch mode
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Check code quality
npm run format     # Format code
npm run typecheck  # Type checking
```

## Learning Path

### Beginner

1. Read [README.md](../README.md)
2. Follow [Quick Start](../README.md#quick-start)
3. Try [Simple Counter Example](../examples/simple-counter/)
4. Read [FAQ.md](./FAQ.md)
5. Explore [RECIPES.md](./RECIPES.md)

### Intermediate

1. Study [BEST_PRACTICES.md](./BEST_PRACTICES.md)
2. Build [Todo App Example](../examples/todo/)
3. Learn [API.md](./API.md) in depth
4. Read [Component Structure](./BEST_PRACTICES.md#component-structure)
5. Understand [Performance Tips](./BEST_PRACTICES.md#performance-tips)

### Advanced

1. Study [Signal Implementation](../src/core/signal.ts)
2. Understand [Renderer Architecture](../src/core/renderer.ts)
3. Read [Architecture Patterns](./BEST_PRACTICES.md#architecture-patterns)
4. Contribute to development ([CONTRIBUTING.md](../CONTRIBUTING.md))
5. Build custom renderers

## Contributing

Want to contribute? Start here:

1. [CONTRIBUTING_QUICK_START.md](../.github/CONTRIBUTING_QUICK_START.md) - 5-minute setup
2. [CONTRIBUTING.md](../CONTRIBUTING.md) - Full guidelines
3. [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) - Current status
4. [GitHub Issues](https://github.com/Wick-Lim/flexium.js/issues) - What to work on

## Support

### Getting Help

1. **Check documentation** - Start with [FAQ.md](./FAQ.md)
2. **Search issues** - [GitHub Issues](https://github.com/Wick-Lim/flexium.js/issues)
3. **Ask questions** - [GitHub Discussions](https://github.com/Wick-Lim/flexium.js/discussions)
4. **Report bugs** - Use [issue template](../.github/ISSUE_TEMPLATE.md)

### Community

- GitHub Discussions - Q&A and community chat
- GitHub Issues - Bug reports and feature requests
- Twitter - Follow @flexiumjs (example)

## Architecture

For deep dives into the architecture:

- [Signal System](../src/core/signal.ts) - Fine-grained reactivity
- [Renderer Interface](../src/core/renderer.ts) - Platform-agnostic rendering
- [DOM Renderer](../src/renderers/dom/) - Web implementation
- [Primitives](../src/primitives/) - UI components

## Project Status

**Current Version:** 0.3.0

**Status:** Early development

See [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) for:
- What's working
- What's planned
- Known issues
- Roadmap

## License

MIT License - See [LICENSE](../LICENSE)

---

## Document Maintenance

This index is maintained to help developers find information quickly.

**Last Updated:** 2025-11-22

**Maintainers:** If you add new documentation, please update this index.

**Missing something?** Open an issue or PR to improve this index.

---

**Happy developing with Flexium!**
