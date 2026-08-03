/** 文件职责：从 Zod Schema 派生共享类型，避免类型与运行时校验规则分叉。 */
import type { z } from "zod";
import type { levelArticleSchema, levelVariantSchema, solutionStepSchema } from "./schema";
import type {
  boosterArticleSchema,
  editorialArticleSchema,
  guideArticleSchema,
  obstacleArticleSchema,
  updateArticleSchema,
} from "./editorial-schema";

export const locales = ["en", "zh-cn"] as const;
export type Locale = (typeof locales)[number];
export type LevelArticle = z.infer<typeof levelArticleSchema>;
export type LevelVariant = z.infer<typeof levelVariantSchema>;
export type SolutionStep = z.infer<typeof solutionStepSchema>;
export type ContentStatus = LevelArticle["status"];
export type ContentTier = LevelArticle["contentTier"];
export type Difficulty = NonNullable<LevelArticle["difficulty"]>;
export type Platform = LevelVariant["platforms"][number];
export type ObstacleArticle = z.infer<typeof obstacleArticleSchema>;
export type BoosterArticle = z.infer<typeof boosterArticleSchema>;
export type GuideArticle = z.infer<typeof guideArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type EditorialArticle = z.infer<typeof editorialArticleSchema>;
