/** 文件职责：渲染版本变化、影响检查日期和受影响的已发布内容，按语言本地化。 */
import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";
import { notFound } from "next/navigation";
import { LevelCard } from "@/components/level-card";
import {
  getPublishedUpdateBySlug,
  getPublishedUpdates,
  getPublishedRelatedLevels,
} from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

/** 详情参数来自真实 Update 文件，并为全部受支持语言生成（非英文回退到英文源内容）。 */
export function generateStaticParams() {
  return supportedLocales.flatMap((locale) =>
    getPublishedUpdates("en").map((article) => ({ locale, slug: article.slug })),
  );
}

/** 结构模板保持 noindex；真实 Update 由 Schema 保证发布信息完整。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const article = getPublishedUpdateBySlug(current, slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.summary,
    alternates: { canonical: `/${current}/updates/${slug}/` },
    robots: "index, follow",
  };
}

/** 影响关卡列表只解析 published，不创建人工复核队列。 */
export default async function UpdateDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const article = getPublishedUpdateBySlug(current, slug);
  if (!article) notFound();
  const affectedLevels = getPublishedRelatedLevels(current, article.affectedLevelNumbers);
  return (
    <div className="shell page editorial-detail">
      <nav className="breadcrumbs" aria-label={t.aria.breadcrumb}>
        <LocaleLink locale={current} to="/">
          {t.nav.home}
        </LocaleLink>
        <span>/</span>
        <LocaleLink locale={current} to="/updates/">
          {t.nav.updates}
        </LocaleLink>
        <span>/</span>
        <span>{article.version}</span>
      </nav>
      <header className="article-hero">
        <p className="eyebrow">
          {t.editorial.detail.eyebrow.update} {article.version}
        </p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-facts">
          <span>
            {t.editorial.detail.labels.released}:{" "}
            {article.releasedAt ?? t.editorial.detail.update.dateMissing}
          </span>
          <span>
            {t.editorial.detail.labels.impactChecked}:{" "}
            {article.impactCheckedAt ?? t.editorial.detail.update.dateMissing}
          </span>
          <span>
            {t.editorial.detail.labels.updated}: {article.updatedAt}
          </span>
        </div>
      </header>
      <div className="decision-grid">
        <section className="content-panel">
          <p className="eyebrow">{t.editorial.detail.update.changesEyebrow}</p>
          <h2>{t.editorial.detail.update.changesTitle}</h2>
          {article.changes.length > 0 ? (
            <ul className="plain-list">
              {article.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">{t.editorial.detail.update.noClaims}</p>
          )}
        </section>
        <section className="content-panel">
          <p className="eyebrow">{t.editorial.detail.update.impactEyebrow}</p>
          <h2>{t.editorial.detail.update.impactTitle}</h2>
          <dl className="compact-facts">
            <div>
              <dt>{t.editorial.detail.update.levels}</dt>
              <dd>{article.affectedLevelNumbers.length}</dd>
            </div>
            <div>
              <dt>{t.editorial.detail.update.obstacles}</dt>
              <dd>{article.affectedObstacleIds.length}</dd>
            </div>
            <div>
              <dt>{t.editorial.detail.update.sources}</dt>
              <dd>{article.sourceReferences.length}</dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.editorial.detail.relatedEyebrow}</p>
            <h2>{t.editorial.detail.relatedTitle}</h2>
          </div>
        </div>
        {affectedLevels.length > 0 ? (
          <div className="level-grid">
            {affectedLevels.map((level) => (
              <LevelCard key={level.id} level={level} locale={current} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>{t.editorial.detail.emptyCountImpact}</span>
            <h2>{t.editorial.detail.emptyTitleImpact}</h2>
            <p>{t.editorial.detail.emptyCopyImpact}</p>
          </div>
        )}
      </section>
    </div>
  );
}
