/**
 * Flexium UI - Column/Row based UI component library
 *
 * @example
 * ```tsx
 * import { Column, Row, Text, Button, Card, Spinner, Modal, createTheme, setTheme } from 'flexium-ui'
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
 *       <Card shadow="md" padding="lg">
 *         <Text>Card content with elevation</Text>
 *         <Spinner size="md" color="primary" />
 *       </Card>
 *       <Row gap={8} mainAxisAlignment="end">
 *         <Button variant="outlined">Cancel</Button>
 *         <Button>Save</Button>
 *       </Row>
 *       <Modal open={true} title="Dialog" onClose={() => {}}>
 *         <Text>Modal content</Text>
 *       </Modal>
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
} from './components'

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
