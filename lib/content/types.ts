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

// 统一语言契约来自 lib/i18n/locales（与 StratLore 三仓库一致），内容层只复用，不重复定义。
import type { Locale as I18nLocale } from "../i18n/locales";
import { supportedLocales } from "../i18n/locales";

export const locales = supportedLocales;
export type Locale = I18nLocale;
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
export type EditorialKind = EditorialArticle["kind"];

/** 关卡元数据：聚合页/搜索/Sitemap 所需的最小字段集合，由 content-vite-plugin 在构建期从 LevelArticle 抽取。 */
export type LevelMeta = {
  id: string;
  levelNumber: number;
  locale: Locale;
  sourceLocale: Locale;
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty | null;
  contentTier: ContentTier;
  boardImage: string | null;
  videoId: string | null;
  obstacleIds: readonly string[];
  updatedAt: string;
  status: ContentStatus;
};

/** 编辑内容元数据：聚合页/搜索/Sitemap 所需的最小字段集合，详情正文走 import.meta.glob 按需加载。 */
export type EditorialMetaBase = {
  id: string;
  locale: Locale;
  sourceLocale: Locale;
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  status: ContentStatus;
};

export type EditorialMeta =
  | (EditorialMetaBase & {
      kind: "obstacle";
      category: string;
      priority: string;
      rules: readonly string[];
    })
  | (EditorialMetaBase & {
      kind: "booster";
      effect: string;
      useWhen: readonly string[];
      avoidWhen: readonly string[];
    })
  | (EditorialMetaBase & {
      kind: "guide";
      question: string;
      obstacleIds: readonly string[];
      boosterIds: readonly string[];
    })
  | (EditorialMetaBase & {
      kind: "update";
      version: string;
      changes: readonly string[];
    });
