/**
 * Flexism Layout Composition
 *
 * Composes layouts with page content for SSR
 */

import type { FNodeChild } from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LayoutContext {
  /** Request object */
  request: Request
  /** URL parameters */
  params: Record<string, string>
}

export interface LayoutLoaderResult {
  /** Props to pass to the layout component */
  props: Record<string, unknown>
}

export type LayoutLoader = (
  context: LayoutContext
) => Promise<LayoutLoaderResult> | LayoutLoaderResult

export type LayoutComponent = (props: {
  children: FNodeChild
  [key: string]: unknown
}) => FNodeChild

export interface LayoutModule {
  /** File path of the layout */
  path: string
  /** Server loader (optional) */
  loader?: LayoutLoader
  /** Layout component */
  Component: LayoutComponent
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Cache
// ─────────────────────────────────────────────────────────────────────────────

const moduleCache = new Map<string, LayoutModule>()

/**
 * Load a layout module
 *
 * Layout files can export:
 * - default: The layout component (2-function pattern or direct)
 * - loader: Server-side data loader
 */
export async function loadLayout(layoutPath: string): Promise<LayoutModule> {
  // Check cache
  const cached = moduleCache.get(layoutPath)
  if (cached) return cached

  // Dynamic import
  const mod = await import(layoutPath)

  // Get component - supports both direct export and 2-function pattern result
  const Component = mod.default || mod.Layout
  if (typeof Component !== 'function') {
    throw new Error(
      `Layout at ${layoutPath} must export a default component function`
    )
  }

  // Get loader if exists
  const loader = mod.loader

  const module: LayoutModule = {
    path: layoutPath,
    loader,
    Component,
  }

  moduleCache.set(layoutPath, module)
  return module
}

/**
 * Clear module cache (for development HMR)
 */
export function clearLayoutCache(): void {
  moduleCache.clear()
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout Composition
// ─────────────────────────────────────────────────────────────────────────────

export interface ComposeLayoutsOptions {
  /** Layout module names (outermost first) */
  layoutModules: string[]
  /** Server directory for loading modules */
  serverDir: string
  /** Page content to wrap */
  pageContent: FNodeChild
  /** Layout context */
  context: LayoutContext
}

/**
 * Compose layouts with page content
 *
 * Layouts are nested outermost → innermost:
 * RootLayout
 *   └─ DashboardLayout
 *       └─ Page Content
 *
 * Each layout receives `children` prop with its nested content.
 *
 * @example
 * ```tsx
 * // src/layout.tsx (Root)
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 *
 * // src/dashboard/layout.tsx
 * export default function DashboardLayout({ children }) {
 *   return (
 *     <div class="dashboard">
 *       <Sidebar />
 *       <main>{children}</main>
 *     </div>
 *   )
 * }
 * ```
 */
export async function composeLayouts(
  options: ComposeLayoutsOptions
): Promise<FNodeChild> {
  const { layoutModules, serverDir, pageContent, context } = options

  // Load all layout modules
  const layouts: LayoutModule[] = []
  for (const moduleName of layoutModules) {
    const modulePath = `${serverDir}/${moduleName}`
    try {
      const mod = await loadLayout(modulePath)
      layouts.push(mod)
    } catch (error) {
      console.error(`[flexism] Failed to load layout: ${modulePath}`, error)
      // Skip failed layouts
    }
  }

  // If no layouts, return page content directly
  if (layouts.length === 0) {
    return pageContent
  }

  // Compose inside-out (innermost layout wraps page, then outer layouts wrap that)
  // layouts array is outermost first, so we reverse to build from inside out
  let content = pageContent

  for (let i = layouts.length - 1; i >= 0; i--) {
    const layout = layouts[i]

    // Execute loader if present
    let layoutProps: Record<string, unknown> = {}
    if (layout.loader) {
      try {
        const result = await layout.loader(context)
        layoutProps = result.props
      } catch (error) {
        console.error(`[flexism] Layout loader error: ${layout.path}`, error)
      }
    }

    // Wrap content with layout component
    // Create an FNode representing the layout call
    content = {
      type: layout.Component,
      props: { ...layoutProps, children: content },
      children: [],
      key: undefined,
    } as FNodeChild
  }

  return content
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an HTML document shell
 *
 * Use this when you don't have a root layout that provides <html>
 */
export function createDocumentShell(options: {
  content: string
  title?: string
  lang?: string
  head?: string
  scripts?: string[]
  styles?: string[]
  bodyAttrs?: string
  stateScript?: string
}): string {
  const {
    content,
    title = '',
    lang = 'en',
    head = '',
    scripts = [],
    styles = [],
    bodyAttrs = '',
    stateScript = '',
  } = options

  const styleLinks = styles
    .map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`)
    .join('\n    ')

  const scriptTags = scripts
    .map((src) => `<script type="module" src="${escapeAttr(src)}"></script>`)
    .join('\n    ')

  return `<!DOCTYPE html>
<html lang="${escapeAttr(lang)}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${title ? `<title>${escapeHtml(title)}</title>` : ''}
    ${styleLinks}
    ${head}
  </head>
  <body${bodyAttrs ? ' ' + bodyAttrs : ''}>
    <div id="app">${content}</div>
    ${stateScript}
    ${scriptTags}
  </body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
