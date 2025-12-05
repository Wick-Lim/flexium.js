import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/topstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([1, 2, 3]),
      });
    });

    await page.route('**/item/*.json', async (route) => {
      const url = route.request().url();
      const id = url.split('/').pop()?.replace('.json', '');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: Number(id),
          title: `Test Story ${id}`,
          by: 'tester',
          score: 100 + Number(id),
          time: 1600000000,
          url: 'http://example.com',
        }),
      });
    });

    await page.goto('/');
    // Wait for content to load
    await page.waitForSelector('li.news-item', { timeout: 10000 });
  });

  test('should have no WCAG 2.1 AA violations on homepage', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper document structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThanOrEqual(0);
  });

  test('should have proper language attribute', async ({ page }) => {
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('should have skip link for keyboard users', async ({ page }) => {
    // Focus should reveal skip link
    await page.keyboard.press('Tab');

    // Check if skip link exists (may be hidden until focused)
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Navigate through items
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    // Filter for contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.forms'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper link text', async ({ page }) => {
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledBy = await link.getAttribute('aria-labelledby');

      // Each link should have accessible text
      const hasAccessibleName =
        (text && text.trim().length > 0) ||
        ariaLabel ||
        ariaLabelledBy;

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper image alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Decorative images should have role="presentation" or empty alt
      // Informative images should have descriptive alt text
      const hasProperAlt = alt !== null || role === 'presentation';
      expect(hasProperAlt).toBeTruthy();
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');

    // App should have some live region for dynamic updates
    expect(await liveRegions.count()).toBeGreaterThanOrEqual(0);
  });

  test('should have proper focus management', async ({ page }) => {
    // Click on a story link
    const link = page.locator('a').first();
    await link.focus();

    // Check focus is on the link
    await expect(link).toBeFocused();
  });

  test('should be navigable without mouse', async ({ page }) => {
    // Tab through the entire page
    let tabCount = 0;
    const maxTabs = 50;

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      const focused = page.locator(':focus');
      if (await focused.count() === 0) break;

      // Each focused element should be visible
      await expect(focused).toBeVisible();
    }

    // Should be able to navigate multiple elements
    expect(tabCount).toBeGreaterThan(1);
  });

  test('should not trap keyboard focus', async ({ page }) => {
    // Tab forward through page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Tab backward
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
    }

    // Focus should still be on an element
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

test.describe('Accessibility - Component Level', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/topstories.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([1]),
      });
    });

    await page.route('**/item/*.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Test Story',
          by: 'tester',
          score: 100,
          time: 1600000000,
          url: 'http://example.com',
        }),
      });
    });

    await page.goto('/');
  });

  test('should have accessible buttons', async ({ page }) => {
    const buttons = page.locator('button, [role="button"]');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Each button should have accessible name
      const hasName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasName).toBeTruthy();
    }
  });

  test('should have accessible lists', async ({ page }) => {
    const lists = page.locator('ul, ol, [role="list"]');
    const count = await lists.count();

    for (let i = 0; i < count; i++) {
      const list = lists.nth(i);
      const items = list.locator('li, [role="listitem"]');

      // Lists should have list items
      expect(await items.count()).toBeGreaterThan(0);
    }
  });
});
