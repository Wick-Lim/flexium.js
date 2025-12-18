import type { FNodeChild, RenderOptions } from '../types'
import { renderToString } from './render'

export interface RenderToHtmlOptions extends RenderOptions {
  /** Document title */
  title?: string
  /** Language attribute */
  lang?: string
  /** Additional head content (meta, link, etc) */
  head?: string
  /** Additional body attributes */
  bodyAttrs?: string
  /** Scripts to load before hydration */
  scripts?: string[]
  /** CSS files to load */
  styles?: string[]
}

/**
 * Render full HTML document with state injection
 *
 * @example
 * ```tsx
 * const html = renderToHtml(<App />, {
 *   title: 'My App',
 *   lang: 'ko',
 *   head: '<meta name="description" content="My app">',
 *   scripts: ['/client.js'],
 *   styles: ['/styles.css'],
 * })
 * ```
 */
export function renderToHtml(
  app: FNodeChild | (() => FNodeChild),
  options: RenderToHtmlOptions = {}
): string {
  const {
    title = '',
    lang = 'en',
    head = '',
    bodyAttrs = '',
    scripts = [],
    styles = [],
    ...renderOptions
  } = options

  const { html, stateScript } = renderToString(app, renderOptions)

  const styleLinks = styles
    .map(href => `<link rel="stylesheet" href="${escapeAttr(href)}">`)
    .join('\n    ')

  const scriptTags = scripts
    .map(src => `<script type="module" src="${escapeAttr(src)}"></script>`)
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
    <div id="app">${html}</div>
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
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}
