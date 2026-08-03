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
import { getMessages } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

/** 详情参数来自真实 Update 文件，不预建任意版本号。 */
export function generateStaticParams() {
  return getPublishedUpdates("en").map((article) => ({ slug: article.slug }));
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
      <nav className="breadcrumbs" aria-label="Breadcrumb">
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
        <p className="eyebrow">VERSION {article.version}</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-facts">
          <span>Released: {article.releasedAt ?? "Template value not supplied"}</span>
          <span>Impact checked: {article.impactCheckedAt ?? "Template value not supplied"}</span>
          <span>Updated: {article.updatedAt}</span>
        </div>
      </header>
      <div className="decision-grid">
        <section className="content-panel">
          <p className="eyebrow">VERIFIED CHANGES</p>
          <h2>What changed</h2>
          {article.changes.length > 0 ? (
            <ul className="plain-list">
              {article.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          ) : (
            <p className="muted-copy">This structure template contains no production claims.</p>
          )}
        </section>
        <section className="content-panel">
          <p className="eyebrow">IMPACT COVERAGE</p>
          <h2>Content impact</h2>
          <dl className="compact-facts">
            <div>
              <dt>Levels</dt>
              <dd>{article.affectedLevelNumbers.length}</dd>
            </div>
            <div>
              <dt>Obstacles</dt>
              <dd>{article.affectedObstacleIds.length}</dd>
            </div>
            <div>
              <dt>Sources</dt>
              <dd>{article.sourceReferences.length}</dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AFFECTED LEVELS</p>
            <h2>Published guides affected by this release</h2>
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
            <span>0 public impacts</span>
            <h2>No individual level was named in the release notes</h2>
            <p>The sourced impact is recorded through the Ivy obstacle relationship instead.</p>
          </div>
        )}
      </section>
    </div>
  );
}
