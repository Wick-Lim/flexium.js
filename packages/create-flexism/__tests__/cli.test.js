import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import { existsSync, rmSync, readFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const CLI_PATH = join(__dirname, '..', 'index.js')
const TEST_DIR = join(__dirname, '..', '.test-output')

describe('create-flexism CLI', () => {
  before(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true })
    }
    mkdirSync(TEST_DIR, { recursive: true })
  })

  after(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  describe('project creation', () => {
    it('should create a new project with valid name', () => {
      const projectName = 'test-app'
      const projectPath = join(TEST_DIR, projectName)

      execSync(`node ${CLI_PATH} ${projectName}`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      assert.ok(existsSync(projectPath), 'Project directory should exist')
      assert.ok(existsSync(join(projectPath, 'package.json')), 'package.json should exist')
      assert.ok(existsSync(join(projectPath, 'src', 'main.tsx')), 'src/main.tsx should exist')
      assert.ok(existsSync(join(projectPath, 'index.html')), 'index.html should exist')
    })

    it('should set project name in package.json', () => {
      const projectName = 'my-custom-app'
      const projectPath = join(TEST_DIR, projectName)

      execSync(`node ${CLI_PATH} ${projectName}`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'))
      assert.strictEqual(packageJson.name, projectName)
    })

    it('should include flexism and flexium dependencies', () => {
      const projectName = 'deps-test-app'
      const projectPath = join(TEST_DIR, projectName)

      execSync(`node ${CLI_PATH} ${projectName}`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'))
      assert.ok(packageJson.dependencies.flexism, 'Should have flexism dependency')
      assert.ok(packageJson.dependencies.flexium, 'Should have flexium dependency')
    })

    it('should include required scripts', () => {
      const projectName = 'scripts-test-app'
      const projectPath = join(TEST_DIR, projectName)

      execSync(`node ${CLI_PATH} ${projectName}`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      })

      const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'))
      assert.ok(packageJson.scripts.dev, 'Should have dev script')
      assert.ok(packageJson.scripts.build, 'Should have build script')
      assert.ok(packageJson.scripts.start, 'Should have start script')
    })
  })

  describe('validation', () => {
    it('should reject uppercase project names', () => {
      assert.throws(() => {
        execSync(`node ${CLI_PATH} MyApp`, {
          cwd: TEST_DIR,
          stdio: 'pipe',
        })
      })
    })

    it('should reject project names with special characters', () => {
      assert.throws(() => {
        execSync(`node ${CLI_PATH} my@app`, {
          cwd: TEST_DIR,
          stdio: 'pipe',
        })
      })
    })

    it('should reject reserved names', () => {
      assert.throws(() => {
        execSync(`node ${CLI_PATH} node_modules`, {
          cwd: TEST_DIR,
          stdio: 'pipe',
        })
      })
    })
  })
})
