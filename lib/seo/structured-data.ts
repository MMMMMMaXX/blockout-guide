/** 文件职责：从页面已展示的发布事实构造 WebSite、面包屑、视频、HowTo 与 FAQ 结构化数据。 */
import type { LevelArticle, Locale, SolutionStep } from "@/lib/content/types";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { localeMeta } from "@/lib/i18n/locale-meta";

const baseUrl = "https://blockout.stratlore.com";

/** 优先使用高分辨率 YouTube 缩略图；maxresdefault 偶尔缺失，但 schema 允许提供多个候选。 */
function buildYoutubeThumbnails(videoId: string): string[] {
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
}

/** 首页搜索动作与实际 q 参数保持一致，并按语言指向对应搜索路由。 */
export function buildWebsiteJsonLd(locale: Locale): Record<string, unknown> {
  const t = getMessages(locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t.brand.name,
    url: `${baseUrl}/${locale}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/${locale}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** 把 boosterUsage 原始值映射为当前语言的友好文案。 */
function getBoosterUsageLabel(boosterUsage: string, locale: Locale): string {
  const t = getMessages(locale);
  return (
    (t.boosterStatus[boosterUsage as keyof typeof t.boosterStatus] as string | undefined) ??
    boosterUsage
  );
}

/** 详情结构化数据只复述页面可见的标题、摘要、来源视频、HowTo 步骤和本地化 FAQ。 */
export function buildLevelJsonLd(level: LevelArticle, locale: Locale): Record<string, unknown>[] {
  const t = getMessages(locale);
  const url = `${baseUrl}/${locale}/levels/${level.levelNumber}/`;
  const variant = level.variants[0];
  const localized = (level as LevelArticle & { sourceLocale?: Locale }).sourceLocale === locale;
  const videoName = localized
    ? level.title
    : interpolate(t.levelDetail.seoTitle, { level: level.levelNumber });
  const videoDescription = localized
    ? level.summary
    : interpolate(t.levelDetail.seoDescription, { level: level.levelNumber });
  const usageLabel = getBoosterUsageLabel(variant.boosterUsage, locale);
  const entities: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.nav.home, item: `${baseUrl}/${locale}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: t.nav.levels,
          item: `${baseUrl}/${locale}/levels/`,
        },
        { "@type": "ListItem", position: 3, name: `Level ${level.levelNumber}`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: interpolate(t.levelDetail.faqBoardDiffersQuestion, { level: level.levelNumber }),
          acceptedAnswer: {
            "@type": "Answer",
            text: t.levelDetail.faqBoardDiffersAnswer,
          },
        },
        {
          "@type": "Question",
          name: t.levelDetail.faqBoosterQuestion,
          acceptedAnswer: {
            "@type": "Answer",
            text: interpolate(t.levelDetail.faqBoosterAnswer, { usage: usageLabel }),
          },
        },
      ],
    },
  ];

  if (level.contentTier === "full-guide" && variant.steps && variant.steps.length > 0) {
    const howToSteps = variant.steps.map((step: SolutionStep, index: number) => ({
      "@type": "HowToStep",
      position: step.order ?? index + 1,
      name: step.title,
      text: step.instruction,
      url: `${url}#step-${step.order ?? index + 1}`,
      ...(step.image
        ? { image: { "@type": "ImageObject", url: `${baseUrl}${step.image}` } }
        : {}),
    }));
    entities.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: interpolate(t.levelDetail.seoTitle, { level: level.levelNumber }),
      description: videoDescription,
      totalTime: "PT0M",
      step: howToSteps,
    });
  }

  if (variant.video?.embedAllowed) {
    const videoId = variant.video.videoId;
    // Google 要求 VideoObject 的 uploadDate 必须是带时区的 ISO 8601 日期时间，
    // 且必须提供 thumbnailUrl。verifiedAt 在内容层是 ISO 日期（YYYY-MM-DD），
    // 这里统一补零时刻 UTC。
    const uploadDate = variant.verifiedAt
      ? `${variant.verifiedAt}T00:00:00+00:00`
      : `${level.updatedAt}T00:00:00+00:00`;
    entities.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: videoName,
      description: videoDescription,
      thumbnailUrl: buildYoutubeThumbnails(videoId),
      uploadDate,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      contentUrl: variant.video.sourceUrl,
      inLanguage: localeMeta[locale]?.hreflang ?? locale,
    });
  }
  return entities;
}
