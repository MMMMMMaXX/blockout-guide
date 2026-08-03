/** 文件职责：配置内容、Repository 和公共路径的 Vitest 单元测试环境。 */
import path from "node:path";
import { defineConfig } from "vitest/config";
import { blockoutContent } from "./build/content-vite-plugin";

export default defineConfig({
  plugins: [blockoutContent()],
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: { environment: "node", include: ["tests/unit/**/*.test.{ts,tsx}"] },
});
