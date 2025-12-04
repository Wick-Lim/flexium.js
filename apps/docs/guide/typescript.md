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

`state()` infers types automatically, or you can specify them.

```tsx
const [count, setCount] = state<number>(0);
const [user, setUser] = state<User | null>(null);
```

## VNode Children Types

As of v0.3.1, Flexium provides improved type definitions for virtual node children:

```tsx
import type { VNodeChild, VNode } from 'flexium';

// VNodeChild supports: VNode, string, number, boolean, null, undefined, and arrays
type VNodeChild = VNode | string | number | boolean | null | undefined | VNodeChild[];
```

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
