/**
 * 文件职责：把 content/<locale>/levels/*.json 中的 colors 数组从本地化显示名
 * 规范化为英文颜色 key（如 "红色" → "red"），因为 colors 是机器标识，
 * UI 显示名由 messages 的 color 命名空间负责本地化。
 *
 * 用法：node scripts/normalize-level-colors.mjs
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CONTENT_DIR = new URL("../content", import.meta.url);
const MESSAGES_DIR = new URL("../messages", import.meta.url);
const LOCALES = ["zh-cn", "pt-br", "ru", "de", "es", "fr", "ja", "ko", "tr"];

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function saveJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + "\n");
}

/** 基于 10 语言 messages 构建反向映射：本地化颜色名 → 英文 key。 */
async function buildLocalizedToKey() {
  const map = new Map();
  const en = await loadJson(join(MESSAGES_DIR.pathname, "en.json"));
  for (const key of Object.keys(en.color)) {
    map.set(key.toLowerCase().trim(), key);
  }
  for (const locale of LOCALES) {
    const catalog = await loadJson(join(MESSAGES_DIR.pathname, `${locale}.json`));
    for (const [key, value] of Object.entries(catalog.color)) {
      if (typeof value === "string") {
        map.set(value.toLowerCase().trim(), key);
      }
    }
  }
  return map;
}

async function normalizeLevelFile(path, localizedToKey) {
  const data = await loadJson(path);
  let changed = false;
  for (const variant of data.variants ?? []) {
    const colors = variant.boardProfile?.colors;
    if (!Array.isArray(colors)) continue;
    const normalized = colors.map((color) => {
      const raw = String(color);
      const lower = raw.toLowerCase().trim();
      const key = localizedToKey.get(lower);
      if (key) return key;
      // 已英文 key 且大小写不一致时规范化为小写
      if (/^[a-z]+$/i.test(lower)) return lower;
      return raw;
    });
    if (JSON.stringify(normalized) !== JSON.stringify(colors)) {
      variant.boardProfile.colors = normalized;
      changed = true;
    }
  }
  if (changed) {
    await saveJson(path, data);
  }
  return changed;
}

async function main() {
  const localizedToKey = await buildLocalizedToKey();
  let changedFiles = 0;
  let unchangedFiles = 0;
  for (const locale of LOCALES) {
    const dir = join(CONTENT_DIR.pathname, locale, "levels");
    const files = await readdir(dir);
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      const changed = await normalizeLevelFile(join(dir, file), localizedToKey);
      if (changed) changedFiles++;
      else unchangedFiles++;
    }
  }
  console.log(`Normalized colors in ${changedFiles} files; ${unchangedFiles} unchanged.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
