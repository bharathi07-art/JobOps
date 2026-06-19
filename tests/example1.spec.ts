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
    });

    test("Test 3: Resume Upload & Processing Loop", async ({ page }) => {
      // Navigate to the resume analysis page
      await page.goto('http://localhost:5173/dashboard/resume')

      // Upload a sample resume PDF (ensure the fixture file exists in the repository)
      await page.setInputFiles('input[type="file"]' , 'tests/fixture/sample_resume.pdf')

      // Wait for the AI analysis to complete – the UI shows "Analysis Complete!"
      await page.waitForSelector('text=Analysis Complete!', { timeout: 120000 })

      // Verify that the resume score section becomes visible
      await expect(page.getByText(/Resume Score/i)).toBeVisible()

      // Verify that the matched jobs section appears after processing
      await expect(page.getByRole('heading', { name: /Matched Jobs/i })).toBeVisible()
    })

});