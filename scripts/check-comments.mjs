/** 文件职责：检查核心人工维护源码是否包含中文文件级职责注释。 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const roots = ["app", "build", "components", "lib", "scripts", "tests", "worker"];
const rootFiles = [
  "eslint.config.mjs",
  "next.config.ts",
  "postcss.config.mjs",
  "playwright.config.ts",
  "prettier.config.mjs",
  "vite.config.ts",
  "vitest.config.ts",
];
const sourcePattern = /\.(?:[cm]?[jt]sx?|css)$/;
const chinesePattern = /[\u3400-\u9fff]/;

/** 递归发现核心人工维护源码；生成目录和严格 JSON 不进入检查范围。 */
async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name === "node_modules") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(target)));
    else if (sourcePattern.test(entry.name)) files.push(target);
  }
  return files;
}

const files = [...(await Promise.all(roots.map(collectFiles))).flat(), ...rootFiles];
const failures = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  const firstLine = source.split("\n", 1)[0] ?? "";
  if (!chinesePattern.test(firstLine) || !/职责/.test(firstLine)) failures.push(file);
}

if (failures.length > 0) {
  console.error(`以下文件缺少首行中文职责注释：\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`中文职责注释检查通过（${files.length} 个文件）。`);
}
