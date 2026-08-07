/** 文件职责：检查公共路径清单、静态 HTML 和生产 Worker 输出的发布边界。 */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { renderWorkerPath } from "./lib/render-worker.ts";
import { getSearchPaths } from "../lib/routing/public-paths.ts";

const paths = JSON.parse(await readFile("dist/.openai/public-paths.json", "utf8")) as string[];

const clientAssets = await readdir("dist/client/assets");
for (const asset of clientAssets.filter((file) => file.endsWith(".js"))) {
  const bytes = (await stat(path.resolve("dist/client/assets", asset))).size;
  if (bytes > 230 * 1024) throw new Error(`客户端分包 ${asset} 超过 230 KiB 预算`);
}

if (!paths.includes("/en/")) throw new Error("公共路径清单缺少英文首页");
const expectedContentPaths = [
  "/en/levels/",
  "/en/hard-levels/",
  "/en/levels/14/",
  "/en/obstacles/",
  "/en/obstacles/ivy/",
  "/en/boosters/",
  "/en/boosters/time-freeze/",
  "/en/guides/",
  "/en/guides/how-to-read-variants/",
  "/en/updates/",
  "/en/updates/version-729/",
];
for (const expectedPath of expectedContentPaths) {
  if (!paths.includes(expectedPath))
    throw new Error(`已发布内容 ${expectedPath} 未进入公共路径清单`);
}
if (paths.some((pathname) => pathname.includes("/levels/218/"))) {
  throw new Error("已移除的 Level 218 不应进入公共路径清单");
}

for (const pathname of paths) {
  const relative = pathname.replace(/^\//, "");
  const html = await readFile(path.resolve("dist/client", relative, "index.html"), "utf8");
  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`${pathname} 缺少标题`);
  if (!/<meta[^>]+name="description"[^>]+content="[^"]+"/i.test(html))
    throw new Error(`${pathname} 缺少说明`);
  if (/name="robots" content="noindex/i.test(html))
    throw new Error(`${pathname} 公共 HTML 被错误 noindex`);

  const response = await renderWorkerPath(pathname);
  if (response.status !== 200) throw new Error(`${pathname} Worker 返回 ${response.status}`);
}

console.log(`生产构建门禁通过（${paths.length} 个公共路径）。`);

// 搜索页为静态壳 + 客户端检索且 robots noindex，单独校验存在性与可渲染；
// 不要求可索引（与上方公共路径门禁区分），确保线上搜索可用。
const searchPaths = getSearchPaths();
for (const pathname of searchPaths) {
  const relative = pathname.replace(/^\//, "");
  const html = await readFile(path.resolve("dist/client", relative, "index.html"), "utf8");
  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`搜索页 ${pathname} 缺少标题`);
  const response = await renderWorkerPath(pathname);
  if (response.status !== 200) throw new Error(`搜索页 ${pathname} Worker 返回 ${response.status}`);
}
console.log(`搜索页预渲染校验通过（${searchPaths.length} 个）。`);
