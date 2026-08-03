/** 文件职责：定义 Level/Variant 的唯一运行时契约和发布失败关闭规则。 */
import { z } from "zod";

const dateSchema = z.iso.date();
const publicAssetSchema = z.string().startsWith("/");

export const solutionStepSchema = z
  .object({
    order: z.number().int().positive(),
    title: z.string().min(1),
    instruction: z.string().min(1),
    image: publicAssetSchema.optional(),
    imageAlt: z.string().min(1).optional(),
  })
  .strict();

export const levelVariantSchema = z
  .object({
    id: z.string().min(1),
    gameVersion: z.string().min(1).optional(),
    platforms: z.array(z.enum(["ios", "android"])),
    boardImage: publicAssetSchema.optional(),
    boardProfile: z
      .object({
        sourceUrl: z.url(),
        layout: z.string().min(40),
        landmarks: z.array(z.string().min(1)).min(3),
        colors: z.array(z.string().min(1)).min(2),
        rightsBasis: z.literal("source-described-site-authored"),
      })
      .strict()
      .optional(),
    boardHash: z.string().min(8).optional(),
    verifiedAt: dateSchema.optional(),
    boosterUsage: z.enum(["none", "optional", "used", "unknown"]),
    verificationStatus: z.enum([
      "video-found",
      "board-matched",
      "source-verified",
      "fully-verified",
    ]),
    video: z
      .object({
        provider: z.literal("youtube"),
        videoId: z.string().min(1),
        publisherLabel: z.string().min(1),
        sourceUrl: z.url(),
        embedAllowed: z.boolean(),
        rightsBasis: z.literal("youtube-embed"),
      })
      .strict()
      .optional(),
    chapters: z
      .array(
        z.object({
          seconds: z.number().int().nonnegative(),
          label: z.string().min(1),
        }),
      )
      .optional(),
    quickTips: z.array(z.string().min(1)).optional(),
    steps: z.array(solutionStepSchema).optional(),
    failurePoints: z.array(z.string().min(1)).optional(),
  })
  .strict();

const levelArticleBaseSchema = z
  .object({
    id: z.string().min(1),
    locale: z.enum(["en", "zh-cn", "pt-br", "ru", "de", "es", "fr", "ja", "ko", "tr"]),
    levelNumber: z.number().int().positive(),
    title: z.string().min(1),
    summary: z.string().min(1),
    status: z.enum(["draft", "published", "archived"]),
    contentTier: z.enum(["video", "enhanced-video", "full-guide"]),
    difficulty: z.enum(["easy", "medium", "hard", "expert", "super-hard"]).optional(),
    obstacleIds: z.array(z.string().min(1)),
    relatedLevelNumbers: z.array(z.number().int().positive()),
    variants: z.array(levelVariantSchema),
    sourceReferences: z.array(z.url()).default([]),
    seo: z
      .object({
        title: z.string().min(10).max(70),
        description: z.string().min(40).max(180),
      })
      .strict()
      .optional(),
    updatedAt: dateSchema,
  })
  .strict();

/** 只有 published 内容执行完整发布门禁；草稿允许逐步补齐但仍需结构合法。 */
export const levelArticleSchema = levelArticleBaseSchema.superRefine((article, context) => {
  if (article.status !== "published") return;

  if (!article.difficulty) {
    context.addIssue({ code: "custom", path: ["difficulty"], message: "发布内容必须标注难度" });
  }
  if (!article.seo) {
    context.addIssue({ code: "custom", path: ["seo"], message: "发布内容必须提供独立 SEO 信息" });
  }
  if (article.sourceReferences.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["sourceReferences"],
      message: "发布内容必须保留来源",
    });
  }
  if (article.variants.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["variants"],
      message: "发布内容至少包含一个 Variant",
    });
  }

  article.variants.forEach((variant, index) => {
    const path = ["variants", index];
    if (!variant.gameVersion)
      context.addIssue({
        code: "custom",
        path: [...path, "gameVersion"],
        message: "发布 Variant 必须记录游戏版本",
      });
    if (variant.platforms.length === 0)
      context.addIssue({
        code: "custom",
        path: [...path, "platforms"],
        message: "发布 Variant 必须记录平台",
      });
    if (!variant.boardImage && !variant.boardProfile)
      context.addIssue({
        code: "custom",
        path: [...path, "boardProfile"],
        message: "发布 Variant 必须有棋盘图或有来源的棋盘识别档案",
      });
    if (!variant.verifiedAt)
      context.addIssue({
        code: "custom",
        path: [...path, "verifiedAt"],
        message: "发布 Variant 必须记录核验日期",
      });
    if (!variant.video?.embedAllowed)
      context.addIssue({
        code: "custom",
        path: [...path, "video"],
        message: "发布 Variant 必须有可嵌入视频",
      });
    if (!["source-verified", "fully-verified"].includes(variant.verificationStatus)) {
      context.addIssue({
        code: "custom",
        path: [...path, "verificationStatus"],
        message: "发布 Variant 至少需要来源核验",
      });
    }
    if (article.contentTier === "enhanced-video") {
      if ((variant.chapters?.length ?? 0) < 3)
        context.addIssue({
          code: "custom",
          path: [...path, "chapters"],
          message: "增强攻略至少需要 3 个视频时间点",
        });
    }
    if (article.contentTier !== "video" && (variant.quickTips?.length ?? 0) < 3)
      context.addIssue({
        code: "custom",
        path: [...path, "quickTips"],
        message: "增强或完整攻略至少需要 3 条快速提示",
      });
    if (article.contentTier === "full-guide") {
      if ((variant.steps?.length ?? 0) < 3)
        context.addIssue({
          code: "custom",
          path: [...path, "steps"],
          message: "完整攻略至少需要 3 个步骤",
        });
      if ((variant.failurePoints?.length ?? 0) < 1)
        context.addIssue({
          code: "custom",
          path: [...path, "failurePoints"],
          message: "完整攻略至少需要 1 个失败点",
        });
    }
  });
});
