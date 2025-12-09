import { test, expect } from '@playwright/test'

/**
 * E2E Tests for vite-starter template
 * Tests the core Flexium features: state, computed, effects
 */
test.describe('Vite Starter Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Initial Render', () => {
    test('should render the app title', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('Flexium')
      await expect(page.locator('.subtitle')).toHaveText('Fine-grained Reactivity Framework')
    })

    test('should display initial counter value of 0', async ({ page }) => {
      await expect(page.locator('.display')).toHaveText('0')
    })

    test('should display computed values (doubled and tripled)', async ({ page }) => {
      const stats = page.locator('.stat-value')
      await expect(stats.first()).toHaveText('0') // doubled
      await expect(stats.nth(1)).toHaveText('0') // tripled
    })

    test('should render all feature tags', async ({ page }) => {
      const tags = page.locator('.tag')
      await expect(tags).toHaveCount(4)
      await expect(tags.nth(0)).toHaveText('State')
      await expect(tags.nth(1)).toHaveText('Computed')
      await expect(tags.nth(2)).toHaveText('Effects')
      await expect(tags.nth(3)).toHaveText('Zero Dependencies')
    })
  })

  test.describe('Counter Interactions', () => {
    test('should increment counter', async ({ page }) => {
      await page.click('button:has-text("+ Increment")')
      await expect(page.locator('.display')).toHaveText('1')
    })

    test('should decrement counter', async ({ page }) => {
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("- Decrement")')
      await expect(page.locator('.display')).toHaveText('0')
    })

    test('should allow negative values', async ({ page }) => {
      await page.click('button:has-text("- Decrement")')
      await expect(page.locator('.display')).toHaveText('-1')
    })

    test('should reset counter to zero', async ({ page }) => {
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')
      await expect(page.locator('.display')).toHaveText('3')

      await page.click('button:has-text("Reset")')
      await expect(page.locator('.display')).toHaveText('0')
    })

    test('should handle rapid clicks', async ({ page }) => {
      // Click increment 10 times rapidly
      for (let i = 0; i < 10; i++) {
        await page.click('button:has-text("+ Increment")')
      }
      await expect(page.locator('.display')).toHaveText('10')
    })
  })

  test.describe('Computed Values (Reactivity)', () => {
    test('should update doubled value when counter changes', async ({ page }) => {
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')

      const stats = page.locator('.stat-value')
      await expect(stats.first()).toHaveText('6') // 3 * 2
    })

    test('should update tripled value when counter changes', async ({ page }) => {
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')

      const stats = page.locator('.stat-value')
      await expect(stats.nth(1)).toHaveText('6') // 2 * 3
    })

    test('should update all computed values synchronously', async ({ page }) => {
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')

      // All should be updated at once
      await expect(page.locator('.display')).toHaveText('5')
      const stats = page.locator('.stat-value')
      await expect(stats.first()).toHaveText('10') // 5 * 2
      await expect(stats.nth(1)).toHaveText('15') // 5 * 3
    })

    test('computed values should handle negative numbers', async ({ page }) => {
      await page.click('button:has-text("- Decrement")')
      await page.click('button:has-text("- Decrement")')

      const stats = page.locator('.stat-value')
      await expect(stats.first()).toHaveText('-4') // -2 * 2
      await expect(stats.nth(1)).toHaveText('-6') // -2 * 3
    })
  })

  test.describe('Effects (Console Logging)', () => {
    test('should log count changes to console', async ({ page }) => {
      const consoleLogs: string[] = []
      page.on('console', (msg) => {
        if (msg.text().includes('Count changed:')) {
          consoleLogs.push(msg.text())
        }
      })

      await page.click('button:has-text("+ Increment")')
      await page.click('button:has-text("+ Increment")')

      // Wait for effects to fire
      await page.waitForTimeout(100)

      expect(consoleLogs.length).toBeGreaterThanOrEqual(2)
      expect(consoleLogs.some((log) => log.includes('1'))).toBe(true)
      expect(consoleLogs.some((log) => log.includes('2'))).toBe(true)
    })
  })

  test.describe('Keyboard Accessibility', () => {
    test('should be able to increment using keyboard', async ({ page }) => {
      await page.locator('button:has-text("+ Increment")').focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('.display')).toHaveText('1')
    })

    test('should be able to navigate buttons with Tab', async ({ page }) => {
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Focus should be on one of the buttons
      const focused = page.locator(':focus')
      await expect(focused).toHaveAttribute('class', /btn/)
    })

    test('should trigger button with Space key', async ({ page }) => {
      await page.locator('button:has-text("+ Increment")').focus()
      await page.keyboard.press('Space')
      await expect(page.locator('.display')).toHaveText('1')
    })
  })

  test.describe('Responsive Design', () => {
    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.display')).toBeVisible()
      await expect(page.locator('button:has-text("+ Increment")')).toBeVisible()
    })

    test('should render correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.display')).toBeVisible()
    })

    test('should render correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.display')).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should handle 100 rapid state updates without lag', async ({ page }) => {
      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        await page.click('button:has-text("+ Increment")', { force: true })
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      await expect(page.locator('.display')).toHaveText('100')

      // Should complete 100 updates in under 5 seconds
      expect(duration).toBeLessThan(5000)
    })

    test('should not have memory leaks after many updates', async ({ page }) => {
      // Get initial heap size
      const initialMetrics = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize
        }
        return 0
      })

      // Perform many updates
      for (let i = 0; i < 50; i++) {
        await page.click('button:has-text("+ Increment")', { force: true })
        await page.click('button:has-text("- Decrement")', { force: true })
      }

      // Get final heap size
      const finalMetrics = await page.evaluate(() => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize
        }
        return 0
      })

      // Memory growth should be reasonable (less than 10MB)
      if (initialMetrics > 0 && finalMetrics > 0) {
        const memoryGrowth = finalMetrics - initialMetrics
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })
})
