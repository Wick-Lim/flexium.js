import { test, expect } from '@playwright/test'

/**
 * Comprehensive Router E2E Tests
 * Tests navigation, params, nested routes, guards
 */
test.describe('Flexium Router', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/topstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([1, 2, 3, 4, 5]),
      })
    })

    await page.route('**/newstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([10, 11, 12]),
      })
    })

    await page.route('**/showstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([20, 21]),
      })
    })

    await page.route('**/askstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([30]),
      })
    })

    await page.route('**/jobstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([40]),
      })
    })

    await page.route('**/item/*.json', async (route) => {
      const url = route.request().url()
      const id = url.split('/').pop()?.replace('.json', '')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: Number(id),
          title: `Test Story ${id}`,
          by: `user${id}`,
          score: 100 + Number(id),
          time: 1600000000 + Number(id) * 1000,
          url: `http://example.com/${id}`,
          descendants: Number(id) * 10,
          kids: [Number(id) * 100, Number(id) * 100 + 1],
        }),
      })
    })

    await page.route('**/user/*.json', async (route) => {
      const url = route.request().url()
      const id = url.split('/').pop()?.replace('.json', '')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id,
          created: 1600000000,
          karma: 1000,
          about: `About ${id}`,
          submitted: [1, 2, 3],
        }),
      })
    })
  })

  test.describe('Basic Navigation', () => {
    test('should load homepage', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/Flexium Hacker News/)
    })

    test('should navigate to /new', async ({ page }) => {
      await page.goto('/')
      await page.click('nav .links a:has-text("new")')
      await expect(page).toHaveURL('/new')
    })

    test('should navigate to /show', async ({ page }) => {
      await page.goto('/')
      await page.click('nav a:has-text("show")')
      await expect(page).toHaveURL('/show')
    })

    test('should navigate to /ask', async ({ page }) => {
      await page.goto('/')
      await page.click('nav a:has-text("ask")')
      await expect(page).toHaveURL('/ask')
    })

    test('should navigate to /jobs', async ({ page }) => {
      await page.goto('/')
      await page.click('nav a:has-text("jobs")')
      await expect(page).toHaveURL('/jobs')
    })

    test('should navigate back to home via logo', async ({ page }) => {
      await page.goto('/new')
      await page.click('a.logo')
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Dynamic Route Parameters', () => {
    test('should navigate to item detail page', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('li.news-item', { timeout: 10000 })

      // Click on a story
      const firstItem = page.locator('li.news-item').first()
      const itemLink = firstItem.locator('a[href^="/item/"]').first()

      if ((await itemLink.count()) > 0) {
        await itemLink.click()
        await expect(page).toHaveURL(/\/item\/\d+/)
      }
    })

    test('should display item with correct ID from URL params', async ({ page }) => {
      await page.goto('/item/123')

      // Wait for content to load
      await page.waitForTimeout(2000)

      // Should show item details
      await expect(page.locator('body')).toContainText('Test Story 123')
    })

    test('should navigate to user profile page', async ({ page }) => {
      await page.goto('/user/testuser')

      // Wait for content to load
      await page.waitForTimeout(2000)

      // Should show user details
      await expect(page.locator('body')).toContainText('testuser')
    })
  })

  test.describe('Browser History', () => {
    test('should support browser back button', async ({ page }) => {
      await page.goto('/')

      await page.click('nav .links a:has-text("show")', { force: true })
      await expect(page).toHaveURL('/show')

      await page.click('nav .links a:has-text("new")', { force: true })
      await expect(page).toHaveURL('/new')

      await page.goBack()
      await expect(page).toHaveURL('/show')

      await page.goBack()
      await expect(page).toHaveURL('/')
    })

    test('should support browser forward button', async ({ page }) => {
      await page.goto('/')

      await page.click('nav .links a:has-text("show")', { force: true })
      await page.click('nav .links a:has-text("new")', { force: true })

      await page.goBack()
      await page.goBack()
      await expect(page).toHaveURL('/')

      await page.goForward()
      await expect(page).toHaveURL('/show')

      await page.goForward()
      await expect(page).toHaveURL('/new')
    })
  })

  test.describe('Direct URL Access', () => {
    test('should handle direct navigation to /new', async ({ page }) => {
      await page.goto('/new')
      await expect(page.locator('#app')).toBeVisible()
      await expect(page.locator('li.news-item')).toHaveCount(3, { timeout: 10000 })
    })

    test('should handle direct navigation to /show', async ({ page }) => {
      await page.goto('/show')
      await expect(page.locator('#app')).toBeVisible()
      await expect(page.locator('li.news-item')).toHaveCount(2, { timeout: 10000 })
    })

    test('should handle direct navigation to /item/:id', async ({ page }) => {
      await page.goto('/item/42')
      await page.waitForTimeout(2000)
      await expect(page.locator('body')).toContainText('Test Story 42')
    })

    test('should handle direct navigation to /user/:id', async ({ page }) => {
      await page.goto('/user/johndoe')
      await page.waitForTimeout(2000)
      await expect(page.locator('body')).toContainText('johndoe')
    })
  })

  test.describe('Link Component', () => {
    test('should prevent default navigation', async ({ page }) => {
      await page.goto('/')

      // Track navigation events
      let fullReloadOccurred = false
      page.on('load', () => {
        fullReloadOccurred = true
      })

      await page.click('nav .links a:has-text("new")')

      // Wait a bit to ensure no full reload
      await page.waitForTimeout(500)

      // If it was SPA navigation, no full reload should occur
      // (The initial load doesn't count)
      expect(fullReloadOccurred).toBe(false)
    })

    test('should set href attribute correctly', async ({ page }) => {
      await page.goto('/')

      const newLink = page.locator('nav .links a:has-text("new")')
      await expect(newLink).toHaveAttribute('href', '/new')

      const showLink = page.locator('nav a:has-text("show")').first()
      await expect(showLink).toHaveAttribute('href', '/show')
    })
  })

  test.describe('Route Rendering', () => {
    test('should render different content for different routes', async ({ page }) => {
      // Check / (top) has 5 items
      await page.goto('/')
      await expect(page.locator('li.news-item')).toHaveCount(5, { timeout: 10000 })

      // Check /new has 3 items
      await page.goto('/new')
      await expect(page.locator('li.news-item')).toHaveCount(3, { timeout: 10000 })

      // Check /show has 2 items
      await page.goto('/show')
      await expect(page.locator('li.news-item')).toHaveCount(2, { timeout: 10000 })
    })

    // Test: Route navigation should update list content correctly
    test('should update content when navigating between routes', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('li.news-item')).toHaveCount(5, { timeout: 10000 })

      await page.click('nav .links a:has-text("new")', { force: true })
      await expect(page.locator('li.news-item')).toHaveCount(3, { timeout: 10000 })

      await page.click('nav .links a:has-text("ask")', { force: true })
      await expect(page.locator('li.news-item')).toHaveCount(1, { timeout: 10000 })
    })
  })

  test.describe('Navigation Performance', () => {
    test('should navigate quickly between routes', async ({ page }) => {
      await page.goto('/')
      await page.waitForSelector('li.news-item', { timeout: 10000 })

      const start = Date.now()

      await page.click('nav .links a:has-text("new")')
      await page.waitForSelector('li.news-item')

      await page.click('nav .links a:has-text("show")')
      await page.waitForSelector('li.news-item')

      await page.click('nav .links a:has-text("ask")')
      await page.waitForSelector('li.news-item')

      const duration = Date.now() - start

      // 3 navigations should complete in under 3 seconds
      expect(duration).toBeLessThan(3000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle 404 routes gracefully', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await page.goto('/nonexistent-route')

      // Should not crash
      await expect(page.locator('#app')).toBeVisible()
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/topstories.json', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      })

      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await page.goto('/')
      await page.waitForTimeout(2000)

      // Should not crash the entire app
      await expect(page.locator('#app')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should maintain focus management during navigation', async ({ page }) => {
      await page.goto('/')

      // Focus on a link
      await page.locator('nav .links a:has-text("new")').focus()
      await expect(page.locator('nav .links a:has-text("new")')).toBeFocused()

      // Navigate
      await page.keyboard.press('Enter')

      // Wait for navigation
      await page.waitForURL('/new')

      // Focus should be managed appropriately
      // (typically moves to main content or stays on navigation)
    })

    test('should have accessible navigation links', async ({ page }) => {
      await page.goto('/')

      const navLinks = page.locator('nav a')
      const count = await navLinks.count()

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i)
        const text = await link.textContent()
        expect(text?.trim().length).toBeGreaterThan(0)
      }
    })
  })
})
