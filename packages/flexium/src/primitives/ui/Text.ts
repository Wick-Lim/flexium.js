/**
 * Text Component - Typography with semantic HTML and style props
 *
 * Automatically selects appropriate HTML element (p, h1-h6, span) based on props
 * Supports typography props and accessibility features
 */

import { effect, type Signal } from '../../core/signal';

/**
 * Text variants (determines semantic HTML tag)
 */
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'label'
  | 'strong'
  | 'em'
  | 'code'
  | 'pre';

/**
 * Text alignment
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Text decoration
 */
export type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';

/**
 * Text transform
 */
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

/**
 * Text component props
 */
export interface TextProps {
  // Variant determines semantic HTML element
  as?: TextVariant;

  // Content
  children?: string | number | HTMLElement | HTMLElement[] | Signal<string | number>;

  // Typography
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: TextAlign;
  textDecoration?: TextDecoration;
  textTransform?: TextTransform;
  color?: string;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';

  // Responsive font sizes
  fontSizeBase?: number | string;
  fontSizeSm?: number | string;
  fontSizeMd?: number | string;
  fontSizeLg?: number | string;
  fontSizeXl?: number | string;

  // Layout
  display?: 'inline' | 'block' | 'inline-block';
  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  maxWidth?: number | string;

  // Text truncation
  truncate?: boolean; // Single line truncation
  lineClamp?: number; // Multi-line truncation

  // Styling
  className?: string;
  style?: Partial<CSSStyleDeclaration>;

  // Accessibility
  id?: string;
  role?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaLive?: 'off' | 'polite' | 'assertive';

  // Events
  onClick?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
}

/**
 * Convert value to CSS unit string
 */
function toCSSValue(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

/**
 * Create a text element with typography props
 */
export function createText(props: TextProps): {
  element: HTMLElement;
  update: (newProps: Partial<TextProps>) => void;
  dispose: () => void;
} {
  const {
    as = 'p',
    children,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    letterSpacing,
    textAlign,
    textDecoration,
    textTransform,
    color,
    whiteSpace,
    fontSizeBase,
    display,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    maxWidth,
    truncate = false,
    lineClamp,
    className = '',
    style,
    id,
    role,
    ariaLabel,
    ariaDescribedby,
    ariaLive,
    onClick,
    onMouseEnter,
    onMouseLeave,
  } = props;

  // Create element based on variant
  const element = document.createElement(as);

  // Set ID
  if (id) element.id = id;

  // Set role
  if (role) element.setAttribute('role', role);

  // Apply classes
  const classes = ['text', `text-${as}`];
  if (truncate) classes.push('text-truncate');
  if (lineClamp) classes.push('text-line-clamp');
  if (className) classes.push(className);
  element.className = classes.join(' ');

  // Apply typography styles
  const styles: Partial<CSSStyleDeclaration> = {};

  if (fontSize) styles.fontSize = toCSSValue(fontSize)!;
  if (fontWeight) styles.fontWeight = String(fontWeight);
  if (fontFamily) styles.fontFamily = fontFamily;
  if (lineHeight) styles.lineHeight = toCSSValue(lineHeight)!;
  if (letterSpacing) styles.letterSpacing = toCSSValue(letterSpacing)!;
  if (textAlign) styles.textAlign = textAlign;
  if (textDecoration) styles.textDecoration = textDecoration;
  if (textTransform) styles.textTransform = textTransform;
  if (color) styles.color = color;
  if (whiteSpace) styles.whiteSpace = whiteSpace;
  if (display) styles.display = display;
  if (maxWidth) styles.maxWidth = toCSSValue(maxWidth)!;

  // Layout styles
  if (margin) styles.margin = toCSSValue(margin)!;
  if (marginTop) styles.marginTop = toCSSValue(marginTop)!;
  if (marginRight) styles.marginRight = toCSSValue(marginRight)!;
  if (marginBottom) styles.marginBottom = toCSSValue(marginBottom)!;
  if (marginLeft) styles.marginLeft = toCSSValue(marginLeft)!;
  if (padding) styles.padding = toCSSValue(padding)!;
  if (paddingTop) styles.paddingTop = toCSSValue(paddingTop)!;
  if (paddingRight) styles.paddingRight = toCSSValue(paddingRight)!;
  if (paddingBottom) styles.paddingBottom = toCSSValue(paddingBottom)!;
  if (paddingLeft) styles.paddingLeft = toCSSValue(paddingLeft)!;

  // Truncation
  if (truncate) {
    styles.overflow = 'hidden';
    styles.textOverflow = 'ellipsis';
    styles.whiteSpace = 'nowrap';
  }

  if (lineClamp) {
    styles.display = '-webkit-box';
    (styles as any).webkitLineClamp = String(lineClamp);
    (styles as any).webkitBoxOrient = 'vertical';
    styles.overflow = 'hidden';
  }

  // Responsive font sizes (using CSS custom properties or media queries)
  // For simplicity, we'll use the base font size here
  // In a real implementation, you might generate CSS with media queries
  if (fontSizeBase) {
    styles.fontSize = toCSSValue(fontSizeBase)!;
  }

  // Apply inline styles
  Object.assign(element.style, styles);
  if (style) {
    Object.assign(element.style, style);
  }

  // Accessibility attributes
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);
  if (ariaDescribedby) element.setAttribute('aria-describedby', ariaDescribedby);
  if (ariaLive) element.setAttribute('aria-live', ariaLive);

  // Track effects for cleanup
  const disposers: (() => void)[] = [];

  // Handle content
  if (children !== undefined) {
    if (typeof children === 'string' || typeof children === 'number') {
      element.textContent = String(children);
    } else if (children instanceof HTMLElement) {
      element.appendChild(children);
    } else if (Array.isArray(children)) {
      children.forEach(child => element.appendChild(child));
    } else if (typeof (children as Signal<string | number>).value !== 'undefined') {
      // Signal content
      const contentSignal = children as Signal<string | number>;
      const contentEffect = effect(() => {
        element.textContent = String(contentSignal.value);
      });
      disposers.push(contentEffect);
    }
  }

  // Event handlers
  if (onClick) {
    const clickHandler = onClick as EventListener;
    element.addEventListener('click', clickHandler);
    disposers.push(() => element.removeEventListener('click', clickHandler));
    // Make clickable elements keyboard accessible
    if (as === 'span' || as === 'p') {
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.style.cursor = 'pointer';

      const handleKeyPress = (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') {
          e.preventDefault();
          onClick(e as any);
        }
      };
      element.addEventListener('keypress', handleKeyPress);
      disposers.push(() => element.removeEventListener('keypress', handleKeyPress));
    }
  }

  if (onMouseEnter) {
    const mouseEnterHandler = onMouseEnter as EventListener;
    element.addEventListener('mouseenter', mouseEnterHandler);
    disposers.push(() => element.removeEventListener('mouseenter', mouseEnterHandler));
  }

  if (onMouseLeave) {
    const mouseLeaveHandler = onMouseLeave as EventListener;
    element.addEventListener('mouseleave', mouseLeaveHandler);
    disposers.push(() => element.removeEventListener('mouseleave', mouseLeaveHandler));
  }

  // Update function
  function update(newProps: Partial<TextProps>): void {
    if (newProps.children !== undefined) {
      const newChildren = newProps.children;
      if (typeof newChildren === 'string' || typeof newChildren === 'number') {
        element.textContent = String(newChildren);
      }
    }

    if (newProps.fontSize !== undefined) {
      element.style.fontSize = toCSSValue(newProps.fontSize)!;
    }

    if (newProps.fontWeight !== undefined) {
      element.style.fontWeight = String(newProps.fontWeight);
    }

    if (newProps.color !== undefined) {
      element.style.color = newProps.color;
    }

    if (newProps.className !== undefined) {
      const classes = ['text', `text-${as}`];
      if (truncate) classes.push('text-truncate');
      if (lineClamp) classes.push('text-line-clamp');
      if (newProps.className) classes.push(newProps.className);
      element.className = classes.join(' ');
    }

    if (newProps.style) {
      Object.assign(element.style, newProps.style);
    }
  }

  // Cleanup function
  function dispose(): void {
    disposers.forEach(d => d());
  }

  return {
    element,
    update,
    dispose,
  };
}

/**
 * Convenience functions for common text elements
 */

export function createHeading(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  props: Omit<TextProps, 'as'>
): ReturnType<typeof createText> {
  return createText({ ...props, as: `h${level}` as TextVariant });
}

export function createParagraph(props: Omit<TextProps, 'as'>): ReturnType<typeof createText> {
  return createText({ ...props, as: 'p' });
}

export function createLabel(props: Omit<TextProps, 'as'>): ReturnType<typeof createText> {
  return createText({ ...props, as: 'label' });
}

export function createCode(props: Omit<TextProps, 'as'>): ReturnType<typeof createText> {
  return createText({
    ...props,
    as: 'code',
    fontFamily: props.fontFamily || 'monospace',
  });
}
