/** 文件职责：渲染面向通用问题的 Guide 正文及已发布关联关卡，按语言本地化。 */
import type { Metadata } from "next";
import { LocaleLink } from "@/components/locale-link";
import { notFound } from "next/navigation";
import { LevelCard } from "@/components/level-card";
import {
  getPublishedGuideBySlug,
  getPublishedGuides,
  getPublishedRelatedLevels,
} from "@/lib/content/editorial-repository";
import type { Locale } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

/** 只为已存在的 Guide 文件生成稳定参数。 */
export function generateStaticParams() {
  return getPublishedGuides("en").map((article) => ({ slug: article.slug }));
}

/** 草稿 Guide 显式 noindex；发布内容使用独立 Article SEO。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const article = getPublishedGuideBySlug(current, slug);
  if (!article) return {};
  return {
    title: article.seo?.title ?? article.title,
    description: article.seo?.description ?? article.summary,
    alternates: { canonical: `/${current}/guides/${slug}/` },
    robots: "index, follow",
  };
}

/** 正文段落来自结构化内容，页面不维护第二份业务文案。 */
export default async function GuideDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const article = getPublishedGuideBySlug(current, slug);
  if (!article) notFound();
  const relatedLevels = getPublishedRelatedLevels(current, article.relatedLevelNumbers);
  return (
    <div className="shell page editorial-detail">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <LocaleLink locale={current} to="/">
          {t.nav.home}
        </LocaleLink>
        <span>/</span>
        <LocaleLink locale={current} to="/guides/">
          {t.nav.guides}
        </LocaleLink>
        <span>/</span>
        <span>{article.title}</span>
      </nav>
      <header className="article-hero">
        <p className="eyebrow">STRATEGY GUIDE</p>
        <h1>{article.title}</h1>
        <p>{article.summary}</p>
        <div className="article-question">
          <strong>Question</strong>
          <span>{article.question}</span>
        </div>
      </header>
      <div className="article-columns">
        <article className="article-main">
          {article.sections.map((section, index) => (
            <section className="content-panel" key={section.heading}>
              <p className="eyebrow">SECTION {index + 1}</p>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>
        <aside className="article-side content-panel">
          <p className="eyebrow">EDITORIAL FACTS</p>
          <h2>Evidence boundary</h2>
          <p>{article.sourceReferences.length} source references recorded.</p>
          <p>Verified {article.verifiedAt ?? article.updatedAt}</p>
          <p>Updated {article.updatedAt}</p>
        </aside>
      </div>
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
              <LevelCard key={level.id} level={level} locale={current} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>0 verified links</span>
            <h2>No level-specific example is linked</h2>
            <p>The guide remains available through its sourced general decision framework.</p>
          </div>
        )}
      </section>
    </div>
  );
}
