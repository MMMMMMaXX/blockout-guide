/** 文件职责：聚合解决跨关卡问题的已发布策略文章，按语言本地化元数据。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedGuides } from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成 Guides 聚合页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** Guide 聚合页自指 canonical + 完整 10 语言 hreflang。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.editorial.pages.guides.title,
    description: t.editorial.pages.guides.description,
    alternates: buildFullAlternates(`/${current}/guides/`),
    robots: "index, follow",
  };
}

/** Guide 聚合只展示有独立问题和完整正文的 published 内容；非英文语言回退到英文源内容。 */
export default async function GuidesPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const guides = getPublishedGuides(current);
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">{t.editorial.pages.guides.eyebrow}</p>
        <h1>{t.editorial.pages.guides.title}</h1>
        <p>{t.editorial.pages.guides.description}</p>
      </header>
      <EditorialCollection
        locale={current}
        items={guides}
        routeSegment="guides"
        emptyTitle={t.editorial.pages.guides.emptyTitle}
        emptyCopy={t.editorial.pages.guides.emptyCopy}
      />
    </div>
  );
}
