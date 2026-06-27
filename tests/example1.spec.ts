import { test, expect } from '@playwright/test';

test.describe("JobOps authentication and Security lifeStyle", () => {


    test("Test 1: Should Register in successfully with valid credentials and verify ", async ({ page }) => {
        await page.goto('http://localhost:5173/register')
        // 1. Target the inputs inside your frontend Register.tsx component
        await page.locator('input[type="text"]').fill('John');
        await page.locator('input[type="email"]').fill('example@gmail.com');
        await page.locator('input[type="password"]').fill('testPassword123@');

                // Check the required Terms of Service checkbox
        await page.locator('input[type="checkbox"]').check();
        // Click the authentication submission action
        await Promise.all([
            page.waitForURL('**/verify-otp'),
            page.getByRole('button', { name: /create account/i }).click()
        ]);
        // Verify we are on the OTP verification page
        await expect(page).toHaveURL('http://localhost:5173/verify-otp');
    });

    //test the login
    test("Test 2: should login successfully with valid credentials", async ({ page, context }) => {
        await page.goto('http://localhost:5173/login')
        // fill credentials
        await page.locator('input[type="email"]').fill('cs235114107@bhc.edu.in');
        await page.locator('input[type="password"]').fill('TESTpassword');
        // Check the "Remember me" checkbox (if present)    
        await page.locator('input[type="checkbox"]').check();

        // Click login and wait for navigation to dashboard
        await Promise.all([
            page.waitForURL('**/dashboard'),
            page.getByRole('button', { name: /sign in/i }).click(),
        ]);

        // Verify we are on the dashboard
        await expect(page).toHaveURL('http://localhost:5173/dashboard');

        //got to analysis page
        await page.goto('http://localhost:5173/dashboard/analytics');

        const upgradeModel = page.locator('upgrade Now');
        await expect(page.getByText(/Upgrade required to access analytics|upgrade Now /i)).toBeVisible();

        await expect(page.getByRole('button', {name:'upgrade Now'})).toBeVisible
    });

    

});