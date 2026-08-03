/** 文件职责：配置生产构建的关键导航和移动端交互 E2E。 */
import { defineConfig, devices } from "@playwright/test";

const channel = process.env.CI ? undefined : "chrome";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], browserName: "chromium", channel },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["iPhone 13"], browserName: "chromium", channel },
    },
  ],
  webServer: {
    // 直接托管 Node 进程，确保 Playwright 结束时同步释放端口，避免 npm 子进程残留。
    command: "node tests/e2e/server.mjs",
    url: "http://127.0.0.1:4173/en/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
