import { test, expect } from '@playwright/test';

test.describe('Hackernews Clone', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`Browser Console: ${msg.text()}`));
    page.on('pageerror', err => console.log(`Browser Error: ${err.message}`));

    // Mock API responses
    await page.route('**/topstories.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([1, 2, 3]) // Return just 3 IDs
      });
    });

    await page.route('**/item/*.json', async route => {
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
          url: 'http://example.com'
        })
      });
    });
    
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Flexium Hacker News/, { timeout: 10000 });
    await expect(page.locator('#app')).toBeVisible();
  });

  test('should render a list of stories', async ({ page }) => {
    // Directly wait for items to populate
    const items = page.locator('li.news-item');
    
    // Use a generous timeout for async data fetching
    await expect(items).toHaveCount(3, { timeout: 15000 });
    
    // Check item content
    await expect(items.first()).toContainText('Test Story 1');
    await expect(items.first()).toContainText('tester');
  });
});
