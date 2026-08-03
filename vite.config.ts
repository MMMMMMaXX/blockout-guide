/** 文件职责：组合 vinext、Sites 和 Cloudflare Worker 的开发与构建插件。 */
import { readFile } from "node:fs/promises";
import vinext from "vinext";
import { defineConfig } from "vite";
import { blockoutContent } from "./build/content-vite-plugin";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID = "00000000-0000-4000-8000-000000000000";

interface HostingConfig {
  d1: string | null;
  r2: string | null;
}

/** 本地 Sites 元数据不进入 Git；Cloudflare 构建缺少该文件时使用无绑定配置。 */
export async function loadHostingConfig(
  configUrl = new URL("./.openai/hosting.json", import.meta.url),
): Promise<HostingConfig> {
  try {
    return JSON.parse(await readFile(configUrl, "utf8")) as HostingConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { d1: null, r2: null };
    throw error;
  }
}

// Codex 沙箱不能使用 FSEvents；仅在该环境回退轮询，避免影响普通开发性能。
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

/** 根据可选 Sites 元数据生成 Cloudflare 本地绑定，缺省时不声明持久化资源。 */
function createLocalBindingConfig({ d1, r2 }: HostingConfig) {
  return {
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
    // 本地 dev 需要把 public 目录绑定到 ASSETS，否则 worker 中 env.ASSETS 为 undefined。
    assets: {
      directory: "./public",
      binding: "ASSETS",
      html_handling: "force-trailing-slash" as const,
      not_found_handling: "none" as const,
    },
    d1_databases: d1
      ? [
          {
            binding: d1,
            database_name: "site-creator-d1",
            database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
          },
        ]
      : [],
    r2_buckets: r2
      ? [
          {
            binding: r2,
            bucket_name: "site-creator-r2",
          },
        ]
      : [],
  };
}

export default defineConfig(async () => {
  const localBindingConfig = createLocalBindingConfig(await loadHostingConfig());
  // Wrangler/Miniflare 状态固定在项目目录；应用环境变量仍只进入忽略的 `.env*`。
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Cloudflare 插件导入时会快照日志路径，因此必须在动态导入前完成设置。
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      blockoutContent(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
