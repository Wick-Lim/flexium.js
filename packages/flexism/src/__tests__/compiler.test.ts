/**
 * Compiler Tests for 2-Function Pattern
 */

import { describe, it, expect } from 'vitest'
import { analyzeFile } from '../compiler/analyzer'
import { transformFile, type TransformContext } from '../compiler/transformer'

function createMockContext(overrides: Partial<TransformContext> = {}): TransformContext {
  return {
    srcDir: '/app/src',
    fileType: 'page',
    routePath: '/',
    middlewares: [],
    layouts: [],
    ...overrides,
  }
}

describe('Analyzer', () => {
  describe('2-function pattern detection', () => {
    it('should detect async component returning a function', async () => {
      const source = `
export default async function Page() {
  const data = await fetchData()
  return ({ data }) => {
    return <div>{data}</div>
  }
}
`
      const analysis = await analyzeFile(source, 'routes/index.tsx')

      expect(analysis.exports).toHaveLength(1)
      expect(analysis.exports[0].name).toBe('default')
      expect(analysis.exports[0].type).toBe('component')
      expect(analysis.exports[0].isAsync).toBe(true)
      expect(analysis.exports[0].returnsFunction).toBe(true)
      expect(analysis.exports[0].sharedProps).toContain('data')
    })

    it('should detect API handler by export name', async () => {
      const source = `
export async function GET(request) {
  const data = await db.query()
  return new Response(JSON.stringify(data))
}
`
      const analysis = await analyzeFile(source, 'routes/api/users.ts')

      expect(analysis.exports).toHaveLength(1)
      expect(analysis.exports[0].name).toBe('GET')
      expect(analysis.exports[0].type).toBe('api')
      expect(analysis.exports[0].isAsync).toBe(true)
    })

    it('should detect multiple HTTP methods as APIs', async () => {
      const source = `
export async function GET(request) {
  return new Response('get')
}

export async function POST(request) {
  return new Response('post')
}

export async function DELETE(request) {
  return new Response('delete')
}
`
      const analysis = await analyzeFile(source, 'routes/api/users.ts')

      expect(analysis.exports).toHaveLength(3)
      expect(analysis.exports.every(e => e.type === 'api')).toBe(true)
      expect(analysis.exports.map(e => e.name)).toEqual(['GET', 'POST', 'DELETE'])
    })

    it('should detect component without hydration (no return function)', async () => {
      const source = `
export async function ServerOnly() {
  const html = await renderOnServer()
  return <div>{html}</div>
}
`
      const analysis = await analyzeFile(source, 'routes/static.tsx')

      expect(analysis.exports).toHaveLength(1)
      expect(analysis.exports[0].type).toBe('component')
      expect(analysis.exports[0].returnsFunction).toBe(false)
    })

    it('should extract multiple shared props from destructured parameter', async () => {
      const source = `
export default async function Page() {
  const user = await getUser()
  const posts = await getPosts()
  const settings = await getSettings()
  return ({ user, posts, settings }) => {
    return <Dashboard user={user} posts={posts} settings={settings} />
  }
}
`
      const analysis = await analyzeFile(source, 'routes/dashboard.tsx')

      expect(analysis.exports[0].sharedProps).toEqual(['user', 'posts', 'settings'])
    })
  })
})

describe('Transformer', () => {
  it('should split server and client code for 2-function pattern', async () => {
    const source = `
export default async function Page() {
  const data = await fetchData()
  return ({ data }) => {
    return <div>{data}</div>
  }
}
`
    const analysis = await analyzeFile(source, 'page.tsx')
    const context = createMockContext({ routePath: '/' })
    const results = transformFile(source, analysis, context)

    expect(results).toHaveLength(1)

    const result = results[0]
    expect(result.serverCode).toContain('loader')
    expect(result.serverCode).toContain('return { data }')
    expect(result.clientCode).toContain('Component')
    expect(result.clientCode).toContain('hydrateComponent')
    expect(result.route.type).toBe('component')
    expect(result.route.hydrateProps).toContain('data')
  })

  it('should generate API handler without client code', async () => {
    const source = `
export async function GET(request) {
  const data = await db.query()
  return new Response(JSON.stringify(data))
}
`
    const analysis = await analyzeFile(source, 'api/users/route.ts')
    const context = createMockContext({ fileType: 'route', routePath: '/api/users' })
    const results = transformFile(source, analysis, context)

    expect(results).toHaveLength(1)

    const result = results[0]
    expect(result.serverCode).toContain('GET')
    expect(result.clientCode).toBe('')
    expect(result.route.type).toBe('api')
  })

  it('should use route path from context', async () => {
    const source = `
export default async function Page() {
  return () => <div>Hello</div>
}
`
    const testCases = [
      { routePath: '/', fileType: 'page' as const },
      { routePath: '/about', fileType: 'page' as const },
      { routePath: '/user/:id', fileType: 'page' as const },
      { routePath: '/blog/:...slug', fileType: 'page' as const },
    ]

    for (const { routePath, fileType } of testCases) {
      const analysis = await analyzeFile(source, 'page.tsx')
      const context = createMockContext({ routePath, fileType })
      const results = transformFile(source, analysis, context)
      expect(results[0].route.path).toBe(routePath)
    }
  })

  it('should include middleware and layout chains in route info', async () => {
    const source = `
export default async function Page() {
  return () => <div>Hello</div>
}
`
    const analysis = await analyzeFile(source, 'page.tsx')
    const context = createMockContext({
      routePath: '/dashboard',
      middlewares: ['/app/src/middleware.ts', '/app/src/dashboard/middleware.ts'],
      layouts: ['/app/src/layout.tsx', '/app/src/dashboard/layout.tsx'],
    })
    const results = transformFile(source, analysis, context)

    expect(results[0].route.middlewares).toHaveLength(2)
    expect(results[0].route.layouts).toHaveLength(2)
  })
})
