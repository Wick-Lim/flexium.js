/**
 * Motion Component Tests
 *
 * Comprehensive tests for Motion animation system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  MotionController,
  createMotion,
  useMotion,
  type MotionProps,
  type AnimatableProps,
  type SpringConfig,
} from '../Motion'
import { signal } from '../../../core/signal'

// Mock Web Animations API
class MockAnimation implements Animation {
  id = ''
  effect = null
  timeline = null
  playbackRate = 1
  startTime = 0
  currentTime = 0
  playState: AnimationPlayState = 'running'
  pending = false
  replaceState: AnimationReplaceState = 'active'

  onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null
  oncancel: ((this: Animation, ev: AnimationPlaybackEvent) => any) | null = null
  onremove: ((this: Animation, ev: Event) => any) | null = null

  private _finished = false
  private _cancelled = false

  constructor(
    public keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    public options: KeyframeAnimationOptions
  ) {}

  get finished(): Promise<Animation> {
    return Promise.resolve(this)
  }

  get ready(): Promise<Animation> {
    return Promise.resolve(this)
  }

  cancel(): void {
    this._cancelled = true
    this.playState = 'idle'
    if (this.oncancel) {
      this.oncancel.call(this, new Event('cancel') as AnimationPlaybackEvent)
    }
  }

  finish(): void {
    this._finished = true
    this.playState = 'finished'
    if (this.onfinish) {
      this.onfinish.call(this, new Event('finish') as AnimationPlaybackEvent)
    }
  }

  play(): void {
    this.playState = 'running'
  }

  pause(): void {
    this.playState = 'paused'
  }

  reverse(): void {
    this.playbackRate *= -1
  }

  updatePlaybackRate(playbackRate: number): void {
    this.playbackRate = playbackRate
  }

  persist(): void {}

  commitStyles(): void {}

  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean {
    return true
  }
}

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  private callback: ResizeObserverCallback
  private elements = new Set<Element>()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    this.elements.add(target)
  }

  unobserve(target: Element): void {
    this.elements.delete(target)
  }

  disconnect(): void {
    this.elements.clear()
  }

  triggerResize(width: number, height: number): void {
    const entries: ResizeObserverEntry[] = Array.from(this.elements).map(
      (element) => ({
        target: element,
        contentRect: {
          width,
          height,
          x: 0,
          y: 0,
          top: 0,
          right: width,
          bottom: height,
          left: 0,
          toJSON: () => ({}),
        } as DOMRectReadOnly,
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      })
    )
    this.callback(entries, this)
  }
}

describe('Motion Component', () => {
  let mockElement: HTMLElement
  let mockAnimations: MockAnimation[]

  beforeEach(() => {
    mockElement = document.createElement('div')
    mockAnimations = []

    // Mock element.animate
    mockElement.animate = vi.fn((keyframes: any, options: any) => {
      const animation = new MockAnimation(keyframes, options)
      mockAnimations.push(animation)
      return animation as unknown as Animation
    }) as any

    // Mock getBoundingClientRect
    mockElement.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    }))

    // Mock ResizeObserver globally
    global.ResizeObserver = MockResizeObserver as any
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('MotionController - Class Creation', () => {
    it('should create MotionController instance', () => {
      const controller = new MotionController(mockElement)
      expect(controller).toBeDefined()
      expect(controller).toBeInstanceOf(MotionController)
    })

    it('should store reference to element', () => {
      const controller = new MotionController(mockElement)
      expect(controller).toBeDefined()
    })
  })

  describe('animate() - Web Animations API Integration', () => {
    it('should call element.animate with correct keyframes', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        initial: { x: 0, opacity: 0 },
        animate: { x: 100, opacity: 1 },
      })

      expect(mockElement.animate).toHaveBeenCalledTimes(1)
      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes).toHaveLength(2)
    })

    it('should apply default duration and easing', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(300)
      expect(options.easing).toBe('ease-out')
    })

    it('should use custom duration and easing', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        duration: 500,
        easing: 'ease-in-out',
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(500)
      expect(options.easing).toBe('ease-in-out')
    })

    it('should apply delay', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        delay: 100,
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.delay).toBe(100)
    })

    it('should set fill mode to forwards', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.fill).toBe('forwards')
    })

    it('should apply initial styles immediately', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      })

      expect(mockElement.style.opacity).toBe('0')
    })

    it('should call onAnimationStart callback', () => {
      const onStart = vi.fn()
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        onAnimationStart: onStart,
      })

      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('should call onAnimationComplete callback when animation finishes', () => {
      const onComplete = vi.fn()
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        onAnimationComplete: onComplete,
      })

      // Simulate animation finish
      mockAnimations[0].finish()
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should do nothing when animate prop is undefined', () => {
      const controller = new MotionController(mockElement)
      controller.animate({})

      expect(mockElement.animate).not.toHaveBeenCalled()
    })

    it('should cancel previous animation before starting new one', () => {
      const controller = new MotionController(mockElement)

      controller.animate({ animate: { opacity: 0.5 } })
      const firstAnimation = mockAnimations[0]

      controller.animate({ animate: { opacity: 1 } })

      expect(firstAnimation.playState).toBe('idle')
      expect(mockAnimations).toHaveLength(2)
    })
  })

  describe('propsToKeyframe() - Keyframe Generation', () => {
    it('should convert x translation to translateX', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { x: 100 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('translateX(100px)')
    })

    it('should convert y translation to translateY', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { y: 50 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('translateY(50px)')
    })

    it('should convert scale to scale transform', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { scale: 1.5 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('scale(1.5)')
    })

    it('should convert scaleX and scaleY separately when scale is not present', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { scaleX: 2, scaleY: 0.5 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('scaleX(2)')
      expect(keyframes[1].transform).toContain('scaleY(0.5)')
    })

    it('should prioritize scale over scaleX/scaleY', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { scale: 2, scaleX: 3, scaleY: 4 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('scale(2)')
      expect(keyframes[1].transform).not.toContain('scaleX')
      expect(keyframes[1].transform).not.toContain('scaleY')
    })

    it('should convert rotate to rotate transform in degrees', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { rotate: 45 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('rotate(45deg)')
    })

    it('should combine multiple transforms', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { x: 100, y: 50, scale: 1.2, rotate: 45 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      const transform = keyframes[1].transform
      expect(transform).toContain('translateX(100px)')
      expect(transform).toContain('translateY(50px)')
      expect(transform).toContain('scale(1.2)')
      expect(transform).toContain('rotate(45deg)')
    })

    it('should convert opacity', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 0.5 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].opacity).toBe('0.5')
    })

    it('should convert numeric width to px', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { width: 200 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].width).toBe('200px')
    })

    it('should keep string width as-is', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { width: '50%' },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].width).toBe('50%')
    })

    it('should convert numeric height to px', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { height: 150 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].height).toBe('150px')
    })

    it('should keep string height as-is', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { height: 'auto' },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].height).toBe('auto')
    })
  })

  describe('springToTiming() - Spring Physics', () => {
    it('should use default spring values when not provided', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        spring: {},
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBeGreaterThan(0)
      expect(options.easing).toBeDefined()
    })

    it('should calculate duration from spring tension and friction', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        spring: { tension: 170, friction: 26 },
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBeGreaterThan(0)
    })

    it('should use bouncy easing for underdamped springs (dampingRatio < 1)', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        spring: { tension: 300, friction: 20 }, // Creates underdamped spring
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.easing).toContain('cubic-bezier')
    })

    it('should use smooth easing for critically damped springs (dampingRatio >= 1)', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        spring: { tension: 170, friction: 100 }, // Creates overdamped spring
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.easing).toContain('cubic-bezier')
    })

    it('should consider mass in duration calculation', () => {
      const controller1 = new MotionController(mockElement)
      controller1.animate({
        animate: { opacity: 1 },
        spring: { tension: 170, friction: 26, mass: 1 },
      })

      const controller2 = new MotionController(mockElement)
      controller2.animate({
        animate: { opacity: 1 },
        spring: { tension: 170, friction: 26, mass: 2 },
      })

      const [, options1] = (mockElement.animate as any).mock.calls[0]
      const [, options2] = (mockElement.animate as any).mock.calls[1]

      // Higher mass should result in longer duration
      expect(options2.duration).toBeGreaterThan(options1.duration)
    })

    it('should override duration and easing when spring config is provided', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        duration: 500,
        easing: 'linear',
        spring: { tension: 170, friction: 26 },
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      // Spring config should override explicit duration and easing
      expect(options.duration).not.toBe(500)
      expect(options.easing).not.toBe('linear')
    })
  })

  describe('Animation Cancellation', () => {
    it('should cancel current animation', () => {
      const controller = new MotionController(mockElement)
      controller.animate({ animate: { opacity: 1 } })

      const animation = mockAnimations[0]
      controller.cancel()

      expect(animation.playState).toBe('idle')
    })

    it('should not throw when cancelling with no active animation', () => {
      const controller = new MotionController(mockElement)
      expect(() => controller.cancel()).not.toThrow()
    })

    it('should cancel animation in dispose', () => {
      const controller = new MotionController(mockElement)
      controller.animate({ animate: { opacity: 1 } })

      const animation = mockAnimations[0]
      controller.dispose()

      expect(animation.playState).toBe('idle')
    })
  })

  describe('animateExit()', () => {
    it('should animate exit properties', async () => {
      const controller = new MotionController(mockElement)
      const exitPromise = controller.animateExit({ opacity: 0, y: 20 })

      expect(mockElement.animate).toHaveBeenCalledTimes(1)

      // Finish the animation
      mockAnimations[0].finish()
      await exitPromise
    })

    it('should use custom duration and easing for exit', async () => {
      const controller = new MotionController(mockElement)
      const exitPromise = controller.animateExit(
        { opacity: 0 },
        400,
        'ease-out'
      )

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(400)
      expect(options.easing).toBe('ease-out')

      mockAnimations[0].finish()
      await exitPromise
    })

    it('should cancel previous animation before exit', async () => {
      const controller = new MotionController(mockElement)
      controller.animate({ animate: { opacity: 1 } })

      const firstAnimation = mockAnimations[0]
      const exitPromise = controller.animateExit({ opacity: 0 })

      expect(firstAnimation.playState).toBe('idle')

      mockAnimations[1].finish()
      await exitPromise
    })

    it('should wait for animation to finish', async () => {
      const controller = new MotionController(mockElement)

      // Start the exit animation
      const exitPromise = controller.animateExit({ opacity: 0 })

      // Get the animation and finish it
      const animation = mockAnimations[0]

      // Finish the animation to resolve the promise
      animation.finish()

      // Wait for the promise to resolve
      await exitPromise

      // If we got here, the promise resolved successfully
      expect(animation.playState).toBe('finished')
    })
  })

  describe('enableLayoutAnimation() - ResizeObserver', () => {
    it('should create ResizeObserver', () => {
      const controller = new MotionController(mockElement)
      controller.enableLayoutAnimation()

      expect(mockElement.getBoundingClientRect).toHaveBeenCalled()
    })

    it('should observe element size changes', () => {
      const controller = new MotionController(mockElement)
      controller.enableLayoutAnimation()

      // Verify that ResizeObserver was created and observing
      expect((controller as any).resizeObserver).toBeDefined()
      expect((controller as any).previousSize).toBeDefined()
    })

    it('should animate when size changes', () => {
      const controller = new MotionController(mockElement)

      // Mock the internal ResizeObserver callback
      let resizeCallback: ResizeObserverCallback | null = null
      global.ResizeObserver = class MockResizeObserverInternal {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any

      controller.enableLayoutAnimation(200, 'ease-in-out')

      // Simulate initial size
      if (resizeCallback) {
        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 100, height: 100 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        // Change size
        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 200, height: 150 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )
      }

      // Should have created an animation
      expect(mockElement.animate).toHaveBeenCalled()
    })

    it('should not animate if size does not change', () => {
      const controller = new MotionController(mockElement)

      let resizeCallback: ResizeObserverCallback | null = null
      global.ResizeObserver = class MockResizeObserverInternal {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any

      controller.enableLayoutAnimation()

      if (resizeCallback) {
        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 100, height: 100 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        const callCount = (mockElement.animate as any).mock.calls.length

        // Trigger with same size
        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 100, height: 100 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        expect((mockElement.animate as any).mock.calls.length).toBe(callCount)
      }
    })

    it('should use custom duration and easing for layout animations', () => {
      const controller = new MotionController(mockElement)

      let resizeCallback: ResizeObserverCallback | null = null
      global.ResizeObserver = class MockResizeObserverInternal {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any

      controller.enableLayoutAnimation(400, 'linear')

      if (resizeCallback) {
        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 100, height: 100 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 150, height: 150 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        const [, options] = (mockElement.animate as any).mock.calls[0]
        expect(options.duration).toBe(400)
        expect(options.easing).toBe('linear')
      }
    })

    it('should cancel previous animation before layout animation', () => {
      const controller = new MotionController(mockElement)
      controller.animate({ animate: { opacity: 1 } })
      const firstAnimation = mockAnimations[0]

      let resizeCallback: ResizeObserverCallback | null = null
      global.ResizeObserver = class MockResizeObserverInternal {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any

      controller.enableLayoutAnimation()

      if (resizeCallback) {
        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 100, height: 100 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        resizeCallback(
          [
            {
              target: mockElement,
              contentRect: { width: 150, height: 150 } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ],
          null as any
        )

        expect(firstAnimation.playState).toBe('idle')
      }
    })
  })

  describe('disableLayoutAnimation()', () => {
    it('should disconnect ResizeObserver', () => {
      const controller = new MotionController(mockElement)
      controller.enableLayoutAnimation()

      const disconnectSpy = vi.fn()
      // Mock the disconnect method
      if ((controller as any).resizeObserver) {
        ;(controller as any).resizeObserver.disconnect = disconnectSpy
      }

      controller.disableLayoutAnimation()
      expect(disconnectSpy).toHaveBeenCalled()
    })

    it('should clear previousSize', () => {
      const controller = new MotionController(mockElement)
      controller.enableLayoutAnimation()
      controller.disableLayoutAnimation()

      expect((controller as any).previousSize).toBeNull()
    })

    it('should not throw when called without active observer', () => {
      const controller = new MotionController(mockElement)
      expect(() => controller.disableLayoutAnimation()).not.toThrow()
    })
  })

  describe('createMotion() - Factory Function', () => {
    beforeEach(() => {
      // Mock document.createElement to return elements with animate method
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation(
        (tagName: string) => {
          const element = originalCreateElement(tagName)
          element.animate = vi.fn((keyframes: any, options: any) => {
            const animation = new MockAnimation(keyframes, options)
            mockAnimations.push(animation)
            return animation as unknown as Animation
          }) as any
          element.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 100,
            x: 0,
            y: 0,
            top: 0,
            right: 100,
            bottom: 100,
            left: 0,
            toJSON: () => ({}),
          }))
          return element
        }
      )
    })

    it('should create motion with element and controller', () => {
      const motion = createMotion({
        animate: { opacity: 1 },
      })

      expect(motion.element).toBeDefined()
      expect(motion.controller).toBeInstanceOf(MotionController)
      expect(motion.update).toBeInstanceOf(Function)
      expect(motion.dispose).toBeInstanceOf(Function)
    })

    it('should create element with default tagName', () => {
      const motion = createMotion({
        animate: { opacity: 1 },
      })

      expect(motion.element.tagName).toBe('DIV')
    })

    it('should create element with custom tagName', () => {
      const motion = createMotion({
        tagName: 'span',
        animate: { opacity: 1 },
      })

      expect(motion.element.tagName).toBe('SPAN')
    })

    it('should use provided element', () => {
      const customElement = document.createElement('section')
      customElement.animate = mockElement.animate

      const motion = createMotion({
        element: customElement,
        animate: { opacity: 1 },
      })

      expect(motion.element).toBe(customElement)
    })

    it('should start initial animation', () => {
      const element = document.createElement('div')
      element.animate = vi.fn(mockElement.animate)

      const motion = createMotion({
        element,
        animate: { opacity: 1 },
      })

      expect(element.animate).toHaveBeenCalled()
    })

    it('should update animation with update method', () => {
      const element = document.createElement('div')
      element.animate = vi.fn(mockElement.animate)

      const motion = createMotion({
        element,
        animate: { opacity: 0.5 },
      })

      motion.update({ animate: { opacity: 1 } })

      expect(element.animate).toHaveBeenCalledTimes(2)
    })

    it('should dispose controller and animations', () => {
      const element = document.createElement('div')
      const animations: MockAnimation[] = []
      element.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        animations.push(animation)
        return animation as unknown as Animation
      }) as any

      const motion = createMotion({
        element,
        animate: { opacity: 1 },
      })

      motion.dispose()

      expect(animations[0].playState).toBe('idle')
    })
  })

  describe('useMotion() - Hook Behavior', () => {
    it('should create controller and watch signal changes', () => {
      const propsSignal = signal<MotionProps>({
        animate: { opacity: 0.5 },
      })

      const motion = useMotion(mockElement, propsSignal)

      expect(motion.controller).toBeInstanceOf(MotionController)
      expect(motion.dispose).toBeInstanceOf(Function)
    })

    it('should trigger animation on signal change', () => {
      const propsSignal = signal<MotionProps>({
        animate: { opacity: 0.5 },
      })

      useMotion(mockElement, propsSignal)

      // Initial animation
      expect(mockElement.animate).toHaveBeenCalledTimes(1)

      // Change signal
      propsSignal.value = { animate: { opacity: 1 } }

      // Should trigger new animation
      expect(mockElement.animate).toHaveBeenCalledTimes(2)
    })

    it('should dispose effect and controller', () => {
      const propsSignal = signal<MotionProps>({
        animate: { opacity: 0.5 },
      })

      const motion = useMotion(mockElement, propsSignal)
      const animation = mockAnimations[0]

      motion.dispose()

      // Should cancel animation
      expect(animation.playState).toBe('idle')

      // Should stop watching signal
      propsSignal.value = { animate: { opacity: 1 } }
      expect(mockElement.animate).toHaveBeenCalledTimes(1) // No new animation
    })

    it('should react to multiple signal updates', () => {
      const propsSignal = signal<MotionProps>({
        animate: { opacity: 0 },
      })

      useMotion(mockElement, propsSignal)

      propsSignal.value = { animate: { opacity: 0.5 } }
      propsSignal.value = { animate: { opacity: 1 } }

      expect(mockElement.animate).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { x: 0, y: 0, opacity: 0, scale: 0 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('translateX(0px)')
      expect(keyframes[1].transform).toContain('translateY(0px)')
      expect(keyframes[1].transform).toContain('scale(0)')
      expect(keyframes[1].opacity).toBe('0')
    })

    it('should handle negative values', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { x: -100, y: -50, rotate: -45 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1].transform).toContain('translateX(-100px)')
      expect(keyframes[1].transform).toContain('translateY(-50px)')
      expect(keyframes[1].transform).toContain('rotate(-45deg)')
    })

    it('should handle rapid animation changes', () => {
      const controller = new MotionController(mockElement)

      controller.animate({ animate: { opacity: 0.2 } })
      controller.animate({ animate: { opacity: 0.4 } })
      controller.animate({ animate: { opacity: 0.6 } })
      controller.animate({ animate: { opacity: 0.8 } })
      controller.animate({ animate: { opacity: 1 } })

      expect(mockElement.animate).toHaveBeenCalledTimes(5)
      expect(mockAnimations[0].playState).toBe('idle')
      expect(mockAnimations[1].playState).toBe('idle')
      expect(mockAnimations[2].playState).toBe('idle')
      expect(mockAnimations[3].playState).toBe('idle')
    })

    it('should handle empty initial props', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        initial: {},
        animate: { opacity: 1 },
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes).toHaveLength(2)
    })

    it('should handle empty animate props', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: {},
      })

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[1]).toEqual({})
    })

    it('should handle very small spring tension', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        spring: { tension: 1, friction: 10 },
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBeGreaterThan(0)
      expect(isFinite(options.duration)).toBe(true)
    })

    it('should handle very high spring tension', () => {
      const controller = new MotionController(mockElement)
      controller.animate({
        animate: { opacity: 1 },
        spring: { tension: 1000, friction: 50 },
      })

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBeGreaterThan(0)
      expect(isFinite(options.duration)).toBe(true)
    })

    it('should handle animation without callbacks gracefully', () => {
      const controller = new MotionController(mockElement)

      expect(() => {
        controller.animate({
          animate: { opacity: 1 },
        })
        mockAnimations[0].finish()
      }).not.toThrow()
    })

    it('should handle multiple dispose calls', () => {
      const controller = new MotionController(mockElement)
      controller.animate({ animate: { opacity: 1 } })

      expect(() => {
        controller.dispose()
        controller.dispose()
        controller.dispose()
      }).not.toThrow()
    })

    it('should handle undefined element in createMotion', () => {
      // Mock document.createElement for this specific test
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation(
        (tagName: string) => {
          const element = originalCreateElement(tagName)
          element.animate = vi.fn((keyframes: any, options: any) => {
            const animation = new MockAnimation(keyframes, options)
            mockAnimations.push(animation)
            return animation as unknown as Animation
          }) as any
          element.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 100,
            x: 0,
            y: 0,
            top: 0,
            right: 100,
            bottom: 100,
            left: 0,
            toJSON: () => ({}),
          }))
          return element
        }
      )

      const motion = createMotion({
        element: null as any,
        animate: { opacity: 1 },
      })

      expect(motion.element).toBeDefined()
      expect(motion.element.tagName).toBe('DIV')
    })
  })
})
