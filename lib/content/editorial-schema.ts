/** 文件职责：定义 Phase 2 机制、Booster、Guide 与 Update 的运行时发布合同。 */
import { z } from "zod";

const dateSchema = z.iso.date();
const localeSchema = z.enum(["en", "zh-cn"]);
const statusSchema = z.enum(["draft", "published", "archived"]);
const seoSchema = z
  .object({
    title: z.string().min(10).max(70),
    description: z.string().min(40).max(180),
  })
  .strict();
const sectionSchema = z
  .object({
    heading: z.string().min(1),
    body: z.array(z.string().min(1)).min(1),
  })
  .strict();

/** 为所有编辑内容执行共同发布门禁，调用方再追加领域规则。 */
function checkPublishedBase(
  article: { status: string; seo?: unknown; sourceReferences: string[]; verifiedAt?: string },
  context: z.RefinementCtx,
) {
  if (article.status !== "published") return;
  if (!article.seo)
    context.addIssue({ code: "custom", path: ["seo"], message: "发布内容必须提供 SEO 信息" });
  if (article.sourceReferences.length === 0)
    context.addIssue({
      code: "custom",
      path: ["sourceReferences"],
      message: "发布内容必须保留来源",
    });
  if (!article.verifiedAt)
    context.addIssue({
      code: "custom",
      path: ["verifiedAt"],
      message: "发布内容必须记录核验日期",
    });
}

const editorialBase = {
  id: z.string().min(1),
  locale: localeSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  status: statusSchema,
  sourceReferences: z.array(z.url()).default([]),
  seo: seoSchema.optional(),
  verifiedAt: dateSchema.optional(),
  updatedAt: dateSchema,
};

export const obstacleArticleSchema = z
  .strictObject({
    kind: z.literal("obstacle"),
    ...editorialBase,
    category: z.string().min(1),
    priority: z.enum(["low", "medium", "high", "state-dependent"]),
    rules: z.array(z.string().min(1)),
    strategyPoints: z.array(z.string().min(1)),
    avoidPoints: z.array(z.string().min(1)),
    relatedLevelNumbers: z.array(z.number().int().positive()),
    relatedObstacleIds: z.array(z.string().min(1)),
  })
  .superRefine((article, context) => {
    checkPublishedBase(article, context);
    if (article.status === "published" && article.rules.length < 2)
      context.addIssue({ code: "custom", path: ["rules"], message: "发布机制至少需要 2 条规则" });
    if (article.status === "published" && article.strategyPoints.length < 2)
      context.addIssue({
        code: "custom",
        path: ["strategyPoints"],
        message: "发布机制至少需要 2 条策略",
      });
  });

export const boosterArticleSchema = z
  .strictObject({
    kind: z.literal("booster"),
    ...editorialBase,
    effect: z.string().min(1),
    useWhen: z.array(z.string().min(1)),
    avoidWhen: z.array(z.string().min(1)),
    decisionChecks: z.array(z.string().min(1)),
    relatedLevelNumbers: z.array(z.number().int().positive()),
  })
  .superRefine((article, context) => {
    checkPublishedBase(article, context);
    if (article.status === "published" && article.useWhen.length < 2)
      context.addIssue({
        code: "custom",
        path: ["useWhen"],
        message: "发布 Booster 至少需要 2 个使用条件",
      });
    if (article.status === "published" && article.avoidWhen.length < 2)
      context.addIssue({
        code: "custom",
        path: ["avoidWhen"],
        message: "发布 Booster 至少需要 2 个不使用条件",
      });
  });

export const guideArticleSchema = z
  .strictObject({
    kind: z.literal("guide"),
    ...editorialBase,
    question: z.string().min(1),
    sections: z.array(sectionSchema),
    obstacleIds: z.array(z.string().min(1)),
    boosterIds: z.array(z.string().min(1)),
    relatedLevelNumbers: z.array(z.number().int().positive()),
  })
  .superRefine((article, context) => {
    checkPublishedBase(article, context);
    if (article.status === "published" && article.sections.length < 2)
      context.addIssue({
        code: "custom",
        path: ["sections"],
        message: "发布 Guide 至少需要 2 个正文段落",
      });
  });

export const updateArticleSchema = z
  .strictObject({
    kind: z.literal("update"),
    ...editorialBase,
    version: z.string().min(1),
    releasedAt: dateSchema.optional(),
    changes: z.array(z.string().min(1)),
    affectedLevelNumbers: z.array(z.number().int().positive()),
    affectedObstacleIds: z.array(z.string().min(1)),
    impactCheckedAt: dateSchema.optional(),
  })
  .superRefine((article, context) => {
    checkPublishedBase(article, context);
    if (article.status === "published" && !article.releasedAt)
      context.addIssue({
        code: "custom",
        path: ["releasedAt"],
        message: "发布 Update 必须记录版本日期",
      });
    if (article.status === "published" && !article.impactCheckedAt)
      context.addIssue({
        code: "custom",
        path: ["impactCheckedAt"],
        message: "发布 Update 必须记录影响检查日期",
      });
    if (article.status === "published" && article.changes.length < 1)
      context.addIssue({
        code: "custom",
        path: ["changes"],
        message: "发布 Update 至少需要 1 条已核验变化",
      });
  });

export const editorialArticleSchema = z.discriminatedUnion("kind", [
  obstacleArticleSchema,
  boosterArticleSchema,
  guideArticleSchema,
  updateArticleSchema,
]);
