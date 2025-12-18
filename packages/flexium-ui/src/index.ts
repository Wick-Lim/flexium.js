/**
 * Flexium UI - Column/Row based UI component library
 *
 * @example
 * ```tsx
 * import { Column, Row, Text, Button, createTheme, setTheme } from 'flexium-ui'
 *
 * // Optional: Create and set custom theme
 * const theme = createTheme({ colors: { primary: '#0066ff' } })
 * setTheme(theme)
 *
 * // Build UI with Column/Row layout
 * function App() {
 *   return (
 *     <Column gap={16} padding={24}>
 *       <Text variant="h1">Welcome</Text>
 *       <Row gap={8} mainAxisAlignment="end">
 *         <Button variant="outlined">Cancel</Button>
 *         <Button>Save</Button>
 *       </Row>
 *     </Column>
 *   )
 * }
 * ```
 *
 * @packageDocumentation
 */

// Layout
export { Column, Row } from './layout'
export type {
  FlexProps,
  ColumnProps,
  RowProps,
  MainAxisAlignment,
  CrossAxisAlignment,
} from './layout'

// Components
export { Text, Button } from './components'
export type { TextProps, ButtonProps } from './components'

// Theme
export {
  createTheme,
  defaultTheme,
  setTheme,
  getTheme,
  resetTheme,
} from './theme'
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeBorderRadius,
  ThemeShadows,
  DeepPartial,
} from './theme'
