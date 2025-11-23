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
