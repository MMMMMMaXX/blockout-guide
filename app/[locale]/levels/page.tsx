/** 文件职责：提供可检索、筛选和分页的已发布关卡聚合入口，并按语言本地化。 */
import type { Metadata } from "next";
import { LevelsExplorer } from "@/components/levels-explorer";
import { getPublishedLevels } from "@/lib/content/level-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成关卡聚合页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** 关卡聚合页自指 canonical + 完整 10 语言 hreflang；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  return {
    title: t.levels.title,
    description: t.levels.subtitle,
    alternates: buildFullAlternates(`/${current}/levels/`),
    robots: "index, follow",
  };
}

/** 聚合页始终消费 published 查询，禁止把草稿当作空状态回退内容。 */
export default async function LevelsPage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const published = getPublishedLevels(current);
  return (
    <div className="shell page page--library">
      <header className="page-heading page-heading--compact">
        <p className="eyebrow">{t.levels.eyebrow}</p>
        <h1>{t.levels.title}</h1>
        <p>{t.levels.subtitle}</p>
      </header>
      <LevelsExplorer levels={published} />
    </div>
  );
}
