/**
 * Server Entry Point
 *
 * This file is used by the server to render the app to HTML.
 * It uses renderToString() to generate static HTML markup.
 */

import { renderToString } from 'flexium/server'
import { App } from './App'

export function render() {
  // Render the App component to an HTML string
  // This runs on the server and generates static HTML
  const html = renderToString(<App />)
  return html
}
