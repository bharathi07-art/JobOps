import {test, expect} from '@playwright/test';

test.describe("Job Subscription Gaurenty", () => {
    test("Should Block free tier user", async ({ page }) => {
        // 1. Log in as the free tier seeded user
        await page.goto('http://localhost:5173/login');
        await page.fill('input[type="email"]', 'cs235114107@bhc.edu.in');
        await page.fill('input[type="password"]', 'TESTpassword');
        await page.click('button[type="submit"]');

        // Wait for dashboard to load
        await page.waitForURL('**/dashboard');

        // 2. Go to analytics page
        await page.goto('http://localhost:5173/dashboard/analytics');

        // 3. Verify the Upgrade Banner is visible
        await expect(page.getByText(/Upgrade required to access analytics/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /upgrade Now/i })).toBeVisible();
    });
});