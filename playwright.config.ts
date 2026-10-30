import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  workers: 1,
  use: {
    baseURL: "http://localhost:3117",
    viewport: { width: 1440, height: 1000 },
    launchOptions: process.env.PLAYWRIGHT_USE_BUNDLED
      ? {}
      : {
          executablePath:
            process.env.PLAYWRIGHT_CHROME_PATH ||
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node scripts/start-test-api.mjs",
      url: "http://127.0.0.1:4117/api/v1/workspace/summary",
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: "npm run start -w @oneops/web -- --port 3117",
      env: { API_ORIGIN: "http://127.0.0.1:4117" },
      url: "http://localhost:3117",
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
