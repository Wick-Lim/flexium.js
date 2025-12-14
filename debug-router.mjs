import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

// Capture console logs
const logs = [];
page.on('console', msg => {
  const text = msg.text();
  logs.push(text);
  console.log(text);
});

// Capture page errors
page.on('pageerror', error => {
  console.error('PAGE ERROR:', error.message);
});

page.on('crash', () => {
  console.error('PAGE CRASHED!');
});

try {
  console.log('=== Loading homepage (/) ===');
  await page.goto('http://localhost:4173/');
  await page.waitForSelector('li.news-item', { timeout: 20000 });

  const count1 = await page.locator('li.news-item').count();
  console.log(`\n✓ Homepage loaded: ${count1} items\n`);

  await page.waitForTimeout(1000);

  console.log('=== Clicking "new" link ===');
  await page.click('nav .links a:has-text("new")');

  console.log('=== Waiting for page to stabilize ===');
  await page.waitForTimeout(2000);

  const count2 = await page.locator('li.news-item').count();
  console.log(`\n${count2 === 3 ? '✓' : '✗'} /new page: ${count2} items (expected 3)\n`);

  const mains = await page.locator('main').count();
  console.log(`${mains === 1 ? '✓' : '✗'} Number of <main> elements: ${mains} (expected 1)\n`);

  if (count2 !== 3 || mains !== 1) {
    console.log('\n❌ FAILED: Reconciliation not working correctly\n');
    console.log('Relevant logs:');
    logs.filter(l => l.includes('[RECONCILE]') || l.includes('[REMOVE]') || l.includes('[NEW]') || l.includes('[REUSE]'))
        .forEach(l => console.log(l));
  } else {
    console.log('\n✅ SUCCESS: Reconciliation working!\n');
  }

  await page.waitForTimeout(2000);
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await browser.close();
}
