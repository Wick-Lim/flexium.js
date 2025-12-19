#!/usr/bin/env node

import { dev } from './commands/dev'
import { build } from './commands/build'
import { start } from './commands/start'

const commands: Record<string, () => Promise<void>> = {
  dev,
  build,
  start,
}

const args = process.argv.slice(2)
const command = args[0]

// Colors
const cyan = '\x1b[36m'
const green = '\x1b[32m'
const red = '\x1b[31m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'

function showHelp() {
  console.log(`
${cyan}${bold}flexism${reset} - Realtime-first Framework CLI

${bold}Usage:${reset}
  flexism <command> [options]

${bold}Commands:${reset}
  ${green}dev${reset}      Start development server
  ${green}build${reset}    Build for production
  ${green}start${reset}    Start production server

${bold}Examples:${reset}
  flexism dev
  flexism build
  flexism start

${bold}Docs:${reset}
  https://flexium.junhyuk.im
`)
}

async function main() {
  if (!command || command === '-h' || command === '--help') {
    showHelp()
    return
  }

  if (command === '-v' || command === '--version') {
    // Read version from package.json
    const pkg = await import('../../package.json', { assert: { type: 'json' } }).catch(() => ({ default: { version: '0.1.0' } }))
    console.log(`flexism v${pkg.default.version}`)
    return
  }

  const handler = commands[command]
  if (!handler) {
    console.error(`${red}Unknown command: ${command}${reset}`)
    console.log(`Run ${cyan}flexism --help${reset} for usage`)
    process.exit(1)
  }

  try {
    await handler()
  } catch (error) {
    console.error(`${red}Error:${reset}`, error)
    process.exit(1)
  }
}

main()
