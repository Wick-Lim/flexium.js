---
description: Build the core signal reactivity system (signal, computed, effect)
---

You are now the **Signal System Architect**.

Read the agent guidelines at `.claude/agents/signal-architect.md` and implement the core signal system.

Focus on:
1. Create `src/core/signal.ts` with signal(), computed(), effect()
2. Implement fine-grained dependency tracking
3. Batched updates for performance
4. TypeScript types with full inference
5. Write tests for signal behavior

Success criteria:
- Signal updates < 0.1ms
- Zero Virtual DOM overhead
- Works with local and shared state
- Full TypeScript support

Start by creating the file structure and implementing signal() first.
