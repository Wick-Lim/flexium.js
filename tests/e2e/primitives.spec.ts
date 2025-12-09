import { test, expect } from '@playwright/test'

/**
 * Comprehensive E2E Tests for Flexium Primitives
 * Tests Button, Transition, Layout, List, Pressable, Text, ScrollView
 */

test.describe('Flexium Primitives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ==========================================
  // Button Tests
  // ==========================================
  test.describe('Button Component', () => {
    test('should render and handle clicks', async ({ page }) => {
      const button = page.locator('[data-testid="basic-button"] button')
      const counter = page.locator('[data-testid="click-count"]')

      await expect(counter).toContainText('Clicks: 0')

      await button.click()
      await expect(counter).toContainText('Clicks: 1')

      await button.click()
      await button.click()
      await expect(counter).toContainText('Clicks: 3')
    })

    test('should render all variants', async ({ page }) => {
      const section = page.locator('[data-testid="button-variants"]')

      await expect(section.locator('button:has-text("Primary")')).toBeVisible()
      await expect(section.locator('button:has-text("Secondary")')).toBeVisible()
      await expect(section.locator('button:has-text("Outline")')).toBeVisible()
      await expect(section.locator('button:has-text("Ghost")')).toBeVisible()
      await expect(section.locator('button:has-text("Danger")')).toBeVisible()
    })

    test('should track variant clicks', async ({ page }) => {
      const section = page.locator('[data-testid="button-variants"]')
      const lastVariant = page.locator('[data-testid="last-variant"]')

      await section.locator('button:has-text("Primary")').click()
      await expect(lastVariant).toContainText('primary')

      await section.locator('button:has-text("Danger")').click()
      await expect(lastVariant).toContainText('danger')
    })

    test('should render different sizes', async ({ page }) => {
      const section = page.locator('[data-testid="button-sizes"]')

      const smallBtn = section.locator('button:has-text("Small")')
      const mediumBtn = section.locator('button:has-text("Medium")')
      const largeBtn = section.locator('button:has-text("Large")')

      await expect(smallBtn).toBeVisible()
      await expect(mediumBtn).toBeVisible()
      await expect(largeBtn).toBeVisible()

      // Check sizes are different
      const smallBox = await smallBtn.boundingBox()
      const largeBox = await largeBtn.boundingBox()

      expect(smallBox!.height).toBeLessThan(largeBox!.height)
    })

    test('should handle loading state', async ({ page }) => {
      const section = page.locator('[data-testid="button-loading"]')
      const button = section.locator('button')
      const loadingState = page.locator('[data-testid="loading-state"]')

      await expect(loadingState).toContainText('idle')

      await button.click()
      await expect(loadingState).toContainText('loading')

      // Wait for async action to complete
      await expect(loadingState).toContainText('idle', { timeout: 2000 })
    })

    test('should handle disabled state', async ({ page }) => {
      const section = page.locator('[data-testid="button-disabled"]')
      const targetButton = section.locator('button').first()
      const toggleButton = section.locator('button:has-text("Toggle")')

      // Initially enabled
      await expect(targetButton).not.toBeDisabled()

      // Toggle to disabled
      await toggleButton.click()
      await expect(targetButton).toBeDisabled()

      // Toggle back to enabled
      await toggleButton.click()
      await expect(targetButton).not.toBeDisabled()
    })

    test('should handle icon button', async ({ page }) => {
      const iconButton = page.locator('[data-testid="icon-button"] button')
      const iconEvent = page.locator('[data-testid="icon-event"]')

      await iconButton.click()
      await expect(iconEvent).toContainText('icon-clicked')
    })

    test('should support keyboard navigation', async ({ page }) => {
      const button = page.locator('#keyboard-test-btn')
      const keyboardEvent = page.locator('[data-testid="keyboard-event"]')

      await button.focus()
      await page.keyboard.press('Enter')
      await expect(keyboardEvent).toContainText('keyboard')
    })

    test('should support Space key', async ({ page }) => {
      const button = page.locator('#keyboard-test-btn')

      await button.focus()
      await page.keyboard.press('Space')

      const keyboardEvent = page.locator('[data-testid="keyboard-event"]')
      await expect(keyboardEvent).toContainText('keyboard')
    })
  })

  // ==========================================
  // Transition Tests
  // ==========================================
  test.describe('Transition Component', () => {
    test('should toggle fade transition', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="fade-transition"] button')
      const fadeBox = page.locator('[data-testid="fade-box"]')

      // Initially visible
      await expect(fadeBox).toBeVisible()

      // Hide
      await toggleBtn.click()
      await expect(fadeBox).toBeHidden({ timeout: 1000 })

      // Show again
      await toggleBtn.click()
      await expect(fadeBox).toBeVisible({ timeout: 1000 })
    })

    test('should toggle slide transition', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="slide-transition"] button')
      const slideBox = page.locator('[data-testid="slide-box"]')

      await expect(slideBox).toBeVisible()

      await toggleBtn.click()
      await expect(slideBox).toBeHidden({ timeout: 1000 })

      await toggleBtn.click()
      await expect(slideBox).toBeVisible({ timeout: 1000 })
    })

    test('should open and close modal', async ({ page }) => {
      const openBtn = page.locator('[data-testid="modal-transition"] button:has-text("Open")')
      const modalBox = page.locator('[data-testid="modal-box"]')
      const closeBtn = page.locator('.modal-content button:has-text("Close")')

      // Initially hidden
      await expect(modalBox).toBeHidden()

      // Open modal
      await openBtn.click()
      await expect(modalBox).toBeVisible({ timeout: 500 })

      // Close modal
      await closeBtn.click()
      await expect(modalBox).toBeHidden({ timeout: 500 })
    })

    test('should handle custom transition', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="custom-transition"] button')
      const customBox = page.locator('[data-testid="custom-box"]')

      await expect(customBox).toBeVisible()

      await toggleBtn.click()
      await expect(customBox).toBeHidden({ timeout: 1000 })

      await toggleBtn.click()
      await expect(customBox).toBeVisible({ timeout: 1000 })
    })
  })

  // ==========================================
  // TransitionGroup Tests
  // ==========================================
  test.describe('TransitionGroup Component', () => {
    test('should add items with animation', async ({ page }) => {
      const addBtn = page.locator('[data-testid="transition-group-section"] button:has-text("Add")')
      const itemCount = page.locator('[data-testid="item-count"]')

      await expect(itemCount).toContainText('Count: 3')

      await addBtn.click()
      await expect(itemCount).toContainText('Count: 4')
      await expect(page.locator('[data-testid="group-item-4"]')).toBeVisible()

      await addBtn.click()
      await expect(itemCount).toContainText('Count: 5')
    })

    test('should remove items with animation', async ({ page }) => {
      const itemCount = page.locator('[data-testid="item-count"]')
      const removeBtn = page.locator('[data-testid="group-item-1"] button')

      await expect(itemCount).toContainText('Count: 3')

      await removeBtn.click()
      await expect(itemCount).toContainText('Count: 2', { timeout: 1000 })
      await expect(page.locator('[data-testid="group-item-1"]')).toBeHidden({ timeout: 1000 })
    })

    test('should shuffle items', async ({ page }) => {
      const shuffleBtn = page.locator('[data-testid="transition-group-section"] button:has-text("Shuffle")')
      const itemCount = page.locator('[data-testid="item-count"]')

      await expect(itemCount).toContainText('Count: 3')

      await shuffleBtn.click()

      // Count should remain the same
      await expect(itemCount).toContainText('Count: 3')
    })
  })

  // ==========================================
  // Layout Tests
  // ==========================================
  test.describe('Layout Components', () => {
    test('Row should arrange children horizontally', async ({ page }) => {
      const row = page.locator('[data-testid="row-layout"] [style*="display: flex"]').first()
      const boxes = row.locator('.layout-box')

      await expect(boxes).toHaveCount(3)

      // Get bounding boxes
      const box1 = await boxes.nth(0).boundingBox()
      const box2 = await boxes.nth(1).boundingBox()
      const box3 = await boxes.nth(2).boundingBox()

      // Check horizontal arrangement (same Y, increasing X)
      expect(box1!.y).toBeCloseTo(box2!.y, 1)
      expect(box2!.y).toBeCloseTo(box3!.y, 1)
      expect(box1!.x).toBeLessThan(box2!.x)
      expect(box2!.x).toBeLessThan(box3!.x)
    })

    test('Column should arrange children vertically', async ({ page }) => {
      const column = page.locator('[data-testid="column-layout"] [style*="flex-direction"]')
      const boxes = column.locator('.layout-box')

      await expect(boxes).toHaveCount(3)

      const box1 = await boxes.nth(0).boundingBox()
      const box2 = await boxes.nth(1).boundingBox()
      const box3 = await boxes.nth(2).boundingBox()

      // Check vertical arrangement (same X, increasing Y)
      expect(box1!.x).toBeCloseTo(box2!.x, 1)
      expect(box1!.y).toBeLessThan(box2!.y)
      expect(box2!.y).toBeLessThan(box3!.y)
    })

    test('Grid should render in columns', async ({ page }) => {
      const grid = page.locator('[data-testid="grid-layout"] [style*="display: grid"]')
      const boxes = grid.locator('.layout-box')

      await expect(boxes).toHaveCount(6)
    })

    test('Spacer should push elements apart', async ({ page }) => {
      const container = page.locator('[data-testid="spacer-layout"] [style*="display: flex"]').first()
      const leftBox = container.locator('.layout-box:has-text("Left")')
      const rightBox = container.locator('.layout-box:has-text("Right")')

      const leftBBox = await leftBox.boundingBox()
      const rightBBox = await rightBox.boundingBox()
      const containerBBox = await container.boundingBox()

      // Left should be at the start, right should be at the end
      expect(leftBBox!.x).toBeLessThan(containerBBox!.x + containerBBox!.width / 2)
      expect(rightBBox!.x).toBeGreaterThan(containerBBox!.x + containerBBox!.width / 2)
    })
  })

  // ==========================================
  // List Tests
  // ==========================================
  test.describe('List Component', () => {
    test('should render list items', async ({ page }) => {
      const listSection = page.locator('[data-testid="basic-list"]')
      const firstItem = page.locator('[data-testid="list-item-0"]')

      await expect(firstItem).toBeVisible()
      await expect(firstItem).toContainText('List Item 1')
    })

    test('should handle item selection', async ({ page }) => {
      const selectedId = page.locator('[data-testid="selected-id"]')
      const item5 = page.locator('[data-testid="list-item-5"]')

      await expect(selectedId).toContainText('none')

      await item5.click()
      await expect(selectedId).toContainText('Selected: 5')
    })

    test('should support scrolling', async ({ page }) => {
      const scrollContainer = page.locator('[data-testid="basic-list"] > div').first()

      // Scroll to bottom
      await scrollContainer.evaluate((el) => {
        el.scrollTop = el.scrollHeight
      })

      // Last items should be visible
      const item99 = page.locator('[data-testid="list-item-99"]')
      await expect(item99).toBeVisible()
    })

    test('virtualized list should render efficiently', async ({ page }) => {
      const virtualList = page.locator('[data-testid="virtualized-list"]')

      // Should only render visible items, not all 1000
      const renderedItems = virtualList.locator('[data-testid^="virtual-item-"]')
      const count = await renderedItems.count()

      // Should have fewer than 1000 items rendered (virtualization)
      // The exact number depends on viewport size and item height
      expect(count).toBeLessThan(100)
      expect(count).toBeGreaterThan(0)
    })
  })

  // ==========================================
  // Pressable Tests
  // ==========================================
  test.describe('Pressable Component', () => {
    test('should handle press events', async ({ page }) => {
      const pressable = page.locator('[data-testid="basic-pressable"] [style*="cursor: pointer"]').first()
      const pressCount = page.locator('[data-testid="press-count"]')

      await expect(pressCount).toContainText('Count: 0')

      await pressable.click()
      await expect(pressCount).toContainText('Count: 1')

      await pressable.click()
      await pressable.click()
      await expect(pressCount).toContainText('Count: 3')
    })

    test('should track press state', async ({ page }) => {
      const pressable = page.locator('[data-testid="basic-pressable"] [style*="cursor: pointer"]').first()
      const pressState = page.locator('[data-testid="press-state"]')

      await pressable.click()
      // After click, state should be 'pressed' or 'released'
      const stateText = await pressState.textContent()
      expect(stateText).toMatch(/pressed|released/)
    })
  })

  // ==========================================
  // Text Tests
  // ==========================================
  test.describe('Text Component', () => {
    test('should render text with different styles', async ({ page }) => {
      const textSection = page.locator('[data-testid="text-styles"]')

      await expect(textSection.locator('text("Heading Text")')).toBeVisible()
      await expect(textSection.locator('text("Body Text")')).toBeVisible()
      await expect(textSection.locator('text("Caption Text")')).toBeVisible()
    })

    test('should truncate long text', async ({ page }) => {
      const truncated = page.locator('[data-testid="text-truncation"]')

      // The text should be visible but truncated
      await expect(truncated).toBeVisible()

      // Container should have fixed width
      const container = truncated.locator('div').first()
      const box = await container.boundingBox()
      expect(box!.width).toBe(200)
    })
  })

  // ==========================================
  // ScrollView Tests
  // ==========================================
  test.describe('ScrollView Component', () => {
    test('should scroll vertically', async ({ page }) => {
      const scrollView = page.locator('[data-testid="vertical-scroll"] > div').first()
      const scrollPosition = page.locator('[data-testid="scroll-position"]')

      await expect(scrollPosition).toContainText('Scroll Y: 0')

      // Scroll down
      await scrollView.evaluate((el) => {
        el.scrollTop = 100
      })

      await expect(scrollPosition).toContainText('Scroll Y: 100')
    })

    test('should scroll horizontally', async ({ page }) => {
      const scrollView = page.locator('[data-testid="horizontal-scroll"] > div').first()

      // Get initial position of first item
      const firstItem = scrollView.locator('.scroll-item-h').first()
      const initialBox = await firstItem.boundingBox()

      // Scroll right
      await scrollView.evaluate((el) => {
        el.scrollLeft = 100
      })

      // First item should have moved left
      const newBox = await firstItem.boundingBox()
      expect(newBox!.x).toBeLessThan(initialBox!.x)
    })
  })

  // ==========================================
  // Accessibility Tests
  // ==========================================
  test.describe('Accessibility', () => {
    test('all buttons should be focusable', async ({ page }) => {
      const buttons = page.locator('button')
      const count = await buttons.count()

      for (let i = 0; i < Math.min(count, 10); i++) {
        const button = buttons.nth(i)
        await button.focus()
        await expect(button).toBeFocused()
      }
    })

    test('icon buttons should have aria-label', async ({ page }) => {
      const iconButton = page.locator('[data-testid="icon-button"] button')
      await expect(iconButton).toHaveAttribute('aria-label')
    })

    test('disabled buttons should have aria-disabled', async ({ page }) => {
      const section = page.locator('[data-testid="button-disabled"]')
      const toggleButton = section.locator('button:has-text("Toggle")')
      const targetButton = section.locator('button').first()

      // Enable disabled state
      await toggleButton.click()

      await expect(targetButton).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ==========================================
  // Performance Tests
  // ==========================================
  test.describe('Performance', () => {
    test('should handle rapid button clicks', async ({ page }) => {
      const button = page.locator('[data-testid="basic-button"] button')
      const counter = page.locator('[data-testid="click-count"]')

      const start = Date.now()

      for (let i = 0; i < 50; i++) {
        await button.click({ force: true })
      }

      const duration = Date.now() - start

      await expect(counter).toContainText('Clicks: 50')
      expect(duration).toBeLessThan(5000)
    })

    test('should handle rapid transition toggles', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="fade-transition"] button')

      const start = Date.now()

      for (let i = 0; i < 10; i++) {
        await toggleBtn.click()
        await page.waitForTimeout(50)
      }

      const duration = Date.now() - start

      // Should complete quickly
      expect(duration).toBeLessThan(3000)
    })

    test('list scrolling should be smooth', async ({ page }) => {
      const scrollContainer = page.locator('[data-testid="basic-list"] > div').first()

      const start = Date.now()

      // Scroll multiple times
      for (let i = 0; i < 5; i++) {
        await scrollContainer.evaluate((el) => {
          el.scrollTop = i * 200
        })
        await page.waitForTimeout(50)
      }

      const duration = Date.now() - start

      expect(duration).toBeLessThan(2000)
    })
  })
})
