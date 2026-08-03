/** 文件职责：渲染 Booster 效果边界、使用条件和不使用条件。 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelCard } from "@/components/level-card";
import {
  getPublishedBoosterBySlug,
  getPublishedBoosters,
  getPublishedRelatedLevels,
} from "@/lib/content/editorial-repository";

type PageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return getPublishedBoosters("en").map((article) => ({ slug: article.slug }));
}
/** Booster 草稿永不索引，发布后使用经过门禁的 SEO 信息。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getPublishedBoosterBySlug("en", (await params).slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.summary,
    alternates: { canonical: `/en/boosters/${article.slug}/` },
    robots: "index, follow",
  };
}
/** 使用/不使用并列呈现，避免把 Booster 写成单向推荐。 */
export default async function BoosterDetailPage({ params }: PageProps) {
  const article = getPublishedBoosterBySlug("en", (await params).slug);
  if (!article) notFound();
  const relatedLevels = getPublishedRelatedLevels("en", article.relatedLevelNumbers);
  return (
    <div className="shell page editorial-detail">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/en/">Home</Link>
        <span>/</span>
        <Link href="/en/boosters/">Boosters</Link>
        <span>/</span>
        <span>{article.title}</span>
      </nav>
      <header className="article-hero">
        <p className="eyebrow">BOOSTER DECISION GUIDE</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-facts">
          <span>Verified: {article.verifiedAt ?? article.updatedAt}</span>
          <span>Updated: {article.updatedAt}</span>
        </div>
      </header>
      <section className="content-panel effect-callout">
        <p className="eyebrow">VERIFIED EFFECT</p>
        <h2>{article.effect}</h2>
      </section>
      <div className="decision-grid">
        <section className="content-panel">
          <p className="eyebrow">CONSIDER USING</p>
          <h2>When it may help</h2>
          <ul className="plain-list plain-list--good">
            {article.useWhen.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="content-panel">
          <p className="eyebrow">DO NOT WASTE IT</p>
          <h2>When it will not fix the attempt</h2>
          <ul className="plain-list plain-list--warn">
            {article.avoidWhen.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="content-panel editorial-section">
        <p className="eyebrow">DECISION CHECKLIST</p>
        <ol className="number-list">
          {article.decisionChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RELATED LEVELS</p>
            <h2>Verified examples</h2>
          </div>
        </div>
        {relatedLevels.length > 0 ? (
          <div className="level-grid">
            {relatedLevels.map((level) => (
              <LevelCard key={level.id} level={level} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>0 verified links</span>
            <h2>No level-specific example is linked</h2>
            <p>
              Use the decision checklist above to separate timing problems from routing problems.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
