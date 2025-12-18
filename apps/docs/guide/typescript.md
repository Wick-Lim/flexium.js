---
title: TypeScript Support - Type-Safe Development
description: Flexium's first-class TypeScript support with complete type definitions for components, state, and props.
head:
  - - meta
    - property: og:title
      content: TypeScript Support - Flexium
  - - meta
    - property: og:description
      content: First-class TypeScript support with complete type definitions. Build type-safe reactive applications.
---

# TypeScript Support

Flexium is written in TypeScript and provides first-class type definitions.

## Component Props

Define props interfaces for your components.

```tsx
interface Props {
  name: string;
  age?: number;
}

function User(props: Props) {
  return <div>{props.name} ({props.age})</div>
}
```

## State Typing

`use()` infers types automatically, or you can specify them.

```tsx
const count = useState<number>(0);
const user = useState<User | null>(null);
```

## FNode Children Types

As of v0.4.0, Flexium uses FNode (Flexium Node) as its core element type:

```tsx
import type { FNodeChild, FNode } from 'flexium/core';

// FNodeChild supports: FNode, string, number, boolean, null, undefined, and arrays
type FNodeChild = FNode | string | number | boolean | null | undefined | FNodeChild[];
```

::: tip FNode (Flexium Node)
FNode is not a Virtual DOM node. It's a lightweight descriptor that immediately converts to real DOM with fine-grained reactivity. The "F" stands for Flexium.
:::

This allows for more flexible JSX expressions:

```tsx
function ConditionalRender({ show }: { show: boolean }) {
  return (
    <div>
      {show && <span>Visible</span>}  {/* boolean short-circuit */}
      {null}  {/* safely ignored */}
    </div>
  );
}
```
