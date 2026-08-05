/**
 * 文件职责：10 语言国际化一致性门禁。
 * 防止「UI 改动只改了英文、漏掉其他 9 种语言」这类回归。
 * 校验两类事实源：
 *   1. messages/*.json 的 leaf 键集合在 10 种语言间完全一致（en 为规范超集）。
 *   2. 编辑型内容（obstacles/boosters/guides/updates）每种 slug 在 10 种语言均有文件。
 * 任一语言缺键或内容缺语言版本即报错退出（非零码），可接入 `npm run quality` / CI。
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = ["en", "zh-cn", "pt-br", "ru", "de", "es", "fr", "ja", "ko", "tr"];

function loadJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

/** 展平为 "a.b.c" leaf 键集合 */
function leafKeys(obj, prefix = "") {
  const out = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v))
      for (const k of leafKeys(v, key)) out.add(k);
    else out.add(key);
  }
  return out;
}

let problems = 0;
const fail = (msg) => {
  problems++;
  console.error("  ✗ " + msg);
};

// ---- 1. 消息目录 leaf-key parity ----
console.log("检查 messages/*.json 的 10 语言 leaf 键一致性…");
const msgDir = join(ROOT, "messages");
const present = LOCALES.filter((l) => existsSync(join(msgDir, `${l}.json`)));
const missingLocales = LOCALES.filter((l) => !present.includes(l));
if (missingLocales.length) {
  fail(`缺失语言消息文件: ${missingLocales.join(", ")}`);
}
const keySets = {};
for (const l of present) {
  keySets[l] = leafKeys(loadJson(join(msgDir, `${l}.json`)));
}
// en 为规范超集
const enKeys = keySets["en"] ?? new Set();
for (const l of present) {
  if (l === "en") continue;
  const missing = [...enKeys].filter((k) => !keySets[l].has(k));
  const extra = [...keySets[l]].filter((k) => !enKeys.has(k));
  if (missing.length)
    fail(
      `${l}.json 缺少 ${missing.length} 个键（如 ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? "…" : ""}）`,
    );
  if (extra.length)
    fail(`${l}.json 多出 ${extra.length} 个 en 没有的键（如 ${extra.slice(0, 5).join(", ")}）`);
}
if (problems === 0) console.log("  ✓ 消息键在 10 语言中完全一致");

// ---- 2. 编辑内容 10 语言覆盖 ----
console.log("检查编辑内容 10 语言覆盖…");
const contentDir = join(ROOT, "content");
const kinds = ["obstacles", "boosters", "guides", "updates"];
for (const kind of kinds) {
  const base = join(contentDir, "en", kind);
  if (!existsSync(base)) continue;
  const slugs = readdirSync(base).filter((f) => f.endsWith(".json"));
  for (const f of slugs) {
    for (const l of LOCALES) {
      if (!existsSync(join(contentDir, l, kind, f))) {
        fail(`编辑内容缺失语言版本: content/${l}/${kind}/${f}`);
      }
    }
  }
}
if (problems === 0) console.log("  ✓ 编辑内容在 10 语言中完整覆盖");

if (problems > 0) {
  console.error(`\n校验失败：${problems} 项不一致。所有 UI 文案与编辑内容改动必须同步 10 种语言。`);
  process.exit(1);
}
console.log("\n✅ 10 语言一致性校验通过");
