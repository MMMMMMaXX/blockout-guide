/** 文件职责：校验 Level 与 Phase 2 作者模板始终为安全草稿且符合当前 Schema。 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { levelArticleSchema } from "../lib/content/schema.ts";
import { editorialArticleSchema } from "../lib/content/editorial-schema.ts";

const templateDirectory = path.resolve("templates/content");
const files = (await readdir(templateDirectory)).filter((file) => file.endsWith(".json"));
const editorialTemplateDirectory = path.resolve("templates/editorial");
const editorialFiles = (await readdir(editorialTemplateDirectory)).filter((file) =>
  file.endsWith(".json"),
);

if (files.length !== 3) throw new Error(`必须保留 3 个 Level Tier 模板，当前为 ${files.length}`);

for (const file of files) {
  const template = levelArticleSchema.parse(
    JSON.parse(await readFile(path.join(templateDirectory, file), "utf8")) as unknown,
  );
  if (template.status !== "draft" || !template.id.startsWith("template-")) {
    throw new Error(`${file} 必须保持 template-* ID 和 draft 状态`);
  }
  if (template.sourceReferences.length > 0 || template.variants.some((variant) => variant.video)) {
    throw new Error(`${file} 不得内置可误认成真实来源的视频`);
  }
}

if (editorialFiles.length !== 4)
  throw new Error(`必须保留 4 个 Phase 2 模板，当前为 ${editorialFiles.length}`);

for (const file of editorialFiles) {
  const template = editorialArticleSchema.parse(
    JSON.parse(await readFile(path.join(editorialTemplateDirectory, file), "utf8")) as unknown,
  );
  if (template.status !== "draft" || !template.id.startsWith("template-")) {
    throw new Error(`${file} 必须保持 template-* ID 和 draft 状态`);
  }
  if (template.sourceReferences.length > 0) {
    throw new Error(`${file} 不得内置可误认成真实证据的来源`);
  }
}

console.log(
  `内容模板校验通过（${files.length} 个 Level Tier + ${editorialFiles.length} 个 Phase 2 类型）。`,
);
