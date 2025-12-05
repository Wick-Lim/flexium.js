---
title: ScrollView - Scrollable Container Component
description: API reference for Flexium's ScrollView component. Create scrollable containers with cross-platform support.
head:
  - - meta
    - property: og:title
      content: ScrollView Component - Flexium API Reference
  - - meta
    - property: og:description
      content: ScrollView component for creating scrollable containers. Universal primitive with vertical and horizontal scroll.
---

# ScrollView

The `ScrollView` component is Flexium's universal primitive for creating scrollable containers. It provides a consistent API for both vertical and horizontal scrolling across web and React Native platforms, with customizable scroll indicators and flexible layout options.

## Overview

On the web, `ScrollView` renders as a `<div>` with `overflow: auto` and flexbox layout, while on React Native it maps to the native `<ScrollView>` component. This abstraction ensures smooth scrolling experiences across all platforms with native performance characteristics.

ScrollView is essential for displaying content that exceeds the viewport or container size, such as long lists, wide tables, image galleries, or any overflowing content.

## Basic Usage

```tsx
import { ScrollView, Column, Text } from 'flexium/primitives';

function App() {
  return (
    <ScrollView style={{ height: 300 }}>
      <Column padding={20} gap={10}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        {/* ... more items */}
      </Column>
    </ScrollView>
  );
}
```

## Props

### children

- **Type:** `any`
- **Required:** No
- **Description:** The scrollable content. Can be any valid React children including components, text, or complex layouts.

```tsx
<ScrollView>
  <Column gap={16}>
    {items.map(item => <Card key={item.id} {...item} />)}
  </Column>
</ScrollView>
```

### horizontal

- **Type:** `boolean`
- **Default:** `false`
- **Description:** If true, enables horizontal scrolling. When false, scrolls vertically.

**Vertical Scrolling (default):**
```tsx
<ScrollView style={{ height: 400 }}>
  <Column gap={16}>
    {items.map(item => <Item key={item} />)}
  </Column>
</ScrollView>
```

**Horizontal Scrolling:**
```tsx
<ScrollView horizontal={true} style={{ height: 200 }}>
  <Row gap={16}>
    {items.map(item => <Card key={item} />)}
  </Row>
</ScrollView>
```

### showsHorizontalScrollIndicator

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether to show the horizontal scrollbar/indicator.

```tsx
<ScrollView
  horizontal={true}
  showsHorizontalScrollIndicator={false}
>
  <Row gap={16}>
    <Card />
    <Card />
    <Card />
  </Row>
</ScrollView>
```

### showsVerticalScrollIndicator

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether to show the vertical scrollbar/indicator.

```tsx
<ScrollView
  showsVerticalScrollIndicator={false}
  style={{ height: 400 }}
>
  <Column gap={16}>
    <Content />
  </Column>
</ScrollView>
```

### style

- **Type:** `CommonStyle`
- **Required:** No (but highly recommended to set height or maxHeight)
- **Description:** Style object for customizing the container appearance and dimensions.

**Important:** For vertical scrolling, you must set a `height` or `maxHeight`. For horizontal scrolling, set `width` or `maxWidth` if needed.

```tsx
<ScrollView
  style={{
    height: 500,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16
  }}
>
  <Content />
</ScrollView>
```

## Examples

### Vertical List

```tsx
<ScrollView style={{ height: 600 }}>
  <Column gap={12} padding={16}>
    {messages.map(message => (
      <Column
        key={message.id}
        gap={4}
        padding={12}
        backgroundColor="#fff"
        borderRadius={8}
      >
        <Text style={{ fontWeight: 'bold' }}>{message.sender}</Text>
        <Text style={{ color: '#666' }}>{message.text}</Text>
        <Text style={{ fontSize: 12, color: '#999' }}>
          {message.timestamp}
        </Text>
      </Column>
    ))}
  </Column>
</ScrollView>
```

### Horizontal Image Gallery

```tsx
<ScrollView
  horizontal={true}
  showsHorizontalScrollIndicator={false}
  style={{ height: 250 }}
>
  <Row gap={16} padding={16}>
    {images.map(img => (
      <Image
        key={img.id}
        src={img.url}
        alt={img.caption}
        width={200}
        height={200}
        style={{ borderRadius: 8, objectFit: 'cover' }}
      />
    ))}
  </Row>
</ScrollView>
```

### Full-Height Scrollable Page

```tsx
<Column style={{ height: '100vh' }}>
  <Row
    padding={16}
    backgroundColor="#fff"
    borderBottom="1px solid #e0e0e0"
  >
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Header</Text>
  </Row>

  <ScrollView style={{ flex: 1 }}>
    <Column padding={20} gap={16}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Page Title
      </Text>
      {sections.map(section => (
        <Section key={section.id} {...section} />
      ))}
    </Column>
  </ScrollView>
</Column>
```

### Horizontal Category Tabs

```tsx
<ScrollView
  horizontal={true}
  showsHorizontalScrollIndicator={false}
  style={{ height: 48 }}
>
  <Row gap={8} padding={12}>
    {categories.map(category => (
      <Pressable
        key={category.id}
        onPress={() => setSelected(category.id)}
        style={{
          padding: '8px 16px',
          backgroundColor: selected === category.id ? '#007bff' : '#f0f0f0',
          borderRadius: 20,
          whiteSpace: 'nowrap'
        }}
      >
        <Text style={{
          color: selected === category.id ? 'white' : '#333'
        }}>
          {category.name}
        </Text>
      </Pressable>
    ))}
  </Row>
</ScrollView>
```

### Modal with Scrollable Content

```tsx
<Column
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  }}
>
  <Row
    justify="between"
    align="center"
    padding={20}
    borderBottom="1px solid #e0e0e0"
  >
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Modal Title</Text>
    <Pressable onPress={onClose}>
      <Icon name="close" size={24} />
    </Pressable>
  </Row>

  <ScrollView style={{ flex: 1, maxHeight: 'calc(90vh - 140px)' }}>
    <Column padding={20} gap={16}>
      <Text>{modalContent}</Text>
    </Column>
  </ScrollView>

  <Row
    justify="end"
    gap={8}
    padding={20}
    borderTop="1px solid #e0e0e0"
  >
    <Button variant="ghost" onPress={onClose}>Cancel</Button>
    <Button variant="primary" onPress={onConfirm}>Confirm</Button>
  </Row>
</Column>
```

### Nested Horizontal Scrolls

```tsx
<ScrollView style={{ height: 600 }}>
  <Column gap={24} padding={20}>
    {sections.map(section => (
      <Column key={section.id} gap={12}>
        <Row justify="between" align="center">
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            {section.title}
          </Text>
          <Text style={{ color: '#007bff', cursor: 'pointer' }}>
            View All
          </Text>
        </Row>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: -20, marginRight: -20 }}
        >
          <Row gap={16} padding="0 20px">
            {section.items.map(item => (
              <Card key={item.id} {...item} />
            ))}
          </Row>
        </ScrollView>
      </Column>
    ))}
  </Column>
</ScrollView>
```

### Chat Messages

```tsx
<Column style={{ height: '100vh' }}>
  <ScrollView
    style={{ flex: 1 }}
    // Auto-scroll to bottom on new messages
    ref={scrollRef}
  >
    <Column gap={12} padding={16}>
      {messages.map(message => (
        <Row
          key={message.id}
          justify={message.isMine ? 'end' : 'start'}
        >
          <Column
            gap={4}
            padding={12}
            backgroundColor={message.isMine ? '#007bff' : '#f0f0f0'}
            borderRadius={12}
            style={{ maxWidth: '70%' }}
          >
            <Text style={{
              color: message.isMine ? 'white' : '#333'
            }}>
              {message.text}
            </Text>
            <Text style={{
              fontSize: 12,
              color: message.isMine ? 'rgba(255,255,255,0.7)' : '#999'
            }}>
              {message.time}
            </Text>
          </Column>
        </Row>
      ))}
    </Column>
  </ScrollView>

  <Row gap={8} padding={16} borderTop="1px solid #e0e0e0">
    <Input
      placeholder="Type a message..."
      style={{ flex: 1 }}
      value={input}
      onChange={e => setInput(e.target.value)}
    />
    <Button variant="primary" onPress={sendMessage}>Send</Button>
  </Row>
</Column>
```

## Common Patterns

### Fixed Header with Scrollable Content

```tsx
<Column style={{ height: '100vh' }}>
  <header style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Header</Text>
  </header>

  <ScrollView style={{ flex: 1 }}>
    <Column padding={20} gap={16}>
      <Content />
    </Column>
  </ScrollView>
</Column>
```

### Sticky Section Headers

```tsx
<ScrollView style={{ height: 600 }}>
  <Column>
    {sections.map(section => (
      <Column key={section.id}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#f5f5f5',
          padding: 12,
          fontWeight: 'bold',
          borderBottom: '1px solid #e0e0e0',
          zIndex: 1
        }}>
          {section.title}
        </div>
        <Column gap={8} padding={12}>
          {section.items.map(item => <Item key={item} />)}
        </Column>
      </Column>
    ))}
  </Column>
</ScrollView>
```

### Infinite Scroll

```tsx
function InfiniteScrollList({ items, loadMore, hasMore }) {
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore) {
      loadMore();
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ height: 600 }}
    >
      <Column gap={12} padding={16}>
        {items.map(item => <Card key={item.id} {...item} />)}
        {hasMore && (
          <Row justify="center" padding={20}>
            <Spinner />
          </Row>
        )}
      </Column>
    </ScrollView>
  );
}
```

### Pull to Refresh

```tsx
function PullToRefreshList({ items, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <ScrollView style={{ height: 600 }}>
      <Column gap={12} padding={16}>
        {refreshing && (
          <Row justify="center" padding={20}>
            <Spinner />
          </Row>
        )}
        {items.map(item => <Card key={item.id} {...item} />)}
      </Column>
    </ScrollView>
  );
}
```

## Accessibility Considerations

### Keyboard Navigation

ScrollView automatically supports keyboard scrolling:
- Arrow keys for incremental scrolling
- Page Up/Down for page scrolling
- Home/End for jumping to top/bottom

```tsx
<ScrollView
  style={{ height: 500 }}
  tabIndex={0} // Make focusable for keyboard navigation
>
  <Content />
</ScrollView>
```

### Screen Reader Announcements

For dynamic content updates:

```tsx
<ScrollView
  style={{ height: 500 }}
  aria-live="polite"
  aria-label="Message list"
>
  <Column gap={12}>
    {messages.map(msg => <Message key={msg.id} {...msg} />)}
  </Column>
</ScrollView>
```

### Focus Management

Maintain focus when scrolling programmatically:

```tsx
function ScrollToItem({ items, selectedId }) {
  const itemRefs = useRef({});

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      itemRefs.current[selectedId].focus();
    }
  }, [selectedId]);

  return (
    <ScrollView style={{ height: 500 }}>
      <Column gap={12}>
        {items.map(item => (
          <div
            key={item.id}
            ref={el => itemRefs.current[item.id] = el}
            tabIndex={-1}
          >
            <Item {...item} />
          </div>
        ))}
      </Column>
    </ScrollView>
  );
}
```

## Styling Best Practices

### Always Set Container Height

For vertical scrolling, always set a height or maxHeight:

```tsx
// Good
<ScrollView style={{ height: 500 }}>
  <Content />
</ScrollView>

// Good - flexible height
<ScrollView style={{ flex: 1, maxHeight: 600 }}>
  <Content />
</ScrollView>

// Avoid - won't scroll
<ScrollView>
  <Content />
</ScrollView>
```

### Custom Scrollbar Styling

Style scrollbars using CSS:

```tsx
<ScrollView
  className="custom-scroll"
  style={{ height: 500 }}
>
  <Content />
</ScrollView>

// In CSS:
// .custom-scroll::-webkit-scrollbar {
//   width: 8px;
// }
// .custom-scroll::-webkit-scrollbar-track {
//   background: #f0f0f0;
// }
// .custom-scroll::-webkit-scrollbar-thumb {
//   background: #888;
//   border-radius: 4px;
// }
```

### Smooth Scrolling

Enable smooth scrolling behavior:

```tsx
<ScrollView
  style={{
    height: 500,
    scrollBehavior: 'smooth'
  }}
>
  <Content />
</ScrollView>
```

## Edge Cases and Gotchas

### Overflow Direction

ScrollView sets overflow based on `horizontal` prop:
- `horizontal={false}`: `overflowY: 'auto'`, `overflowX: 'hidden'`
- `horizontal={true}`: `overflowX: 'auto'`, `overflowY: 'hidden'`

```tsx
// Vertical only
<ScrollView style={{ height: 400 }}>
  <WideContent /> {/* Won't scroll horizontally */}
</ScrollView>

// Horizontal only
<ScrollView horizontal={true} style={{ height: 200 }}>
  <TallContent /> {/* Won't scroll vertically */}
</ScrollView>
```

### Flexbox Layout

ScrollView uses flexbox internally:
- `display: 'flex'`
- `flexDirection: horizontal ? 'row' : 'column'`

This affects child layout:

```tsx
<ScrollView horizontal={true}>
  <Row gap={16}> {/* Children arranged in row */}
    <Card />
    <Card />
  </Row>
</ScrollView>
```

### Nested ScrollViews

Avoid deeply nested ScrollViews as they can cause scrolling conflicts:

```tsx
// Avoid - confusing scroll behavior
<ScrollView>
  <ScrollView>
    <Content />
  </ScrollView>
</ScrollView>

// Better - use different scroll directions if needed
<ScrollView style={{ height: 600 }}>
  <Column gap={20}>
    <ScrollView horizontal={true} style={{ height: 200 }}>
      <Row gap={16}>
        <Card />
      </Row>
    </ScrollView>
  </Column>
</ScrollView>
```

### Scroll Indicator Limitations

Note: `showsHorizontalScrollIndicator` and `showsVerticalScrollIndicator` may have limited effect on web browsers, as scrollbar appearance is often controlled by the browser or OS.

## Performance Tips

### Virtualization for Long Lists

For very long lists, consider virtualization:

```tsx
import { VirtualList } from 'flexium';

// Instead of ScrollView with many items
<VirtualList
  items={thousands}
  itemHeight={60}
  containerHeight={600}
  renderItem={item => <Card {...item} />}
/>
```

### Lazy Loading Images

Defer loading of off-screen images:

```tsx
<ScrollView style={{ height: 600 }}>
  <Column gap={16}>
    {items.map(item => (
      <Image
        key={item.id}
        src={item.image}
        alt={item.title}
        loading="lazy"
        width={300}
        height={200}
      />
    ))}
  </Column>
</ScrollView>
```

### Debounce Scroll Events

Optimize scroll event handlers:

```tsx
function ScrollableList() {
  const handleScroll = useMemo(
    () => debounce((e) => {
      console.log('Scrolled', e.currentTarget.scrollTop);
    }, 100),
    []
  );

  return (
    <ScrollView onScroll={handleScroll} style={{ height: 500 }}>
      <Content />
    </ScrollView>
  );
}
```

### Memoize Content

Prevent unnecessary re-renders of scrollable content:

```tsx
const MemoizedContent = memo(({ items }) => (
  <Column gap={12}>
    {items.map(item => <Card key={item.id} {...item} />)}
  </Column>
));

<ScrollView style={{ height: 500 }}>
  <MemoizedContent items={items} />
</ScrollView>
```

## Advanced Examples

### Programmatic Scrolling

```tsx
function ScrollToTopButton() {
  const scrollRef = useRef(null);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <ScrollView ref={scrollRef} style={{ height: 600 }}>
        <Column gap={16} padding={20}>
          <Content />
        </Column>
      </ScrollView>

      <Pressable
        onPress={scrollToTop}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#007bff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <Icon name="arrow-up" color="white" size={24} />
      </Pressable>
    </>
  );
}
```

### Scroll Spy Navigation

```tsx
function ScrollSpyDoc() {
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef({});

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;

    // Find which section is currently in view
    Object.entries(sectionRefs.current).forEach(([id, ref]) => {
      if (ref && ref.offsetTop <= scrollTop + 100) {
        setActiveSection(id);
      }
    });
  };

  return (
    <Row style={{ height: '100vh' }}>
      <Column
        width={200}
        padding={20}
        backgroundColor="#f5f5f5"
        borderRight="1px solid #e0e0e0"
      >
        {sections.map(section => (
          <Text
            key={section.id}
            style={{
              padding: 8,
              fontWeight: activeSection === section.id ? 'bold' : 'normal',
              color: activeSection === section.id ? '#007bff' : '#333',
              cursor: 'pointer'
            }}
            onClick={() => {
              sectionRefs.current[section.id]?.scrollIntoView({
                behavior: 'smooth'
              });
            }}
          >
            {section.title}
          </Text>
        ))}
      </Column>

      <ScrollView
        onScroll={handleScroll}
        style={{ flex: 1 }}
      >
        <Column gap={40} padding={40}>
          {sections.map(section => (
            <div
              key={section.id}
              ref={el => sectionRefs.current[section.id] = el}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
                {section.title}
              </Text>
              <Text>{section.content}</Text>
            </div>
          ))}
        </Column>
      </ScrollView>
    </Row>
  );
}
```

## Related Components

- [Column](/reference/primitives/column) - Vertical layout container (use inside ScrollView)
- [Row](/reference/primitives/row) - Horizontal layout container (use inside ScrollView)
- [Image](/reference/primitives/image) - Images with lazy loading support
- [VirtualList](/reference/components/virtual-list) - Optimized for very long lists
