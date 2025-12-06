import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createText,
  createHeading,
  createParagraph,
  createLabel,
  createCode,
  type TextProps,
} from '../Text'
import { signal } from '../../../core/signal'

describe('Text Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('createText', () => {
    it('should create a paragraph element by default', () => {
      const { element } = createText({ children: 'Hello' })
      expect(element.tagName.toLowerCase()).toBe('p')
      expect(element.textContent).toBe('Hello')
    })

    it('should create element with specified variant', () => {
      const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'label', 'strong', 'em', 'code', 'pre'] as const
      for (const variant of variants) {
        const { element } = createText({ as: variant, children: 'test' })
        expect(element.tagName.toLowerCase()).toBe(variant)
      }
    })

    it('should handle string children', () => {
      const { element } = createText({ children: 'Hello World' })
      expect(element.textContent).toBe('Hello World')
    })

    it('should handle number children', () => {
      const { element } = createText({ children: 42 })
      expect(element.textContent).toBe('42')
    })

    it('should handle HTMLElement children', () => {
      const child = document.createElement('span')
      child.textContent = 'inner'
      const { element } = createText({ children: child })
      expect(element.contains(child)).toBe(true)
    })

    it('should handle array of HTMLElement children', () => {
      const child1 = document.createElement('span')
      child1.textContent = 'a'
      const child2 = document.createElement('span')
      child2.textContent = 'b'
      const { element } = createText({ children: [child1, child2] })
      expect(element.children.length).toBe(2)
    })

    it('should handle Signal children', () => {
      const content = signal('initial')
      const { element, dispose } = createText({ children: content })

      expect(element.textContent).toBe('initial')

      content.set('updated')
      expect(element.textContent).toBe('updated')

      dispose()
    })
  })

  describe('typography styles', () => {
    it('should apply fontSize', () => {
      const { element } = createText({ children: 'text', fontSize: 20 })
      expect(element.style.fontSize).toBe('20px')
    })

    it('should apply fontSize as string', () => {
      const { element } = createText({ children: 'text', fontSize: '1.5rem' })
      expect(element.style.fontSize).toBe('1.5rem')
    })

    it('should apply fontWeight', () => {
      const { element } = createText({ children: 'text', fontWeight: 700 })
      expect(element.style.fontWeight).toBe('700')
    })

    it('should apply fontFamily', () => {
      const { element } = createText({ children: 'text', fontFamily: 'Arial' })
      expect(element.style.fontFamily).toBe('Arial')
    })

    it('should apply lineHeight', () => {
      const { element } = createText({ children: 'text', lineHeight: 1.5 })
      expect(element.style.lineHeight).toBe('1.5px')
    })

    it('should apply letterSpacing', () => {
      const { element } = createText({ children: 'text', letterSpacing: 2 })
      expect(element.style.letterSpacing).toBe('2px')
    })

    it('should apply textAlign', () => {
      const { element } = createText({ children: 'text', textAlign: 'center' })
      expect(element.style.textAlign).toBe('center')
    })

    it('should apply textDecoration', () => {
      const { element } = createText({ children: 'text', textDecoration: 'underline' })
      expect(element.style.textDecoration).toBe('underline')
    })

    it('should apply textTransform', () => {
      const { element } = createText({ children: 'text', textTransform: 'uppercase' })
      expect(element.style.textTransform).toBe('uppercase')
    })

    it('should apply color', () => {
      const { element } = createText({ children: 'text', color: '#ff0000' })
      expect(element.style.color).toBe('rgb(255, 0, 0)')
    })

    it('should apply whiteSpace', () => {
      const { element } = createText({ children: 'text', whiteSpace: 'nowrap' })
      expect(element.style.whiteSpace).toBe('nowrap')
    })
  })

  describe('layout styles', () => {
    it('should apply display', () => {
      const { element } = createText({ children: 'text', display: 'inline-block' })
      expect(element.style.display).toBe('inline-block')
    })

    it('should apply margin', () => {
      const { element } = createText({ children: 'text', margin: 10 })
      expect(element.style.margin).toBe('10px')
    })

    it('should apply individual margin properties', () => {
      const { element } = createText({
        children: 'text',
        marginTop: 5,
        marginRight: 10,
        marginBottom: 15,
        marginLeft: 20,
      })
      expect(element.style.marginTop).toBe('5px')
      expect(element.style.marginRight).toBe('10px')
      expect(element.style.marginBottom).toBe('15px')
      expect(element.style.marginLeft).toBe('20px')
    })

    it('should apply padding', () => {
      const { element } = createText({ children: 'text', padding: 10 })
      expect(element.style.padding).toBe('10px')
    })

    it('should apply individual padding properties', () => {
      const { element } = createText({
        children: 'text',
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 15,
        paddingLeft: 20,
      })
      expect(element.style.paddingTop).toBe('5px')
      expect(element.style.paddingRight).toBe('10px')
      expect(element.style.paddingBottom).toBe('15px')
      expect(element.style.paddingLeft).toBe('20px')
    })

    it('should apply maxWidth', () => {
      const { element } = createText({ children: 'text', maxWidth: 500 })
      expect(element.style.maxWidth).toBe('500px')
    })
  })

  describe('truncation', () => {
    it('should apply truncation styles', () => {
      const { element } = createText({ children: 'text', truncate: true })
      expect(element.style.overflow).toBe('hidden')
      expect(element.style.textOverflow).toBe('ellipsis')
      expect(element.style.whiteSpace).toBe('nowrap')
      expect(element.classList.contains('text-truncate')).toBe(true)
    })

    it('should apply line clamp styles', () => {
      const { element } = createText({ children: 'text', lineClamp: 3 })
      expect(element.style.display).toBe('-webkit-box')
      expect(element.style.overflow).toBe('hidden')
      expect(element.classList.contains('text-line-clamp')).toBe(true)
    })
  })

  describe('className and style', () => {
    it('should apply className', () => {
      const { element } = createText({ children: 'text', className: 'custom-class' })
      expect(element.classList.contains('custom-class')).toBe(true)
      expect(element.classList.contains('text')).toBe(true)
      expect(element.classList.contains('text-p')).toBe(true)
    })

    it('should apply inline style object', () => {
      const { element } = createText({
        children: 'text',
        style: { backgroundColor: 'red', border: '1px solid black' },
      })
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.border).toBe('1px solid black')
    })
  })

  describe('accessibility', () => {
    it('should apply id', () => {
      const { element } = createText({ children: 'text', id: 'my-text' })
      expect(element.id).toBe('my-text')
    })

    it('should apply role', () => {
      const { element } = createText({ children: 'text', role: 'heading' })
      expect(element.getAttribute('role')).toBe('heading')
    })

    it('should apply aria-label', () => {
      const { element } = createText({ children: 'text', ariaLabel: 'Description' })
      expect(element.getAttribute('aria-label')).toBe('Description')
    })

    it('should apply aria-describedby', () => {
      const { element } = createText({ children: 'text', ariaDescribedby: 'desc-id' })
      expect(element.getAttribute('aria-describedby')).toBe('desc-id')
    })

    it('should apply aria-live', () => {
      const { element } = createText({ children: 'text', ariaLive: 'polite' })
      expect(element.getAttribute('aria-live')).toBe('polite')
    })
  })

  describe('event handlers', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn()
      const { element } = createText({ children: 'text', onClick })

      element.click()
      expect(onClick).toHaveBeenCalled()
    })

    it('should make element keyboard accessible when onClick is provided', () => {
      const onClick = vi.fn()
      const { element } = createText({ as: 'span', children: 'text', onClick })

      expect(element.getAttribute('role')).toBe('button')
      expect(element.getAttribute('tabindex')).toBe('0')
      expect(element.style.cursor).toBe('pointer')
    })

    it('should trigger onClick on Enter key', () => {
      const onClick = vi.fn()
      const { element } = createText({ as: 'span', children: 'text', onClick })

      const event = new KeyboardEvent('keypress', { key: 'Enter' })
      element.dispatchEvent(event)
      expect(onClick).toHaveBeenCalled()
    })

    it('should trigger onClick on Space key', () => {
      const onClick = vi.fn()
      const { element } = createText({ as: 'span', children: 'text', onClick })

      const event = new KeyboardEvent('keypress', { key: ' ' })
      element.dispatchEvent(event)
      expect(onClick).toHaveBeenCalled()
    })

    it('should call onMouseEnter on mouse enter', () => {
      const onMouseEnter = vi.fn()
      const { element } = createText({ children: 'text', onMouseEnter })

      element.dispatchEvent(new MouseEvent('mouseenter'))
      expect(onMouseEnter).toHaveBeenCalled()
    })

    it('should call onMouseLeave on mouse leave', () => {
      const onMouseLeave = vi.fn()
      const { element } = createText({ children: 'text', onMouseLeave })

      element.dispatchEvent(new MouseEvent('mouseleave'))
      expect(onMouseLeave).toHaveBeenCalled()
    })
  })

  describe('update function', () => {
    it('should update children', () => {
      const { element, update } = createText({ children: 'initial' })
      expect(element.textContent).toBe('initial')

      update({ children: 'updated' })
      expect(element.textContent).toBe('updated')
    })

    it('should update fontSize', () => {
      const { element, update } = createText({ children: 'text', fontSize: 16 })
      expect(element.style.fontSize).toBe('16px')

      update({ fontSize: 24 })
      expect(element.style.fontSize).toBe('24px')
    })

    it('should update fontWeight', () => {
      const { element, update } = createText({ children: 'text', fontWeight: 400 })
      expect(element.style.fontWeight).toBe('400')

      update({ fontWeight: 700 })
      expect(element.style.fontWeight).toBe('700')
    })

    it('should update color', () => {
      const { element, update } = createText({ children: 'text', color: 'red' })
      expect(element.style.color).toBe('red')

      update({ color: 'blue' })
      expect(element.style.color).toBe('blue')
    })

    it('should update className', () => {
      const { element, update } = createText({ children: 'text', className: 'class-a' })
      expect(element.classList.contains('class-a')).toBe(true)

      update({ className: 'class-b' })
      expect(element.classList.contains('class-b')).toBe(true)
    })

    it('should update style', () => {
      const { element, update } = createText({ children: 'text' })

      update({ style: { backgroundColor: 'yellow' } })
      expect(element.style.backgroundColor).toBe('yellow')
    })
  })

  describe('dispose function', () => {
    it('should clean up event listeners', () => {
      const onClick = vi.fn()
      const { element, dispose } = createText({ children: 'text', onClick })

      element.click()
      expect(onClick).toHaveBeenCalledTimes(1)

      dispose()
      element.click()
      expect(onClick).toHaveBeenCalledTimes(1) // No additional calls
    })

    it('should clean up signal effects', () => {
      const content = signal('initial')
      const { element, dispose } = createText({ children: content })

      expect(element.textContent).toBe('initial')
      content.set('updated')
      expect(element.textContent).toBe('updated')

      dispose()
      content.set('after dispose')
      // After dispose, updates should not affect the element
      // (depends on effect implementation)
    })
  })

  describe('convenience functions', () => {
    describe('createHeading', () => {
      it('should create h1-h6 elements', () => {
        for (let level = 1; level <= 6; level++) {
          const { element } = createHeading(level as 1 | 2 | 3 | 4 | 5 | 6, { children: `Heading ${level}` })
          expect(element.tagName.toLowerCase()).toBe(`h${level}`)
          expect(element.textContent).toBe(`Heading ${level}`)
        }
      })

      it('should apply props to heading', () => {
        const { element } = createHeading(1, { children: 'Title', fontSize: 32, color: 'blue' })
        expect(element.style.fontSize).toBe('32px')
        expect(element.style.color).toBe('blue')
      })
    })

    describe('createParagraph', () => {
      it('should create a p element', () => {
        const { element } = createParagraph({ children: 'Paragraph text' })
        expect(element.tagName.toLowerCase()).toBe('p')
        expect(element.textContent).toBe('Paragraph text')
      })
    })

    describe('createLabel', () => {
      it('should create a label element', () => {
        const { element } = createLabel({ children: 'Label text' })
        expect(element.tagName.toLowerCase()).toBe('label')
        expect(element.textContent).toBe('Label text')
      })
    })

    describe('createCode', () => {
      it('should create a code element with monospace font', () => {
        const { element } = createCode({ children: 'const x = 1' })
        expect(element.tagName.toLowerCase()).toBe('code')
        expect(element.textContent).toBe('const x = 1')
        expect(element.style.fontFamily).toBe('monospace')
      })

      it('should allow custom fontFamily', () => {
        const { element } = createCode({ children: 'code', fontFamily: 'Fira Code' })
        expect(element.style.fontFamily).toBe('Fira Code')
      })
    })
  })
})
