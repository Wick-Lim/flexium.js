/**
 * Layout Primitives Types
 */

/**
 * Responsive value type supporting base and breakpoint-specific values
 */
export type ResponsiveValue<T> =
  | T
  | {
    base?: T
    sm?: T
    md?: T
    lg?: T
    xl?: T
  }

/**
 * CSS Properties type
 */
export interface CSSProperties {
  [key: string]: string | number | undefined
}

// Layout Types
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type JustifyContent =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
export type AlignItems =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'baseline'
  | 'flex-start'
  | 'flex-end'
export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto'
export type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
export type Display =
  | 'flex'
  | 'none'
  | 'block'
  | 'inline-block'
  | 'inline'
  | 'grid'
  | 'initial'
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse'

// Text Types
export type TextAlign = 'left' | 'center' | 'right' | 'justify'
export type FontStyle = 'normal' | 'italic' | 'oblique'
export type FontWeight =
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | number
  | string
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase'
export type TextDecoration =
  | 'none'
  | 'underline'
  | 'overline'
  | 'line-through'
  | 'blink'
export type WhiteSpace = 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap'
export type TextOverflow = 'clip' | 'ellipsis'
export type WordBreak = 'normal' | 'break-all' | 'keep-all' | 'break-word'
export type VerticalAlign =
  | 'baseline'
  | 'sub'
  | 'super'
  | 'top'
  | 'text-top'
  | 'middle'
  | 'bottom'
  | 'text-bottom'
  | string
  | number

// Other Types
export type Cursor =
  | 'auto'
  | 'default'
  | 'none'
  | 'context-menu'
  | 'help'
  | 'pointer'
  | 'progress'
  | 'wait'
  | 'cell'
  | 'crosshair'
  | 'text'
  | 'vertical-text'
  | 'alias'
  | 'copy'
  | 'move'
  | 'no-drop'
  | 'not-allowed'
  | 'grab'
  | 'grabbing'
  | string
export type Visibility = 'visible' | 'hidden' | 'collapse'
export type BoxSizing = 'content-box' | 'border-box'
export type PointerEvents =
  | 'auto'
  | 'none'
  | 'visiblePainted'
  | 'visibleFill'
  | 'visibleStroke'
  | 'visible'
  | 'painted'
  | 'fill'
  | 'stroke'
  | 'all'
  | 'inherit'

// Base style props that can be applied to any component
export interface BaseStyleProps {
  // Layout
  display?: ResponsiveValue<Display>
  flex?: ResponsiveValue<number | string>
  flexGrow?: ResponsiveValue<number>
  flexShrink?: ResponsiveValue<number>
  flexBasis?: ResponsiveValue<string>
  flexDirection?: ResponsiveValue<FlexDirection>
  justifyContent?: ResponsiveValue<JustifyContent>
  alignItems?: ResponsiveValue<AlignItems>
  alignSelf?: ResponsiveValue<AlignItems>
  gap?: ResponsiveValue<number | string>
  flexWrap?: ResponsiveValue<FlexWrap>

  // Spacing
  padding?: ResponsiveValue<number | string>
  paddingTop?: ResponsiveValue<number | string>
  paddingRight?: ResponsiveValue<number | string>
  paddingBottom?: ResponsiveValue<number | string>
  paddingLeft?: ResponsiveValue<number | string>
  margin?: ResponsiveValue<number | string>
  marginTop?: ResponsiveValue<number | string>
  marginRight?: ResponsiveValue<number | string>
  marginBottom?: ResponsiveValue<number | string>
  marginLeft?: ResponsiveValue<number | string>

  // Sizing
  width?: ResponsiveValue<number | string>
  height?: ResponsiveValue<number | string>
  minWidth?: ResponsiveValue<number | string>
  maxWidth?: ResponsiveValue<number | string>
  minHeight?: ResponsiveValue<number | string>
  maxHeight?: ResponsiveValue<number | string>

  // Visual
  backgroundColor?: ResponsiveValue<string>
  background?: ResponsiveValue<string>
  borderRadius?: ResponsiveValue<number | string>
  borderWidth?: ResponsiveValue<number | string>
  borderColor?: ResponsiveValue<string>
  borderStyle?: ResponsiveValue<string>
  border?: ResponsiveValue<string>
  opacity?: ResponsiveValue<number>
  overflow?: ResponsiveValue<Overflow>
  boxShadow?: ResponsiveValue<string>

  // Positioning
  position?: ResponsiveValue<Position>
  top?: ResponsiveValue<number | string>
  right?: ResponsiveValue<number | string>
  bottom?: ResponsiveValue<number | string>
  left?: ResponsiveValue<number | string>
  zIndex?: ResponsiveValue<number>

  // Text
  color?: ResponsiveValue<string>
  fontSize?: ResponsiveValue<number | string>
  fontWeight?: ResponsiveValue<FontWeight>
  fontFamily?: ResponsiveValue<string>
  fontStyle?: ResponsiveValue<FontStyle>
  textAlign?: ResponsiveValue<TextAlign>
  lineHeight?: ResponsiveValue<number | string>
  letterSpacing?: ResponsiveValue<number | string>
  textTransform?: ResponsiveValue<TextTransform>
  textDecoration?: ResponsiveValue<TextDecoration>
  whiteSpace?: ResponsiveValue<WhiteSpace>
  textOverflow?: ResponsiveValue<TextOverflow>
  wordBreak?: ResponsiveValue<WordBreak>
  verticalAlign?: ResponsiveValue<VerticalAlign>

  // Other
  cursor?: ResponsiveValue<Cursor>
  visibility?: ResponsiveValue<Visibility>
  boxSizing?: ResponsiveValue<BoxSizing>
  pointerEvents?: ResponsiveValue<PointerEvents>
}

// Base props for all components
export interface BaseComponentProps extends BaseStyleProps {
  id?: string
  /** CSS class name (unified API) */
  class?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: string
  tabIndex?: number
  /** Press/click handler (unified API for web and mobile) */
  onPress?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
}

// Configuration for style properties
const styleConfig: Record<string, (val: any) => any> = {}

// 1. Standard properties (direct mapping)
const standardProps = [
  'display',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'flexDirection',
  'flexWrap',
  'backgroundColor',
  'background',
  'borderColor',
  'borderStyle',
  'border',
  'opacity',
  'overflow',
  'boxShadow',
  'position',
  'zIndex',
  'color',
  'fontWeight',
  'fontFamily',
  'fontStyle',
  'textAlign',
  'textTransform',
  'textDecoration',
  'whiteSpace',
  'textOverflow',
  'wordBreak',
  'verticalAlign',
  'cursor',
  'visibility',
  'boxSizing',
  'pointerEvents',
]
standardProps.forEach((prop) => (styleConfig[prop] = (v) => v))

// 2. Pixel properties (convert number to px)
const pixelProps = [
  'gap',
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
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'borderRadius',
  'borderWidth',
  'top',
  'right',
  'bottom',
  'left',
  'fontSize',
  'lineHeight',
  'letterSpacing',
]
pixelProps.forEach((prop) => (styleConfig[prop] = toCSSValue))

// 3. Special mappings
styleConfig.justifyContent = (v) => mapJustifyContent(v)
styleConfig.alignItems = (v) => mapAlignItems(v)
styleConfig.alignSelf = (v) => mapAlignItems(v)

// Helper to convert style props to CSSProperties
export function stylePropsToCSS(props: BaseStyleProps): CSSProperties {
  const styles: CSSProperties = {}

  for (const key in props) {
    const transform = styleConfig[key]
    if (transform) {
      const value = getBaseValue(props[key as keyof BaseStyleProps])
      if (value !== undefined) {
        styles[key] = transform(value)
      }
    }
  }

  return styles
}

// Helper to merge styles (user-provided style takes precedence)
export function mergeStyles(
  baseStyles: CSSProperties,
  userStyles?: CSSProperties
): CSSProperties {
  if (!userStyles) {
    return baseStyles
  }
  return { ...baseStyles, ...userStyles }
}

// Helper to get the base value from a responsive prop
export function getBaseValue<T>(
  responsiveValue: ResponsiveValue<T> | undefined
): T | undefined {
  if (responsiveValue === undefined) return undefined
  if (
    typeof responsiveValue === 'object' &&
    responsiveValue !== null &&
    'base' in responsiveValue
  ) {
    // @ts-ignore - we know base exists because of the check
    return responsiveValue.base
  }
  return responsiveValue as T
}

// Helper to convert number to px string if needed
export function toCSSValue(
  value: number | string | undefined
): string | number | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') {
    return `${value}px`
  }
  return value
}

/** Map justify shorthand to CSS value */
export function mapJustifyContent(value: JustifyContent): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }
  return map[value] || value
}

/** Map align shorthand to CSS value */
export function mapAlignItems(value: AlignItems): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  }
  return map[value] || value
}
