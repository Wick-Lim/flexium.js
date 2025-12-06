/**
 * Transition Component - Coordinated Enter/Exit Animations
 *
 * Provides declarative transitions for elements entering and leaving the DOM.
 * Works seamlessly with For and conditional rendering (ternary, &&).
 */

import { onCleanup } from '../../core/signal'
import type { AnimatableProps, MotionController } from './Motion'
import { MotionController as MC } from './Motion'
import { f } from '../../renderers/dom/h'

/**
 * Preset animation types
 */
export type TransitionPreset =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'scale-fade'

/**
 * Transition timing configuration
 */
export interface TransitionTiming {
  duration?: number
  delay?: number
  easing?: string
}

/**
 * Transition component props
 */
export interface TransitionProps {
  /** Use a preset animation */
  preset?: TransitionPreset
  /** Custom enter animation (from state) */
  enter?: AnimatableProps
  /** Custom enter animation (to state) */
  enterTo?: AnimatableProps
  /** Custom exit animation (to state) */
  exit?: AnimatableProps
  /** Enter timing */
  enterTiming?: TransitionTiming
  /** Exit timing */
  exitTiming?: TransitionTiming
  /** Callback when enter animation starts */
  onEnterStart?: () => void
  /** Callback when enter animation completes */
  onEnterComplete?: () => void
  /** Callback when exit animation starts */
  onExitStart?: () => void
  /** Callback when exit animation completes */
  onExitComplete?: () => void
  /** Children to animate */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}

/**
 * Get animation keyframes for a preset
 */
function getPresetKeyframes(preset: TransitionPreset): {
  enter: AnimatableProps
  enterTo: AnimatableProps
  exit: AnimatableProps
} {
  switch (preset) {
    case 'fade':
      return {
        enter: { opacity: 0 },
        enterTo: { opacity: 1 },
        exit: { opacity: 0 },
      }
    case 'slide-up':
      return {
        enter: { opacity: 0, y: 20 },
        enterTo: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      }
    case 'slide-down':
      return {
        enter: { opacity: 0, y: -20 },
        enterTo: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
      }
    case 'slide-left':
      return {
        enter: { opacity: 0, x: 20 },
        enterTo: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      }
    case 'slide-right':
      return {
        enter: { opacity: 0, x: -20 },
        enterTo: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
      }
    case 'scale':
      return {
        enter: { scale: 0.9 },
        enterTo: { scale: 1 },
        exit: { scale: 0.9 },
      }
    case 'scale-fade':
      return {
        enter: { opacity: 0, scale: 0.95 },
        enterTo: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      }
    default:
      return {
        enter: {},
        enterTo: {},
        exit: {},
      }
  }
}

/**
 * TransitionGroup context for staggered animations
 */
interface TransitionGroupContext {
  registerChild: () => number
  staggerDelay: number
}

let currentTransitionGroup: TransitionGroupContext | null = null

/**
 * Transition component for animated enter/exit
 *
 * @example
 * {() => visible() && (
 *   <Transition preset="fade">
 *     <div>Content appears with fade</div>
 *   </Transition>
 * )}
 *
 * @example
 * <Transition
 *   enter={{ opacity: 0, y: 50 }}
 *   enterTo={{ opacity: 1, y: 0 }}
 *   exit={{ opacity: 0, y: -50 }}
 *   enterTiming={{ duration: 300, easing: 'ease-out' }}
 *   exitTiming={{ duration: 200, easing: 'ease-in' }}
 * >
 *   <div>Custom animated content</div>
 * </Transition>
 */
export function Transition(props: TransitionProps) {
  const {
    preset,
    enter: customEnter,
    enterTo: customEnterTo,
    exit: customExit,
    enterTiming = { duration: 300, easing: 'ease-out' },
    exitTiming = { duration: 200, easing: 'ease-in' },
    onEnterStart,
    onEnterComplete,
    onExitStart,
    onExitComplete,
    children,
  } = props

  // Get keyframes from preset or custom props
  const presetFrames = preset ? getPresetKeyframes(preset) : null
  const enter = customEnter ?? presetFrames?.enter ?? {}
  const enterTo = customEnterTo ?? presetFrames?.enterTo ?? {}
  const exit = customExit ?? presetFrames?.exit ?? {}

  // Track the mounted element and controller
  let element: HTMLElement | null = null
  let controller: MotionController | null = null

  // Get stagger delay from group if present
  const staggerIndex = currentTransitionGroup?.registerChild() ?? 0
  const staggerDelay = currentTransitionGroup?.staggerDelay ?? 0
  const additionalDelay = staggerIndex * staggerDelay

  // Setup cleanup for exit animation
  onCleanup(async () => {
    if (element && controller) {
      onExitStart?.()

      await controller.animateExit(exit, exitTiming.duration, exitTiming.easing)

      onExitComplete?.()
    }
  })

  // Return wrapper div with ref to capture element
  return f(
    'div',
    {
      style: { display: 'contents' },
      ref: (el: HTMLElement | null) => {
        if (!el) return

        element = el
        controller = new MC(el)

        // Schedule enter animation after DOM update
        queueMicrotask(() => {
          if (controller) {
            onEnterStart?.()

            controller.animate({
              initial: enter,
              animate: enterTo,
              duration: enterTiming.duration,
              easing: enterTiming.easing,
              delay: (enterTiming.delay ?? 0) + additionalDelay,
              onAnimationComplete: onEnterComplete,
            })
          }
        })
      },
    },
    children
  )
}

/**
 * TransitionGroup props
 */
export interface TransitionGroupProps {
  /** Delay between each child animation (stagger effect) */
  stagger?: number
  /** Children (should contain Transition components) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any
}

/**
 * TransitionGroup component for staggered animations
 *
 * @example
 * <TransitionGroup stagger={50}>
 *   <For each={items}>
 *     {(item) => (
 *       <Transition preset="slide-up">
 *         <div>{item.name}</div>
 *       </Transition>
 *     )}
 *   </For>
 * </TransitionGroup>
 */
export function TransitionGroup(props: TransitionGroupProps) {
  const { stagger = 50, children } = props

  let childIndex = 0

  const context: TransitionGroupContext = {
    registerChild: () => childIndex++,
    staggerDelay: stagger,
  }

  return () => {
    // Reset child index for each render
    childIndex = 0

    // Set context for child Transitions
    const previousGroup = currentTransitionGroup
    currentTransitionGroup = context

    try {
      return children
    } finally {
      currentTransitionGroup = previousGroup
    }
  }
}

/**
 * Create a reusable transition configuration
 *
 * @example
 * const fadeTransition = createTransition({
 *   preset: 'fade',
 *   enterTiming: { duration: 200 }
 * })
 *
 * // Use in component
 * <Transition {...fadeTransition}>
 *   <Content />
 * </Transition>
 */
export function createTransition(
  config: Omit<TransitionProps, 'children'>
): Omit<TransitionProps, 'children'> {
  return config
}

/**
 * Preset transition configurations
 */
export const transitions = {
  fade: createTransition({ preset: 'fade' }),
  slideUp: createTransition({ preset: 'slide-up' }),
  slideDown: createTransition({ preset: 'slide-down' }),
  slideLeft: createTransition({ preset: 'slide-left' }),
  slideRight: createTransition({ preset: 'slide-right' }),
  scale: createTransition({ preset: 'scale' }),
  scaleFade: createTransition({ preset: 'scale-fade' }),

  // Common UI patterns
  modal: createTransition({
    enter: { opacity: 0, scale: 0.95, y: -10 },
    enterTo: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    enterTiming: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exitTiming: { duration: 150, easing: 'ease-in' },
  }),

  dropdown: createTransition({
    enter: { opacity: 0, y: -8, scale: 0.95 },
    enterTo: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.95 },
    enterTiming: { duration: 150, easing: 'ease-out' },
    exitTiming: { duration: 100, easing: 'ease-in' },
  }),

  tooltip: createTransition({
    enter: { opacity: 0, scale: 0.9 },
    enterTo: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    enterTiming: { duration: 100, easing: 'ease-out' },
    exitTiming: { duration: 75, easing: 'ease-in' },
  }),

  notification: createTransition({
    enter: { opacity: 0, x: 100 },
    enterTo: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    enterTiming: { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exitTiming: { duration: 200, easing: 'ease-in' },
  }),

  page: createTransition({
    enter: { opacity: 0 },
    enterTo: { opacity: 1 },
    exit: { opacity: 0 },
    enterTiming: { duration: 200, easing: 'ease-out' },
    exitTiming: { duration: 150, easing: 'ease-in' },
  }),
} as const
