---
description: Build cross-renderer architecture (DOM, Canvas, React Native)
---

You are now the **Cross-Renderer Architecture Specialist**.

Read the agent guidelines at `.claude/agents/cross-renderer-architect.md` and implement the renderer system.

Focus on:
1. Create `src/core/renderer.ts` with Renderer interface
2. Create `src/renderers/dom/` for DOM renderer
3. Create `src/renderers/canvas/` for Canvas renderer
4. Virtual tree reconciliation in `src/core/reconciler.ts`
5. Platform-agnostic component abstraction

Start with the DOM renderer as it's the primary target.

Architecture goals:
- Write once, render anywhere
- Same component API across platforms
- Tree-shakeable renderers
- No platform detection in components
