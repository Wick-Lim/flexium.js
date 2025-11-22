# Motion & Animations Demo

A comprehensive showcase of Web Animations API integrated with Flexium's reactive signals, demonstrating various animation techniques and patterns.

## Features

### 1. Basic Transitions
- Fade in/out animations
- Slide-in with scale
- Opacity and transform combinations

### 2. Spring Physics
- Bouncy animations
- Shake effects
- Pulse scaling
- Natural feeling motion

### 3. Staggered Animations
- Sequential element animations
- Increasing delays
- Notification-style entrance/exit
- Coordinated multi-element motion

### 4. Drag & Release
- Mouse-based dragging
- Spring-back on release
- Interactive positioning
- Gesture integration

### 5. Complex Keyframes
- Multi-step animations
- Orbit paths
- 3D flips
- Wiggle effects

### 6. Interactive Controls
- Real-time property updates
- Signal-driven transforms
- Slider-controlled animations
- Live property adjustment

## Web Animations API Basics

### Simple Animation

```javascript
element.animate([
  { opacity: 0, transform: 'translateY(20px)' },  // From
  { opacity: 1, transform: 'translateY(0)' }      // To
], {
  duration: 300,
  easing: 'ease-out',
  fill: 'forwards'  // Keep final state
});
```

### Multi-step Keyframes

```javascript
element.animate([
  { transform: 'translateX(0)' },      // 0%
  { transform: 'translateX(100px)' },  // 50%
  { transform: 'translateX(0)' }       // 100%
], {
  duration: 1000,
  easing: 'ease-in-out'
});
```

### Animation Options

```javascript
{
  duration: 500,              // Animation length in ms
  easing: 'ease-out',        // Timing function
  delay: 100,                 // Start delay in ms
  iterations: 2,              // Number of times to repeat
  direction: 'alternate',     // Play direction
  fill: 'forwards',          // Keep final state
  endDelay: 200              // Delay before completion
}
```

## Easing Functions

### Built-in Easings
```javascript
'linear'           // Constant speed
'ease'             // Default, slow start and end
'ease-in'          // Slow start
'ease-out'         // Slow end
'ease-in-out'      // Slow start and end
```

### Custom Cubic Bezier
```javascript
// Spring effect - overshoots and bounces back
'cubic-bezier(0.34, 1.56, 0.64, 1)'

// Smooth deceleration
'cubic-bezier(0.22, 1, 0.36, 1)'

// Anticipation - moves back before forward
'cubic-bezier(0.6, -0.28, 0.735, 0.045)'
```

### Creating Spring Physics

```javascript
// Bouncy spring
const springEasing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

element.animate([
  { transform: 'translateY(0)' },
  { transform: 'translateY(-100px)' },
  { transform: 'translateY(0)' }
], {
  duration: 800,
  easing: springEasing
});
```

## Integration with Flexium Signals

### Reactive Transforms

```javascript
import { signal, effect } from 'flexium';

const x = signal(0);
const y = signal(0);
const rotation = signal(0);

// Automatically update transform when signals change
effect(() => {
  const transform = `translate(${x.value}px, ${y.value}px) rotate(${rotation.value}deg)`;
  element.style.transform = transform;
  element.style.transition = 'transform 0.3s ease-out';
});

// Change values - transform updates automatically
x.value = 100;
rotation.value = 45;
```

### Triggering Animations from Signals

```javascript
const isVisible = signal(false);

effect(() => {
  if (isVisible.value) {
    element.animate([
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 300, easing: 'ease-out' });
  } else {
    element.animate([
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.8)' }
    ], { duration: 200, easing: 'ease-in' });
  }
});

// Toggle visibility - animation runs automatically
isVisible.value = !isVisible.value;
```

## Staggered Animation Pattern

### Sequential Delays

```javascript
elements.forEach((element, index) => {
  element.animate([
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], {
    duration: 400,
    delay: index * 100,  // 100ms delay between each
    easing: 'ease-out',
    fill: 'forwards'
  });
});
```

### With Promises

```javascript
async function staggerIn(elements) {
  for (const element of elements) {
    const animation = element.animate([
      { opacity: 0, transform: 'translateX(-20px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 300, fill: 'forwards' });

    await animation.finished;
    await new Promise(r => setTimeout(r, 50)); // 50ms gap
  }
}
```

## Drag and Drop Pattern

### Basic Implementation

```javascript
let isDragging = false;
let startX, startY, offsetX = 0, offsetY = 0;

element.onmousedown = (e) => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
};

document.onmousemove = (e) => {
  if (!isDragging) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
};

document.onmouseup = () => {
  isDragging = false;

  // Spring back animation
  element.animate([
    { transform: `translate(${offsetX}px, ${offsetY}px)` },
    { transform: 'translate(0, 0)' }
  ], {
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards'
  });
};
```

### With Signals

```javascript
const position = signal({ x: 0, y: 0 });
const isDragging = signal(false);

effect(() => {
  const { x, y } = position.value;
  element.style.transform = `translate(${x}px, ${y}px)`;
});

// Drag handlers update the signal
element.onmousemove = (e) => {
  if (isDragging.value) {
    position.value = { x: e.clientX, y: e.clientY };
  }
};
```

## Advanced Techniques

### Chaining Animations

```javascript
async function chainedAnimation() {
  // First animation
  await element.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(100px)' }
  ], { duration: 500 }).finished;

  // Second animation (after first completes)
  await element.animate([
    { transform: 'translateX(100px) rotate(0deg)' },
    { transform: 'translateX(100px) rotate(360deg)' }
  ], { duration: 500 }).finished;

  // Third animation
  await element.animate([
    { transform: 'translateX(100px)' },
    { transform: 'translateX(0)' }
  ], { duration: 500 }).finished;
}
```

### Parallel Animations

```javascript
// Animate multiple properties independently
const opacityAnim = element.animate([
  { opacity: 0 },
  { opacity: 1 }
], { duration: 1000 });

const scaleAnim = element.animate([
  { transform: 'scale(0.5)' },
  { transform: 'scale(1)' }
], { duration: 800 });

const rotateAnim = element.animate([
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' }
], { duration: 1200 });

// Wait for all to complete
await Promise.all([
  opacityAnim.finished,
  scaleAnim.finished,
  rotateAnim.finished
]);
```

### Controlling Animations

```javascript
const animation = element.animate([...], { duration: 1000 });

animation.pause();                    // Pause
animation.play();                     // Resume
animation.reverse();                  // Play backwards
animation.cancel();                   // Stop and reset
animation.playbackRate = 2;          // Speed up 2x
animation.currentTime = 500;         // Jump to middle

// Listen for events
animation.onfinish = () => console.log('Done!');
animation.oncancel = () => console.log('Cancelled');
```

## Performance Tips

### 1. Use Transform and Opacity
```javascript
// ✅ Good - GPU accelerated
element.animate([
  { transform: 'translateX(100px)', opacity: 0.5 }
], { duration: 300 });

// ❌ Bad - causes reflow/repaint
element.animate([
  { left: '100px', width: '200px' }
], { duration: 300 });
```

### 2. Use will-change for Heavy Animations
```css
.animated-element {
  will-change: transform, opacity;
}
```

### 3. Prefer Composite Properties
- `transform` (translateX, translateY, scale, rotate)
- `opacity`
- `filter`

Avoid animating:
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`

### 4. Batch DOM Reads/Writes
```javascript
// ❌ Bad - causes multiple reflows
elements.forEach(el => {
  const height = el.offsetHeight;  // Read
  el.style.transform = `translateY(${height}px)`; // Write
});

// ✅ Good - batch reads, then writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.transform = `translateY(${heights[i]}px)`;
});
```

## Browser Compatibility

Web Animations API is supported in:
- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

For older browsers, use a polyfill:
```html
<script src="https://cdn.jsdelivr.net/npm/web-animations-js@2.3.2/web-animations.min.js"></script>
```

## Real-World Use Cases

1. **Page Transitions** - Smooth navigation between routes
2. **Loading States** - Spinners, skeletons, progress bars
3. **Notifications** - Toast messages, alerts
4. **Modals** - Slide in/fade in dialogs
5. **List Animations** - Add/remove items with transitions
6. **Drag & Drop** - Interactive reordering
7. **Data Visualization** - Chart animations
8. **Micro-interactions** - Button clicks, hover effects

## Usage

1. Build Flexium: `npm run build`
2. Serve demos: `python3 -m http.server 8000`
3. Open http://localhost:8000/animations/index.html
4. Play with different animations!

## Next Steps

- Combine with **Motion component** for declarative API
- Add **gesture detection** for mobile interactions
- Create **animation presets** library
- Build **transition groups** for lists
