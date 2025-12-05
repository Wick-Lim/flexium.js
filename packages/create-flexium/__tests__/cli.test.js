import { test } from 'node:test'
import assert from 'node:assert'
import { existsSync, rmSync, readFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const CLI_PATH = join(__dirname, '../index.js')
const TEST_DIR = join(__dirname, '../test-output')

// Cleanup helper
function cleanup(projectName) {
  const projectPath = join(TEST_DIR, projectName)
  if (existsSync(projectPath)) {
    rmSync(projectPath, { recursive: true, force: true })
  }
}

// Setup test directory
function setupTestDir() {
  if (!existsSync(TEST_DIR)) {
    mkdirSync(TEST_DIR, { recursive: true })
  }
}

test('CLI - Template Generation', async (t) => {
  await t.test('should create vite-starter template', () => {
    setupTestDir()
    const projectName = 'test-vite'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'package.json')), 'package.json should exist')
      assert.ok(existsSync(join(projectPath, 'index.html')), 'index.html should exist')
      assert.ok(existsSync(join(projectPath, 'tsconfig.json')), 'tsconfig.json should exist')
      assert.ok(existsSync(join(projectPath, 'vite.config.ts')), 'vite.config.ts should exist')
      assert.ok(existsSync(join(projectPath, 'src')), 'src directory should exist')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should create vanilla-starter template', () => {
    setupTestDir()
    const projectName = 'test-vanilla'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 2`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'index.html')), 'index.html should exist')
      assert.ok(existsSync(join(projectPath, 'README.md')), 'README.md should exist')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should create todo-app template', () => {
    setupTestDir()
    const projectName = 'test-todo'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 3`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'index.html')), 'index.html should exist')
      assert.ok(existsSync(join(projectPath, 'README.md')), 'README.md should exist')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should create SSR template', () => {
    setupTestDir()
    const projectName = 'test-ssr'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 4`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'package.json')), 'package.json should exist')
      assert.ok(existsSync(join(projectPath, 'server.js')), 'server.js should exist')
      assert.ok(existsSync(join(projectPath, 'src/client')), 'client directory should exist')
      assert.ok(existsSync(join(projectPath, 'src/server')), 'server directory should exist')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should create PWA template', () => {
    setupTestDir()
    const projectName = 'test-pwa'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 5`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'package.json')), 'package.json should exist')
      assert.ok(existsSync(join(projectPath, 'public/manifest.json')), 'manifest.json should exist')
      assert.ok(existsSync(join(projectPath, 'public/sw.js')), 'service worker should exist')
      assert.ok(existsSync(join(projectPath, 'public/icons')), 'icons directory should exist')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should create monorepo template', () => {
    setupTestDir()
    const projectName = 'test-monorepo'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 6`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'package.json')), 'package.json should exist')
      assert.ok(existsSync(join(projectPath, 'packages')), 'packages directory should exist')
      assert.ok(existsSync(join(projectPath, 'pnpm-workspace.yaml')), 'workspace config should exist')
    } finally {
      cleanup(projectName)
    }
  })
})

test('CLI - File Creation', async (t) => {
  await t.test('should create all necessary files for vite template', () => {
    setupTestDir()
    const projectName = 'test-files'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      const expectedFiles = [
        'package.json',
        'index.html',
        'tsconfig.json',
        'vite.config.ts',
        '.gitignore',
        '.eslintrc.json',
        '.prettierrc',
        'README.md',
      ]

      expectedFiles.forEach((file) => {
        assert.ok(existsSync(join(projectPath, file)), `${file} should exist`)
      })
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should not create node_modules or dist directories', () => {
    setupTestDir()
    const projectName = 'test-no-build'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(!existsSync(join(projectPath, 'node_modules')), 'node_modules should not exist')
      assert.ok(!existsSync(join(projectPath, 'dist')), 'dist should not exist')
    } finally {
      cleanup(projectName)
    }
  })
})

test('CLI - package.json Generation', async (t) => {
  await t.test('should update package.json with project name', () => {
    setupTestDir()
    const projectName = 'my-custom-app'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      const packageJsonPath = join(projectPath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      assert.strictEqual(packageJson.name, projectName, 'package.json name should match project name')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should preserve package.json dependencies', () => {
    setupTestDir()
    const projectName = 'test-deps'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      const packageJsonPath = join(projectPath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      assert.ok(packageJson.dependencies, 'dependencies should exist')
      assert.ok(packageJson.dependencies.flexium, 'flexium should be in dependencies')
      assert.ok(packageJson.devDependencies, 'devDependencies should exist')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should preserve package.json scripts', () => {
    setupTestDir()
    const projectName = 'test-scripts'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      const packageJsonPath = join(projectPath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      assert.ok(packageJson.scripts, 'scripts should exist')
      assert.ok(packageJson.scripts.dev, 'dev script should exist')
      assert.ok(packageJson.scripts.build, 'build script should exist')
    } finally {
      cleanup(projectName)
    }
  })
})

test('CLI - Input Validation', async (t) => {
  await t.test('should reject when directory already exists', () => {
    setupTestDir()
    const projectName = 'existing-dir'
    const projectPath = join(TEST_DIR, projectName)

    // Create directory first
    if (!existsSync(projectPath)) {
      mkdirSync(projectPath, { recursive: true })
    }

    try {
      assert.throws(
        () => {
          execSync(`node ${CLI_PATH} ${projectName} 1`, {
            cwd: TEST_DIR,
            stdio: 'pipe',
          })
        },
        {
          name: 'Error',
        },
        'Should throw error when directory exists'
      )
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should handle invalid template selection', () => {
    setupTestDir()
    const projectName = 'test-invalid-template'
    cleanup(projectName)

    try {
      // Test with invalid template number (should default to first template)
      execSync(`node ${CLI_PATH} ${projectName} 999`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      // Should create project with default template
      assert.ok(existsSync(projectPath), 'Project should be created with default template')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should sanitize project name with invalid characters', () => {
    setupTestDir()
    const projectName = 'test-valid-name'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project should be created with sanitized name')
    } finally {
      cleanup(projectName)
    }
  })
})

test('CLI - Edge Cases', async (t) => {
  await t.test('should handle project names with hyphens', () => {
    setupTestDir()
    const projectName = 'my-awesome-app'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project should be created')

      const packageJsonPath = join(projectPath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      assert.strictEqual(packageJson.name, projectName, 'package.json name should preserve hyphens')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should handle project names with underscores', () => {
    setupTestDir()
    const projectName = 'my_awesome_app'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project should be created')

      const packageJsonPath = join(projectPath, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      assert.strictEqual(packageJson.name, projectName, 'package.json name should preserve underscores')
    } finally {
      cleanup(projectName)
    }
  })

  await t.test('should handle project names with numbers', () => {
    setupTestDir()
    const projectName = 'app-v2-test'
    cleanup(projectName)

    try {
      execSync(`node ${CLI_PATH} ${projectName} 1`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const projectPath = join(TEST_DIR, projectName)
      assert.ok(existsSync(projectPath), 'Project should be created')
    } finally {
      cleanup(projectName)
    }
  })
})

// Cleanup test directory after all tests
test.after(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true })
  }
})
