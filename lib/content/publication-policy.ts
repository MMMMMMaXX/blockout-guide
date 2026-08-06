/** 文件职责：约束真实内容生成即发布，并阻止审核队列或占位债务进入生产内容。 */
import type { EditorialArticle, LevelArticle } from "./types";

const deferredMarkers = [
  "pending-review",
  "needs-review",
  "not-started",
  "in-progress",
  "todo",
  "tbd",
  "replace this",
] as const;

/** template-* 仅表示结构验收样例，不能被内容 Agent 当作真实文章继续编辑。 */
export function isStructureTemplate(article: { id: string; status: string }): boolean {
  return article.id.startsWith("template-") && article.status === "draft";
}

/**
 * 深度检查内容值，避免以自由文本或扩展字段绕过生成即发布规则。
 * 标记仅在整段字符串等于候选值（去空白、忽略大小写）时命中：西班牙语
 * "en todo momento"（a todo = 全部）等合法文本不会被误判为 todo 待处理标记。
 */
function findDeferredMarker(value: unknown, trail = "root"): string | null {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    const marker = deferredMarkers.find((candidate) => normalized === candidate);
    return marker ? `${trail}=${marker}` : null;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      const match = findDeferredMarker(item, `${trail}[${index}]`);
      if (match) return match;
    }
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (normalizedKey.includes("review") || normalizedKey.includes("pending")) {
        return `${trail}.${key}=deferred-field`;
      }
      const match = findDeferredMarker(item, `${trail}.${key}`);
      if (match) return match;
    }
  }
  return null;
}

/** content 只允许 published 真实文章；结构模板必须留在 templates/。 */
export function assertProductionArticle(
  article: LevelArticle | EditorialArticle,
  sourceLabel: string,
): void {
  if (isStructureTemplate(article)) {
    throw new Error(`${sourceLabel}: template-* 只能保存在 templates/，不能进入 content/`);
  }
  if (article.status !== "published") {
    throw new Error(`${sourceLabel}: 真实文章必须生成即 published，不得保留 ${article.status}`);
  }
  const deferred = findDeferredMarker(article);
  if (deferred) throw new Error(`${sourceLabel}: 检测到待处理标记 ${deferred}`);
}
