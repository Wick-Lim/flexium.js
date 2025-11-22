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
    path: '../../templates/vite-starter',
  },
  'vanilla-starter': {
    name: 'Vanilla (No Build)',
    description: 'Simple starter with no build tools - just open in browser',
    path: '../../templates/vanilla-starter',
  },
  'todo-app': {
    name: 'Todo App (Reference)',
    description: 'Complete todo application showing best practices',
    path: '../../templates/todo-app-template',
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

// Get project name from args or prompt
async function getProjectName(rl, args) {
  if (args[0]) {
    return args[0]
  }
  const name = await question(rl, `${cyan}📝 Project name:${reset} `)
  return name.trim() || 'my-flexium-app'
}

// Get template choice
async function getTemplateChoice(rl) {
  const answer = await question(
    rl,
    `${cyan}🎨 Choose template (1-${Object.keys(TEMPLATES).length}):${reset} `
  )
  const choice = parseInt(answer.trim())
  const templateKeys = Object.keys(TEMPLATES)

  if (choice >= 1 && choice <= templateKeys.length) {
    return templateKeys[choice - 1]
  }

  return 'vite-starter' // Default
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

  // Copy template files
  const fullTemplatePath = resolve(__dirname, templatePath)
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

  if (templateKey === 'vite-starter' || templateKey === 'todo-app') {
    console.log(`  ${cyan}npm install${reset}`)
    console.log(`  ${cyan}npm run dev${reset}`)
  } else if (templateKey === 'vanilla-starter') {
    console.log(`  ${cyan}npx serve .${reset}   ${reset}# or any HTTP server`)
  }

  console.log(`\n${bright}📚 Learn more:${reset}`)
  console.log(`  ${blue}https://github.com/yourusername/flexium.js${reset}`)
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
    showTemplates()
    const templateKey = await getTemplateChoice(rl)
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
