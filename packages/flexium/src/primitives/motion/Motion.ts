/**
 * Motion Component - Declarative animations using Web Animations API
 *
 * Provides smooth, performant animations without JavaScript RAF
 * Supports transforms, opacity, spring physics, and layout animations
 */

import { effect, type Signal } from '../../core/signal'

/**
 * Animation properties that can be animated
 */
export interface AnimatableProps {
  x?: number
  y?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number // in degrees
  opacity?: number
  width?: number | string
  height?: number | string
}

/**
 * Spring physics configuration
 */
export interface SpringConfig {
  tension?: number // Default: 170
  friction?: number // Default: 26
  mass?: number // Default: 1
}

/**
 * Motion component props
 */
export interface MotionProps {
  element?: HTMLElement | null
  initial?: AnimatableProps
  animate?: AnimatableProps
  exit?: AnimatableProps
  duration?: number // in milliseconds
  spring?: SpringConfig
  easing?: string // CSS easing function
  delay?: number
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}

/**
 * Convert animatable props to Web Animations API keyframe
 */
function propsToKeyframe(props: AnimatableProps): Keyframe {
  const keyframe: Keyframe = {}

  const transforms: string[] = []

  if (props.x !== undefined) {
    transforms.push(`translateX(${props.x}px)`)
  }

  if (props.y !== undefined) {
    transforms.push(`translateY(${props.y}px)`)
  }

  if (props.scale !== undefined) {
    transforms.push(`scale(${props.scale})`)
  } else {
    if (props.scaleX !== undefined) {
      transforms.push(`scaleX(${props.scaleX})`)
    }
    if (props.scaleY !== undefined) {
      transforms.push(`scaleY(${props.scaleY})`)
    }
  }

  if (props.rotate !== undefined) {
    transforms.push(`rotate(${props.rotate}deg)`)
  }

  if (transforms.length > 0) {
    keyframe.transform = transforms.join(' ')
  }

  if (props.opacity !== undefined) {
    keyframe.opacity = props.opacity.toString()
  }

  if (props.width !== undefined) {
    keyframe.width =
      typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height !== undefined) {
    keyframe.height =
      typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  return keyframe
}

/**
 * Calculate spring-based duration and easing
 * Based on spring physics formula
 */
function springToTiming(spring: SpringConfig): {
  duration: number
  easing: string
} {
  const tension = spring.tension ?? 170
  const friction = spring.friction ?? 26
  const mass = spring.mass ?? 1

  // Calculate damping ratio and natural frequency
  const k = tension
  const c = friction
  const m = mass

  const naturalFreq = Math.sqrt(k / m)
  const dampingRatio = c / (2 * Math.sqrt(k * m))

  // Calculate duration (time to settle within 1% of final value)
  const duration = (4.6 / (dampingRatio * naturalFreq)) * 1000

  // Create spring easing curve
  // For underdamped (bouncy) springs
  if (dampingRatio < 1) {
    // Use cubic-bezier that approximates spring behavior
    // Values tuned for natural spring feel
    const easing = `cubic-bezier(0.34, 1.56, 0.64, 1)`
    return { duration, easing }
  }

  // For critically damped or overdamped springs
  const easing = `cubic-bezier(0.22, 1, 0.36, 1)`
  return { duration, easing }
}

/**
 * Check if user prefers reduced motion
 * Cached at module level for performance
 */
let prefersReducedMotion: boolean | null = null
let mediaQueryCleanup: (() => void) | null = null

function checkReducedMotion(): boolean {
  if (prefersReducedMotion === null) {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion = mediaQuery.matches
      // Listen for changes with proper cleanup support
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion = e.matches
      }
      mediaQuery.addEventListener('change', handler)
      mediaQueryCleanup = () => {
        mediaQuery.removeEventListener('change', handler)
        prefersReducedMotion = null
        mediaQueryCleanup = null
      }
    } else {
      prefersReducedMotion = false
    }
  }
  return prefersReducedMotion
}

/**
 * Cleanup motion module state (useful for testing and SSR)
 */
export function cleanupMotionState(): void {
  if (mediaQueryCleanup) {
    mediaQueryCleanup()
  }
}

/**
 * Motion controller class
 * Manages animations for a single element using Web Animations API
 * Respects prefers-reduced-motion accessibility setting
 */
export class MotionController {
  private element: HTMLElement
  private animation: Animation | null = null
  private resizeObserver: ResizeObserver | null = null
  private previousSize: { width: number; height: number } | null = null

  constructor(element: HTMLElement) {
    this.element = element
  }

  /**
   * Animate from initial to animate props
   * Respects prefers-reduced-motion: applies end state instantly if enabled
   */
  animate(props: MotionProps): void {
    const {
      initial,
      animate,
      duration = 300,
      spring,
      easing = 'ease-out',
      delay = 0,
    } = props

    if (!animate) return

    // Cancel any running animation
    this.cancel()

    // Respect prefers-reduced-motion: skip animation and apply final state instantly
    if (checkReducedMotion()) {
      const finalKeyframe = propsToKeyframe(animate)
      Object.assign(this.element.style, {
        transform: finalKeyframe.transform || '',
        opacity: finalKeyframe.opacity || '',
        width: finalKeyframe.width || '',
        height: finalKeyframe.height || '',
      })
      if (props.onAnimationStart) props.onAnimationStart()
      if (props.onAnimationComplete) props.onAnimationComplete()
      return
    }

    // Apply initial state immediately if provided
    if (initial) {
      const initialKeyframe = propsToKeyframe(initial)
      Object.assign(this.element.style, {
        transform: initialKeyframe.transform || '',
        opacity: initialKeyframe.opacity || '',
        width: initialKeyframe.width || '',
        height: initialKeyframe.height || '',
      })
    }

    // Create keyframes
    const from = initial ? propsToKeyframe(initial) : {}
    const to = propsToKeyframe(animate)

    // Calculate timing
    let animDuration = duration
    let animEasing = easing

    if (spring) {
      const timing = springToTiming(spring)
      animDuration = timing.duration
      animEasing = timing.easing
    }

    // Create animation
    this.animation = this.element.animate([from, to], {
      duration: animDuration,
      easing: animEasing,
      delay,
      fill: 'forwards',
    })

    // Handle callbacks
    if (props.onAnimationStart) {
      props.onAnimationStart()
    }

    this.animation.onfinish = () => {
      if (props.onAnimationComplete) {
        props.onAnimationComplete()
      }
    }
  }

  /**
   * Animate exit (used when element is being removed)
   * Respects prefers-reduced-motion: applies end state instantly if enabled
   */
  async animateExit(
    exitProps: AnimatableProps,
    duration = 300,
    easing = 'ease-in'
  ): Promise<void> {
    this.cancel()

    // Respect prefers-reduced-motion: skip animation
    if (checkReducedMotion()) {
      const finalKeyframe = propsToKeyframe(exitProps)
      Object.assign(this.element.style, {
        transform: finalKeyframe.transform || '',
        opacity: finalKeyframe.opacity || '',
        width: finalKeyframe.width || '',
        height: finalKeyframe.height || '',
      })
      return
    }

    const to = propsToKeyframe(exitProps)

    this.animation = this.element.animate([{}, to], {
      duration,
      easing,
      fill: 'forwards',
    })

    await this.animation.finished
  }

  /**
   * Enable layout animations (animate size changes automatically)
   */
  enableLayoutAnimation(duration = 300, easing = 'ease-out'): void {
    // Store initial size
    const rect = this.element.getBoundingClientRect()
    this.previousSize = { width: rect.width, height: rect.height }

    // Watch for size changes
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!this.previousSize) {
          this.previousSize = {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          }
          return
        }

        const newWidth = entry.contentRect.width
        const newHeight = entry.contentRect.height

        // Only animate if size actually changed
        if (
          newWidth !== this.previousSize.width ||
          newHeight !== this.previousSize.height
        ) {
          // Animate from previous size to new size
          this.cancel()

          this.animation = this.element.animate(
            [
              {
                width: `${this.previousSize.width}px`,
                height: `${this.previousSize.height}px`,
              },
              {
                width: `${newWidth}px`,
                height: `${newHeight}px`,
              },
            ],
            {
              duration,
              easing,
              fill: 'forwards',
            }
          )

          this.previousSize = { width: newWidth, height: newHeight }
        }
      }
    })

    this.resizeObserver.observe(this.element)
  }

  /**
   * Disable layout animations
   */
  disableLayoutAnimation(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
      this.previousSize = null
    }
  }

  /**
   * Cancel current animation
   */
  cancel(): void {
    if (this.animation) {
      this.animation.cancel()
      this.animation = null
    }
  }

  /**
   * Cleanup all animations and observers
   */
  dispose(): void {
    this.cancel()
    this.disableLayoutAnimation()
  }
}

/**
 * Create a motion-enabled element
 *
 * @example
 * const motionDiv = createMotion({
 *   initial: { opacity: 0, y: 20 },
 *   animate: { opacity: 1, y: 0 },
 *   duration: 300,
 * });
 * document.body.appendChild(motionDiv.element);
 */
export function createMotion(props: MotionProps & { tagName?: string }): {
  element: HTMLElement
  controller: MotionController
  update: (newProps: MotionProps) => void
  dispose: () => void
} {
  const element =
    props.element || document.createElement(props.tagName || 'div')
  const controller = new MotionController(element)

  // Initial animation
  controller.animate(props)

  return {
    element,
    controller,
    update: (newProps: MotionProps) => {
      controller.animate(newProps)
    },
    dispose: () => {
      controller.dispose()
    },
  }
}

/**
 * Hook-like function to use motion with signals
 *
 * @example
 * const visible = signal(false);
 * const motion = useMotion(element, {
 *   initial: { opacity: 0 },
 *   animate: visible.value ? { opacity: 1 } : { opacity: 0 },
 * });
 */
export function useMotion(
  element: HTMLElement,
  propsSignal: Signal<MotionProps>
): {
  controller: MotionController
  dispose: () => void
} {
  const controller = new MotionController(element)

  // Watch for prop changes
  const dispose = effect(() => {
    const props = propsSignal.value
    controller.animate(props)
  })

  return {
    controller,
    dispose: () => {
      dispose()
      controller.dispose()
    },
  }
}
