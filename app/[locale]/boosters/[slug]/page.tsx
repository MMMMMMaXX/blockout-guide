/** 文件职责：渲染 Booster 效果边界、使用条件和不使用条件，按语言本地化。 */
import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";
import { notFound } from "next/navigation";
import { LevelCard } from "@/components/level-card";
import {
  getPublishedBoosterBySlug,
  getPublishedBoosters,
  getPublishedRelatedLevels,
} from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string; slug: string }> };
export function generateStaticParams() {
  return supportedLocales.flatMap((locale) =>
    getPublishedBoosters("en").map((article) => ({ locale, slug: article.slug })),
  );
}
/** Booster 草稿永不索引，发布后使用经过门禁的 SEO 信息。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const article = getPublishedBoosterBySlug(current, slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.summary,
    alternates: { canonical: `/${current}/boosters/${slug}/` },
    robots: "index, follow",
  };
}
/** 使用/不使用并列呈现，避免把 Booster 写成单向推荐。 */
export default async function BoosterDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const article = getPublishedBoosterBySlug(current, slug);
  if (!article) notFound();
  const relatedLevels = getPublishedRelatedLevels(current, article.relatedLevelNumbers);
  return (
    <div className="shell page editorial-detail">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <LocaleLink locale={current} to="/">
          {t.nav.home}
        </LocaleLink>
        <span>/</span>
        <LocaleLink locale={current} to="/boosters/">
          {t.nav.boosters}
        </LocaleLink>
        <span>/</span>
        <span>{article.title}</span>
      </nav>
      <header className="article-hero">
        <p className="eyebrow">{t.editorial.detail.eyebrow.booster}</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-facts">
          <span>
            {t.editorial.detail.labels.verified}: {article.verifiedAt ?? article.updatedAt}
          </span>
          <span>
            {t.editorial.detail.labels.updated}: {article.updatedAt}
          </span>
        </div>
      </header>
      <section className="content-panel effect-callout">
        <p className="eyebrow">{t.editorial.detail.booster.effectEyebrow}</p>
        <h2>{article.effect}</h2>
      </section>
      <div className="decision-grid">
        <section className="content-panel">
          <p className="eyebrow">{t.editorial.detail.booster.useEyebrow}</p>
          <h2>{t.editorial.detail.booster.useTitle}</h2>
          <ul className="plain-list plain-list--good">
            {article.useWhen.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="content-panel">
          <p className="eyebrow">{t.editorial.detail.booster.avoidEyebrow}</p>
          <h2>{t.editorial.detail.booster.avoidTitle}</h2>
          <ul className="plain-list plain-list--warn">
            {article.avoidWhen.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="content-panel editorial-section">
        <p className="eyebrow">{t.editorial.detail.booster.checklistEyebrow}</p>
        <ol className="number-list">
          {article.decisionChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.editorial.detail.relatedEyebrow}</p>
            <h2>{t.editorial.detail.relatedTitle}</h2>
          </div>
        </div>
        {relatedLevels.length > 0 ? (
          <div className="level-grid">
            {relatedLevels.map((level) => (
              <LevelCard key={level.id} level={level} locale={current} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>{t.editorial.detail.emptyCount}</span>
            <h2>{t.editorial.detail.emptyTitle}</h2>
            <p>{t.editorial.detail.emptyCopyBooster}</p>
          </div>
        )}
      </section>
    </div>
  );
}
