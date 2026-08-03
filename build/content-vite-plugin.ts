/** 文件职责：把构建期校验后的内容清单注入应用，避免 Worker 运行时读取文件系统。 */
import type { Plugin } from "vite";
import { loadEditorialManifest, loadLevelManifest } from "../lib/content/discovery.server";

const virtualId = "virtual:blockout-content";
const resolvedVirtualId = `\0${virtualId}`;

/** 开发和生产共享同一发现逻辑；内容变化时 Vite 会重建虚拟模块。 */
export function blockoutContent(): Plugin {
  let root = process.cwd();
  return {
    name: "blockout-content",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === virtualId ? resolvedVirtualId : null;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return null;
      const [levels, editorial] = await Promise.all([
        loadLevelManifest(root),
        loadEditorialManifest(root),
      ]);
      return `export const editorial = ${JSON.stringify(editorial)}; export default ${JSON.stringify(levels)};`;
    },
  };
}
