/** 文件职责：构建期把 robots.txt 与 sitemap.xml 生成为静态文件写入 dist/client，使生产 Worker 不再运行时生成 SEO 文件（迁移方案阶段 1）。 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = "https://blockout.stratlore.com";

async function main(): Promise<void> {
  const paths = JSON.parse(await readFile("dist/.openai/public-paths.json", "utf8")) as string[];

  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /search/",
    "Disallow: /board-matcher/",
    "Disallow: /__design-system/",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");
  await writeFile(path.resolve("dist/client/robots.txt"), robots, "utf8");

  const urls = paths.map((p) => `  <url><loc>${baseUrl}${p}</loc></url>`).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.resolve("dist/client/sitemap.xml"), sitemap, "utf8");

  console.log(
    `静态 SEO 已生成：robots.txt、sitemap.xml（${paths.length} 条 URL 与公共路径一致）。`,
  );
}

main();
