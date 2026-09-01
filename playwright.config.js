// One command runs every check: `npm test`.
//
// The site is plain files with no build step, so the tests are run against a
// plain static file server. Each card gets its own spec file in tests/.

import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  // Starts the same static server the app is developed against, and reuses one
  // that is already running.
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
  },
});
