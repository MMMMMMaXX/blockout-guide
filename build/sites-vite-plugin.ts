/** 文件职责：在构建结束后把 Sites 托管配置打包进部署产物。 */
import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { loadEditorialManifest, loadLevelManifest } from "../lib/content/discovery.server";
import { getPublicPaths } from "../lib/routing/public-paths";

/** 判断可选托管文件是否存在，同时保留非 ENOENT 异常。 */
async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/** 将托管元信息复制到 dist，存储未启用时不制造迁移目录。 */
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }
      const [levels, editorial] = await Promise.all([
        loadLevelManifest(root),
        loadEditorialManifest(root),
      ]);
      await writeFile(
        resolve(outputDirectory, "public-paths.json"),
        JSON.stringify(getPublicPaths(levels, editorial), null, 2),
      );
    },
  };
}
