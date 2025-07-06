import { test, expect } from '@playwright/test';

test.describe('Adaptive Job Application', () => {
  test('should complete frontend engineer application flow', async ({ page }) => {
    await page.goto('/');

    // Check initial state
    await expect(page.getByText('Adaptive Job Application')).toBeVisible();
    await expect(page.getByText('Frontend Engineer')).toBeVisible();

    // Answer first question (name)
    await page.fill('input[type="text"]', 'John Doe');
    await page.click('button:has-text("Continue")');

    // Wait for next question to load
    await page.waitForSelector('input[type="text"]');

    // Answer second question (email)
    await page.fill('input[type="text"]', 'john.doe@example.com');
    await page.click('button:has-text("Continue")');

    // Wait for select dropdown
    await page.waitForSelector('select');

    // Answer third question (experience)
    await page.selectOption('select', '2-3 years');
    await page.click('button:has-text("Continue")');

    // Continue through remaining questions
    await page.waitForSelector('textarea');
    await page.fill('textarea', 'React, TypeScript, CSS, HTML');
    await page.click('button:has-text("Continue")');

    await page.waitForSelector('textarea');
    await page.fill('textarea', 'Built a complex dashboard with real-time data visualization');
    await page.click('button:has-text("Continue")');

    await page.waitForSelector('select');
    await page.selectOption('select', 'Within 2 weeks');
    await page.click('button:has-text("Continue")');

    // Check completion
    await expect(page.getByText('Application Complete!')).toBeVisible();
    await expect(page.getByText('Frontend Engineer position')).toBeVisible();
  });

  test('should switch between roles and show different content', async ({ page }) => {
    await page.goto('/');

    // Initially on Frontend Engineer
    await expect(page.getByText('Frontend Engineer')).toBeVisible();

    // Switch to Product Designer
    await page.click('button:has-text("Product Designer")');

    // Start answering questions
    await page.fill('input[type="text"]', 'Jane Smith');
    await page.click('button:has-text("Continue")');

    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', 'jane.smith@example.com');
    await page.click('button:has-text("Continue")');

    await page.waitForSelector('select');
    await page.selectOption('select', '4-5 years');
    await page.click('button:has-text("Continue")');

    // Check for design-specific question
    await page.waitForSelector('textarea');
    await expect(page.getByText('design tools')).toBeVisible();
  });

  test('should show progress indicator correctly', async ({ page }) => {
    await page.goto('/');

    // Check initial progress
    await expect(page.getByText('Question 1 of 6')).toBeVisible();
    await expect(page.getByText('0% Complete')).toBeVisible();

    // Answer first question
    await page.fill('input[type="text"]', 'Test User');
    await page.click('button:has-text("Continue")');

    // Check updated progress
    await expect(page.getByText('Question 2 of 6')).toBeVisible();
    await expect(page.getByText('17% Complete')).toBeVisible();
  });
});