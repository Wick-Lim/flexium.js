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
 * Apply style props to DOM element efficiently
 */
function updateStyles(element: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>): void {
  const style = element.style;

  // 1. Handle 'style' object prop
  const oldStyle = oldProps.style;
  const newStyle = newProps.style;
  
  if (oldStyle !== newStyle) {
    if (oldStyle && typeof oldStyle === 'object') {
      for (const key in oldStyle) {
        if (!newStyle || !(key in newStyle)) {
          if ((style as any)[key] !== '') (style as any)[key] = '';
        }
      }
    }
    if (newStyle && typeof newStyle === 'object') {
      for (const key in newStyle) {
        const val = newStyle[key];
        if (!oldStyle || oldStyle[key] !== val) {
           (style as any)[key] = val;
        }
      }
    }
  }

  // 2. Handle Flexium specific style props
  // Helper to update individual style property if changed
  const update = (prop: string, value: string | undefined) => {
      // Note: accessing style[prop] is slow, maybe better to just assign?
      // Browsers optimize redundant assignment, but string conversion has cost.
      // Let's trust browser for simple properties, but we handle logic.
      if (value === undefined) {
          if ((style as any)[prop] !== '') (style as any)[prop] = '';
      } else {
          if ((style as any)[prop] !== value) (style as any)[prop] = value;
      }
  };

  // Layout
  if (oldProps.width !== newProps.width) update('width', newProps.width !== undefined ? px(newProps.width) : undefined);
  if (oldProps.height !== newProps.height) update('height', newProps.height !== undefined ? px(newProps.height) : undefined);

  // Flexbox setup (display: flex)
  const type = element.getAttribute('data-flexium-type');
  const needsFlex = (
      newProps.flexDirection || newProps.justifyContent || newProps.alignItems || 
      newProps.flexWrap || newProps.gap !== undefined || newProps.justify || newProps.align ||
      type === 'Row' || type === 'Column' || type === 'Stack'
  );

  if (needsFlex) {
      if (style.display !== 'flex') style.display = 'flex';
      
      if (type === 'Row' && style.flexDirection !== 'row') style.flexDirection = 'row';
      if (type === 'Column' && style.flexDirection !== 'column') style.flexDirection = 'column';
  }

  // Flex properties
  if (oldProps.flexDirection !== newProps.flexDirection) update('flexDirection', newProps.flexDirection);
  if (oldProps.justifyContent !== newProps.justifyContent) update('justifyContent', newProps.justifyContent);
  if (oldProps.alignItems !== newProps.alignItems) update('alignItems', newProps.alignItems);
  if (oldProps.alignSelf !== newProps.alignSelf) update('alignSelf', newProps.alignSelf);
  if (oldProps.flexWrap !== newProps.flexWrap) update('flexWrap', newProps.flexWrap);
  if (oldProps.flex !== newProps.flex) update('flex', newProps.flex !== undefined ? String(newProps.flex) : undefined);
  if (oldProps.gap !== newProps.gap) update('gap', newProps.gap !== undefined ? px(newProps.gap) : undefined);

  // Shorthands
  if (oldProps.justify !== newProps.justify) update('justifyContent', newProps.justify);
  if (oldProps.align !== newProps.align) update('alignItems', newProps.align);

  // Visual
  if (oldProps.bg !== newProps.bg) update('backgroundColor', newProps.bg);
  if (oldProps.color !== newProps.color) update('color', newProps.color);
  if (oldProps.borderRadius !== newProps.borderRadius) update('borderRadius', newProps.borderRadius !== undefined ? px(newProps.borderRadius) : undefined);
  if (oldProps.borderWidth !== newProps.borderWidth) {
      update('borderWidth', newProps.borderWidth !== undefined ? px(newProps.borderWidth) : undefined);
      if (newProps.borderWidth !== undefined && style.borderStyle !== 'solid') style.borderStyle = 'solid';
  }
  if (oldProps.borderColor !== newProps.borderColor) update('borderColor', newProps.borderColor);
  if (oldProps.opacity !== newProps.opacity) update('opacity', newProps.opacity !== undefined ? String(newProps.opacity) : undefined);

  // Typography
  if (oldProps.fontSize !== newProps.fontSize) update('fontSize', newProps.fontSize !== undefined ? px(newProps.fontSize) : undefined);
  if (oldProps.fontWeight !== newProps.fontWeight) update('fontWeight', newProps.fontWeight !== undefined ? String(newProps.fontWeight) : undefined);
  if (oldProps.fontFamily !== newProps.fontFamily) update('fontFamily', newProps.fontFamily);
  if (oldProps.lineHeight !== newProps.lineHeight) update('lineHeight', newProps.lineHeight !== undefined ? String(newProps.lineHeight) : undefined);
  if (oldProps.textAlign !== newProps.textAlign) update('textAlign', newProps.textAlign);
  
  // Padding/Margin
  // Optimization: Check general first
  if (oldProps.padding !== newProps.padding) update('padding', newProps.padding !== undefined ? px(newProps.padding) : undefined);
  if (oldProps.paddingTop !== newProps.paddingTop) update('paddingTop', newProps.paddingTop !== undefined ? px(newProps.paddingTop) : undefined);
  if (oldProps.paddingRight !== newProps.paddingRight) update('paddingRight', newProps.paddingRight !== undefined ? px(newProps.paddingRight) : undefined);
  if (oldProps.paddingBottom !== newProps.paddingBottom) update('paddingBottom', newProps.paddingBottom !== undefined ? px(newProps.paddingBottom) : undefined);
  if (oldProps.paddingLeft !== newProps.paddingLeft) update('paddingLeft', newProps.paddingLeft !== undefined ? px(newProps.paddingLeft) : undefined);

  if (oldProps.margin !== newProps.margin) update('margin', newProps.margin !== undefined ? px(newProps.margin) : undefined);
  if (oldProps.marginTop !== newProps.marginTop) update('marginTop', newProps.marginTop !== undefined ? px(newProps.marginTop) : undefined);
  if (oldProps.marginRight !== newProps.marginRight) update('marginRight', newProps.marginRight !== undefined ? px(newProps.marginRight) : undefined);
  if (oldProps.marginBottom !== newProps.marginBottom) update('marginBottom', newProps.marginBottom !== undefined ? px(newProps.marginBottom) : undefined);
  if (oldProps.marginLeft !== newProps.marginLeft) update('marginLeft', newProps.marginLeft !== undefined ? px(newProps.marginLeft) : undefined);
}

/**
 * Normalize className prop (supports string, array, object)
 */
function normalizeClass(value: any): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(normalizeClass).filter(Boolean).join(' ');
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).filter(k => value[k]).join(' ');
  }
  return '';
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
    if (ELEMENT_MAPPING[type]) {
        element.setAttribute('data-flexium-type', type);
    }

    // Apply all props (treat oldProps as empty)
    this.updateNode(element, {}, props);

    return element;
  }

  updateNode(
    node: HTMLElement,
    oldProps: Record<string, any>,
    newProps: Record<string, any>
  ): void {
    // 1. Handle className
    if (newProps.className !== oldProps.className) {
      node.className = normalizeClass(newProps.className);
    }

    // 2. Update Styles (Efficiently)
    updateStyles(node, oldProps, newProps);

    // 3. Handle Events & Attributes
    // We iterate over merged keys to handle additions, updates, and removals in one pass if possible
    // But separating old and new is easier for now.
    
    // Remove deleted props
    for (const key in oldProps) {
        if (!(key in newProps)) {
            // Ignore Symbols
            if (typeof key === 'symbol') continue;

            if (key.startsWith('on')) {
                const eventName = EVENT_MAPPING[key] || key.slice(2).toLowerCase();
                this.removeEventListener(node, eventName, oldProps[key]);
            } else if (!SKIP_PROPS.has(key)) {
                node.removeAttribute(key);
            }
        }
    }

    // Add/Update new props
    const keys = Reflect.ownKeys(newProps); // Get string and symbol keys
    for (const key of keys) {
        // Ignore Symbols (Synapse keys)
        if (typeof key === 'symbol') continue;
        
        // Cast key to string for accessing record
        const strKey = key as string;
        const newVal = newProps[strKey];
        const oldVal = oldProps[strKey];

        if (newVal === oldVal) continue;

        if (strKey.startsWith('on')) {
            const eventName = EVENT_MAPPING[strKey] || strKey.slice(2).toLowerCase();
            if (oldVal) this.removeEventListener(node, eventName, oldVal);
            if (newVal) this.addEventListener(node, eventName, newVal);
        } else if (!SKIP_PROPS.has(strKey)) {
            if (newVal === null || newVal === undefined || newVal === false) {
                node.removeAttribute(strKey);
            } else if (newVal === true) {
                node.setAttribute(strKey, '');
            } else {
                node.setAttribute(strKey, String(newVal));
            }
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
