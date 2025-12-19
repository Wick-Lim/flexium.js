import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const cyan = '\x1b[36m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'

export async function build() {
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
  ║      flexism build                ║
  ╚═══════════════════════════════════╝${reset}
`)

  console.log(`${green}Building for production...${reset}\n`)

  // Run vite build
  const child = spawn(viteBin, ['build'], {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      FLEXISM_MODE: 'production',
      NODE_ENV: 'production',
    },
  })

  return new Promise<void>((resolve, reject) => {
    child.on('error', (error) => {
      console.error('Build failed:', error)
      reject(error)
    })

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${green}${bold}Build completed successfully!${reset}`)
        console.log(`Output: ${cyan}./dist${reset}\n`)
        resolve()
      } else {
        reject(new Error(`Build failed with code ${code}`))
      }
    })
  })
}

function findViteBin(cwd: string): string | null {
  const localVite = resolve(cwd, 'node_modules', '.bin', 'vite')
  if (existsSync(localVite)) {
    return localVite
  }
  return 'npx vite'
}
