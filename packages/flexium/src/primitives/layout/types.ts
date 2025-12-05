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
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: string
  tabIndex?: number
  onClick?: (event: MouseEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
}

// Helper to convert style props to CSSProperties
export function stylePropsToCSS(props: BaseStyleProps): CSSProperties {
  const styles: CSSProperties = {}

  // Layout
  if (props.display !== undefined) styles.display = getBaseValue(props.display)
  if (props.flex !== undefined) styles.flex = getBaseValue(props.flex)
  if (props.flexGrow !== undefined)
    styles.flexGrow = getBaseValue(props.flexGrow)
  if (props.flexShrink !== undefined)
    styles.flexShrink = getBaseValue(props.flexShrink)
  if (props.flexBasis !== undefined)
    styles.flexBasis = getBaseValue(props.flexBasis)
  if (props.flexDirection !== undefined)
    styles.flexDirection = getBaseValue(props.flexDirection)
  if (props.justifyContent !== undefined)
    styles.justifyContent = mapJustifyContent(
      getBaseValue(props.justifyContent) as JustifyContent
    )
  if (props.alignItems !== undefined)
    styles.alignItems = mapAlignItems(
      getBaseValue(props.alignItems) as AlignItems
    )
  if (props.alignSelf !== undefined)
    styles.alignSelf = mapAlignItems(
      getBaseValue(props.alignSelf) as AlignItems
    )
  if (props.gap !== undefined) styles.gap = toCSSValue(getBaseValue(props.gap))
  if (props.flexWrap !== undefined)
    styles.flexWrap = getBaseValue(props.flexWrap)

  // Spacing
  if (props.padding !== undefined)
    styles.padding = toCSSValue(getBaseValue(props.padding))
  if (props.paddingTop !== undefined)
    styles.paddingTop = toCSSValue(getBaseValue(props.paddingTop))
  if (props.paddingRight !== undefined)
    styles.paddingRight = toCSSValue(getBaseValue(props.paddingRight))
  if (props.paddingBottom !== undefined)
    styles.paddingBottom = toCSSValue(getBaseValue(props.paddingBottom))
  if (props.paddingLeft !== undefined)
    styles.paddingLeft = toCSSValue(getBaseValue(props.paddingLeft))
  if (props.margin !== undefined)
    styles.margin = toCSSValue(getBaseValue(props.margin))
  if (props.marginTop !== undefined)
    styles.marginTop = toCSSValue(getBaseValue(props.marginTop))
  if (props.marginRight !== undefined)
    styles.marginRight = toCSSValue(getBaseValue(props.marginRight))
  if (props.marginBottom !== undefined)
    styles.marginBottom = toCSSValue(getBaseValue(props.marginBottom))
  if (props.marginLeft !== undefined)
    styles.marginLeft = toCSSValue(getBaseValue(props.marginLeft))

  // Sizing
  if (props.width !== undefined)
    styles.width = toCSSValue(getBaseValue(props.width))
  if (props.height !== undefined)
    styles.height = toCSSValue(getBaseValue(props.height))
  if (props.minWidth !== undefined)
    styles.minWidth = toCSSValue(getBaseValue(props.minWidth))
  if (props.maxWidth !== undefined)
    styles.maxWidth = toCSSValue(getBaseValue(props.maxWidth))
  if (props.minHeight !== undefined)
    styles.minHeight = toCSSValue(getBaseValue(props.minHeight))
  if (props.maxHeight !== undefined)
    styles.maxHeight = toCSSValue(getBaseValue(props.maxHeight))

  // Visual
  if (props.backgroundColor !== undefined)
    styles.backgroundColor = getBaseValue(props.backgroundColor)
  if (props.background !== undefined)
    styles.background = getBaseValue(props.background)
  if (props.borderRadius !== undefined)
    styles.borderRadius = toCSSValue(getBaseValue(props.borderRadius))
  if (props.borderWidth !== undefined)
    styles.borderWidth = toCSSValue(getBaseValue(props.borderWidth))
  if (props.borderColor !== undefined)
    styles.borderColor = getBaseValue(props.borderColor)
  if (props.borderStyle !== undefined)
    styles.borderStyle = getBaseValue(props.borderStyle)
  if (props.border !== undefined) styles.border = getBaseValue(props.border)
  if (props.opacity !== undefined) styles.opacity = getBaseValue(props.opacity)
  if (props.overflow !== undefined)
    styles.overflow = getBaseValue(props.overflow)
  if (props.boxShadow !== undefined)
    styles.boxShadow = getBaseValue(props.boxShadow)

  // Positioning
  if (props.position !== undefined)
    styles.position = getBaseValue(props.position)
  if (props.top !== undefined) styles.top = toCSSValue(getBaseValue(props.top))
  if (props.right !== undefined)
    styles.right = toCSSValue(getBaseValue(props.right))
  if (props.bottom !== undefined)
    styles.bottom = toCSSValue(getBaseValue(props.bottom))
  if (props.left !== undefined)
    styles.left = toCSSValue(getBaseValue(props.left))
  if (props.zIndex !== undefined) styles.zIndex = getBaseValue(props.zIndex)

  // Text
  if (props.color !== undefined) styles.color = getBaseValue(props.color)
  if (props.fontSize !== undefined)
    styles.fontSize = toCSSValue(getBaseValue(props.fontSize))
  if (props.fontWeight !== undefined)
    styles.fontWeight = getBaseValue(props.fontWeight)
  if (props.fontFamily !== undefined)
    styles.fontFamily = getBaseValue(props.fontFamily)
  if (props.fontStyle !== undefined)
    styles.fontStyle = getBaseValue(props.fontStyle)
  if (props.textAlign !== undefined)
    styles.textAlign = getBaseValue(props.textAlign)
  if (props.lineHeight !== undefined)
    styles.lineHeight = toCSSValue(getBaseValue(props.lineHeight))
  if (props.letterSpacing !== undefined)
    styles.letterSpacing = toCSSValue(getBaseValue(props.letterSpacing))
  if (props.textTransform !== undefined)
    styles.textTransform = getBaseValue(props.textTransform)
  if (props.textDecoration !== undefined)
    styles.textDecoration = getBaseValue(props.textDecoration)
  if (props.whiteSpace !== undefined)
    styles.whiteSpace = getBaseValue(props.whiteSpace)
  if (props.textOverflow !== undefined)
    styles.textOverflow = getBaseValue(props.textOverflow)
  if (props.wordBreak !== undefined)
    styles.wordBreak = getBaseValue(props.wordBreak)
  if (props.verticalAlign !== undefined)
    styles.verticalAlign = getBaseValue(props.verticalAlign)

  // Other
  if (props.cursor !== undefined) styles.cursor = getBaseValue(props.cursor)
  if (props.visibility !== undefined)
    styles.visibility = getBaseValue(props.visibility)
  if (props.boxSizing !== undefined)
    styles.boxSizing = getBaseValue(props.boxSizing)
  if (props.pointerEvents !== undefined)
    styles.pointerEvents = getBaseValue(props.pointerEvents)

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

// Map justify shorthand to CSS value
function mapJustifyContent(value: JustifyContent): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }
  // If it's a known shorthand, map it. Otherwise return as is (e.g. 'flex-start')
  return map[value] || value
}

// Map align shorthand to CSS value
function mapAlignItems(value: AlignItems): string {
  const map: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  }
  return map[value] || value
}
