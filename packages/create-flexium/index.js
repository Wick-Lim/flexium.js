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

// Templates available
const TEMPLATES = {
  'vite-starter': {
    name: 'Vite + TypeScript (Recommended)',
    description: 'Production-ready setup with Vite, TypeScript, and hot reload',
    path: './templates/vite-starter',
  },
  'vanilla-starter': {
    name: 'Vanilla (No Build)',
    description: 'Simple starter with no build tools - just open in browser',
    path: './templates/vanilla-starter',
  },
  'todo-app': {
    name: 'Todo App (Reference)',
    description: 'Complete todo application showing best practices',
    path: './templates/todo-app-template',
  },
  'ssr-starter': {
    name: 'SSR (Server-Side Rendering)',
    description: 'Express server with SSR for optimal performance and SEO',
    path: './templates/ssr-starter',
  },
  'pwa-starter': {
    name: 'PWA (Progressive Web App)',
    description: 'Full PWA with offline support, service worker, and manifest',
    path: './templates/pwa-starter',
  },
  'monorepo-starter': {
    name: 'Monorepo (pnpm workspaces)',
    description: 'Monorepo setup with shared packages and workspaces',
    path: './templates/monorepo-starter',
  },
}

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
  ║   ${reset}Fine-grained reactivity framework   ${cyan}║
  ║   ${reset}for building modern UIs            ${cyan}║
  ║                                       ║
  ╚═══════════════════════════════════════╝
${reset}
`)
}

// Display templates
function showTemplates() {
  console.log(`${bright}${blue}📦 Available Templates:${reset}\n`)
  Object.entries(TEMPLATES).forEach(([key, template], index) => {
    console.log(`${green}${index + 1}.${reset} ${bright}${template.name}${reset}`)
    console.log(`   ${template.description}\n`)
  })
}

// Validate project name
function validateProjectName(name) {
  // Check if empty
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Project name cannot be empty' }
  }

  // Check for npm package name rules
  const trimmedName = name.trim()

  // Check length
  if (trimmedName.length > 214) {
    return { valid: false, error: 'Project name must be 214 characters or less' }
  }

  // Check for uppercase letters
  if (trimmedName !== trimmedName.toLowerCase()) {
    return { valid: false, error: 'Project name cannot contain uppercase letters' }
  }

  // Check for invalid characters (only lowercase, numbers, hyphens, underscores allowed)
  const validNameRegex = /^[a-z0-9_-]+$/
  if (!validNameRegex.test(trimmedName)) {
    return {
      valid: false,
      error: 'Project name can only contain lowercase letters, numbers, hyphens, and underscores'
    }
  }

  // Check if starts with dot or underscore
  if (trimmedName.startsWith('.') || trimmedName.startsWith('_')) {
    return { valid: false, error: 'Project name cannot start with a dot or underscore' }
  }

  // Reserved names
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
    projectName = await question(rl, `${cyan}📝 Project name [default: my-flexium-app]:${reset} `)
    projectName = projectName.trim() || 'my-flexium-app'
  }

  // Validate project name
  const validation = validateProjectName(projectName)
  if (!validation.valid) {
    console.log(`${red}❌ Invalid project name: ${validation.error}${reset}`)
    console.log(`${yellow}💡 Examples: my-app, my-project-name, my_app${reset}\n`)

    // Ask again if interactive
    if (!args[0]) {
      return getProjectName(rl, [])
    } else {
      process.exit(1)
    }
  }

  return validation.name
}

// Get template choice
async function getTemplateChoice(rl, args) {
  const templateKeys = Object.keys(TEMPLATES)

  // Check if template choice is provided as command-line argument
  if (args[1]) {
    const index = parseInt(args[1]) - 1
    if (!isNaN(index) && index >= 0 && index < templateKeys.length) {
      return templateKeys[index]
    }
    // Invalid choice from args, use default
    return templateKeys[0]
  }

  // Interactive mode - show templates and prompt
  showTemplates()

  const choice = await question(rl, `${cyan}📦 Select template [1-${templateKeys.length}] (default: 1):${reset} `)
  const index = parseInt(choice.trim()) - 1

  if (isNaN(index) || index < 0 || index >= templateKeys.length) {
    return templateKeys[0] // Default to first template
  }

  return templateKeys[index]
}

// Copy template
function copyTemplate(templatePath, targetPath, projectName) {
  console.log(`\n${yellow}📁 Creating project...${reset}`)

  // Check if directory exists
  if (existsSync(targetPath)) {
    console.log(`${red}❌ Error: Directory "${projectName}" already exists${reset}`)
    process.exit(1)
  }

  // Create directory
  mkdirSync(targetPath, { recursive: true })

  // Copy template files - use absolute path from __dirname
  const fullTemplatePath = join(__dirname, templatePath)
  if (!existsSync(fullTemplatePath)) {
    console.log(`${red}❌ Error: Template not found at ${fullTemplatePath}${reset}`)
    process.exit(1)
  }

  cpSync(fullTemplatePath, targetPath, { recursive: true })

  // Update package.json with project name
  const packageJsonPath = join(targetPath, 'package.json')
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    packageJson.name = projectName
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  }

  console.log(`${green}✅ Project created successfully!${reset}`)
}

// Show next steps
function showNextSteps(projectName, templateKey) {
  const template = TEMPLATES[templateKey]

  console.log(`\n${bright}${green}🎉 All set! Next steps:${reset}\n`)
  console.log(`  ${cyan}cd ${projectName}${reset}`)

  if (templateKey === 'vanilla-starter') {
    console.log(`  ${cyan}npx serve .${reset}   ${reset}# or any HTTP server`)
  } else if (templateKey === 'monorepo-starter') {
    console.log(`  ${cyan}pnpm install${reset}  ${reset}# requires pnpm`)
    console.log(`  ${cyan}pnpm dev${reset}`)
  } else {
    console.log(`  ${cyan}npm install${reset}`)
    console.log(`  ${cyan}npm run dev${reset}`)
  }

  // Template-specific tips
  if (templateKey === 'ssr-starter') {
    console.log(`\n${bright}💡 SSR Tips:${reset}`)
    console.log(`  ${yellow}Run "npm run build" to build for production${reset}`)
    console.log(`  ${yellow}Use "npm run preview" to test production build${reset}`)
  } else if (templateKey === 'pwa-starter') {
    console.log(`\n${bright}💡 PWA Tips:${reset}`)
    console.log(`  ${yellow}Build and serve over HTTPS to test PWA features${reset}`)
    console.log(`  ${yellow}Replace icons in public/icons/ with your own${reset}`)
  } else if (templateKey === 'monorepo-starter') {
    console.log(`\n${bright}💡 Monorepo Tips:${reset}`)
    console.log(`  ${yellow}Install pnpm globally: npm install -g pnpm${reset}`)
    console.log(`  ${yellow}Run "pnpm -r build" to build all packages${reset}`)
  }

  console.log(`\n${bright}📚 Learn more:${reset}`)
  console.log(`  ${blue}https://github.com/Wick-Lim/flexium.js${reset}`)
  console.log()
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  const rl = createPrompt()

  try {
    showBanner()

    // Get project name
    const projectName = await getProjectName(rl, args)

    // Show templates and get choice
    const templateKey = await getTemplateChoice(rl, args)
    const template = TEMPLATES[templateKey]

    console.log(`\n${green}✨ Selected:${reset} ${bright}${template.name}${reset}`)
    console.log(`${green}📂 Project:${reset} ${bright}${projectName}${reset}`)

    // Copy template
    const targetPath = resolve(process.cwd(), projectName)
    copyTemplate(template.path, targetPath, projectName)

    // Show next steps
    showNextSteps(projectName, templateKey)
  } catch (error) {
    console.error(`${red}❌ Error: ${error.message}${reset}`)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
