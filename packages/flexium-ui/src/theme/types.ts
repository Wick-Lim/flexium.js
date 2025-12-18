/**
 * Theme type definitions
 */

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  error: string
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  border: string
}

export interface ThemeSpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export interface ThemeTypography {
  fontFamily: string
  fontSize: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  fontWeight: {
    normal: number
    medium: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

export interface ThemeBorderRadius {
  none: number
  sm: number
  md: number
  lg: number
  full: number
}

export interface ThemeShadows {
  none: string
  sm: string
  md: string
  lg: string
}

export interface Theme {
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
