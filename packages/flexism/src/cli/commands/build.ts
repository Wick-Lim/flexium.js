import { resolve } from 'path'
import { createCompiler } from '../../compiler'

const cyan = '\x1b[36m'
const green = '\x1b[32m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'
const dim = '\x1b[2m'

export async function build() {
  const cwd = process.cwd()

  console.log(`
${cyan}${bold}  ╔═══════════════════════════════════╗
  ║      flexism build                ║
  ╚═══════════════════════════════════╝${reset}
`)

  console.log(`${green}Building for production...${reset}\n`)

  const startTime = Date.now()

  try {
    // Create compiler with production settings
    const compiler = createCompiler({
      srcDir: resolve(cwd, 'src'),
      outDir: resolve(cwd, '.flexism'),
      minify: true,
      sourcemap: true,
      target: 'es2022',
    })

    // Run compilation
    const result = await compiler.compile()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`
${green}${bold}✓ Build completed in ${result.buildTime}ms${reset}

${dim}Output:${reset}
  ${cyan}Server:${reset}   ${result.serverBundle}
  ${cyan}Client:${reset}   ${result.clientBundle}
  ${cyan}Manifest:${reset} ${result.manifestPath}

${dim}Total time: ${duration}s${reset}
`)

  } catch (error) {
    console.error(`\n${yellow}Build failed:${reset}`, error)
    process.exit(1)
  }
}
