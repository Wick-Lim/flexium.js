import { Context, use } from 'flexium/core'
import type { Theme } from './types'
import { defaultTheme } from './defaultTheme'

/**
 * Theme Context
 */
export const ThemeContext = new Context<Theme>(defaultTheme)

/**
 * Theme Provider component
 *
 * @example
 * ```tsx
 * import { ThemeProvider, createTheme } from 'flexium-ui'
 *
 * const customTheme = createTheme({
 *   colors: { primary: '#ff0000' }
 * })
 *
 * function App() {
 *   return (
 *     <ThemeProvider theme={customTheme}>
 *       <MyComponents />
 *     </ThemeProvider>
 *   )
 * }
 * ```
 */
export interface ThemeProviderProps {
  theme?: Theme
  children?: any
}

export function ThemeProvider(props: ThemeProviderProps) {
  const { theme = defaultTheme, children } = props
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to get the current theme from context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme()
 *   return <div style={{ color: theme.colors.primary }}>Hello</div>
 * }
 * ```
 */
export function useTheme(): Theme {
  const [theme] = use(ThemeContext)
  return theme
}
