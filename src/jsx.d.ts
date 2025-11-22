/**
 * JSX Type Definitions for Flexium
 *
 * This file provides TypeScript type definitions for JSX elements.
 * It defines which HTML elements and attributes are allowed in JSX,
 * and provides proper type checking and autocomplete support.
 */

import type { VNode } from './core/renderer'

declare global {
  namespace JSX {
    /**
     * The result type of JSX expressions
     */
    type Element = VNode

    /**
     * Props that are valid for all JSX elements
     */
    interface IntrinsicAttributes {
      key?: string | number
    }

    /**
     * Intrinsic HTML elements that can be used in JSX
     * This provides autocomplete and type checking for HTML elements
     */
    interface IntrinsicElements {
      // Document structure
      html: HTMLAttributes
      head: HTMLAttributes
      title: HTMLAttributes
      meta: HTMLAttributes
      link: HTMLAttributes
      style: HTMLAttributes
      body: HTMLAttributes

      // Sectioning
      header: HTMLAttributes
      nav: HTMLAttributes
      main: HTMLAttributes
      section: HTMLAttributes
      article: HTMLAttributes
      aside: HTMLAttributes
      footer: HTMLAttributes
      h1: HTMLAttributes
      h2: HTMLAttributes
      h3: HTMLAttributes
      h4: HTMLAttributes
      h5: HTMLAttributes
      h6: HTMLAttributes

      // Content grouping
      div: HTMLAttributes
      p: HTMLAttributes
      pre: HTMLAttributes
      blockquote: HTMLAttributes
      ol: HTMLAttributes
      ul: HTMLAttributes
      li: HTMLAttributes
      dl: HTMLAttributes
      dt: HTMLAttributes
      dd: HTMLAttributes
      figure: HTMLAttributes
      figcaption: HTMLAttributes
      hr: HTMLAttributes

      // Text semantics
      a: AnchorHTMLAttributes
      em: HTMLAttributes
      strong: HTMLAttributes
      small: HTMLAttributes
      s: HTMLAttributes
      cite: HTMLAttributes
      q: HTMLAttributes
      dfn: HTMLAttributes
      abbr: HTMLAttributes
      code: HTMLAttributes
      var: HTMLAttributes
      samp: HTMLAttributes
      kbd: HTMLAttributes
      sub: HTMLAttributes
      sup: HTMLAttributes
      i: HTMLAttributes
      b: HTMLAttributes
      u: HTMLAttributes
      mark: HTMLAttributes
      span: HTMLAttributes
      br: HTMLAttributes
      wbr: HTMLAttributes

      // Forms
      form: FormHTMLAttributes
      label: LabelHTMLAttributes
      input: InputHTMLAttributes
      button: ButtonHTMLAttributes
      select: SelectHTMLAttributes
      option: OptionHTMLAttributes
      textarea: TextareaHTMLAttributes
      fieldset: HTMLAttributes
      legend: HTMLAttributes

      // Interactive elements
      details: HTMLAttributes
      summary: HTMLAttributes
      dialog: HTMLAttributes

      // Media
      img: ImgHTMLAttributes
      video: VideoHTMLAttributes
      audio: AudioHTMLAttributes
      source: SourceHTMLAttributes
      canvas: CanvasHTMLAttributes
      svg: SVGAttributes
      path: SVGAttributes
      circle: SVGAttributes
      rect: SVGAttributes
      line: SVGAttributes
      polygon: SVGAttributes
      polyline: SVGAttributes
      text: SVGAttributes

      // Tables
      table: HTMLAttributes
      thead: HTMLAttributes
      tbody: HTMLAttributes
      tfoot: HTMLAttributes
      tr: HTMLAttributes
      th: HTMLAttributes
      td: HTMLAttributes
      caption: HTMLAttributes

      // Scripting
      script: ScriptHTMLAttributes
      noscript: HTMLAttributes

      // Custom Flexium components
      fragment: { children?: any }
    }

    /**
     * Base HTML attributes available on all elements
     */
    interface HTMLAttributes {
      // React-style key prop for list items
      key?: string | number

      // Standard HTML attributes
      id?: string
      class?: string
      className?: string
      style?: string | Record<string, any>
      title?: string
      lang?: string
      dir?: 'ltr' | 'rtl' | 'auto'
      tabIndex?: number
      role?: string
      contentEditable?: boolean | 'true' | 'false'
      draggable?: boolean | 'true' | 'false'
      hidden?: boolean

      // ARIA attributes
      'aria-label'?: string
      'aria-labelledby'?: string
      'aria-describedby'?: string
      'aria-hidden'?: boolean | 'true' | 'false'
      'aria-disabled'?: boolean | 'true' | 'false'
      'aria-expanded'?: boolean | 'true' | 'false'
      'aria-selected'?: boolean | 'true' | 'false'
      'aria-checked'?: boolean | 'true' | 'false'
      'aria-pressed'?: boolean | 'true' | 'false'
      'aria-current'?: string
      'aria-live'?: 'polite' | 'assertive' | 'off'
      'aria-relevant'?: string
      'aria-atomic'?: boolean | 'true' | 'false'

      // Data attributes (allow any data-* attribute)
      [key: `data-${string}`]: any

      // Event handlers (DOM Level 0 style)
      onclick?: (event: MouseEvent) => void
      ondblclick?: (event: MouseEvent) => void
      onmousedown?: (event: MouseEvent) => void
      onmouseup?: (event: MouseEvent) => void
      onmousemove?: (event: MouseEvent) => void
      onmouseover?: (event: MouseEvent) => void
      onmouseout?: (event: MouseEvent) => void
      onmouseenter?: (event: MouseEvent) => void
      onmouseleave?: (event: MouseEvent) => void
      oncontextmenu?: (event: MouseEvent) => void

      onkeydown?: (event: KeyboardEvent) => void
      onkeyup?: (event: KeyboardEvent) => void
      onkeypress?: (event: KeyboardEvent) => void

      onfocus?: (event: FocusEvent) => void
      onblur?: (event: FocusEvent) => void

      oninput?: (event: Event) => void
      onchange?: (event: Event) => void
      onsubmit?: (event: Event) => void

      onscroll?: (event: Event) => void
      onwheel?: (event: WheelEvent) => void

      ontouchstart?: (event: TouchEvent) => void
      ontouchmove?: (event: TouchEvent) => void
      ontouchend?: (event: TouchEvent) => void
      ontouchcancel?: (event: TouchEvent) => void

      // Children
      children?: any
    }

    interface AnchorHTMLAttributes extends HTMLAttributes {
      href?: string
      target?: '_blank' | '_self' | '_parent' | '_top'
      rel?: string
      download?: string
    }

    interface FormHTMLAttributes extends HTMLAttributes {
      action?: string
      method?: 'get' | 'post'
      enctype?: string
      target?: string
      novalidate?: boolean
    }

    interface LabelHTMLAttributes extends HTMLAttributes {
      for?: string
      htmlFor?: string
    }

    interface InputHTMLAttributes extends HTMLAttributes {
      type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' |
             'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' |
             'checkbox' | 'radio' | 'file' | 'submit' | 'reset' | 'button' | 'hidden'
      name?: string
      value?: string | number
      defaultValue?: string | number
      placeholder?: string
      disabled?: boolean
      readonly?: boolean
      required?: boolean
      checked?: boolean
      defaultChecked?: boolean
      min?: string | number
      max?: string | number
      step?: string | number
      pattern?: string
      autocomplete?: string
      autofocus?: boolean
      multiple?: boolean
      accept?: string
    }

    interface ButtonHTMLAttributes extends HTMLAttributes {
      type?: 'button' | 'submit' | 'reset'
      disabled?: boolean
      name?: string
      value?: string
    }

    interface SelectHTMLAttributes extends HTMLAttributes {
      name?: string
      value?: string | string[]
      defaultValue?: string | string[]
      disabled?: boolean
      required?: boolean
      multiple?: boolean
      size?: number
      autofocus?: boolean
    }

    interface OptionHTMLAttributes extends HTMLAttributes {
      value?: string
      selected?: boolean
      disabled?: boolean
    }

    interface TextareaHTMLAttributes extends HTMLAttributes {
      name?: string
      value?: string
      defaultValue?: string
      placeholder?: string
      disabled?: boolean
      readonly?: boolean
      required?: boolean
      rows?: number
      cols?: number
      maxlength?: number
      wrap?: 'hard' | 'soft'
      autofocus?: boolean
    }

    interface ImgHTMLAttributes extends HTMLAttributes {
      src?: string
      alt?: string
      width?: number | string
      height?: number | string
      loading?: 'lazy' | 'eager'
      decoding?: 'sync' | 'async' | 'auto'
      crossorigin?: 'anonymous' | 'use-credentials'
      srcset?: string
      sizes?: string
    }

    interface VideoHTMLAttributes extends HTMLAttributes {
      src?: string
      poster?: string
      width?: number | string
      height?: number | string
      controls?: boolean
      autoplay?: boolean
      loop?: boolean
      muted?: boolean
      preload?: 'none' | 'metadata' | 'auto'
    }

    interface AudioHTMLAttributes extends HTMLAttributes {
      src?: string
      controls?: boolean
      autoplay?: boolean
      loop?: boolean
      muted?: boolean
      preload?: 'none' | 'metadata' | 'auto'
    }

    interface SourceHTMLAttributes extends HTMLAttributes {
      src?: string
      type?: string
      media?: string
      srcset?: string
      sizes?: string
    }

    interface CanvasHTMLAttributes extends HTMLAttributes {
      width?: number | string
      height?: number | string
    }

    interface ScriptHTMLAttributes extends HTMLAttributes {
      src?: string
      type?: string
      async?: boolean
      defer?: boolean
      crossorigin?: 'anonymous' | 'use-credentials'
      integrity?: string
      nomodule?: boolean
    }

    interface SVGAttributes extends HTMLAttributes {
      xmlns?: string
      viewBox?: string
      width?: number | string
      height?: number | string
      fill?: string
      stroke?: string
      strokeWidth?: number | string
      d?: string
      x?: number | string
      y?: number | string
      cx?: number | string
      cy?: number | string
      r?: number | string
      rx?: number | string
      ry?: number | string
      x1?: number | string
      y1?: number | string
      x2?: number | string
      y2?: number | string
      points?: string
    }
  }
}

export {}
