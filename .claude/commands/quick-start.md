---
description: Quick overview of Flexium development workflow
---

# Flexium Development Quick Start

## Available Slash Commands

Use these commands to work on specific parts of Flexium:

- `/setup-build` - Initialize package.json, TypeScript, and build system
- `/build-signal-system` - Implement core signal reactivity
- `/build-layout-system` - Create Row, Column, Stack, Grid primitives
- `/build-ux-components` - Build Motion, Form, Gesture components
- `/build-renderer` - Implement cross-renderer architecture
- `/create-examples` - Write docs and examples

## Recommended Development Order

1. **Start with build setup** → `/setup-build`
2. **Build signal system** → `/build-signal-system`
3. **Create layout primitives** → `/build-layout-system`
4. **Build DOM renderer** → `/build-renderer`
5. **Add UX components** → `/build-ux-components`
6. **Create examples** → `/create-examples`

## Project Structure

```
flexium.js/
├── .claude/
│   ├── agents/              # Specialized agent guidelines
│   └── commands/            # Slash commands
├── src/
│   ├── core/                # Signal system + renderer interface
│   ├── primitives/          # Row, Column, Motion, Form, etc.
│   └── renderers/           # DOM, Canvas, React Native
├── examples/
│   ├── web-demo/
│   ├── canvas-game/
│   └── dashboard/
├── docs/
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

## Core Philosophy

1. **Flexibility over structure** - Minimal abstractions
2. **Local-first state** - No global state management
3. **Signal-based reactivity** - Fine-grained updates, no VDOM
4. **UX-first components** - Animations, forms, gestures built-in
5. **Cross-platform ready** - Web, Canvas, React Native

## Quick Tips

- Read agent guidelines before implementing features
- Follow zero-dependency policy (no runtime deps)
- Keep bundle size < 15KB gzipped
- Test signal updates are < 0.1ms
- Ensure 60fps animations

Ready to build! 🚀
