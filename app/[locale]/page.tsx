/** 文件职责：实现首页核心路径——输入关卡号并理解站点差异化，按当前语言本地化。 */
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { HeroLevelSearch } from "@/components/hero-level-search";
import { HeroVisual } from "@/components/hero-visual";
import { LevelsExplorer } from "@/components/levels-explorer";
import { LocaleLink } from "@/components/locale-link";
import {
  getPublishedBoosters,
  getPublishedGuides,
  getPublishedObstacles,
  getPublishedUpdates,
} from "@/lib/content/editorial-repository";
import type { EditorialMeta, Locale } from "@/lib/content/types";
import { getPublishedLevels } from "@/lib/content/level-repository";
import { supportedLocales } from "@/lib/i18n/locales";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { buildFullAlternates } from "@/lib/seo/metadata";
import { buildWebsiteJsonLd } from "@/lib/seo/structured-data";

type PageProps = { params: Promise<{ locale: string }> };

/** 为所有受支持语言生成首页静态参数。 */
export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

/** 首页自指 canonical + 完整 10 语言 hreflang。 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `/${locale}/`;
  const t = getMessages(locale as Locale);
  return {
    title: t.home.title,
    alternates: buildFullAlternates(canonical),
    robots: "index, follow",
  };
}

/** 首页只消费已发布内容；空状态说明审核进度但不回退展示草稿。 */
export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params;
  const current = locale as Locale;
  const t = getMessages(current);
  const allLevels = [...getPublishedLevels(current)];

  const categorySections: {
    label: string;
    eyebrow: string;
    segment: "obstacles" | "boosters" | "guides" | "updates";
    items: readonly EditorialMeta[];
  }[] = [
    {
      label: t.nav.obstacles,
      eyebrow: t.home.categoryEyebrows.obstacles,
      segment: "obstacles",
      items: getPublishedObstacles(current),
    },
    {
      label: t.nav.boosters,
      eyebrow: t.home.categoryEyebrows.boosters,
      segment: "boosters",
      items: getPublishedBoosters(current),
    },
    {
      label: t.nav.guides,
      eyebrow: t.home.categoryEyebrows.guides,
      segment: "guides",
      items: getPublishedGuides(current),
    },
    {
      label: t.nav.updates,
      eyebrow: t.home.categoryEyebrows.updates,
      segment: "updates",
      items: getPublishedUpdates(current),
    },
  ];

  return (
    <>
      <JsonLd data={buildWebsiteJsonLd(current)} />
      <section className="shell hero">
        <div className="hero-copy">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>{t.home.title}</h1>
          <p className="lede">{t.home.lede}</p>
          <HeroLevelSearch levels={allLevels} />
          <div className="chip-row">
            {t.home.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>
        <div className="hero-board">
          <HeroVisual />
        </div>
      </section>

      <section className="shell status-strip" aria-label={t.aria.productPrinciples}>
        {t.home.statusStrip.map((item) => (
          <div key={item.value}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.home.levelLibraryEyebrow}</p>
            <h2>{t.home.levelLibraryTitle}</h2>
            <p>
              {allLevels.length === 0
                ? t.home.levelLibraryEmpty
                : interpolate(t.home.levelLibraryCopy, { count: allLevels.length })}
            </p>
          </div>
        </div>
        {allLevels.length > 0 ? (
          <LevelsExplorer levels={allLevels} />
        ) : (
          <div className="empty-state home-empty">
            <span>{t.common.loading}</span>
            <h2>{t.home.emptyTitle}</h2>
            <p>{t.home.emptyCopy}</p>
          </div>
        )}
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.home.whyEyebrow}</p>
            <h2>{t.home.whyTitle}</h2>
          </div>
        </div>
        <div className="feature-grid">
          {t.home.features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {categorySections.map(({ label, eyebrow, items, segment }) => (
        <section className="shell section" key={segment}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h2>{label}</h2>
              <p>
                {items.length === 0
                  ? interpolate(t.home.categoryEmpty, { label: label.toLowerCase() })
                  : interpolate(t.home.categoryLive, {
                      count: items.length,
                      label: label.toLowerCase(),
                    })}
              </p>
            </div>
            {items.length > 0 ? (
              <LocaleLink to={`/${segment}/`}>
                {interpolate(t.home.viewAll, { label: label.toLowerCase() })} →
              </LocaleLink>
            ) : null}
          </div>
          {items.length > 0 ? (
            <div className="catalog-grid">
              {items.slice(0, 4).map((article) => (
                <LocaleLink
                  className="catalog-card"
                  to={`/${segment}/${article.slug}/`}
                  key={article.id}
                >
                  <span>{t.editorial.detail.eyebrow[article.kind]}</span>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <strong>{t.home.readVerified}</strong>
                </LocaleLink>
              ))}
            </div>
          ) : (
            <div className="empty-state home-empty">
              <span>{t.common.loading}</span>
              <h2>{interpolate(t.home.categoryEmpty, { label: label.toLowerCase() })}</h2>
              <p>{t.home.emptyCopy}</p>
            </div>
          )}
        </section>
      ))}

      <section className="shell section faq-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.home.faqEyebrow}</p>
            <h2>{t.home.faqTitle}</h2>
          </div>
        </div>
        {t.home.faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <section className="shell section roadmap-cta">
        <div>
          <p className="eyebrow">{t.home.roadmapEyebrow}</p>
          <h2>{t.home.roadmapTitle}</h2>
          <p>{t.home.roadmapCopy}</p>
        </div>
        <LocaleLink className="button-link" to="/about/">
          {t.home.readEditorial}
        </LocaleLink>
      </section>
    </>
  );
}
