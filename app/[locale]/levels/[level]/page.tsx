/** 文件职责：实现关卡详情模板，按语言展示本地化内容，并控制索引资格。 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LevelDetailView } from "@/components/level-detail-view";
import { FloatingLevelBar } from "@/components/floating-level-bar";
import type { LevelSearchItem } from "@/components/level-search-overlay";
import { LocaleLink } from "@/components/locale-link";
import { getPublishedLevelByNumber, getPublishedLevels } from "@/lib/content/level-repository";
import { supportedLocales, type Locale } from "@/lib/i18n/locales";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";
import { buildLevelJsonLd } from "@/lib/seo/structured-data";

type PageProps = { params: Promise<{ locale: string; level: string }> };

/** 为所有受支持语言与其已发布关卡生成静态参数。 */
export function generateStaticParams() {
  const levels = getPublishedLevels("en");
  return supportedLocales.flatMap((locale) =>
    levels.map((level) => ({ locale, level: String(level.levelNumber) })),
  );
}

/** 关卡页自指 canonical + 完整 10 语言 hreflang + x-default；标题按语言本地化。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, level: rawLevel } = await params;
  const locale = rawLocale as Locale;
  const levelNumber = Number(rawLevel);
  const level = getPublishedLevelByNumber(locale, levelNumber);
  if (!level) return {};
  const t = getMessages(locale);
  const localized = level.sourceLocale === locale;
  const title = localized
    ? level.title
    : interpolate(t.levelDetail.seoTitle, { level: levelNumber });
  const description = localized
    ? level.summary
    : interpolate(t.levelDetail.seoDescription, { level: levelNumber });
  return {
    title,
    description,
    alternates: buildFullAlternates(`/${locale}/levels/${levelNumber}/`),
    robots: "index, follow",
  };
}

/** 页面消费 Repository 结果，不直接耦合 content 文件路径。 */
export default async function LevelDetailPage({ params }: PageProps) {
  const { locale: rawLocale, level: rawLevel } = await params;
  const locale = rawLocale as Locale;
  const levelNumber = Number(rawLevel);
  const level = getPublishedLevelByNumber(locale, levelNumber);
  if (!level) notFound();

  const publishedLevels = [...getPublishedLevels(locale)].sort(
    (first, second) => first.levelNumber - second.levelNumber,
  );
  const previousLevel =
    [...publishedLevels].reverse().find((item) => item.levelNumber < levelNumber) ?? null;
  const nextLevel = publishedLevels.find((item) => item.levelNumber > levelNumber) ?? null;

  const searchLevels: LevelSearchItem[] = publishedLevels.map((item) => ({
    levelNumber: item.levelNumber,
    title: item.title,
    difficulty: item.difficulty ?? null,
    boardImage: item.variants[0]?.boardImage ?? null,
  }));

  return (
    <div className="shell page detail-page">
      <JsonLd data={buildLevelJsonLd(level, locale)} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <LocaleLink to="/">{getMessages(locale).nav.home}</LocaleLink>
        <span>/</span>
        <LocaleLink to="/levels/">{getMessages(locale).nav.levels}</LocaleLink>
        <span>/</span>
        <span>{level.levelNumber}</span>
      </nav>
      <LevelDetailView level={level} />
      <FloatingLevelBar
        locale={locale}
        previousLevel={previousLevel}
        nextLevel={nextLevel}
        levels={searchLevels}
      />
    </div>
  );
}
