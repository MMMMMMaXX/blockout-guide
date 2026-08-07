/** 文件职责：渲染障碍规则、策略、避坑点及已发布关联关卡，按语言本地化。 */
import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";
import { notFound } from "next/navigation";
import { LevelCard } from "@/components/level-card";
import {
  getPublishedObstacleBySlug,
  getPublishedObstacles,
  getPublishedRelatedLevels,
} from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages, interpolate } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

/** 为全部受支持语言生成详情参数（非英文回退到英文源内容），不批量制造机制空页。 */
export function generateStaticParams() {
  return supportedLocales.flatMap((locale) =>
    getPublishedObstacles("en").map((article) => ({ locale, slug: article.slug })),
  );
}

/** 草稿机制显式 noindex，发布后使用独立 SEO 或内容摘要。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const article = await getPublishedObstacleBySlug(current, slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.summary,
    alternates: { canonical: `/${current}/obstacles/${slug}/` },
    robots: "index, follow",
  };
}

/** 关联关卡必须再次经过 published Repository，避免草稿泄露。 */
export default async function ObstacleDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const article = await getPublishedObstacleBySlug(current, slug);
  if (!article) notFound();
  const relatedLevels = getPublishedRelatedLevels(current, article.relatedLevelNumbers);
  return (
    <div className="shell page editorial-detail">
      <nav className="breadcrumbs" aria-label={t.aria.breadcrumb}>
        <LocaleLink locale={current} to="/">
          {t.nav.home}
        </LocaleLink>
        <span>/</span>
        <LocaleLink locale={current} to="/obstacles/">
          {t.nav.obstacles}
        </LocaleLink>
        <span>/</span>
        <span>{article.title}</span>
      </nav>
      <header className="article-hero">
        <p className="eyebrow">
          {t.editorial.detail.eyebrow.obstacle} · {article.category}
        </p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-facts">
          <span>
            {t.editorial.detail.labels.priority}: {article.priority}
          </span>
          <span>
            {t.editorial.detail.labels.verified}: {article.verifiedAt ?? article.updatedAt}
          </span>
          <span>
            {t.editorial.detail.labels.updated}: {article.updatedAt}
          </span>
        </div>
      </header>
      <div className="article-columns">
        <div className="article-main">
          <section className="content-panel">
            <p className="eyebrow">{t.editorial.detail.obstacle.rulesEyebrow}</p>
            <h2>{t.editorial.detail.obstacle.rulesTitle}</h2>
            <ul className="plain-list">
              {article.rules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="content-panel">
            <p className="eyebrow">{t.editorial.detail.obstacle.strategyEyebrow}</p>
            <h2>{t.editorial.detail.obstacle.strategyTitle}</h2>
            <ul className="plain-list plain-list--good">
              {article.strategyPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="content-panel">
            <p className="eyebrow">{t.editorial.detail.obstacle.avoidEyebrow}</p>
            <h2>{t.editorial.detail.obstacle.avoidTitle}</h2>
            <ul className="plain-list plain-list--warn">
              {article.avoidPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="article-side content-panel">
          <p className="eyebrow">{t.editorial.detail.obstacle.evidenceEyebrow}</p>
          <h2>{t.editorial.detail.obstacle.evidenceTitle}</h2>
          <p>
            {interpolate(t.editorial.detail.obstacle.sourceRefs, {
              count: article.sourceReferences.length,
            })}
          </p>
          <p>
            {interpolate(t.editorial.detail.obstacle.checkedOn, {
              date: article.verifiedAt ?? article.updatedAt,
            })}
          </p>
        </aside>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.editorial.detail.relatedEyebrow}</p>
            <h2>{t.editorial.detail.relatedTitleObstacle}</h2>
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
            <p>{t.editorial.detail.emptyCopyObstacle}</p>
          </div>
        )}
      </section>
    </div>
  );
}
