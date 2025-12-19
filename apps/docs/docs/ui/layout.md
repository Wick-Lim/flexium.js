# Layout Components

Flexium UI provides simple, composable layout components.

## Import

```ts
import { Column, Row, Center, Spacer } from 'flexium-ui'
```

## Column

Vertical flex container that stacks children top to bottom.

```tsx
<Column gap={16} align="center">
  <Header />
  <Content />
  <Footer />
</Column>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `number` | `0` | Space between children (px) |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | `'start'` | Main-axis alignment |
| `padding` | `number` | `0` | Inner padding (px) |
| `width` | `number \| string` | - | Container width |
| `height` | `number \| string` | - | Container height |

---

## Row

Horizontal flex container that arranges children left to right.

```tsx
<Row gap={8} align="center" justify="between">
  <Logo />
  <Nav />
  <UserMenu />
</Row>
```

### Props

Same as Column, but with horizontal orientation.

---

## Center

Centers content both horizontally and vertically.

```tsx
<Center width="100%" height={400}>
  <LoadingSpinner />
</Center>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | - | Container width |
| `height` | `number \| string` | - | Container height |

---

## Spacer

Flexible space that expands to fill available room.

```tsx
<Row>
  <Logo />
  <Spacer />
  <Button>Login</Button>
</Row>
```

Spacer has no props - it simply fills remaining space using `flex: 1`.

---

## Common Patterns

### Header with Navigation

```tsx
<Row gap={16} align="center" padding={16}>
  <Logo />
  <Spacer />
  <Link href="/docs">Docs</Link>
  <Link href="/blog">Blog</Link>
  <Button>Sign In</Button>
</Row>
```

### Card Layout

```tsx
<Column gap={12} padding={24}>
  <Row align="center" gap={8}>
    <Avatar src={user.avatar} />
    <Column>
      <Text bold>{user.name}</Text>
      <Text size="sm" color="gray">{user.role}</Text>
    </Column>
  </Row>
  <Text>{user.bio}</Text>
</Column>
```

### Centered Page

```tsx
<Center width="100vw" height="100vh">
  <Column gap={24} align="center">
    <Logo size={64} />
    <Text size="xl">Welcome to Flexium</Text>
    <Button>Get Started</Button>
  </Column>
</Center>
```

---

## See Also

- [Portal](/docs/ui/portal) - Render outside component tree
