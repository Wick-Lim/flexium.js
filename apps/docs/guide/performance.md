---
title: Performance - Optimization Guide
description: Learn how Flexium achieves high performance with fine-grained updates, no Virtual DOM, and automatic optimizations.
head:
  - - meta
    - property: og:title
      content: Performance Optimization - Flexium
  - - meta
    - property: og:description
      content: High performance by default with fine-grained reactivity. No Virtual DOM overhead, surgical DOM updates.
---

# Performance

Flexium is designed for high performance by default.

## Fine-Grained Updates

Because Flexium uses signals, updates are pinpointed. If a state changes, only the specific text node or attribute bound to that state updates.

## No Virtual DOM

There is no Virtual DOM overhead. No diffing phase. This reduces memory usage and CPU cycles significantly.

## Benchmarks

(Coming Soon)
