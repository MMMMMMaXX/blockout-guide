/** 文件职责：在构建期发现并校验所有内容 JSON，同时阻止 ID 和路由冲突。 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { levelArticleSchema } from "./schema.ts";
import { editorialArticleSchema } from "./editorial-schema.ts";
import { assertProductionArticle } from "./publication-policy.ts";
import type { EditorialArticle, LevelArticle } from "./types.ts";

/** 递归收集 levels 目录下的 JSON；其他内容类型由后续 Schema 任务独立接入。 */
async function collectLevelFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectLevelFiles(target)));
    else if (entry.name.endsWith(".json") && target.includes(`${path.sep}levels${path.sep}`))
      files.push(target);
  }
  return files;
}

/** 递归收集非关卡编辑内容，目录名决定允许的 Schema 类型但不替代 kind 校验。 */
async function collectEditorialFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectEditorialFiles(target)));
    else if (
      entry.name.endsWith(".json") &&
      ["obstacles", "boosters", "guides", "updates"].some((segment) =>
        target.includes(`${path.sep}${segment}${path.sep}`),
      )
    )
      files.push(target);
  }
  return files;
}

/** 返回排序稳定的已校验内容；任何损坏或冲突都会直接阻断构建。 */
export async function loadLevelManifest(root = process.cwd()): Promise<LevelArticle[]> {
  const contentDirectory = path.resolve(root, "content");
  const files = await collectLevelFiles(contentDirectory);
  const levels: LevelArticle[] = [];
  const ids = new Map<string, string>();
  const routes = new Map<string, string>();

  for (const file of files.sort()) {
    const source = JSON.parse(await readFile(file, "utf8")) as unknown;
    const level = levelArticleSchema.parse(source);
    assertProductionArticle(level, file);
    const routeKey = `${level.locale}:${level.levelNumber}`;
    if (ids.has(level.id))
      throw new Error(`重复内容 ID ${level.id}: ${ids.get(level.id)} 与 ${file}`);
    if (routes.has(routeKey))
      throw new Error(`重复关卡路由 ${routeKey}: ${routes.get(routeKey)} 与 ${file}`);
    ids.set(level.id, file);
    routes.set(routeKey, file);
    levels.push(level);
  }

  return levels.sort((left, right) => left.levelNumber - right.levelNumber);
}

/** 返回按 kind/slug 排序的 Phase 2 内容；任意跨类型 ID 或路由冲突都会阻断构建。 */
export async function loadEditorialManifest(root = process.cwd()): Promise<EditorialArticle[]> {
  const contentDirectory = path.resolve(root, "content");
  const files = await collectEditorialFiles(contentDirectory);
  const articles: EditorialArticle[] = [];
  const ids = new Map<string, string>();
  const routes = new Map<string, string>();

  for (const file of files.sort()) {
    const source = JSON.parse(await readFile(file, "utf8")) as unknown;
    const article = editorialArticleSchema.parse(source);
    assertProductionArticle(article, file);
    const routeKey = `${article.locale}:${article.kind}:${article.slug}`;
    if (ids.has(article.id))
      throw new Error(`重复内容 ID ${article.id}: ${ids.get(article.id)} 与 ${file}`);
    if (routes.has(routeKey))
      throw new Error(`重复编辑内容路由 ${routeKey}: ${routes.get(routeKey)} 与 ${file}`);
    ids.set(article.id, file);
    routes.set(routeKey, file);
    articles.push(article);
  }

  return articles.sort((left, right) =>
    `${left.kind}:${left.slug}`.localeCompare(`${right.kind}:${right.slug}`),
  );
}
