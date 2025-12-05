/**
 * Image Component Tests
 *
 * Tests for Image primitive component
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { Image } from '../Image'

describe('Image', () => {
  describe('Basic VNode Creation', () => {
    it('should create correct VNode with img element', () => {
      const vnode = Image({ src: '/test.png' })

      expect(vnode.type).toBe('img')
      expect(vnode.props.src).toBe('/test.png')
      expect(vnode.children).toEqual([])
    })

    it('should always have empty children array', () => {
      const vnode = Image({ src: '/logo.png' })

      expect(vnode.children).toEqual([])
    })

    it('should require src prop', () => {
      const vnode = Image({ src: 'image.jpg' })

      expect(vnode.props.src).toBe('image.jpg')
    })
  })

  describe('Source Handling', () => {
    it('should handle absolute URL src', () => {
      const vnode = Image({ src: 'https://example.com/image.png' })

      expect(vnode.props.src).toBe('https://example.com/image.png')
    })

    it('should handle relative path src', () => {
      const vnode = Image({ src: './assets/logo.png' })

      expect(vnode.props.src).toBe('./assets/logo.png')
    })

    it('should handle root path src', () => {
      const vnode = Image({ src: '/images/photo.jpg' })

      expect(vnode.props.src).toBe('/images/photo.jpg')
    })

    it('should handle data URI src', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgo='
      const vnode = Image({ src: dataUri })

      expect(vnode.props.src).toBe(dataUri)
    })

    it('should handle empty string src', () => {
      const vnode = Image({ src: '' })

      expect(vnode.props.src).toBe('')
    })
  })

  describe('Alt Text Handling', () => {
    it('should apply alt text when provided', () => {
      const vnode = Image({ src: '/logo.png', alt: 'Company Logo' })

      expect(vnode.props.alt).toBe('Company Logo')
    })

    it('should use empty string as default alt when not provided', () => {
      const vnode = Image({ src: '/image.png' })

      expect(vnode.props.alt).toBe('')
    })

    it('should handle empty string alt', () => {
      const vnode = Image({ src: '/image.png', alt: '' })

      expect(vnode.props.alt).toBe('')
    })

    it('should handle descriptive alt text', () => {
      const vnode = Image({
        src: '/photo.jpg',
        alt: 'A sunset over the ocean with vibrant orange and purple colors',
      })

      expect(vnode.props.alt).toBe(
        'A sunset over the ocean with vibrant orange and purple colors'
      )
    })
  })

  describe('Width and Height Props', () => {
    it('should apply width from props', () => {
      const vnode = Image({ src: '/img.png', width: 200 })

      expect(vnode.props.style.width).toBe('200px')
    })

    it('should apply height from props', () => {
      const vnode = Image({ src: '/img.png', height: 150 })

      expect(vnode.props.style.height).toBe('150px')
    })

    it('should apply both width and height from props', () => {
      const vnode = Image({ src: '/img.png', width: 300, height: 200 })

      expect(vnode.props.style.width).toBe('300px')
      expect(vnode.props.style.height).toBe('200px')
    })

    it('should prioritize width prop over style.width', () => {
      const vnode = Image({
        src: '/img.png',
        width: 100,
        style: { width: 200 },
      })

      expect(vnode.props.style.width).toBe('100px')
    })

    it('should prioritize height prop over style.height', () => {
      const vnode = Image({
        src: '/img.png',
        height: 100,
        style: { height: 200 },
      })

      expect(vnode.props.style.height).toBe('100px')
    })

    it('should use style.width when width prop is not provided', () => {
      const vnode = Image({
        src: '/img.png',
        style: { width: 250 },
      })

      expect(vnode.props.style.width).toBe('250px')
    })

    it('should use style.height when height prop is not provided', () => {
      const vnode = Image({
        src: '/img.png',
        style: { height: 175 },
      })

      expect(vnode.props.style.height).toBe('175px')
    })

    it('should handle string width in style', () => {
      const vnode = Image({
        src: '/img.png',
        style: { width: '100%' },
      })

      expect(vnode.props.style.width).toBe('100%')
    })

    it('should handle string height in style', () => {
      const vnode = Image({
        src: '/img.png',
        style: { height: '50vh' },
      })

      expect(vnode.props.style.height).toBe('50vh')
    })
  })

  describe('Style Normalization', () => {
    it('should normalize basic styles', () => {
      const vnode = Image({
        src: '/img.png',
        style: {
          borderRadius: 8,
          opacity: 0.8,
        },
      })

      expect(vnode.props.style).toMatchObject({
        borderRadius: '8px',
        opacity: 0.8,
      })
    })

    it('should normalize padding and margin', () => {
      const vnode = Image({
        src: '/img.png',
        style: {
          padding: 10,
          margin: 5,
        },
      })

      expect(vnode.props.style).toMatchObject({
        padding: '10px',
        margin: '5px',
      })
    })

    it('should normalize border properties', () => {
      const vnode = Image({
        src: '/img.png',
        style: {
          borderWidth: 2,
          borderColor: 'black',
        },
      })

      expect(vnode.props.style).toMatchObject({
        borderWidth: '2px',
        borderColor: 'black',
      })
    })

    it('should handle multiple style properties', () => {
      const vnode = Image({
        src: '/img.png',
        style: {
          width: 200,
          height: 150,
          borderRadius: 10,
          opacity: 0.9,
          backgroundColor: 'gray',
        },
      })

      expect(vnode.props.style).toMatchObject({
        width: '200px',
        height: '150px',
        borderRadius: '10px',
        opacity: 0.9,
        backgroundColor: 'gray',
      })
    })

    it('should return empty object style when style is undefined', () => {
      const vnode = Image({ src: '/img.png' })

      expect(vnode.props.style).toBeDefined()
    })
  })

  describe('Event Handlers', () => {
    it('should handle onLoad event', () => {
      const onLoad = () => {}
      const vnode = Image({ src: '/img.png', onLoad })

      expect(vnode.props.onload).toBe(onLoad)
    })

    it('should handle onError event', () => {
      const onError = () => {}
      const vnode = Image({ src: '/img.png', onError })

      expect(vnode.props.onerror).toBe(onError)
    })

    it('should handle both onLoad and onError', () => {
      const onLoad = () => {}
      const onError = () => {}
      const vnode = Image({ src: '/img.png', onLoad, onError })

      expect(vnode.props.onload).toBe(onLoad)
      expect(vnode.props.onerror).toBe(onError)
    })

    it('should handle undefined onLoad', () => {
      const vnode = Image({ src: '/img.png' })

      expect(vnode.props.onload).toBeUndefined()
    })

    it('should handle undefined onError', () => {
      const vnode = Image({ src: '/img.png' })

      expect(vnode.props.onerror).toBeUndefined()
    })
  })

  describe('Loading States', () => {
    it('should support eager loading via additional props', () => {
      const vnode = Image({
        src: '/img.png',
        loading: 'eager',
      } as any)

      expect(vnode.props.loading).toBe('eager')
    })

    it('should support lazy loading via additional props', () => {
      const vnode = Image({
        src: '/img.png',
        loading: 'lazy',
      } as any)

      expect(vnode.props.loading).toBe('lazy')
    })

    it('should support decoding attribute', () => {
      const vnode = Image({
        src: '/img.png',
        decoding: 'async',
      } as any)

      expect(vnode.props.decoding).toBe('async')
    })
  })

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const vnode = Image({
        src: '/img.png',
        id: 'hero-image',
        'data-testid': 'image-element',
      } as any)

      expect(vnode.props.id).toBe('hero-image')
      expect(vnode.props['data-testid']).toBe('image-element')
    })

    it('should pass through aria attributes', () => {
      const vnode = Image({
        src: '/img.png',
        'aria-label': 'Decorative image',
        'aria-hidden': 'true',
      } as any)

      expect(vnode.props['aria-label']).toBe('Decorative image')
      expect(vnode.props['aria-hidden']).toBe('true')
    })

    it('should pass through className', () => {
      const vnode = Image({
        src: '/img.png',
        className: 'responsive-image',
      } as any)

      expect(vnode.props.className).toBe('responsive-image')
    })

    it('should pass through crossOrigin attribute', () => {
      const vnode = Image({
        src: 'https://example.com/img.png',
        crossOrigin: 'anonymous',
      } as any)

      expect(vnode.props.crossOrigin).toBe('anonymous')
    })

    it('should not include special props in rest props', () => {
      const vnode = Image({
        src: '/img.png',
        alt: 'Test',
        width: 100,
        height: 100,
        style: { opacity: 0.5 },
        onLoad: () => {},
        onError: () => {},
      })

      expect(vnode.props.width).toBeUndefined()
      expect(vnode.props.height).toBeUndefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete Image with all common props', () => {
      const onLoad = () => {}
      const onError = () => {}
      const vnode = Image({
        src: 'https://example.com/photo.jpg',
        alt: 'A beautiful photograph',
        width: 800,
        height: 600,
        style: {
          borderRadius: 10,
          opacity: 0.95,
          margin: 20,
        },
        onLoad,
        onError,
        id: 'main-photo',
      } as any)

      expect(vnode.type).toBe('img')
      expect(vnode.props.src).toBe('https://example.com/photo.jpg')
      expect(vnode.props.alt).toBe('A beautiful photograph')
      expect(vnode.props.style).toMatchObject({
        width: '800px',
        height: '600px',
        borderRadius: '10px',
        opacity: 0.95,
        margin: '20px',
      })
      expect(vnode.props.onload).toBe(onLoad)
      expect(vnode.props.onerror).toBe(onError)
      expect(vnode.props.id).toBe('main-photo')
      expect(vnode.children).toEqual([])
    })

    it('should handle minimal Image props', () => {
      const vnode = Image({ src: '/minimal.png' })

      expect(vnode.type).toBe('img')
      expect(vnode.props.src).toBe('/minimal.png')
      expect(vnode.props.alt).toBe('')
      expect(vnode.children).toEqual([])
    })

    it('should handle responsive image with percentage dimensions', () => {
      const vnode = Image({
        src: '/responsive.png',
        alt: 'Responsive',
        style: {
          width: '100%',
          height: 'auto',
        },
      })

      expect(vnode.props.style.width).toBe('100%')
      expect(vnode.props.style.height).toBe('auto')
    })
  })
})
