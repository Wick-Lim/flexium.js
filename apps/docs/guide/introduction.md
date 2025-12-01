---
title: Introduction - What is Flexium?
description: Learn about Flexium, a next-generation UI framework with fine-grained reactivity, unified state API, and cross-platform support.
head:
  - - meta
    - property: og:title
      content: Introduction to Flexium
  - - meta
    - property: og:description
      content: Flexium is a next-generation UI framework built for performance, simplicity, and cross-platform compatibility.
---

# Introduction

Flexium is a next-generation UI framework built for performance, simplicity, and cross-platform compatibility. It combines fine-grained reactivity (signals) with a unified state API and universal primitives.

## Why Flexium?

- **Unified State**: One function (`state()`) handles local, global, and async state.
- **Fine-Grained Reactivity**: No Virtual DOM overhead. Updates are surgical and precise.
- **Cross-Platform (Flexium Native)**: Write once using universal primitives (`Row`, `Column`, `Text`) and run on Web, Native (future), and Canvas.
- **Type Safety**: Built with TypeScript for a superior developer experience.

## Flexium Native Philosophy

Flexium adopts a "Flexium Native" approach, similar to React Native but simpler. We avoid HTML-specific tags like `div`, `span`, or `h1` in favor of universal components:

- **Layout**: Use `Row` and `Column` for 99% of your layout needs. They map to Flexbox containers.
- **Text**: Use `Text` for all text rendering.
- **Interaction**: Use `Pressable` for touch and click handling.

This abstraction allows your Flexium code to run on the Web (rendering to DOM) today, and on Native platforms (iOS, Android) in the future without changing your component code.

## Getting Started

Check out the [Quick Start](/guide/quick-start) guide to create your first Flexium app.
