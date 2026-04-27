import { test, expect } from '@playwright/test';

// Test configuration and setup
test.describe('Kumbh Yatra - Onboarding and Login Flow', () => {
  
  // Environment variables with fallbacks
  const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';
  const USER_EMAIL = process.env.USER_EMAIL || 'user@example.com';
  const USER_PASSWORD = process.env.USER_PASSWORD || 'userpass123';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass123';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure fresh state
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Set longer timeout for potentially slow operations
    test.setTimeout(60000);
  });

  test.describe('Onboarding Flow', () => {
    
    test('should display exactly 4 onboarding tour cards', async ({ page }) => {
      // Navigate to base URL
      await page.goto('/');
      
      // Wait for onboarding to load (it should redirect from Index to Onboarding)
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Verify the onboarding card is visible
      await expect(page.getByTestId('onboarding-card')).toBeVisible({ timeout: 10000 });
      
      // Count the total number of onboarding steps by checking progress indicators
      const progressDots = page.locator('.w-2.h-2.rounded-full');
      await expect(progressDots).toHaveCount(4, { timeout: 5000 });
      
      // Verify we can navigate through all 4 cards by clicking Next
      const nextButton = page.getByTestId('next-btn');
      const skipButton = page.getByTestId('skip-btn');
      
      // Verify both buttons are visible
      await expect(nextButton).toBeVisible();
      await expect(skipButton).toBeVisible();
      
      // Navigate through all 4 cards
      for (let i = 0; i < 3; i++) {
        await nextButton.click();
        await page.waitForTimeout(500); // Small delay for animation
      }
      
      // On the last card, the button should say "Get Started"
      await expect(nextButton).toHaveText('Get Started');
    });

    test('should have visible Skip button during tour', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Verify Skip button is visible and has correct data-testid
      const skipButton = page.getByTestId('skip-btn');
      await expect(skipButton).toBeVisible({ timeout: 5000 });
      await expect(skipButton).toHaveText('Skip');
    });

    test('should navigate to login page when Skip is clicked', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Click the Skip button
      const skipButton = page.getByTestId('skip-btn');
      await skipButton.click();
      
      // Verify navigation to login page
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Verify login form is visible
      const loginForm = page.getByTestId('login-form');
      await expect(loginForm).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to login page when completing onboarding tour', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Navigate through all onboarding steps
      const nextButton = page.getByTestId('next-btn');
      
      // Click through all 4 steps
      for (let i = 0; i < 4; i++) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
      
      // Should navigate to login page
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Verify login form is visible
      const loginForm = page.getByTestId('login-form');
      await expect(loginForm).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Login Flow', () => {
    
    test.beforeEach(async ({ page }) => {
      // Set onboarding as completed to skip onboarding
      await page.evaluate(() => {
        localStorage.setItem('kumbh-onboarded', 'true');
      });
    });

    test('should display login form with required elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Verify login form and all required elements are present
      const loginForm = page.getByTestId('login-form');
      const emailInput = page.getByTestId('login-email');
      const passwordInput = page.getByTestId('login-password');
      const submitButton = page.getByTestId('login-submit');
      
      await expect(loginForm).toBeVisible({ timeout: 5000 });
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Sign In');
    });

    test('should login as USER and redirect to user dashboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Fill in user credentials
      await page.getByTestId('login-email').fill(USER_EMAIL);
      await page.getByTestId('login-password').fill(USER_PASSWORD);
      
      // Submit login form
      await page.getByTestId('login-submit').click();
      
      // Wait for redirect and verify URL contains user/dashboard path
      await page.waitForURL(url => 
        url.includes('/user') || url.includes('/dashboard'), 
        { timeout: 10000 }
      );
      
      // Verify user is logged in by checking localStorage
      const user = await page.evaluate(() => {
        const userData = localStorage.getItem('kumbh-user');
        return userData ? JSON.parse(userData) : null;
      });
      
      expect(user).toBeTruthy();
      expect(user.role).toBe('user');
      expect(user.email).toBe(USER_EMAIL);
    });

    test('should login as ADMIN and redirect to admin dashboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Fill in admin credentials
      await page.getByTestId('login-email').fill(ADMIN_EMAIL);
      await page.getByTestId('login-password').fill(ADMIN_PASSWORD);
      
      // Submit login form
      await page.getByTestId('login-submit').click();
      
      // Wait for redirect and verify URL contains admin path
      await page.waitForURL('**/admin', { timeout: 10000 });
      
      // Verify admin is logged in by checking localStorage
      const user = await page.evaluate(() => {
        const userData = localStorage.getItem('kumbh-user');
        return userData ? JSON.parse(userData) : null;
      });
      
      expect(user).toBeTruthy();
      expect(user.role).toBe('admin');
      expect(user.email).toBe(ADMIN_EMAIL);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Fill in invalid credentials
      await page.getByTestId('login-email').fill('invalid@example.com');
      await page.getByTestId('login-password').fill('wrongpassword');
      
      // Listen for dialog (alert) 
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Invalid credentials');
        await dialog.accept();
      });
      
      // Submit login form
      await page.getByTestId('login-submit').click();
      
      // Should remain on login page
      await expect(page).toHaveURL(/.*login.*/);
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Try to submit empty form
      await page.getByTestId('login-submit').click();
      
      // Check if HTML5 validation prevents submission
      const emailInput = page.getByTestId('login-email');
      const passwordInput = page.getByTestId('login-password');
      
      // Check that form inputs have required validation
      await expect(emailInput).toHaveAttribute('required');
      await expect(passwordInput).toHaveAttribute('required');
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('End-to-End Flow', () => {
    
    test('should complete full onboarding to login to dashboard flow', async ({ page }) => {
      // Start from base URL (fresh user)
      await page.goto('/');
      
      // Should redirect to onboarding
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Complete onboarding by clicking through all steps
      const nextButton = page.getByTestId('next-btn');
      for (let i = 0; i < 4; i++) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
      
      // Should be on login page
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Login as user
      await page.getByTestId('login-email').fill(USER_EMAIL);
      await page.getByTestId('login-password').fill(USER_PASSWORD);
      await page.getByTestId('login-submit').click();
      
      // Should redirect to dashboard
      await page.waitForURL(url => 
        url.includes('/user') || url.includes('/dashboard'), 
        { timeout: 10000 }
      );
      
      // Verify successful login
      const user = await page.evaluate(() => {
        const userData = localStorage.getItem('kumbh-user');
        return userData ? JSON.parse(userData) : null;
      });
      
      expect(user).toBeTruthy();
      expect(user.role).toBe('user');
    });

    test('should skip onboarding and login as admin', async ({ page }) => {
      // Start from base URL
      await page.goto('/');
      
      // Should redirect to onboarding
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Skip onboarding
      await page.getByTestId('skip-btn').click();
      
      // Should be on login page
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Login as admin
      await page.getByTestId('login-email').fill(ADMIN_EMAIL);
      await page.getByTestId('login-password').fill(ADMIN_PASSWORD);
      await page.getByTestId('login-submit').click();
      
      // Should redirect to admin dashboard
      await page.waitForURL('**/admin', { timeout: 10000 });
      
      // Verify admin login
      const user = await page.evaluate(() => {
        const userData = localStorage.getItem('kumbh-user');
        return userData ? JSON.parse(userData) : null;
      });
      
      expect(user).toBeTruthy();
      expect(user.role).toBe('admin');
    });
  });

  test.describe('Responsive Design Tests', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Verify elements are visible on mobile
      await expect(page.getByTestId('onboarding-card')).toBeVisible();
      await expect(page.getByTestId('skip-btn')).toBeVisible();
      await expect(page.getByTestId('next-btn')).toBeVisible();
      
      // Complete onboarding flow on mobile
      await page.getByTestId('skip-btn').click();
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Verify login form is usable on mobile
      await expect(page.getByTestId('login-form')).toBeVisible();
      await expect(page.getByTestId('login-email')).toBeVisible();
      await expect(page.getByTestId('login-password')).toBeVisible();
      await expect(page.getByTestId('login-submit')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    
    test('should load onboarding page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      await page.getByTestId('onboarding-card').waitFor({ timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });

    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/onboarding', { timeout: 10000 });
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
    });
  });
});
