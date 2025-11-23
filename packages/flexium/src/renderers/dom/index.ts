import type { Renderer, EventHandler } from '../../core/renderer';
import { eventDelegator } from './events';

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
  View: 'div',
  Container: 'div',
};

/**
 * Event name mapping (platform-agnostic to DOM)
 */
const EVENT_MAPPING: Record<string, string> = {
  onPress: 'click',
  onHover: 'mouseenter',
  onChange: 'input',
  onFocus: 'focus',
  onBlur: 'blur',
};

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
]);

/**
 * Convert pixel value to CSS string
 */
function px(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Apply style props to DOM element
 */
function applyStyles(element: HTMLElement, props: Record<string, any>): void {
  const style = element.style;

  // Apply style object prop first (if provided)
  if (props.style && typeof props.style === 'object') {
    Object.assign(style, props.style);
  }

  // Layout
  if (props.width !== undefined) style.width = px(props.width);
  if (props.height !== undefined) style.height = px(props.height);

  // Padding - apply general padding first, then individual ones can override
  if (props.padding !== undefined) {
    style.padding = px(props.padding);
  }
  // Individual padding props can override the general padding
  if (props.paddingTop !== undefined) style.paddingTop = px(props.paddingTop);
  if (props.paddingRight !== undefined)
    style.paddingRight = px(props.paddingRight);
  if (props.paddingBottom !== undefined)
    style.paddingBottom = px(props.paddingBottom);
  if (props.paddingLeft !== undefined) style.paddingLeft = px(props.paddingLeft);

  // Margin - apply general margin first, then individual ones can override
  if (props.margin !== undefined) {
    style.margin = px(props.margin);
  }
  // Individual margin props can override the general margin
  if (props.marginTop !== undefined) style.marginTop = px(props.marginTop);
  if (props.marginRight !== undefined) style.marginRight = px(props.marginRight);
  if (props.marginBottom !== undefined)
    style.marginBottom = px(props.marginBottom);
  if (props.marginLeft !== undefined) style.marginLeft = px(props.marginLeft);

  // Flexbox - Row/Column get display:flex by default
  const type = element.getAttribute('data-flexium-type');
  if (type === 'Row' || type === 'Column' || type === 'Stack') {
    style.display = 'flex';

    if (type === 'Row') {
      style.flexDirection = 'row';
    } else if (type === 'Column') {
      style.flexDirection = 'column';
    }
  }

  // Apply flexbox properties
  if (props.flexDirection) style.flexDirection = props.flexDirection;
  if (props.justifyContent) style.justifyContent = props.justifyContent;
  if (props.alignItems) style.alignItems = props.alignItems;
  if (props.alignSelf) style.alignSelf = props.alignSelf;
  if (props.flexWrap) style.flexWrap = props.flexWrap;
  if (props.flex !== undefined) style.flex = String(props.flex);
  if (props.gap !== undefined) style.gap = px(props.gap);

  // Shorthand flexbox props
  if (props.justify) style.justifyContent = props.justify;
  if (props.align) style.alignItems = props.align;

  // If any flexbox layout props are present, set display:flex (unless it's already set)
  if (
    (props.flexDirection ||
      props.justifyContent ||
      props.alignItems ||
      props.flexWrap ||
      props.gap !== undefined ||
      props.justify ||
      props.align) &&
    !style.display
  ) {
    style.display = 'flex';
  }

  // Visual
  if (props.bg) style.backgroundColor = props.bg;
  if (props.color) style.color = props.color;
  if (props.borderRadius !== undefined)
    style.borderRadius = px(props.borderRadius);
  if (props.borderWidth !== undefined) {
    style.borderWidth = px(props.borderWidth);
    style.borderStyle = style.borderStyle || 'solid';
  }
  if (props.borderColor) style.borderColor = props.borderColor;
  if (props.opacity !== undefined) style.opacity = String(props.opacity);

  // Typography
  if (props.fontSize !== undefined) style.fontSize = px(props.fontSize);
  if (props.fontWeight !== undefined) style.fontWeight = String(props.fontWeight);
  if (props.fontFamily) style.fontFamily = props.fontFamily;
  if (props.lineHeight !== undefined) style.lineHeight = String(props.lineHeight);
  if (props.textAlign) style.textAlign = props.textAlign;
}

/**
 * Remove style props from DOM element
 */
function removeStyles(element: HTMLElement, props: Record<string, any>): void {
  const style = element.style;

  // Remove style object prop
  if (props.style && typeof props.style === 'object') {
    for (const key in props.style) {
      (style as any)[key] = '';
    }
  }

  // Layout
  if (props.width !== undefined) style.width = '';
  if (props.height !== undefined) style.height = '';

  // Padding
  if (props.padding !== undefined) {
    style.padding = '';
  } else {
    if (props.paddingTop !== undefined) style.paddingTop = '';
    if (props.paddingRight !== undefined) style.paddingRight = '';
    if (props.paddingBottom !== undefined) style.paddingBottom = '';
    if (props.paddingLeft !== undefined) style.paddingLeft = '';
  }

  // Margin
  if (props.margin !== undefined) {
    style.margin = '';
  } else {
    if (props.marginTop !== undefined) style.marginTop = '';
    if (props.marginRight !== undefined) style.marginRight = '';
    if (props.marginBottom !== undefined) style.marginBottom = '';
    if (props.marginLeft !== undefined) style.marginLeft = '';
  }

  // Flexbox
  if (props.flexDirection) style.flexDirection = '';
  if (props.justifyContent) style.justifyContent = '';
  if (props.alignItems) style.alignItems = '';
  if (props.alignSelf) style.alignSelf = '';
  if (props.flexWrap) style.flexWrap = '';
  if (props.flex !== undefined) style.flex = '';
  if (props.gap !== undefined) style.gap = '';

  // Shorthand flexbox props
  if (props.justify) style.justifyContent = '';
  if (props.align) style.alignItems = '';

  // Visual
  if (props.bg) style.backgroundColor = '';
  if (props.color) style.color = '';
  if (props.borderRadius !== undefined) style.borderRadius = '';
  if (props.borderWidth !== undefined) style.borderWidth = '';
  if (props.borderColor) style.borderColor = '';
  if (props.opacity !== undefined) style.opacity = '';

  // Typography
  if (props.fontSize !== undefined) style.fontSize = '';
  if (props.fontWeight !== undefined) style.fontWeight = '';
  if (props.fontFamily) style.fontFamily = '';
  if (props.lineHeight !== undefined) style.lineHeight = '';
  if (props.textAlign) style.textAlign = '';
}

/**
 * DOM Renderer implementation
 */
export class DOMRenderer implements Renderer {
  createNode(type: string, props: Record<string, any>): HTMLElement {
    // Map component type to HTML element
    const tagName = ELEMENT_MAPPING[type] || type;
    const element = document.createElement(tagName);

    // Store original type for reference
    element.setAttribute('data-flexium-type', type);

    // Apply all props
    this.updateNode(element, {}, props);

    return element;
  }

  updateNode(
    node: HTMLElement,
    oldProps: Record<string, any>,
    newProps: Record<string, any>
  ): void {
    // Handle className
    if (newProps.className !== oldProps.className) {
      if (newProps.className) {
        node.className = newProps.className;
      } else {
        node.className = '';
      }
    }

    // Remove old event listeners
    for (const key in oldProps) {
      if (key.startsWith('on') && !(key in newProps)) {
        const eventName = EVENT_MAPPING[key] || key.slice(2).toLowerCase();
        // Use delegator to unregister
        this.removeEventListener(node, eventName, oldProps[key]);
      }
    }

    // Remove old styles that are no longer present in newProps
    const removedStyleProps: Record<string, any> = {};
    for (const key in oldProps) {
      if (SKIP_PROPS.has(key) && !(key in newProps)) {
        removedStyleProps[key] = oldProps[key];
      }
    }
    if (Object.keys(removedStyleProps).length > 0) {
      removeStyles(node, removedStyleProps);
    }

    // Apply new styles
    applyStyles(node, newProps);

    // Add new event listeners
    for (const key in newProps) {
      if (key.startsWith('on')) {
        const handler = newProps[key];
        if (typeof handler === 'function') {
          const eventName = EVENT_MAPPING[key] || key.slice(2).toLowerCase();

          // Remove old listener if it exists
          const oldHandler = oldProps[key];
          if (oldHandler && oldHandler !== handler) {
            this.removeEventListener(node, eventName, oldHandler);
          }

          // Add new listener using delegator
          this.addEventListener(node, eventName, handler);
        }
      }
    }

    // Apply other props as attributes
    for (const key in newProps) {
      if (
        !key.startsWith('on') &&
        !SKIP_PROPS.has(key) &&
        newProps[key] !== oldProps[key]
      ) {
        const value = newProps[key];
        if (value === null || value === undefined || value === false) {
          node.removeAttribute(key);
        } else if (value === true) {
          node.setAttribute(key, '');
        } else {
          node.setAttribute(key, String(value));
        }
      }
    }

    // Remove old attributes
    for (const key in oldProps) {
      if (
        !key.startsWith('on') &&
        !SKIP_PROPS.has(key) &&
        !(key in newProps)
      ) {
        node.removeAttribute(key);
      }
    }
  }

  appendChild(parent: Node, child: Node): void {
    parent.appendChild(child);
  }

  insertBefore(parent: Node, child: Node, beforeChild: Node | null): void {
    parent.insertBefore(child, beforeChild);
  }

  nextSibling(node: Node): Node | null {
    return node.nextSibling;
  }

  removeChild(parent: Node, child: Node): void {
    // No need to manually cleanup listeners if using WeakMap in delegator
    // The nodeHandlers WeakMap will automatically release entries when node is garbage collected
    parent.removeChild(child);
  }

  createTextNode(text: string): Text {
    return document.createTextNode(text);
  }

  updateTextNode(node: Text, text: string): void {
    node.textContent = text;
  }

  addEventListener(node: Node, event: string, handler: EventHandler): void {
    // Use Event Delegation
    // Map to DOM event name
    const domEvent = EVENT_MAPPING[event] || event;
    eventDelegator.on(node, domEvent, handler);
  }

  removeEventListener(node: Node, event: string, _handler: EventHandler): void {
    // Use Event Delegation
    // Map to DOM event name
    const domEvent = EVENT_MAPPING[event] || event;
    eventDelegator.off(node, domEvent);
  }
}

/**
 * Default DOM renderer instance
 */
export const domRenderer = new DOMRenderer();
