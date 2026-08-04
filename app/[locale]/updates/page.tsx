/** 文件职责：聚合已核验版本变化和内容复核状态，按语言本地化元数据。 */
import type { Metadata } from "next";
import { EditorialCollection } from "@/components/editorial-collection";
import { getPublishedUpdates } from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成 Updates 聚合页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** Updates 聚合页自指 canonical + 完整 10 语言 hreflang。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.editorial.pages.updates.title,
    description: t.editorial.pages.updates.description,
    alternates: buildFullAlternates(`/${current}/updates/`),
    robots: "index, follow",
  };
}

/** Updates 页面强调对攻略库的影响，而不是复制普通新闻流；非英文语言回退到英文源内容。 */
export default async function UpdatesPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const updates = getPublishedUpdates(current);
  return (
    <div className="shell page">
      <header className="page-heading">
        <p className="eyebrow">{t.editorial.pages.updates.eyebrow}</p>
        <h1>{t.editorial.pages.updates.title}</h1>
        <p>{t.editorial.pages.updates.description}</p>
      </header>
      <EditorialCollection
        locale={current}
        items={updates}
        routeSegment="updates"
        emptyTitle={t.editorial.pages.updates.emptyTitle}
        emptyCopy={t.editorial.pages.updates.emptyCopy}
      />
    </div>
  );
}
