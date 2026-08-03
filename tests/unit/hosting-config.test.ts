/** 文件职责：验证本地 Sites 元数据缺失时 Cloudflare 构建仍采用无绑定配置。 */
import { describe, expect, it } from "vitest";
import { loadHostingConfig } from "../../vite.config";

describe("loadHostingConfig", () => {
  it("falls back to empty bindings when the ignored local file is absent", async () => {
    const missingConfig = new URL("./fixtures/missing-hosting.json", import.meta.url);
    await expect(loadHostingConfig(missingConfig)).resolves.toEqual({ d1: null, r2: null });
  });
});
