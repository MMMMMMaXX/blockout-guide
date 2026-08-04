/** 文件职责：提供已发布 Booster 决策指南的聚合入口，按语言本地化元数据。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedBoosters } from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成 Booster 聚合页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** Booster 聚合页自指 canonical + 完整 10 语言 hreflang。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.editorial.pages.boosters.title,
    description: t.editorial.pages.boosters.description,
    alternates: buildFullAlternates(`/${current}/boosters/`),
    robots: "index, follow",
  };
}

/** 页面只呈现通过使用/不使用条件门禁的 published 指南；非英文语言回退到英文源内容。 */
export default async function BoostersPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const boosters = getPublishedBoosters(current);
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">{t.editorial.pages.boosters.eyebrow}</p>
        <h1>{t.editorial.pages.boosters.title}</h1>
        <p>{t.editorial.pages.boosters.description}</p>
      </header>
      <EditorialCollection
        locale={current}
        items={boosters}
        routeSegment="boosters"
        emptyTitle={t.editorial.pages.boosters.emptyTitle}
        emptyCopy={t.editorial.pages.boosters.emptyCopy}
      />
    </div>
  );
}
