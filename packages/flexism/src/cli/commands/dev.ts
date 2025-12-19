import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const cyan = '\x1b[36m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'

export async function dev() {
  const cwd = process.cwd()

  // Check if vite is available
  const viteBin = findViteBin(cwd)
  if (!viteBin) {
    console.error(`${yellow}Vite not found. Please install vite:${reset}`)
    console.log(`  npm install -D vite`)
    process.exit(1)
  }

  console.log(`
${cyan}${bold}  ╔═══════════════════════════════════╗
  ║      flexism dev server           ║
  ╚═══════════════════════════════════╝${reset}
`)

  console.log(`${green}Starting development server...${reset}\n`)

  // Run vite dev
  const child = spawn(viteBin, ['--host'], {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      FLEXISM_MODE: 'development',
    },
  })

  child.on('error', (error) => {
    console.error('Failed to start dev server:', error)
    process.exit(1)
  })

  child.on('close', (code) => {
    process.exit(code ?? 0)
  })

  // Handle shutdown
  process.on('SIGINT', () => {
    child.kill('SIGINT')
  })

  process.on('SIGTERM', () => {
    child.kill('SIGTERM')
  })
}

function findViteBin(cwd: string): string | null {
  // Try local node_modules
  const localVite = resolve(cwd, 'node_modules', '.bin', 'vite')
  if (existsSync(localVite)) {
    return localVite
  }

  // Try npx
  return 'npx vite'
}
