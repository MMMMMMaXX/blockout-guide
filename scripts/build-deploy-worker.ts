/** 文件职责：构建末尾把生产 Worker 替换为极简静态资源 Worker，确保 wrangler deploy 不携带完整 SSR 运行时（迁移方案阶段 2）。 */
import { readFile, writeFile, readdir, rm } from "node:fs/promises";
import path from "node:path";

const serverDir = path.resolve("dist/server");
const minimalSrc = path.resolve("worker/deploy-minimal.js");
const outJs = path.resolve(serverDir, "index.js");
// wrangler.json 由 vinext build 生成且部署必须保留；其余 SSR 产物在部署前清理。
const keep = new Set(["wrangler.json"]);

const files = await readdir(serverDir);
for (const file of files) {
  if (!keep.has(file)) {
    await rm(path.resolve(serverDir, file), { recursive: true, force: true });
  }
}

const code = await readFile(minimalSrc, "utf8");
await writeFile(outJs, code, "utf8");
console.log(
  `已写入极简生产 Worker dist/server/index.js（${code.length} 字节），移除完整 SSR 运行时。`,
);
