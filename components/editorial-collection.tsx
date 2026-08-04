/** 文件职责：统一展示 Phase 2 已发布内容卡片和零发布空状态。 */
import Link from "next/link";
import type { EditorialArticle, Locale } from "@/lib/content/types";
import { withLocale } from "@/lib/i18n/locale-path";
import { getMessages, interpolate } from "@/lib/i18n/messages";

const kindToNavKey: Record<
  EditorialArticle["kind"],
  "obstacles" | "boosters" | "guides" | "updates"
> = {
  obstacle: "obstacles",
  booster: "boosters",
  guide: "guides",
  update: "updates",
};

type EditorialCollectionProps = {
  locale: Locale;
  items: readonly EditorialArticle[];
  routeSegment: "obstacles" | "boosters" | "guides" | "updates";
  emptyTitle: string;
  emptyCopy: string;
};

/** 卡片只接受 Repository 返回的 published 项，调用方负责提供领域标题。 */
export function EditorialCollection({
  locale,
  items,
  routeSegment,
  emptyTitle,
  emptyCopy,
}: EditorialCollectionProps) {
  const t = getMessages(locale);
  if (items.length === 0)
    return (
      <section className="empty-state">
        <span>{interpolate(t.editorial.publishedArticles, { count: 0 })}</span>
        <h2>{emptyTitle}</h2>
        <p>{emptyCopy}</p>
      </section>
    );

  return (
    <div className="editorial-grid">
      {items.map((item) => (
        <Link
          className="editorial-card"
          href={withLocale(locale, `/${routeSegment}/${item.slug}/`)}
          key={item.id}
        >
          <div className="editorial-card__icon" aria-hidden="true">
            {item.kind === "obstacle"
              ? "◇"
              : item.kind === "booster"
                ? "+"
                : item.kind === "guide"
                  ? "≡"
                  : "↻"}
          </div>
          <div>
            <p className="eyebrow">{t.nav[kindToNavKey[item.kind]]}</p>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
          </div>
          <span className="editorial-card__meta">
            {interpolate(t.editorial.updated, { date: item.updatedAt })} →
          </span>
        </Link>
      ))}
    </div>
  );
}
