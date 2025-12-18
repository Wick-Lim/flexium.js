/**
 * CSS value types
 */
export type CSSValue = string | number

/**
 * Standard CSS properties with support for numbers (auto-converted to px)
 */
export interface CSSProperties {
  // Layout
  display?: CSSValue
  position?: CSSValue
  top?: CSSValue
  right?: CSSValue
  bottom?: CSSValue
  left?: CSSValue
  zIndex?: CSSValue

  // Flexbox
  flex?: CSSValue
  flexDirection?: CSSValue
  flexWrap?: CSSValue
  flexGrow?: CSSValue
  flexShrink?: CSSValue
  flexBasis?: CSSValue
  justifyContent?: CSSValue
  alignItems?: CSSValue
  alignContent?: CSSValue
  alignSelf?: CSSValue
  gap?: CSSValue
  rowGap?: CSSValue
  columnGap?: CSSValue

  // Grid
  grid?: CSSValue
  gridTemplate?: CSSValue
  gridTemplateColumns?: CSSValue
  gridTemplateRows?: CSSValue
  gridColumn?: CSSValue
  gridRow?: CSSValue
  gridArea?: CSSValue

  // Box model
  width?: CSSValue
  height?: CSSValue
  minWidth?: CSSValue
  minHeight?: CSSValue
  maxWidth?: CSSValue
  maxHeight?: CSSValue
  padding?: CSSValue
  paddingTop?: CSSValue
  paddingRight?: CSSValue
  paddingBottom?: CSSValue
  paddingLeft?: CSSValue
  margin?: CSSValue
  marginTop?: CSSValue
  marginRight?: CSSValue
  marginBottom?: CSSValue
  marginLeft?: CSSValue

  // Border
  border?: CSSValue
  borderWidth?: CSSValue
  borderStyle?: CSSValue
  borderColor?: CSSValue
  borderTop?: CSSValue
  borderRight?: CSSValue
  borderBottom?: CSSValue
  borderLeft?: CSSValue
  borderRadius?: CSSValue
  borderTopLeftRadius?: CSSValue
  borderTopRightRadius?: CSSValue
  borderBottomLeftRadius?: CSSValue
  borderBottomRightRadius?: CSSValue

  // Colors
  color?: CSSValue
  backgroundColor?: CSSValue
  background?: CSSValue
  backgroundImage?: CSSValue
  backgroundSize?: CSSValue
  backgroundPosition?: CSSValue
  backgroundRepeat?: CSSValue
  opacity?: CSSValue

  // Typography
  font?: CSSValue
  fontFamily?: CSSValue
  fontSize?: CSSValue
  fontWeight?: CSSValue
  fontStyle?: CSSValue
  lineHeight?: CSSValue
  letterSpacing?: CSSValue
  textAlign?: CSSValue
  textDecoration?: CSSValue
  textTransform?: CSSValue
  whiteSpace?: CSSValue
  wordBreak?: CSSValue
  overflow?: CSSValue
  overflowX?: CSSValue
  overflowY?: CSSValue
  textOverflow?: CSSValue

  // Visual
  boxShadow?: CSSValue
  textShadow?: CSSValue
  outline?: CSSValue
  outlineWidth?: CSSValue
  outlineStyle?: CSSValue
  outlineColor?: CSSValue
  outlineOffset?: CSSValue
  visibility?: CSSValue
  cursor?: CSSValue
  pointerEvents?: CSSValue
  userSelect?: CSSValue

  // Transform & Animation
  transform?: CSSValue
  transformOrigin?: CSSValue
  transition?: CSSValue
  transitionProperty?: CSSValue
  transitionDuration?: CSSValue
  transitionTimingFunction?: CSSValue
  transitionDelay?: CSSValue
  animation?: CSSValue
  animationName?: CSSValue
  animationDuration?: CSSValue
  animationTimingFunction?: CSSValue
  animationDelay?: CSSValue
  animationIterationCount?: CSSValue
  animationDirection?: CSSValue
  animationFillMode?: CSSValue

  // Other
  content?: CSSValue
  objectFit?: CSSValue
  objectPosition?: CSSValue
  filter?: CSSValue
  backdropFilter?: CSSValue
  mixBlendMode?: CSSValue
  isolation?: CSSValue
  contain?: CSSValue
  aspectRatio?: CSSValue

  // Allow any other CSS property
  [key: string]: CSSValue | StyleObject | undefined
}

/**
 * Style object with support for nested selectors and at-rules
 */
export interface StyleObject extends CSSProperties {
  /** Nested selectors: &:hover, &::before, & > div */
  [key: `&${string}`]: StyleObject
  /** At-rules: @media, @supports, @container */
  [key: `@${string}`]: StyleObject
}

/**
 * Keyframes definition
 */
export interface KeyframeDefinition {
  [key: string]: CSSProperties  // 'from', 'to', '0%', '50%', '100%', etc.
}

/**
 * Variant configuration for styled()
 */
export type VariantConfig = {
  [variantName: string]: {
    [variantValue: string]: StyleObject
  }
}

/**
 * Default variants type
 */
export type DefaultVariants<V extends VariantConfig> = {
  [K in keyof V]?: keyof V[K]
}

/**
 * Styled component configuration
 */
export interface StyledConfig<V extends VariantConfig = VariantConfig> {
  base: StyleObject
  variants?: V
  defaultVariants?: DefaultVariants<V>
  compoundVariants?: Array<{
    [K in keyof V]?: keyof V[K]
  } & { css: StyleObject }>
}

/**
 * Props for styled components
 */
export type StyledProps<V extends VariantConfig = VariantConfig> = {
  [K in keyof V]?: keyof V[K]
} & {
  children?: any
  className?: string
  [key: string]: any
}
