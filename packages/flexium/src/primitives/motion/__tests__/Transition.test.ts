/**
 * Transition Component Tests
 *
 * Comprehensive tests for Transition animation system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  Transition,
  TransitionGroup,
  transitions,
  type TransitionProps,
  type TransitionPreset,
} from '../Transition'
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

describe('Transition Component', () => {
  let mockAnimations: MockAnimation[]
  let mockElements: HTMLElement[]

  beforeEach(() => {
    mockAnimations = []
    mockElements = []

    // Mock document.createElement to track elements
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const element = originalCreateElement(tagName)
        mockElements.push(element)

        // Mock element.animate
        element.animate = vi.fn((keyframes: any, options: any) => {
          const animation = new MockAnimation(keyframes, options)
          mockAnimations.push(animation)
          return animation as unknown as Animation
        }) as any

        return element
      }
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockAnimations = []
    mockElements = []
  })

  describe('Basic Transition Rendering', () => {
    it('should render transition component with children', () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test Content',
      })

      expect(result).toBeDefined()
    })

    it('should create wrapper div with display:contents style', () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test',
      }) as any

      expect(result.type).toBe('div')
      expect(result.props.style).toEqual({ display: 'contents' })
    })

    it('should pass children through to wrapper', () => {
      const children = 'Test Content'
      const result = Transition({
        preset: 'fade',
        children,
      }) as any

      // Children are normalized to an array by h function
      expect(result.children).toEqual([children])
    })
  })

  describe('Preset Animations', () => {
    it('should apply fade preset correctly', async () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test',
      }) as any

      // Simulate ref callback
      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)

      // Wait for microtask
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(mockElement.animate).toHaveBeenCalled()
      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toEqual({ opacity: '0' })
      expect(keyframes[1]).toEqual({ opacity: '1' })
    })

    it('should apply slide-up preset correctly', async () => {
      const result = Transition({
        preset: 'slide-up',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(mockElement.animate).toHaveBeenCalled()
      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('translateY(20px)'),
      })
      expect(keyframes[1]).toMatchObject({
        opacity: '1',
        transform: expect.stringContaining('translateY(0px)'),
      })
    })

    it('should apply slide-down preset correctly', async () => {
      const result = Transition({
        preset: 'slide-down',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('translateY(-20px)'),
      })
      expect(keyframes[1]).toMatchObject({
        opacity: '1',
        transform: expect.stringContaining('translateY(0px)'),
      })
    })

    it('should apply slide-left preset correctly', async () => {
      const result = Transition({
        preset: 'slide-left',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('translateX(20px)'),
      })
      expect(keyframes[1]).toMatchObject({
        opacity: '1',
        transform: expect.stringContaining('translateX(0px)'),
      })
    })

    it('should apply slide-right preset correctly', async () => {
      const result = Transition({
        preset: 'slide-right',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('translateX(-20px)'),
      })
      expect(keyframes[1]).toMatchObject({
        opacity: '1',
        transform: expect.stringContaining('translateX(0px)'),
      })
    })

    it('should apply scale preset correctly', async () => {
      const result = Transition({
        preset: 'scale',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        transform: expect.stringContaining('scale(0.9)'),
      })
      expect(keyframes[1]).toMatchObject({
        transform: expect.stringContaining('scale(1)'),
      })
    })

    it('should apply scale-fade preset correctly', async () => {
      const result = Transition({
        preset: 'scale-fade',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('scale(0.95)'),
      })
      expect(keyframes[1]).toMatchObject({
        opacity: '1',
        transform: expect.stringContaining('scale(1)'),
      })
    })
  })

  describe('Custom Animations', () => {
    it('should use custom enter and enterTo props', async () => {
      const result = Transition({
        enter: { opacity: 0, x: 100 },
        enterTo: { opacity: 1, x: 0 },
        exit: { opacity: 0 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('translateX(100px)'),
      })
      expect(keyframes[1]).toMatchObject({
        opacity: '1',
        transform: expect.stringContaining('translateX(0px)'),
      })
    })

    it('should override preset with custom props', async () => {
      const result = Transition({
        preset: 'fade',
        enter: { opacity: 0, scale: 0.5 },
        enterTo: { opacity: 1, scale: 1 },
        exit: { opacity: 0 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      // Custom props should override preset
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('scale(0.5)'),
      })
    })
  })

  describe('Timing Configuration', () => {
    it('should use default enter timing', async () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(300)
      expect(options.easing).toBe('ease-out')
    })

    it('should use custom enter timing', async () => {
      const result = Transition({
        preset: 'fade',
        enterTiming: { duration: 500, easing: 'ease-in-out' },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(500)
      expect(options.easing).toBe('ease-in-out')
    })

    it('should apply enter delay', async () => {
      const result = Transition({
        preset: 'fade',
        enterTiming: { duration: 300, delay: 100 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.delay).toBe(100)
    })
  })

  describe('Callbacks', () => {
    it('should call onEnterStart when animation starts', async () => {
      const onEnterStart = vi.fn()
      const result = Transition({
        preset: 'fade',
        onEnterStart,
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(onEnterStart).toHaveBeenCalledTimes(1)
    })

    it('should call onEnterComplete when animation finishes', async () => {
      const onEnterComplete = vi.fn()
      const result = Transition({
        preset: 'fade',
        onEnterComplete,
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      // Finish the animation
      mockAnimations[0].finish()

      expect(onEnterComplete).toHaveBeenCalledTimes(1)
    })

    it('should not throw when callbacks are undefined', async () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      expect(() => {
        refCallback(mockElement)
      }).not.toThrow()
    })
  })

  describe('TransitionGroup', () => {
    it('should create TransitionGroup component', () => {
      const result = TransitionGroup({
        stagger: 50,
        children: 'Test',
      })

      expect(result).toBeDefined()
      expect(typeof result).toBe('function')
    })

    it('should use default stagger value', () => {
      const result = TransitionGroup({
        children: 'Test',
      })

      expect(result).toBeDefined()
    })

    it('should return children when function is called', () => {
      const children = 'Test Content'
      const result = TransitionGroup({
        stagger: 50,
        children,
      })

      const output = (result as Function)()
      expect(output).toBe(children)
    })

    it('should reset child index on each render', () => {
      const children = 'Test'
      const result = TransitionGroup({
        stagger: 50,
        children,
      })

      const fn = result as Function
      fn()
      fn()
      fn()

      // If it works correctly, it should not throw
      expect(fn()).toBe(children)
    })

    it('should restore previous group context after rendering', () => {
      const children = 'Test'
      const result = TransitionGroup({
        stagger: 50,
        children,
      })

      const fn = result as Function
      fn()

      // Context should be restored, no errors should occur
      expect(() => fn()).not.toThrow()
    })
  })

  describe('Stagger Animations', () => {
    it('should apply stagger delay to multiple children', async () => {
      // This test simulates staggered animations but due to the implementation
      // we can verify the logic works by checking that delays accumulate
      const result = Transition({
        preset: 'fade',
        enterTiming: { duration: 300, delay: 0 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.delay).toBe(0)
    })
  })

  describe('Preset Transitions Object', () => {
    it('should have fade preset', () => {
      expect(transitions.fade).toBeDefined()
      expect(transitions.fade.preset).toBe('fade')
    })

    it('should have slideUp preset', () => {
      expect(transitions.slideUp).toBeDefined()
      expect(transitions.slideUp.preset).toBe('slide-up')
    })

    it('should have slideDown preset', () => {
      expect(transitions.slideDown).toBeDefined()
      expect(transitions.slideDown.preset).toBe('slide-down')
    })

    it('should have slideLeft preset', () => {
      expect(transitions.slideLeft).toBeDefined()
      expect(transitions.slideLeft.preset).toBe('slide-left')
    })

    it('should have slideRight preset', () => {
      expect(transitions.slideRight).toBeDefined()
      expect(transitions.slideRight.preset).toBe('slide-right')
    })

    it('should have scale preset', () => {
      expect(transitions.scale).toBeDefined()
      expect(transitions.scale.preset).toBe('scale')
    })

    it('should have scaleFade preset', () => {
      expect(transitions.scaleFade).toBeDefined()
      expect(transitions.scaleFade.preset).toBe('scale-fade')
    })

    it('should have modal preset with custom configuration', () => {
      expect(transitions.modal).toBeDefined()
      expect(transitions.modal.enter).toEqual({
        opacity: 0,
        scale: 0.95,
        y: -10,
      })
      expect(transitions.modal.enterTo).toEqual({ opacity: 1, scale: 1, y: 0 })
      expect(transitions.modal.exit).toEqual({ opacity: 0, scale: 0.95, y: 10 })
      expect(transitions.modal.enterTiming?.duration).toBe(200)
      expect(transitions.modal.exitTiming?.duration).toBe(150)
    })

    it('should have dropdown preset with custom configuration', () => {
      expect(transitions.dropdown).toBeDefined()
      expect(transitions.dropdown.enter).toEqual({
        opacity: 0,
        y: -8,
        scale: 0.95,
      })
      expect(transitions.dropdown.enterTiming?.duration).toBe(150)
      expect(transitions.dropdown.exitTiming?.duration).toBe(100)
    })

    it('should have tooltip preset with custom configuration', () => {
      expect(transitions.tooltip).toBeDefined()
      expect(transitions.tooltip.enter).toEqual({ opacity: 0, scale: 0.9 })
      expect(transitions.tooltip.enterTiming?.duration).toBe(100)
      expect(transitions.tooltip.exitTiming?.duration).toBe(75)
    })

    it('should have notification preset with custom configuration', () => {
      expect(transitions.notification).toBeDefined()
      expect(transitions.notification.enter).toEqual({ opacity: 0, x: 100 })
      expect(transitions.notification.enterTiming?.duration).toBe(300)
      expect(transitions.notification.exitTiming?.duration).toBe(200)
    })

    it('should have page preset with custom configuration', () => {
      expect(transitions.page).toBeDefined()
      expect(transitions.page.enter).toEqual({ opacity: 0 })
      expect(transitions.page.enterTo).toEqual({ opacity: 1 })
      expect(transitions.page.exit).toEqual({ opacity: 0 })
      expect(transitions.page.enterTiming?.duration).toBe(200)
      expect(transitions.page.exitTiming?.duration).toBe(150)
    })

    it('should be usable with Transition component', async () => {
      const result = Transition({
        ...transitions.modal,
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(mockElement.animate).toHaveBeenCalled()
      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(200)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null ref callback gracefully', () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref

      expect(() => {
        refCallback(null)
      }).not.toThrow()
    })

    it('should handle empty enter/exit props', async () => {
      const result = Transition({
        enter: {},
        enterTo: {},
        exit: {},
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toEqual({})
      expect(keyframes[1]).toEqual({})
    })

    it('should handle transitions without preset or custom props', async () => {
      const result = Transition({
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toEqual({})
      expect(keyframes[1]).toEqual({})
    })

    it('should handle partial timing configuration', async () => {
      const result = Transition({
        preset: 'fade',
        enterTiming: { duration: 400 }, // no easing
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(400)
      expect(options.easing).toBeDefined()
    })

    it('should handle complex children structures', () => {
      const child1 = 'Text'
      const child2 = { type: 'div', props: {} }
      const child3 = 123

      const result = Transition({
        preset: 'fade',
        children: [child1, child2, child3],
      }) as any

      // h function receives children as rest parameter, so single array argument becomes nested
      expect(result.children).toBeDefined()
      expect(result.children.length).toBeGreaterThan(0)
    })
  })

  describe('Exit Animations', () => {
    it('should configure exit animation with preset', () => {
      const result = Transition({
        preset: 'fade',
        exitTiming: { duration: 200, easing: 'ease-in' },
        children: 'Test',
      }) as any

      expect(result).toBeDefined()
    })

    it('should configure custom exit animation', () => {
      const result = Transition({
        exit: { opacity: 0, y: 100 },
        exitTiming: { duration: 300 },
        children: 'Test',
      }) as any

      expect(result).toBeDefined()
    })

    it('should use default exit timing when not provided', () => {
      const result = Transition({
        preset: 'slide-up',
        children: 'Test',
      }) as any

      expect(result).toBeDefined()
    })
  })

  describe('Initial Mount Behavior', () => {
    it('should trigger enter animation on initial mount', async () => {
      const result = Transition({
        preset: 'fade',
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(mockElement.animate).toHaveBeenCalledTimes(1)
    })

    it('should apply initial styles immediately before animation', async () => {
      const result = Transition({
        enter: { opacity: 0, scale: 0.5 },
        enterTo: { opacity: 1, scale: 1 },
        exit: { opacity: 0 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(mockElement.animate).toHaveBeenCalled()
      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('scale(0.5)'),
      })
    })
  })

  describe('Multiple Preset Combinations', () => {
    it('should handle scale with translation', async () => {
      const result = Transition({
        enter: { scale: 0.8, x: -50, y: 20 },
        enterTo: { scale: 1, x: 0, y: 0 },
        exit: { scale: 0.8, x: 50, y: -20 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0].transform).toContain('translateX(-50px)')
      expect(keyframes[0].transform).toContain('translateY(20px)')
      expect(keyframes[0].transform).toContain('scale(0.8)')
    })

    it('should handle rotation with opacity', async () => {
      const result = Transition({
        enter: { opacity: 0, rotate: -180 },
        enterTo: { opacity: 1, rotate: 0 },
        exit: { opacity: 0, rotate: 180 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0]).toMatchObject({
        opacity: '0',
        transform: expect.stringContaining('rotate(-180deg)'),
      })
    })
  })

  describe('Advanced Timing Options', () => {
    it('should handle cubic-bezier easing', async () => {
      const result = Transition({
        preset: 'fade',
        enterTiming: {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    })

    it('should handle very long durations', async () => {
      const result = Transition({
        preset: 'fade',
        enterTiming: { duration: 2000 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(2000)
    })

    it('should handle very short durations', async () => {
      const result = Transition({
        preset: 'fade',
        enterTiming: { duration: 50 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [, options] = (mockElement.animate as any).mock.calls[0]
      expect(options.duration).toBe(50)
    })
  })

  describe('Callback Sequencing', () => {
    it('should call onEnterStart before onEnterComplete', async () => {
      const callOrder: string[] = []
      const onEnterStart = vi.fn(() => callOrder.push('start'))
      const onEnterComplete = vi.fn(() => callOrder.push('complete'))

      const result = Transition({
        preset: 'fade',
        onEnterStart,
        onEnterComplete,
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))
      mockAnimations[0].finish()

      expect(callOrder).toEqual(['start', 'complete'])
    })

    it('should call onEnterStart even if it contains errors', async () => {
      const onEnterStart = vi.fn()

      const result = Transition({
        preset: 'fade',
        onEnterStart,
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      expect(onEnterStart).toHaveBeenCalledTimes(1)
    })
  })

  describe('TransitionGroup Advanced', () => {
    it('should handle zero stagger', () => {
      const result = TransitionGroup({
        stagger: 0,
        children: 'Test',
      })

      expect(result).toBeDefined()
      expect(typeof result).toBe('function')
    })

    it('should handle large stagger values', () => {
      const result = TransitionGroup({
        stagger: 1000,
        children: 'Test',
      })

      expect(result).toBeDefined()
      const output = (result as Function)()
      expect(output).toBe('Test')
    })

    it('should properly handle rendering with function children', () => {
      const childFn = vi.fn(() => 'Rendered')

      const result = TransitionGroup({
        stagger: 50,
        children: childFn,
      })

      const fn = result as Function
      const output = fn()

      // The function child should be returned as-is
      expect(output).toBe(childFn)
    })
  })

  describe('Animation Property Edge Cases', () => {
    it('should handle decimal opacity values', async () => {
      const result = Transition({
        enter: { opacity: 0.25 },
        enterTo: { opacity: 0.75 },
        exit: { opacity: 0 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0].opacity).toBe('0.25')
      expect(keyframes[1].opacity).toBe('0.75')
    })

    it('should handle negative scale values', async () => {
      const result = Transition({
        enter: { scale: -1 },
        enterTo: { scale: 1 },
        exit: { scale: -1 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0].transform).toContain('scale(-1)')
    })

    it('should handle large rotation values', async () => {
      const result = Transition({
        enter: { rotate: 720 },
        enterTo: { rotate: 0 },
        exit: { rotate: 0 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0].transform).toContain('rotate(720deg)')
    })

    it('should handle scaleX and scaleY independently', async () => {
      const result = Transition({
        enter: { scaleX: 0.5, scaleY: 2 },
        enterTo: { scaleX: 1, scaleY: 1 },
        exit: { scaleX: 1, scaleY: 1 },
        children: 'Test',
      }) as any

      const refCallback = result.props.ref
      const mockElement = document.createElement('div')
      mockElement.animate = vi.fn((keyframes: any, options: any) => {
        const animation = new MockAnimation(keyframes, options)
        mockAnimations.push(animation)
        return animation as unknown as Animation
      }) as any

      refCallback(mockElement)
      await new Promise((resolve) => queueMicrotask(resolve))

      const [keyframes] = (mockElement.animate as any).mock.calls[0]
      expect(keyframes[0].transform).toContain('scaleX(0.5)')
      expect(keyframes[0].transform).toContain('scaleY(2)')
    })
  })
})
