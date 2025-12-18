/**
 * Flexium UI - Column/Row based UI component library
 *
 * @example
 * ```tsx
 * import { Column, Row, Text, Button, Card, ThemeProvider, createTheme } from 'flexium-ui'
 *
 * // Optional: Create custom theme
 * const theme = createTheme({ colors: { primary: '#0066ff' } })
 *
 * // Build UI with Column/Row layout
 * function App() {
 *   return (
 *     <ThemeProvider theme={theme}>
 *       <Column gap={16} padding={24}>
 *         <Text variant="h1">Welcome</Text>
 *         <Card shadow="md" padding="lg">
 *           <Text>Card content</Text>
 *         </Card>
 *         <Row gap={8} mainAxisAlignment="end">
 *           <Button variant="outlined">Cancel</Button>
 *           <Button>Save</Button>
 *         </Row>
 *       </Column>
 *     </ThemeProvider>
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
export {
  Text,
  Button,
  Card,
  Spinner,
  Modal,
  Avatar,
  Badge,
  Chip,
  TextField,
  Checkbox,
  Switch,
  Portal,
} from './components'
export type {
  TextProps,
  ButtonProps,
  CardProps,
  SpinnerProps,
  ModalProps,
  AvatarProps,
  BadgeProps,
  ChipProps,
  TextFieldProps,
  CheckboxProps,
  SwitchProps,
  PortalProps,
} from './components'

// Theme
export {
  ThemeProvider,
  ThemeContext,
  useTheme,
  createTheme,
  defaultTheme,
} from './theme'
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeProviderProps,
  DeepPartial,
} from './theme'
