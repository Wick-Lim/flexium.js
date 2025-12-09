import { test, expect } from '@playwright/test';

test.describe('Hackernews Real API', () => {
  // Increase timeout for real network requests
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Enable console logs
    page.on('console', msg => console.log(`Browser: ${msg.text()}`));
    page.on('pageerror', err => console.log(`Browser Error: ${err.message}`));
    
    await page.goto('/');
  });

  test('should fetch and render real stories', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Flexium Hacker News/);

    // Wait for any news item (real data might take time)
    const items = page.locator('li.news-item');
    await expect(items.first()).toBeVisible({ timeout: 30000 });

    const count = await items.count();
    console.log(`Rendered items count: ${count}`);
    expect(count).toBeGreaterThan(0);

    // Wait for first item to have actual content (not just "Loading...")
    await expect(items.first()).not.toContainText('Loading...', { timeout: 30000 });

    // Check content of first item
    const firstItemText = await items.first().innerText();
    console.log('First item text:', firstItemText);

    expect(firstItemText.length).toBeGreaterThan(10);
    // Check for "by" which confirms author rendering
    expect(firstItemText).toContain('by');
  });
});
