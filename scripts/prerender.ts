/** 文件职责：把公共路径渲染为静态 HTML，并拒绝失败或重定向结果。 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderWorkerPath } from "./lib/render-worker.ts";
import { supportedLocales, defaultLocale } from "../lib/i18n/locales.ts";
import { localeMeta } from "../lib/i18n/locale-meta.ts";

/** 将尾斜杠公共路径映射到 CDN 可直接服务的 index.html。 */
function getOutputFile(pathname: string): string {
  const relative = pathname.replace(/^\//, "");
  return path.resolve("dist/client", relative, "index.html");
}

/** 预渲染 HTML 由根布局统一种植 lang="en"，此处按路径前缀改写为真实语言，保证静态 SEO 正确。 */
function injectHtmlLang(html: string, pathname: string): string {
  const prefix = pathname.split("/")[1] ?? defaultLocale;
  const locale = supportedLocales.includes(prefix as never) ? (prefix as keyof typeof localeMeta) : defaultLocale;
  const htmlLang = localeMeta[locale]?.htmlLang ?? "en";
  return html.replace(/<html\s+lang="en"/, `<html lang="${htmlLang}"`);
}

const paths = JSON.parse(await readFile("dist/.openai/public-paths.json", "utf8")) as string[];

for (const pathname of paths) {
  const response = await renderWorkerPath(pathname);
  if (response.status !== 200) throw new Error(`预渲染 ${pathname} 返回 ${response.status}`);
  const outputFile = getOutputFile(pathname);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, injectHtmlLang(await response.text(), pathname));
}

console.log(`静态预渲染完成（${paths.length} 个公共路径）。`);
