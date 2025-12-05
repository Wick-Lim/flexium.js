/**
 * Image Component Tests
 *
 * Tests for Image primitive component
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest'
import { Image } from '../Image'

describe('Image', () => {
  describe('Basic FNode Creation', () => {
    it('should create correct FNode with img element', () => {
      const fnode = Image({ src: '/test.png' })

      expect(fnode.type).toBe('img')
      expect(fnode.props.src).toBe('/test.png')
      expect(fnode.children).toEqual([])
    })

    it('should always have empty children array', () => {
      const fnode = Image({ src: '/logo.png' })

      expect(fnode.children).toEqual([])
    })

    it('should require src prop', () => {
      const fnode = Image({ src: 'image.jpg' })

      expect(fnode.props.src).toBe('image.jpg')
    })
  })

  describe('Source Handling', () => {
    it('should handle absolute URL src', () => {
      const fnode = Image({ src: 'https://example.com/image.png' })

      expect(fnode.props.src).toBe('https://example.com/image.png')
    })

    it('should handle relative path src', () => {
      const fnode = Image({ src: './assets/logo.png' })

      expect(fnode.props.src).toBe('./assets/logo.png')
    })

    it('should handle root path src', () => {
      const fnode = Image({ src: '/images/photo.jpg' })

      expect(fnode.props.src).toBe('/images/photo.jpg')
    })

    it('should handle data URI src', () => {
      const dataUri = 'data:image/png;base64,iVBORw0KGgo='
      const fnode = Image({ src: dataUri })

      expect(fnode.props.src).toBe(dataUri)
    })

    it('should handle empty string src', () => {
      const fnode = Image({ src: '' })

      expect(fnode.props.src).toBe('')
    })
  })

  describe('Alt Text Handling', () => {
    it('should apply alt text when provided', () => {
      const fnode = Image({ src: '/logo.png', alt: 'Company Logo' })

      expect(fnode.props.alt).toBe('Company Logo')
    })

    it('should use empty string as default alt when not provided', () => {
      const fnode = Image({ src: '/image.png' })

      expect(fnode.props.alt).toBe('')
    })

    it('should handle empty string alt', () => {
      const fnode = Image({ src: '/image.png', alt: '' })

      expect(fnode.props.alt).toBe('')
    })

    it('should handle descriptive alt text', () => {
      const fnode = Image({
        src: '/photo.jpg',
        alt: 'A sunset over the ocean with vibrant orange and purple colors',
      })

      expect(fnode.props.alt).toBe(
        'A sunset over the ocean with vibrant orange and purple colors'
      )
    })
  })

  describe('Width and Height Props', () => {
    it('should apply width from props', () => {
      const fnode = Image({ src: '/img.png', width: 200 })

      expect(fnode.props.style.width).toBe('200px')
    })

    it('should apply height from props', () => {
      const fnode = Image({ src: '/img.png', height: 150 })

      expect(fnode.props.style.height).toBe('150px')
    })

    it('should apply both width and height from props', () => {
      const fnode = Image({ src: '/img.png', width: 300, height: 200 })

      expect(fnode.props.style.width).toBe('300px')
      expect(fnode.props.style.height).toBe('200px')
    })

    it('should prioritize width prop over style.width', () => {
      const fnode = Image({
        src: '/img.png',
        width: 100,
        style: { width: 200 },
      })

      expect(fnode.props.style.width).toBe('100px')
    })

    it('should prioritize height prop over style.height', () => {
      const fnode = Image({
        src: '/img.png',
        height: 100,
        style: { height: 200 },
      })

      expect(fnode.props.style.height).toBe('100px')
    })

    it('should use style.width when width prop is not provided', () => {
      const fnode = Image({
        src: '/img.png',
        style: { width: 250 },
      })

      expect(fnode.props.style.width).toBe('250px')
    })

    it('should use style.height when height prop is not provided', () => {
      const fnode = Image({
        src: '/img.png',
        style: { height: 175 },
      })

      expect(fnode.props.style.height).toBe('175px')
    })

    it('should handle string width in style', () => {
      const fnode = Image({
        src: '/img.png',
        style: { width: '100%' },
      })

      expect(fnode.props.style.width).toBe('100%')
    })

    it('should handle string height in style', () => {
      const fnode = Image({
        src: '/img.png',
        style: { height: '50vh' },
      })

      expect(fnode.props.style.height).toBe('50vh')
    })
  })

  describe('Style Normalization', () => {
    it('should normalize basic styles', () => {
      const fnode = Image({
        src: '/img.png',
        style: {
          borderRadius: 8,
          opacity: 0.8,
        },
      })

      expect(fnode.props.style).toMatchObject({
        borderRadius: '8px',
        opacity: 0.8,
      })
    })

    it('should normalize padding and margin', () => {
      const fnode = Image({
        src: '/img.png',
        style: {
          padding: 10,
          margin: 5,
        },
      })

      expect(fnode.props.style).toMatchObject({
        padding: '10px',
        margin: '5px',
      })
    })

    it('should normalize border properties', () => {
      const fnode = Image({
        src: '/img.png',
        style: {
          borderWidth: 2,
          borderColor: 'black',
        },
      })

      expect(fnode.props.style).toMatchObject({
        borderWidth: '2px',
        borderColor: 'black',
      })
    })

    it('should handle multiple style properties', () => {
      const fnode = Image({
        src: '/img.png',
        style: {
          width: 200,
          height: 150,
          borderRadius: 10,
          opacity: 0.9,
          backgroundColor: 'gray',
        },
      })

      expect(fnode.props.style).toMatchObject({
        width: '200px',
        height: '150px',
        borderRadius: '10px',
        opacity: 0.9,
        backgroundColor: 'gray',
      })
    })

    it('should return empty object style when style is undefined', () => {
      const fnode = Image({ src: '/img.png' })

      expect(fnode.props.style).toBeDefined()
    })
  })

  describe('Event Handlers', () => {
    it('should handle onLoad event', () => {
      const onLoad = () => {}
      const fnode = Image({ src: '/img.png', onLoad })

      expect(fnode.props.onload).toBe(onLoad)
    })

    it('should handle onError event', () => {
      const onError = () => {}
      const fnode = Image({ src: '/img.png', onError })

      expect(fnode.props.onerror).toBe(onError)
    })

    it('should handle both onLoad and onError', () => {
      const onLoad = () => {}
      const onError = () => {}
      const fnode = Image({ src: '/img.png', onLoad, onError })

      expect(fnode.props.onload).toBe(onLoad)
      expect(fnode.props.onerror).toBe(onError)
    })

    it('should handle undefined onLoad', () => {
      const fnode = Image({ src: '/img.png' })

      expect(fnode.props.onload).toBeUndefined()
    })

    it('should handle undefined onError', () => {
      const fnode = Image({ src: '/img.png' })

      expect(fnode.props.onerror).toBeUndefined()
    })
  })

  describe('Loading States', () => {
    it('should support eager loading via additional props', () => {
      const fnode = Image({
        src: '/img.png',
        loading: 'eager',
      } as any)

      expect(fnode.props.loading).toBe('eager')
    })

    it('should support lazy loading via additional props', () => {
      const fnode = Image({
        src: '/img.png',
        loading: 'lazy',
      } as any)

      expect(fnode.props.loading).toBe('lazy')
    })

    it('should support decoding attribute', () => {
      const fnode = Image({
        src: '/img.png',
        decoding: 'async',
      } as any)

      expect(fnode.props.decoding).toBe('async')
    })
  })

  describe('Additional Props', () => {
    it('should pass through additional props', () => {
      const fnode = Image({
        src: '/img.png',
        id: 'hero-image',
        'data-testid': 'image-element',
      } as any)

      expect(fnode.props.id).toBe('hero-image')
      expect(fnode.props['data-testid']).toBe('image-element')
    })

    it('should pass through aria attributes', () => {
      const fnode = Image({
        src: '/img.png',
        'aria-label': 'Decorative image',
        'aria-hidden': 'true',
      } as any)

      expect(fnode.props['aria-label']).toBe('Decorative image')
      expect(fnode.props['aria-hidden']).toBe('true')
    })

    it('should pass through className', () => {
      const fnode = Image({
        src: '/img.png',
        className: 'responsive-image',
      } as any)

      expect(fnode.props.className).toBe('responsive-image')
    })

    it('should pass through crossOrigin attribute', () => {
      const fnode = Image({
        src: 'https://example.com/img.png',
        crossOrigin: 'anonymous',
      } as any)

      expect(fnode.props.crossOrigin).toBe('anonymous')
    })

    it('should not include special props in rest props', () => {
      const fnode = Image({
        src: '/img.png',
        alt: 'Test',
        width: 100,
        height: 100,
        style: { opacity: 0.5 },
        onLoad: () => {},
        onError: () => {},
      })

      expect(fnode.props.width).toBeUndefined()
      expect(fnode.props.height).toBeUndefined()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete Image with all common props', () => {
      const onLoad = () => {}
      const onError = () => {}
      const fnode = Image({
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

      expect(fnode.type).toBe('img')
      expect(fnode.props.src).toBe('https://example.com/photo.jpg')
      expect(fnode.props.alt).toBe('A beautiful photograph')
      expect(fnode.props.style).toMatchObject({
        width: '800px',
        height: '600px',
        borderRadius: '10px',
        opacity: 0.95,
        margin: '20px',
      })
      expect(fnode.props.onload).toBe(onLoad)
      expect(fnode.props.onerror).toBe(onError)
      expect(fnode.props.id).toBe('main-photo')
      expect(fnode.children).toEqual([])
    })

    it('should handle minimal Image props', () => {
      const fnode = Image({ src: '/minimal.png' })

      expect(fnode.type).toBe('img')
      expect(fnode.props.src).toBe('/minimal.png')
      expect(fnode.props.alt).toBe('')
      expect(fnode.children).toEqual([])
    })

    it('should handle responsive image with percentage dimensions', () => {
      const fnode = Image({
        src: '/responsive.png',
        alt: 'Responsive',
        style: {
          width: '100%',
          height: 'auto',
        },
      })

      expect(fnode.props.style.width).toBe('100%')
      expect(fnode.props.style.height).toBe('auto')
    })
  })
})
