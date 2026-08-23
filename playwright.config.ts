// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

export default defineConfig({
	testDir: './tests-e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: {
		command: 'pnpm dev --port 5173',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		stdout: 'ignore',
		stderr: 'pipe'
	}
});
