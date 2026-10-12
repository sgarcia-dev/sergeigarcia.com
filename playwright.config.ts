import { defineConfig, devices } from "@playwright/test";

// Port is 4329 by default; override with E2E_PORT if it is taken.
const port = process.env.E2E_PORT ?? "4329";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL },
  webServer: {
    command: `npx astro build && npx astro preview --ignore-lock --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 180_000,
  },
  projects: [
    { name: "chromium-light", use: { ...devices["Desktop Chrome"], colorScheme: "light" } },
    { name: "chromium-dark", use: { ...devices["Desktop Chrome"], colorScheme: "dark" } },
  ],
});
