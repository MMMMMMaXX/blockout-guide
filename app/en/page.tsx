/** 文件职责：实现首页核心路径——输入关卡号并理解站点差异化。 */
import type { Metadata } from "next";
import Link from "next/link";
import { HeroVisual } from "@/components/hero-visual";
import { LevelSearchTrigger } from "@/components/level-search-overlay";
import type { LevelSearchItem } from "@/components/level-search-overlay";
import { LevelsExplorer } from "@/components/levels-explorer";
import { JsonLd } from "@/components/json-ld";
import {
  getPublishedBoosters,
  getPublishedGuides,
  getPublishedObstacles,
  getPublishedUpdates,
} from "@/lib/content/editorial-repository";
import type { EditorialArticle } from "@/lib/content/types";
import { getPublishedLevels } from "@/lib/content/level-repository";
import { buildWebsiteJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Block Out level guides",
  alternates: { canonical: "/en/" },
};

const features = [
  ["A/B", "Match the board first", "A level number alone is not enough when game versions change."],
  [
    "1→5",
    "See the opening moves",
    "Use short, actionable notes before watching the full solution.",
  ],
  [
    "▶",
    "Jump to the moment",
    "Enhanced guides connect video chapters with mechanics and mistakes.",
  ],
  ["◐", "Built for mobile", "Portrait media and 40px touch targets fit the real play context."],
] as const;

/** 首页只消费已发布内容；空状态说明审核进度但不回退展示草稿。 */
export default function EnglishHomePage() {
  const allLevels = [...getPublishedLevels("en")];
  const searchLevels: LevelSearchItem[] = [...allLevels]
    .sort((first, second) => first.levelNumber - second.levelNumber)
    .map((level) => ({
      levelNumber: level.levelNumber,
      title: level.title,
      difficulty: level.difficulty ?? null,
      boardImage: level.variants[0]?.boardImage ?? null,
    }));
  const categorySections: {
    label: string;
    eyebrow: string;
    segment: "obstacles" | "boosters" | "guides" | "updates";
    items: readonly EditorialArticle[];
  }[] = [
    {
      label: "Obstacles",
      eyebrow: "MECHANIC LIBRARY",
      segment: "obstacles",
      items: getPublishedObstacles("en"),
    },
    {
      label: "Boosters",
      eyebrow: "HELPER LIBRARY",
      segment: "boosters",
      items: getPublishedBoosters("en"),
    },
    {
      label: "Guides",
      eyebrow: "PLAYBOOK LIBRARY",
      segment: "guides",
      items: getPublishedGuides("en"),
    },
    {
      label: "Updates",
      eyebrow: "VERSION LIBRARY",
      segment: "updates",
      items: getPublishedUpdates("en"),
    },
  ];

  return (
    <>
      <JsonLd data={buildWebsiteJsonLd()} />
      <section className="shell hero">
        <div className="hero-copy">
          <p className="eyebrow">STRATLORE LEVEL GUIDE ENGINE</p>
          <h1>Stuck on a level? Start with the right board.</h1>
          <p className="lede">
            Find a matching variant, then get the video, opening moves and obstacle notes without
            digging through a long article.
          </p>
          <LevelSearchTrigger levels={searchLevels} size="hero" />
          <div className="chip-row">
            <span>Board variants</span>
            <span>Portrait video</span>
            <span>Version-aware</span>
            <span>No empty pages</span>
          </div>
        </div>
        <div className="hero-board">
          <HeroVisual />
        </div>
      </section>

      <section className="shell status-strip" aria-label="Product principles">
        <div>
          <strong>30 sec</strong>
          <span>target time to the right solution</span>
        </div>
        <div>
          <strong>3 tiers</strong>
          <span>video to full guide, based on value</span>
        </div>
        <div>
          <strong>1 source</strong>
          <span>validated JSON drives every consumer</span>
        </div>
        <div>
          <strong>390 px</strong>
          <span>primary mobile acceptance width</span>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LEVEL LIBRARY</p>
            <h2>Every verified level guide</h2>
            <p>
              {allLevels.length === 0
                ? "No production level is published yet. The framework keeps drafts out of search, aggregation and future sitemaps."
                : `${allLevels.length} verified levels are live. Search, filter by difficulty, or jump to a range.`}
            </p>
          </div>
        </div>
        {allLevels.length > 0 ? (
          <LevelsExplorer levels={allLevels} />
        ) : (
          <div className="empty-state home-empty">
            <span>Automated publication gate active</span>
            <h2>The library opens when a complete guide passes every gate</h2>
            <p>
              Content agents publish complete guides directly. Incomplete research never becomes a
              complete public article or a hidden content backlog.
            </p>
          </div>
        )}
      </section>

      <section className="shell section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WHY THIS SITE</p>
            <h2>Fast help, backed by content discipline</h2>
          </div>
        </div>
        <div className="feature-grid">
          {features.map(([icon, title, copy]) => (
            <article className="feature-card" key={title}>
              <span>{icon}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
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
                  ? `No ${label.toLowerCase()} article is published yet.`
                  : `${items.length} verified ${label.toLowerCase()} article${items.length > 1 ? "s" : ""} live.`}
              </p>
            </div>
            <Link href={`/en/${segment}/`}>View all {label.toLowerCase()} →</Link>
          </div>
          {items.length > 0 ? (
            <div className="catalog-grid">
              {items.slice(0, 4).map((article) => (
                <Link
                  className="catalog-card"
                  href={`/en/${segment}/${article.slug}/`}
                  key={article.id}
                >
                  <span>{article.kind}</span>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <strong>Read verified article →</strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state home-empty">
              <span>Automated publication gate active</span>
              <h2>No {label.toLowerCase()} article is published yet</h2>
              <p>
                Agents publish only complete, sourced articles; incomplete research stays outside
                the production content set.
              </p>
            </div>
          )}
        </section>
      ))}

      <section className="shell section faq-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAQ & EDITORIAL STANDARD</p>
            <h2>How the guide library works</h2>
          </div>
        </div>
        <details>
          <summary>Why do you ask me to match the board?</summary>
          <p>A level number can map to different layouts across versions or platforms.</p>
        </details>
        <details>
          <summary>Why are there no filler level pages?</summary>
          <p>Only verified, useful guides are published and included in discovery.</p>
        </details>
        <details>
          <summary>How is a solution verified?</summary>
          <p>
            The content pipeline requires board, version, platform, source and verification date in
            the same generation task.
          </p>
        </details>
      </section>

      <section className="shell section roadmap-cta">
        <div>
          <p className="eyebrow">QUALITY BEFORE SCALE</p>
          <h2>Every public guide must earn publication</h2>
          <p>Board, version and source checks keep draft research out of the searchable library.</p>
        </div>
        <Link className="button-link" href="/en/about/">
          Read the editorial scope
        </Link>
      </section>
    </>
  );
}
