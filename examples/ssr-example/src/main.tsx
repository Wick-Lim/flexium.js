/**
 * Client Entry Point
 *
 * This file is loaded in the browser and hydrates the server-rendered HTML.
 * It attaches event handlers and makes the application interactive.
 */

import { hydrate } from 'flexium/dom'
import { App } from './App'

// Hydrate the server-rendered content
// This attaches event handlers and sets up signal reactivity
// without re-rendering the entire page
const appElement = document.getElementById('app')
if (appElement) {
  hydrate(<App />, appElement)
  console.log('✅ Application hydrated successfully!')
} else {
  console.error('❌ Could not find #app element for hydration')
}
