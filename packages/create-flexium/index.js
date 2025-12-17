#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createInterface } from 'readline'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}

const { cyan, green, yellow, red, blue, magenta, bright, reset } = colors

// Create readline interface
function createPrompt() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

// Ask question
function question(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

// Display banner
function showBanner() {
  console.log(`
${cyan}${bright}
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   ${magenta}✨ Create Flexium App ✨${cyan}           ║
  ║                                       ║
  ║   ${reset}Vite + TypeScript + Tailwind CSS    ${cyan}║
  ║                                       ║
  ╚═══════════════════════════════════════╝
${reset}
`)
}

// Validate project name
function validateProjectName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Project name cannot be empty' }
  }

  const trimmedName = name.trim()

  if (trimmedName.length > 214) {
    return { valid: false, error: 'Project name must be 214 characters or less' }
  }

  if (trimmedName !== trimmedName.toLowerCase()) {
    return { valid: false, error: 'Project name cannot contain uppercase letters' }
  }

  const validNameRegex = /^[a-z0-9_-]+$/
  if (!validNameRegex.test(trimmedName)) {
    return {
      valid: false,
      error: 'Project name can only contain lowercase letters, numbers, hyphens, and underscores'
    }
  }

  if (trimmedName.startsWith('.') || trimmedName.startsWith('_')) {
    return { valid: false, error: 'Project name cannot start with a dot or underscore' }
  }

  const reserved = ['node_modules', 'favicon.ico']
  if (reserved.includes(trimmedName)) {
    return { valid: false, error: `"${trimmedName}" is a reserved name` }
  }

  return { valid: true, name: trimmedName }
}

// Get project name from args or prompt
async function getProjectName(rl, args) {
  let projectName = args[0]

  if (!projectName) {
    projectName = await question(rl, `${cyan}📝 Project name:${reset} `)
    projectName = projectName.trim()
  }

  if (!projectName) {
    projectName = 'my-flexium-app'
  }

  const validation = validateProjectName(projectName)
  if (!validation.valid) {
    console.log(`${red}❌ ${validation.error}${reset}`)
    console.log(`${yellow}💡 Examples: my-app, my-project, todo-app${reset}\n`)

    if (!args[0]) {
      return getProjectName(rl, [])
    } else {
      process.exit(1)
    }
  }

  return validation.name
}

// Copy template
function copyTemplate(targetPath, projectName) {
  console.log(`\n${yellow}📁 Creating project...${reset}`)

  if (existsSync(targetPath)) {
    console.log(`${red}❌ Directory "${projectName}" already exists${reset}`)
    process.exit(1)
  }

  mkdirSync(targetPath, { recursive: true })

  const templatePath = join(__dirname, './templates/vite-starter')
  if (!existsSync(templatePath)) {
    console.log(`${red}❌ Template not found${reset}`)
    process.exit(1)
  }

  cpSync(templatePath, targetPath, { recursive: true })

  // Update package.json
  const packageJsonPath = join(targetPath, 'package.json')
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    packageJson.name = projectName
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  }

  console.log(`${green}✅ Created successfully!${reset}`)
}

// Show next steps
function showNextSteps(projectName) {
  console.log(`
${bright}${green}🎉 Done! Next steps:${reset}

  ${cyan}cd ${projectName}${reset}
  ${cyan}npm install${reset}
  ${cyan}npm run dev${reset}

${bright}📚 Docs:${reset} ${blue}https://flexium.junhyuk.im${reset}
`)
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const rl = createPrompt()

  try {
    showBanner()

    const projectName = await getProjectName(rl, args)
    console.log(`\n${green}📂 Project:${reset} ${bright}${projectName}${reset}`)

    const targetPath = resolve(process.cwd(), projectName)
    copyTemplate(targetPath, projectName)
    showNextSteps(projectName)
  } catch (error) {
    console.error(`${red}❌ ${error.message}${reset}`)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
