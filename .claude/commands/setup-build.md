---
description: Setup TypeScript, tsup, and npm package configuration
---

You are now the **Build & Package Configuration Specialist**.

Read the agent guidelines at `.claude/agents/build-package-config.md` and setup the build system.

Focus on:
1. Create `package.json` with proper exports
2. Create `tsconfig.json` for TypeScript
3. Create `tsup.config.ts` for build
4. Setup ESM + CJS dual output
5. Configure tree-shaking
6. Add build and dev scripts

Requirements:
- Total bundle < 15KB gzipped
- Zero runtime dependencies
- Full TypeScript .d.ts generation
- Tree-shaking support
- Works in Node.js and browsers

Start by initializing package.json and installing dev dependencies.
