/** 文件职责：提供已发布障碍机制的聚合入口和安全空状态，按语言本地化元数据。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedObstacles } from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
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
  return {
    title: "Block Out obstacles",
    description: "Learn verified Block Out obstacle rules, priorities and related levels.",
    alternates: buildFullAlternates(`/${current}/obstacles/`),
    robots: "index, follow",
  };
}

/** 聚合页不回退展示研究草稿。 */
export default async function ObstaclesPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const obstacles = getPublishedObstacles(current);
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">MECHANIC LIBRARY</p>
        <h1>Block Out obstacles</h1>
        <p>Verified rules, board priorities, failure modes and the published levels they affect.</p>
      </header>
      <EditorialCollection
        locale={current}
        items={obstacles}
        routeSegment="obstacles"
        emptyTitle="No obstacle article is published yet"
        emptyCopy="Add a complete published obstacle article to make it appear here automatically."
      />
    </div>
  );
}
