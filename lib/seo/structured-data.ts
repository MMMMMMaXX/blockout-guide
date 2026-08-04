/** 文件职责：从页面已展示的发布事实构造 WebSite、面包屑、视频与 FAQ 结构化数据。 */
import type { LevelArticle, Locale } from "@/lib/content/types";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { localeMeta } from "@/lib/i18n/locale-meta";

const baseUrl = "https://blockout.stratlore.com";

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

/** 详情结构化数据只复述页面可见的标题、摘要、来源视频和两条 FAQ。 */
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
          name: `Why might my Level ${level.levelNumber} board look different?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: "Game version, platform or staged rollout differences can change a board layout.",
          },
        },
        {
          "@type": "Question",
          name: "Should I use a booster?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `This variant records booster use as ${variant.boosterUsage}. Match the board before applying that note.`,
          },
        },
      ],
    },
  ];
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
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      uploadDate,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      contentUrl: variant.video.sourceUrl,
      inLanguage: localeMeta[locale]?.hreflang ?? locale,
    });
  }
  return entities;
}
