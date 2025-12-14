import { test, expect } from '@playwright/test';

test.describe('Hacker News Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
  });

  test('should load top stories on initial page load', async ({ page }) => {
    // Wait for the news list to appear
    await page.waitForSelector('.news-list', { timeout: 15000 });

    // Check that we have story items with actual titles (not just "Loading...")
    const storyTitles = await page.locator('.news-item .title a').count();
    expect(storyTitles).toBeGreaterThan(0);

    // Verify at least one story has actual content
    const firstTitle = await page.locator('.news-item .title a').first().textContent();
    expect(firstTitle).toBeTruthy();
    expect(firstTitle).not.toBe('Loading...');
  });

  test('should navigate to /new and display new stories', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.news-list', { timeout: 15000 });

    // Click the "new" link
    await page.click('a[href="/new"]');

    // Wait for URL to change
    await expect(page).toHaveURL('http://localhost:5174/new');

    // Wait for new stories to load
    // The page might show "Loading..." initially, so we need to wait for actual content
    await page.waitForFunction(
      () => {
        const newsList = document.querySelector('.news-list');
        if (!newsList) return false;

        // Check if we have story items with actual titles (not Loading...)
        const titleLinks = newsList.querySelectorAll('.title a');
        return titleLinks.length > 0 && titleLinks[0].textContent !== 'Loading...';
      },
      { timeout: 15000 }
    );

    // Verify we have loaded stories
    const storyTitles = await page.locator('.news-item .title a').count();
    expect(storyTitles).toBeGreaterThan(0);

    // Verify the heading (use first in case multiple h1s exist during transition)
    const heading = await page.locator('h1').first().textContent();
    expect(heading).toContain('New');
  });

  test('should navigate between different story types without getting stuck', async ({ page }) => {
    // Test helper function to wait for stories to load
    const waitForStories = async () => {
      await page.waitForFunction(
        () => {
          const newsList = document.querySelector('.news-list');
          if (!newsList) return false;
          const titleLinks = newsList.querySelectorAll('.title a');
          return titleLinks.length > 0 && titleLinks[0].textContent !== 'Loading...';
        },
        { timeout: 15000 }
      );
    };

    // Start on home page (top stories)
    await waitForStories();
    const topTitle = await page.locator('.news-item .title a').first().textContent();
    expect(topTitle).toBeTruthy();

    // Navigate to /new
    await page.click('a[href="/new"]');
    await waitForStories();
    const newTitle = await page.locator('.news-item .title a').first().textContent();
    expect(newTitle).toBeTruthy();

    // Titles might be different (not guaranteed but likely)
    console.log('Top story:', topTitle);
    console.log('New story:', newTitle);

    // Navigate to /show
    await page.click('a[href="/show"]');
    await waitForStories();
    const showTitle = await page.locator('.news-item .title a').first().textContent();
    expect(showTitle).toBeTruthy();

    // Navigate to /ask
    await page.click('a[href="/ask"]');
    await waitForStories();
    const askTitle = await page.locator('.news-item .title a').first().textContent();
    expect(askTitle).toBeTruthy();

    // Navigate back to top
    await page.click('a[href="/"]');
    await waitForStories();
    const backToTop = await page.locator('.news-item .title a').first().textContent();
    expect(backToTop).toBeTruthy();
  });

  test('should display correct page heading for each route', async ({ page }) => {
    const routes = [
      { path: '/', heading: 'Top Stories' },
      { path: '/new', heading: 'New Stories' },
      { path: '/show', heading: 'Show Stories' },
      { path: '/ask', heading: 'Ask Stories' },
      { path: '/jobs', heading: 'Job Stories' }
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:5174${route.path}`);

      // Wait for content to load
      await page.waitForFunction(
        () => {
          const newsList = document.querySelector('.news-list');
          if (!newsList) return false;
          const titleLinks = newsList.querySelectorAll('.title a');
          return titleLinks.length > 0;
        },
        { timeout: 15000 }
      );

      // Check heading (it's visually-hidden but should be in the DOM)
      const heading = await page.locator('h1').first().textContent();
      expect(heading).toContain(route.heading);
    }
  });

  test('should render story items with all expected elements', async ({ page }) => {
    // Wait for stories to load
    await page.waitForFunction(
      () => {
        const newsList = document.querySelector('.news-list');
        if (!newsList) return false;
        const titleLinks = newsList.querySelectorAll('.title a');
        return titleLinks.length > 5; // Wait for at least 5 stories
      },
      { timeout: 15000 }
    );

    // Check first story has all elements
    const firstStory = page.locator('.news-item').first();

    // Should have a score element (may be empty if points not loaded yet)
    await expect(firstStory.locator('.score')).toBeAttached();

    // Should have a title link
    await expect(firstStory.locator('.title a')).toBeVisible();

    // Should have meta info (by, time, comments)
    await expect(firstStory.locator('.meta .by')).toBeVisible();
    await expect(firstStory.locator('.meta .time')).toBeVisible();
    await expect(firstStory.locator('.meta .comments-link')).toBeVisible();
  });
});
