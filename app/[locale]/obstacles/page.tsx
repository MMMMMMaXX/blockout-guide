/** 文件职责：提供已发布障碍机制的聚合入口和安全空状态，按语言本地化元数据。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedObstacles } from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成障碍聚合页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** 障碍聚合页自指 canonical + 完整 10 语言 hreflang。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.editorial.pages.obstacles.title,
    description: t.editorial.pages.obstacles.description,
    alternates: buildFullAlternates(`/${current}/obstacles/`),
    robots: "index, follow",
  };
}

/** 聚合页不回退展示研究草稿；非英文语言回退到英文源内容。 */
export default async function ObstaclesPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const obstacles = getPublishedObstacles(current);
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">{t.editorial.pages.obstacles.eyebrow}</p>
        <h1>{t.editorial.pages.obstacles.title}</h1>
        <p>{t.editorial.pages.obstacles.description}</p>
      </header>
      <EditorialCollection
        locale={current}
        items={obstacles}
        routeSegment="obstacles"
        emptyTitle={t.editorial.pages.obstacles.emptyTitle}
        emptyCopy={t.editorial.pages.obstacles.emptyCopy}
      />
    </div>
  );
}
