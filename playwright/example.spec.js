// Playwright E2E test placeholder
// Install playwright and run `npx playwright test` after starting the app (`npm run dev`).
import { test, expect } from '@playwright/test';

test('home has title', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('text=PizzApp React')).toBeVisible();
});
