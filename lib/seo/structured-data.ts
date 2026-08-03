/** 文件职责：从页面已展示的发布事实构造 WebSite、面包屑、视频与 FAQ 结构化数据。 */
import type { LevelArticle } from "@/lib/content/types";

const baseUrl = "https://blockout.stratlore.com";

/** 首页搜索动作与实际 q 参数保持一致。 */
export function buildWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Block Out! Guides",
    url: `${baseUrl}/en/`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/en/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** 详情结构化数据只复述页面可见的标题、摘要、来源视频和两条 FAQ。 */
export function buildLevelJsonLd(level: LevelArticle): Record<string, unknown>[] {
  const url = `${baseUrl}/${level.locale}/levels/${level.levelNumber}/`;
  const variant = level.variants[0];
  const entities: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/en/` },
        { "@type": "ListItem", position: 2, name: "Levels", item: `${baseUrl}/en/levels/` },
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
    entities.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: level.title,
      description: level.summary,
      uploadDate: variant.verifiedAt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${variant.video.videoId}`,
      contentUrl: variant.video.sourceUrl,
    });
  }
  return entities;
}
