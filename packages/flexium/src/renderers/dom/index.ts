import type { Renderer, EventHandler } from '../../core/renderer'
import { eventDelegator } from './events'

/**
 * Style property configuration for data-driven updates
 */
interface StylePropConfig {
  /** CSS property name to set */
  cssProp: string
  /** Transform function (e.g., px for pixel values) */
  transform?: 'px' | 'string' | 'none'
  /** Additional side effect when setting this property */
  sideEffect?: (style: CSSStyleDeclaration, value: string | undefined) => void
}

/**
 * Data-driven style property mappings
 * Maps Flexium props to CSS properties with optional transformations
 */
const STYLE_PROPS_CONFIG: Record<string, StylePropConfig> = {
  // Layout
  width: { cssProp: 'width', transform: 'px' },
  height: { cssProp: 'height', transform: 'px' },

  // Flex properties
  flexDirection: { cssProp: 'flexDirection', transform: 'none' },
  justifyContent: { cssProp: 'justifyContent', transform: 'none' },
  alignItems: { cssProp: 'alignItems', transform: 'none' },
  alignSelf: { cssProp: 'alignSelf', transform: 'none' },
  flexWrap: { cssProp: 'flexWrap', transform: 'none' },
  flex: { cssProp: 'flex', transform: 'string' },
  gap: { cssProp: 'gap', transform: 'px' },

  // Shorthands
  justify: { cssProp: 'justifyContent', transform: 'none' },
  align: { cssProp: 'alignItems', transform: 'none' },

  // Visual
  bg: { cssProp: 'backgroundColor', transform: 'none' },
  color: { cssProp: 'color', transform: 'none' },
  borderRadius: { cssProp: 'borderRadius', transform: 'px' },
  borderWidth: {
    cssProp: 'borderWidth',
    transform: 'px',
    sideEffect: (style, value) => {
      if (value !== undefined && style.borderStyle !== 'solid') {
        style.borderStyle = 'solid'
      }
    },
  },
  borderColor: { cssProp: 'borderColor', transform: 'none' },
  opacity: { cssProp: 'opacity', transform: 'string' },

  // Typography
  fontSize: { cssProp: 'fontSize', transform: 'px' },
  fontWeight: { cssProp: 'fontWeight', transform: 'string' },
  fontFamily: { cssProp: 'fontFamily', transform: 'none' },
  lineHeight: { cssProp: 'lineHeight', transform: 'string' },
  textAlign: { cssProp: 'textAlign', transform: 'none' },

  // Padding
  padding: { cssProp: 'padding', transform: 'px' },
  paddingTop: { cssProp: 'paddingTop', transform: 'px' },
  paddingRight: { cssProp: 'paddingRight', transform: 'px' },
  paddingBottom: { cssProp: 'paddingBottom', transform: 'px' },
  paddingLeft: { cssProp: 'paddingLeft', transform: 'px' },

  // Margin
  margin: { cssProp: 'margin', transform: 'px' },
  marginTop: { cssProp: 'marginTop', transform: 'px' },
  marginRight: { cssProp: 'marginRight', transform: 'px' },
  marginBottom: { cssProp: 'marginBottom', transform: 'px' },
  marginLeft: { cssProp: 'marginLeft', transform: 'px' },
}

/**
 * Component type to HTML element mapping
 */
const ELEMENT_MAPPING: Record<string, string> = {
  Row: 'div',
  Column: 'div',
  Stack: 'div',
  Text: 'span',
  Button: 'button',
  Input: 'input',
  Container: 'div',
}

/**
 * Event name mapping (platform-agnostic to DOM)
 */
const EVENT_MAPPING: Record<string, string> = {
  onPress: 'click',
  onHover: 'mouseenter',
  onChange: 'input',
  onFocus: 'focus',
  onBlur: 'blur',
}

/**
 * Props that should not be set as DOM attributes
 */
const SKIP_PROPS = new Set([
  'children',
  'key',
  'ref',
  'className',
  'style',
  // Layout props (handled via style)
  'width',
  'height',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'gap',
  'flex',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignSelf',
  // Shorthand flexbox props
  'align',
  'justify',
  // Visual props (handled via style)
  'bg',
  'color',
  'borderRadius',
  'borderWidth',
  'borderColor',
  'opacity',
  // Typography props
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'textAlign',
])

/**
 * Convert pixel value to CSS string
 */
function px(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * Convert camelCase to kebab-case for CSS property names
 */
function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * Transform a value based on the config type
 */
function transformValue(
  value: unknown,
  transform: StylePropConfig['transform']
): string | undefined {
  if (value === undefined || value === null) return undefined
  switch (transform) {
    case 'px':
      return px(value as number | string)
    case 'string':
      return String(value)
    case 'none':
    default:
      return value as string
  }
}

/**
 * Apply style props to DOM element efficiently
 */
function updateStyles(
  element: HTMLElement,
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): void {
  const style = element.style

  // 1. Handle 'style' object prop
  const oldStyle = oldProps.style as Record<string, string> | undefined
  const newStyle = newProps.style as Record<string, string> | undefined

  if (oldStyle !== newStyle) {
    if (oldStyle && typeof oldStyle === 'object') {
      for (const key in oldStyle) {
        if (!newStyle || !(key in newStyle)) {
          // Convert camelCase to kebab-case for CSS property names
          style.setProperty(toKebabCase(key), '')
        }
      }
    }
    if (newStyle && typeof newStyle === 'object') {
      for (const key in newStyle) {
        const val = newStyle[key]
        if (!oldStyle || oldStyle[key] !== val) {
          // Convert camelCase to kebab-case for CSS property names
          style.setProperty(toKebabCase(key), val)
        }
      }
    }
  }

  // 2. Flexbox setup (display: flex)
  const type = element.getAttribute('data-flexium-type')
  const needsFlex =
    newProps.flexDirection ||
    newProps.justifyContent ||
    newProps.alignItems ||
    newProps.flexWrap ||
    newProps.gap !== undefined ||
    newProps.justify ||
    newProps.align ||
    type === 'Row' ||
    type === 'Column' ||
    type === 'Stack'

  if (needsFlex) {
    if (style.display !== 'flex') style.display = 'flex'
    if (type === 'Row' && style.flexDirection !== 'row')
      style.flexDirection = 'row'
    if (type === 'Column' && style.flexDirection !== 'column')
      style.flexDirection = 'column'
  }

  // 3. Handle Flexium specific style props using data-driven config
  for (const propName in STYLE_PROPS_CONFIG) {
    const oldValue = oldProps[propName]
    const newValue = newProps[propName]

    if (oldValue === newValue) continue

    const config = STYLE_PROPS_CONFIG[propName]
    const transformedValue = transformValue(newValue, config.transform)
    const cssProp = config.cssProp as keyof CSSStyleDeclaration

    // Update the style property
    if (transformedValue === undefined) {
      if (style[cssProp] !== '') {
        ;(style as unknown as Record<string, string>)[cssProp as string] = ''
      }
    } else {
      if (style[cssProp] !== transformedValue) {
        ;(style as unknown as Record<string, string>)[cssProp as string] =
          transformedValue
      }
    }

    // Apply any side effects
    if (config.sideEffect) {
      config.sideEffect(style, transformedValue)
    }
  }
}

/**
 * Normalize className prop (supports string, array, object)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClass(value: any): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(normalizeClass).filter(Boolean).join(' ')
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value)
      .filter((k) => value[k])
      .join(' ')
  }
  return ''
}

/**
 * DOM Renderer implementation
 */
export class DOMRenderer implements Renderer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNode(type: string, props: Record<string, any>): HTMLElement {
    // Map component type to HTML element
    const tagName = ELEMENT_MAPPING[type] || type
    const element = document.createElement(tagName)

    // Store original type for reference
    if (ELEMENT_MAPPING[type]) {
      element.setAttribute('data-flexium-type', type)
    }

    // Apply all props (treat oldProps as empty)
    this.updateNode(element, {}, props)

    return element
  }

  updateNode(
    node: HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oldProps: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newProps: Record<string, any>
  ): void {
    // 1. Handle className
    if (newProps.className !== oldProps.className) {
      node.className = normalizeClass(newProps.className)
    }

    // 2. Update Styles (Efficiently)
    updateStyles(node, oldProps, newProps)

    // 3. Handle Events & Attributes
    // We iterate over merged keys to handle additions, updates, and removals in one pass if possible
    // But separating old and new is easier for now.

    // Remove deleted props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        // Ignore Symbols
        if (typeof key === 'symbol') continue

        if (key.startsWith('on')) {
          const eventName = EVENT_MAPPING[key] || key.slice(2).toLowerCase()
          this.removeEventListener(node, eventName, oldProps[key])
        } else if (!SKIP_PROPS.has(key)) {
          node.removeAttribute(key)
        }
      }
    }

    // Add/Update new props
    const keys = Reflect.ownKeys(newProps) // Get string and symbol keys
    for (const key of keys) {
      // Ignore Symbols (Synapse keys)
      if (typeof key === 'symbol') continue

      // Cast key to string for accessing record
      const strKey = key
      const newVal = newProps[strKey]
      const oldVal = oldProps[strKey]

      if (newVal === oldVal) continue

      if (strKey.startsWith('on')) {
        const eventName = EVENT_MAPPING[strKey] || strKey.slice(2).toLowerCase()
        if (oldVal) this.removeEventListener(node, eventName, oldVal)
        if (newVal) this.addEventListener(node, eventName, newVal)
      } else if (!SKIP_PROPS.has(strKey)) {
        if (newVal === null || newVal === undefined || newVal === false) {
          node.removeAttribute(strKey)
        } else if (newVal === true) {
          node.setAttribute(strKey, '')
        } else {
          node.setAttribute(strKey, String(newVal))
        }
      }
    }
  }

  appendChild(parent: Node, child: Node): void {
    parent.appendChild(child)
  }

  insertBefore(parent: Node, child: Node, beforeChild: Node | null): void {
    parent.insertBefore(child, beforeChild)
  }

  nextSibling(node: Node): Node | null {
    return node.nextSibling
  }

  removeChild(parent: Node, child: Node): void {
    // No need to manually cleanup listeners if using WeakMap in delegator
    // The nodeHandlers WeakMap will automatically release entries when node is garbage collected
    parent.removeChild(child)
  }

  createTextNode(text: string): Text {
    return document.createTextNode(text)
  }

  updateTextNode(node: Text, text: string): void {
    node.textContent = text
  }

  addEventListener(node: Node, event: string, handler: EventHandler): void {
    // Use Event Delegation
    // Map to DOM event name
    const domEvent = EVENT_MAPPING[event] || event
    eventDelegator.on(node, domEvent, handler)
  }

  removeEventListener(node: Node, event: string, _handler: EventHandler): void {
    // Use Event Delegation
    // Map to DOM event name
    const domEvent = EVENT_MAPPING[event] || event
    eventDelegator.off(node, domEvent)
  }
}

/**
 * Default DOM renderer instance
 */
export const domRenderer = new DOMRenderer()
