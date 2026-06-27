import {test, expect} from '@playwright/test';

test.describe("Job Subscription Gaurenty", ()=>{
    test("Should Block free tier user",async({page})=>{
         //got to analysis page
        await page.goto('http://localhost:5173/dashboard/analytics');

        const upgradeModel = page.locator('upgrade Now');
        await expect(page.getByText(/Upgrade required to access analytics|upgrade Now /i)).toBeVisible();

        await expect(page.getByRole('button', {name:'upgrade Now'})).toBeVisible
    })
})