/** 文件职责：把公共路径渲染为静态 HTML，并拒绝失败或重定向结果。 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderWorkerPath } from "./lib/render-worker.ts";

/** 将尾斜杠公共路径映射到 CDN 可直接服务的 index.html。 */
function getOutputFile(pathname: string): string {
  const relative = pathname.replace(/^\//, "");
  return path.resolve("dist/client", relative, "index.html");
}

const paths = JSON.parse(await readFile("dist/.openai/public-paths.json", "utf8")) as string[];

for (const pathname of paths) {
  const response = await renderWorkerPath(pathname);
  if (response.status !== 200) throw new Error(`预渲染 ${pathname} 返回 ${response.status}`);
  const outputFile = getOutputFile(pathname);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, await response.text());
}

console.log(`静态预渲染完成（${paths.length} 个公共路径）。`);
