# Flexium Development Agents

This directory contains specialized AI agents for developing the Flexium library. Each agent is an expert in their domain and can be invoked to work on specific aspects of the project.

## Agent Team Structure

### 1. Signal System Architect
**File**: `signal-architect.md`
**Focus**: Core reactive signal system, fine-grained reactivity, no Virtual DOM

**Key Responsibilities**:
- Implement signal(), computed(), effect()
- Dependency tracking and batched updates
- Performance optimization (< 0.1ms updates)
- Zero VDOM overhead

**Invoke when**: Working on reactivity, state management, performance optimization

---

### 2. Layout & Style System Specialist
**File**: `layout-style-system.md`
**Focus**: Flex-first layout primitives, inline style props, responsive design

**Key Responsibilities**:
- Build Row, Column, Stack, Grid components
- Create Tailwind-like prop system
- Responsive breakpoints
- Theme system with CSS variables

**Invoke when**: Working on layout components, styling, responsive design

---

### 3. UX Components Specialist
**File**: `ux-components-specialist.md`
**Focus**: Animations, forms, gestures, accessibility

**Key Responsibilities**:
- Motion component (Web Animations API)
- Form with built-in validation
- Gesture handling (touch, swipe, pinch)
- Accessibility primitives (ARIA, keyboard nav)

**Invoke when**: Working on UX features, animations, form handling, a11y

---

### 4. Cross-Renderer Architecture Specialist
**File**: `cross-renderer-architect.md`
**Focus**: Platform-agnostic components, multi-renderer support

**Key Responsibilities**:
- Renderer interface design
- DOM, Canvas, React Native renderers
- Virtual tree reconciliation
- Platform abstraction layer

**Invoke when**: Working on renderers, cross-platform support, core architecture

---

### 5. Build & Package Configuration Specialist
**File**: `build-package-config.md`
**Focus**: Build system, TypeScript, npm publishing, bundle optimization

**Key Responsibilities**:
- tsup/esbuild configuration
- Package.json exports strategy
- Tree-shaking optimization
- Zero-dependency policy
- Release workflow

**Invoke when**: Setting up build, optimizing bundle size, preparing for npm publish

---

### 6. Documentation & Examples Specialist
**File**: `documentation-examples.md`
**Focus**: Developer experience, examples, tutorials, migration guides

**Key Responsibilities**:
- README and API documentation
- Real-world examples (Todo, Dashboard, Canvas game)
- Migration guides from React/Vue
- Interactive playground
- Performance benchmarks

**Invoke when**: Writing docs, creating examples, onboarding developers

---

## How to Use These Agents

### As a Developer
When working on a specific feature, reference the relevant agent's guidelines:

```bash
# Example: Working on signals
cat .claude/agents/signal-architect.md

# Example: Working on layout
cat .claude/agents/layout-style-system.md
```

### With Claude Code
When using Claude Code, you can reference these agents in your prompts:

```
"Act as the Signal System Architect and implement the core signal() function"
"As the UX Components Specialist, create the Motion component"
"Following the Build & Package Configuration guidelines, set up tsup"
```

### Agent Coordination
For complex features that span multiple domains:

1. **Cross-Renderer Architecture** → defines the structure
2. **Signal System** → provides reactivity
3. **Layout System** → builds primitives
4. **UX Components** → adds interactivity
5. **Build Config** → packages everything
6. **Documentation** → explains it all

## Development Workflow

### Phase 1: Foundation (Weeks 1-2)
- **Lead**: Signal System Architect + Cross-Renderer Architect
- Build core signal system and renderer interface
- Create basic reconciler

### Phase 2: Primitives (Weeks 3-4)
- **Lead**: Layout & Style System Specialist
- Implement Row, Column, Stack, Grid
- Style props system and theming

### Phase 3: UX Features (Weeks 5-6)
- **Lead**: UX Components Specialist
- Motion, Form, Gesture components
- Accessibility features

### Phase 4: Polish & Release (Weeks 7-8)
- **Lead**: Build Config + Documentation
- Bundle optimization, tree-shaking
- Examples, docs, migration guides
- npm publish

## Success Metrics

Each agent has specific success criteria. The overall project succeeds when:

- ✅ Total bundle < 15KB gzipped
- ✅ Signal updates < 0.1ms
- ✅ 60fps animations on mobile
- ✅ Zero runtime dependencies
- ✅ Works on Web + Canvas + React Native
- ✅ Full TypeScript support
- ✅ 10+ production-ready examples
- ✅ Published to npm with 100+ stars in first month

## Philosophy Alignment

All agents follow Flexium's core philosophy:

1. **Flexibility over structure** - Change-friendly
2. **Local-first state** - Minimal global state
3. **Signal-based reactivity** - No Virtual DOM
4. **UX-first components** - Motion/Form/Gesture built-in
5. **Cross-platform ready** - One codebase, multiple targets

## Contact & Coordination

For questions or coordination between agents, create GitHub issues with labels:
- `area:signals` → Signal System Architect
- `area:layout` → Layout & Style System
- `area:ux` → UX Components Specialist
- `area:renderer` → Cross-Renderer Architect
- `area:build` → Build & Package Config
- `area:docs` → Documentation & Examples

---

**Ready to build the future of UI/UX libraries!** 🚀
