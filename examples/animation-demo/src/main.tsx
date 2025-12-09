/**
 * Flexium Animation/Motion Demo
 *
 * Demonstrates the Motion and Transition components with:
 * - Motion component with keyframes
 * - Transition component for state-based animations
 * - Enter/exit animations
 * - Staggered animations
 * - Spring physics animations
 * - Easing functions
 * - Animation controls (play, pause, reverse)
 */

import { signal, computed, effect, onMount } from 'flexium'
import { render } from 'flexium/dom'
import { Show, For } from 'flexium'
import {
  Transition,
  TransitionGroup,
  transitions,
  MotionController,
  type AnimatableProps
} from 'flexium'

// ============================================================================
// State Management
// ============================================================================

const showBasicMotion = signal(true)
const showTransition = signal(true)
const showNotification = signal(false)
const notificationType = signal<'success' | 'error' | 'warning' | 'info'>('success')

const items = signal([
  { id: 1, name: 'Item 1', description: 'First item with stagger animation' },
  { id: 2, name: 'Item 2', description: 'Second item with stagger animation' },
  { id: 3, name: 'Item 3', description: 'Third item with stagger animation' },
  { id: 4, name: 'Item 4', description: 'Fourth item with stagger animation' },
])

const springConfig = signal({
  tension: 170,
  friction: 26,
  mass: 1,
})

const currentPreset = signal<keyof typeof transitions>('fade')
const springBallPosition = signal(0)

// ============================================================================
// Demo 1: Basic Motion with Keyframes
// ============================================================================

function BasicMotionDemo() {
  let boxRef: HTMLDivElement | null = null
  let controller: MotionController | null = null

  onMount(() => {
    if (boxRef) {
      controller = new MotionController(boxRef)
    }

    return () => {
      controller?.dispose()
    }
  })

  const animateScale = () => {
    controller?.animate({
      initial: { scale: 1 },
      animate: { scale: 1.5 },
      duration: 500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }

  const animateRotate = () => {
    controller?.animate({
      initial: { rotate: 0 },
      animate: { rotate: 360 },
      duration: 800,
      easing: 'ease-out',
    })
  }

  const animatePosition = () => {
    controller?.animate({
      initial: { x: 0, y: 0 },
      animate: { x: 100, y: -50 },
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    })
  }

  const animateCombined = () => {
    controller?.animate({
      initial: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
      animate: { x: 100, y: -50, scale: 1.3, rotate: 180, opacity: 0.7 },
      duration: 1000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }

  const reset = () => {
    controller?.animate({
      animate: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
      duration: 400,
      easing: 'ease-out',
    })
  }

  return (
    <div class="demo-section">
      <h3>Basic Motion with Keyframes</h3>
      <div class="info-box">
        Use the <code>MotionController</code> to animate individual properties like position, scale, rotation, and opacity.
        The Motion API uses the Web Animations API under the hood for optimal performance.
      </div>

      <div class="demo-area">
        <div
          class="animated-box"
          ref={(el: HTMLDivElement) => { boxRef = el }}
        >
          Box
        </div>
      </div>

      <div class="controls">
        <button onClick={animateScale}>Scale</button>
        <button onClick={animateRotate}>Rotate</button>
        <button onClick={animatePosition}>Move</button>
        <button onClick={animateCombined}>Combined</button>
        <button class="secondary" onClick={reset}>Reset</button>
      </div>

      <pre>{`// Animate with MotionController
const controller = new MotionController(element)

controller.animate({
  initial: { scale: 1, rotate: 0 },
  animate: { scale: 1.5, rotate: 360 },
  duration: 500,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
})`}</pre>
    </div>
  )
}

// ============================================================================
// Demo 2: Transition Component with Presets
// ============================================================================

function TransitionPresetDemo() {
  const presets: Array<keyof typeof transitions> = [
    'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight',
    'scale', 'scaleFade', 'modal', 'dropdown', 'tooltip'
  ]

  return (
    <div class="demo-section">
      <h3>Transition Component with Presets</h3>
      <div class="info-box">
        The <code>Transition</code> component provides easy enter/exit animations with built-in presets
        or custom keyframes. It automatically handles element mounting and unmounting.
      </div>

      <div class="controls">
        <label>
          Preset:
          <select
            value={currentPreset.value}
            onChange={(e: Event) => {
              const target = e.target as HTMLSelectElement
              currentPreset.value = target.value as keyof typeof transitions
            }}
            style="margin-left: 10px; padding: 8px; border-radius: 4px; border: 1px solid #ddd;"
          >
            {presets.map(preset => (
              <option value={preset}>{preset}</option>
            ))}
          </select>
        </label>
        <button onClick={() => { showTransition.value = !showTransition.value }}>
          Toggle ({showTransition.value ? 'Hide' : 'Show'})
        </button>
      </div>

      <div class="demo-area">
        <Show when={showTransition.value}>
          <Transition {...transitions[currentPreset.value]}>
            <div class="animated-card">
              <h4 style="color: #667eea; margin-bottom: 10px;">Animated Card</h4>
              <p style="color: #666;">
                This card animates using the <strong>{currentPreset.value}</strong> preset.
                Toggle visibility to see the enter and exit animations.
              </p>
            </div>
          </Transition>
        </Show>
      </div>

      <pre>{`// Using Transition with presets
<Show when={visible}>
  <Transition preset="fade">
    <div>Content with fade animation</div>
  </Transition>
</Show>

// Or use predefined transition configs
<Transition {...transitions.modal}>
  <div>Modal with custom timing</div>
</Transition>`}</pre>
    </div>
  )
}

// ============================================================================
// Demo 3: Enter/Exit Animations
// ============================================================================

function EnterExitDemo() {
  return (
    <div class="demo-section">
      <h3>Enter/Exit Animations</h3>
      <div class="info-box">
        Create smooth enter and exit animations with different timings and easing functions.
        Perfect for modals, notifications, and dynamic content.
      </div>

      <div class="controls">
        <button
          class="success"
          onClick={() => {
            notificationType.value = 'success'
            showNotification.value = true
            setTimeout(() => { showNotification.value = false }, 3000)
          }}
        >
          Success Notification
        </button>
        <button
          class="danger"
          onClick={() => {
            notificationType.value = 'error'
            showNotification.value = true
            setTimeout(() => { showNotification.value = false }, 3000)
          }}
        >
          Error Notification
        </button>
        <button
          class="warning"
          onClick={() => {
            notificationType.value = 'warning'
            showNotification.value = true
            setTimeout(() => { showNotification.value = false }, 3000)
          }}
        >
          Warning Notification
        </button>
      </div>

      <Show when={showNotification.value}>
        <Transition
          enter={{ opacity: 0, x: 100, scale: 0.9 }}
          enterTo={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          enterTiming={{ duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          exitTiming={{ duration: 200, easing: 'ease-in' }}
        >
          <div class={`notification ${notificationType.value}`}>
            <h4 style="margin-bottom: 8px; color: #333;">
              {notificationType.value === 'success' ? 'Success!' :
               notificationType.value === 'error' ? 'Error!' : 'Warning!'}
            </h4>
            <p style="color: #666; font-size: 14px;">
              This notification animates in from the right and exits smoothly.
            </p>
          </div>
        </Transition>
      </Show>

      <pre>{`// Custom enter/exit animations
<Transition
  enter={{ opacity: 0, x: 100, scale: 0.9 }}
  enterTo={{ opacity: 1, x: 0, scale: 1 }}
  exit={{ opacity: 0, x: 100, scale: 0.9 }}
  enterTiming={{ duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
  exitTiming={{ duration: 200, easing: 'ease-in' }}
>
  <Notification />
</Transition>`}</pre>
    </div>
  )
}

// ============================================================================
// Demo 4: Staggered Animations
// ============================================================================

function StaggeredAnimationsDemo() {
  const addItem = () => {
    const newId = Math.max(...items.value.map(i => i.id), 0) + 1
    items.value = [
      ...items.value,
      {
        id: newId,
        name: `Item ${newId}`,
        description: `Added item with stagger animation`
      }
    ]
  }

  const removeItem = () => {
    if (items.value.length > 0) {
      items.value = items.value.slice(0, -1)
    }
  }

  const shuffleItems = () => {
    items.value = [...items.value].sort(() => Math.random() - 0.5)
  }

  return (
    <div class="demo-section">
      <h3>Staggered Animations</h3>
      <div class="info-box">
        Use <code>TransitionGroup</code> with the <code>stagger</code> prop to create beautiful
        cascading animations for lists and grids.
      </div>

      <div class="controls">
        <button class="success" onClick={addItem}>Add Item</button>
        <button class="danger" onClick={removeItem}>Remove Item</button>
        <button class="secondary" onClick={shuffleItems}>Shuffle</button>
      </div>

      <div class="stagger-container">
        <TransitionGroup stagger={100}>
          <For each={items.value}>
            {(item) => (
              <Transition
                enter={{ opacity: 0, x: -50, scale: 0.9 }}
                enterTo={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                enterTiming={{ duration: 400, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                exitTiming={{ duration: 300, easing: 'ease-in' }}
              >
                <div class="animated-item">
                  <strong>{item.name}</strong> - {item.description}
                </div>
              </Transition>
            )}
          </For>
        </TransitionGroup>
      </div>

      <pre>{`// Staggered list animations
<TransitionGroup stagger={100}>
  <For each={items}>
    {(item) => (
      <Transition preset="slideLeft">
        <div>{item.name}</div>
      </Transition>
    )}
  </For>
</TransitionGroup>`}</pre>
    </div>
  )
}

// ============================================================================
// Demo 5: Spring Physics Animations
// ============================================================================

function SpringPhysicsDemo() {
  let springBallRef: HTMLDivElement | null = null
  let springController: MotionController | null = null

  onMount(() => {
    if (springBallRef) {
      springController = new MotionController(springBallRef)
    }

    return () => {
      springController?.dispose()
    }
  })

  const animateWithSpring = () => {
    springController?.animate({
      initial: { x: springBallPosition.value },
      animate: { x: springBallPosition.value + 200 },
      spring: springConfig.value,
      onAnimationComplete: () => {
        springBallPosition.value += 200
      }
    })
  }

  const resetBall = () => {
    springController?.animate({
      animate: { x: 0 },
      spring: { tension: 170, friction: 26, mass: 1 },
      onAnimationComplete: () => {
        springBallPosition.value = 0
      }
    })
  }

  const presets = [
    { name: 'Default', tension: 170, friction: 26, mass: 1 },
    { name: 'Gentle', tension: 120, friction: 14, mass: 1 },
    { name: 'Wobbly', tension: 180, friction: 12, mass: 1 },
    { name: 'Stiff', tension: 210, friction: 20, mass: 1 },
    { name: 'Slow', tension: 280, friction: 60, mass: 1 },
    { name: 'Bouncy', tension: 300, friction: 10, mass: 1 },
  ]

  return (
    <div class="demo-section">
      <h3>Spring Physics Animations</h3>
      <div class="info-box">
        Spring physics create natural, realistic motion. Adjust <code>tension</code>, <code>friction</code>,
        and <code>mass</code> to control the spring behavior.
      </div>

      <div class="controls">
        <label>
          Preset:
          <select
            onChange={(e: Event) => {
              const target = e.target as HTMLSelectElement
              const preset = presets[parseInt(target.value)]
              springConfig.value = {
                tension: preset.tension,
                friction: preset.friction,
                mass: preset.mass
              }
            }}
            style="margin-left: 10px; padding: 8px; border-radius: 4px; border: 1px solid #ddd;"
          >
            {presets.map((preset, index) => (
              <option value={index}>{preset.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div class="controls">
        <label style="display: flex; align-items: center; gap: 8px;">
          Tension: {springConfig.value.tension}
          <input
            type="range"
            min="50"
            max="400"
            value={springConfig.value.tension}
            onInput={(e: Event) => {
              const target = e.target as HTMLInputElement
              springConfig.value = { ...springConfig.value, tension: parseInt(target.value) }
            }}
          />
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          Friction: {springConfig.value.friction}
          <input
            type="range"
            min="1"
            max="80"
            value={springConfig.value.friction}
            onInput={(e: Event) => {
              const target = e.target as HTMLInputElement
              springConfig.value = { ...springConfig.value, friction: parseInt(target.value) }
            }}
          />
        </label>
        <label style="display: flex; align-items: center; gap: 8px;">
          Mass: {springConfig.value.mass}
          <input
            type="range"
            min="1"
            max="10"
            value={springConfig.value.mass}
            onInput={(e: Event) => {
              const target = e.target as HTMLInputElement
              springConfig.value = { ...springConfig.value, mass: parseInt(target.value) }
            }}
          />
        </label>
      </div>

      <div class="spring-demo-area">
        <div
          class="spring-ball"
          ref={(el: HTMLDivElement) => { springBallRef = el }}
        />
      </div>

      <div class="controls">
        <button onClick={animateWithSpring}>Animate with Spring</button>
        <button class="secondary" onClick={resetBall}>Reset</button>
      </div>

      <pre>{`// Spring physics animation
controller.animate({
  initial: { x: 0 },
  animate: { x: 200 },
  spring: {
    tension: 170,  // Stiffness of the spring
    friction: 26,  // Resistance to motion
    mass: 1        // Weight of the object
  }
})`}</pre>
    </div>
  )
}

// ============================================================================
// Demo 6: Easing Functions
// ============================================================================

function EasingFunctionsDemo() {
  const easings = [
    { name: 'Linear', value: 'linear' },
    { name: 'Ease', value: 'ease' },
    { name: 'Ease In', value: 'ease-in' },
    { name: 'Ease Out', value: 'ease-out' },
    { name: 'Ease In Out', value: 'ease-in-out' },
    { name: 'Elastic', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    { name: 'Bounce', value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    { name: 'Smooth', value: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  ]

  let boxes: (HTMLDivElement | null)[] = []
  let controllers: (MotionController | null)[] = []

  onMount(() => {
    controllers = boxes.map(box => box ? new MotionController(box) : null)

    return () => {
      controllers.forEach(c => c?.dispose())
    }
  })

  const animateAll = () => {
    controllers.forEach((controller, index) => {
      if (controller) {
        controller.animate({
          initial: { x: 0 },
          animate: { x: 300 },
          duration: 1000,
          easing: easings[index].value,
        })
      }
    })
  }

  const reset = () => {
    controllers.forEach(controller => {
      controller?.animate({
        animate: { x: 0 },
        duration: 400,
        easing: 'ease-out',
      })
    })
  }

  return (
    <div class="demo-section">
      <h3>Easing Functions</h3>
      <div class="info-box">
        Compare different easing functions to see how they affect animation timing.
        Custom cubic-bezier curves can create unique motion effects.
      </div>

      <div class="controls">
        <button onClick={animateAll}>Animate All</button>
        <button class="secondary" onClick={reset}>Reset</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 15px; margin: 20px 0;">
        {easings.map((easing, index) => (
          <div style="display: flex; align-items: center; gap: 15px;">
            <div
              class="animated-box"
              style="width: 60px; height: 60px; font-size: 12px;"
              ref={(el: HTMLDivElement) => { boxes[index] = el }}
            >
              {index + 1}
            </div>
            <div style="flex: 1;">
              <strong>{easing.name}</strong>
              <br />
              <code style="font-size: 0.85em;">{easing.value}</code>
            </div>
          </div>
        ))}
      </div>

      <pre>{`// Using easing functions
controller.animate({
  animate: { x: 200 },
  duration: 1000,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Elastic
})`}</pre>
    </div>
  )
}

// ============================================================================
// Demo 7: Animation Controls
// ============================================================================

function AnimationControlsDemo() {
  let controlBoxRef: HTMLDivElement | null = null
  let animation: Animation | null = null

  const play = () => {
    if (controlBoxRef) {
      animation = controlBoxRef.animate(
        [
          { transform: 'translateX(0px) rotate(0deg)', opacity: '1' },
          { transform: 'translateX(300px) rotate(360deg)', opacity: '0.7' }
        ],
        {
          duration: 2000,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'forwards'
        }
      )
    }
  }

  const pause = () => {
    if (animation) {
      animation.pause()
    }
  }

  const resume = () => {
    if (animation) {
      animation.play()
    }
  }

  const reverse = () => {
    if (animation) {
      animation.reverse()
    }
  }

  const cancel = () => {
    if (animation) {
      animation.cancel()
      animation = null
    }
  }

  return (
    <div class="demo-section">
      <h3>Animation Controls</h3>
      <div class="info-box">
        The Web Animations API provides powerful controls: play, pause, reverse, and cancel.
        These work directly with the native Animation objects.
      </div>

      <div class="demo-area">
        <div
          class="animated-box"
          ref={(el: HTMLDivElement) => { controlBoxRef = el }}
        >
          Control Me
        </div>
      </div>

      <div class="controls">
        <button class="success" onClick={play}>Play</button>
        <button class="warning" onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button class="secondary" onClick={reverse}>Reverse</button>
        <button class="danger" onClick={cancel}>Cancel</button>
      </div>

      <pre>{`// Animation controls
const animation = element.animate(keyframes, options)

animation.play()     // Start/resume animation
animation.pause()    // Pause animation
animation.reverse()  // Reverse direction
animation.cancel()   // Cancel and reset`}</pre>
    </div>
  )
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <div class="container">
      <h1>Flexium Animation/Motion Demo</h1>
      <p class="description">
        Comprehensive demonstration of Flexium's Motion and Transition components.
        Built on the Web Animations API for smooth, performant animations without JavaScript RAF.
      </p>

      <BasicMotionDemo />
      <TransitionPresetDemo />
      <EnterExitDemo />
      <StaggeredAnimationsDemo />
      <SpringPhysicsDemo />
      <EasingFunctionsDemo />
      <AnimationControlsDemo />

      <h2>Key Features</h2>
      <div class="grid">
        <div class="animated-card">
          <h3 style="color: #667eea;">Declarative API</h3>
          <p style="color: #666; line-height: 1.6;">
            Define animations with simple props - no manual RAF loops or state management needed.
          </p>
        </div>
        <div class="animated-card">
          <h3 style="color: #667eea;">Web Animations API</h3>
          <p style="color: #666; line-height: 1.6;">
            Built on native browser APIs for optimal performance and smooth 60fps animations.
          </p>
        </div>
        <div class="animated-card">
          <h3 style="color: #667eea;">Spring Physics</h3>
          <p style="color: #666; line-height: 1.6;">
            Natural, realistic motion with configurable tension, friction, and mass.
          </p>
        </div>
        <div class="animated-card">
          <h3 style="color: #667eea;">Enter/Exit Transitions</h3>
          <p style="color: #666; line-height: 1.6;">
            Smooth animations when elements mount and unmount from the DOM.
          </p>
        </div>
        <div class="animated-card">
          <h3 style="color: #667eea;">Staggered Animations</h3>
          <p style="color: #666; line-height: 1.6;">
            Beautiful cascading effects for lists with TransitionGroup.
          </p>
        </div>
        <div class="animated-card">
          <h3 style="color: #667eea;">Custom Easing</h3>
          <p style="color: #666; line-height: 1.6;">
            Full control over timing with CSS easing functions and cubic-bezier curves.
          </p>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: linear-gradient(135deg, #e0e7ff 0%, #f0e7ff 100%); border-radius: 12px;">
        <h3 style="color: #667eea; margin-bottom: 10px;">Getting Started</h3>
        <pre>{`import { MotionController, Transition, TransitionGroup } from 'flexium'

// Basic motion with MotionController
const element = document.createElement('div')
const controller = new MotionController(element)
controller.animate({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  duration: 300
})

// Transition component
<Show when={visible}>
  <Transition preset="fade">
    <div>Animated content</div>
  </Transition>
</Show>

// Staggered list
<TransitionGroup stagger={50}>
  <For each={items}>
    {item => (
      <Transition preset="slideUp">
        <div>{item.name}</div>
      </Transition>
    )}
  </For>
</TransitionGroup>`}</pre>
      </div>
    </div>
  )
}

// ============================================================================
// Render App
// ============================================================================

const root = document.getElementById('app')
if (root) {
  render(() => <App />, root)
}
