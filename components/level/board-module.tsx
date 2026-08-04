/** 文件职责：渲染关卡详情的棋盘卡片（标题、难度、Variant 切换与开局棋盘）。所有关卡复用同一组件。 */
import Image from "next/image";
import Link from "next/link";
import type { LevelVariant, Locale } from "@/lib/content/types";
import type { ResolvedLevel } from "@/lib/content/level-repository";
import { BoardPreview } from "@/components/board-preview";
import { BoardProfile } from "@/components/board-profile";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/locale-path";

type VariantOption = { id: string; label: string };

type BoardModuleProps = {
  level: ResolvedLevel;
  variant: LevelVariant;
  variantOptions: VariantOption[];
  selectedIndex: number;
  onSelectVariant: (index: number) => void;
  locale: Locale;
};

type BoardBodyProps = {
  level: ResolvedLevel;
  variant: LevelVariant;
  locale: Locale;
  showProse: boolean;
};

/**
 * 棋盘 + 档案组合：开局势必露出可识别的颜色与地标，因此即便有开局图也保留档案块；
 * 没有开局图与档案时回退到通用占位，避免空容器。
 */
function BoardBody({ level, variant, locale, showProse }: BoardBodyProps) {
  const t = getMessages(locale);
  const hasImage = Boolean(variant.boardImage);
  const hasProfile = Boolean(variant.boardProfile);
  if (!hasImage && !hasProfile) {
    return (
      <div className="board-card__media board-card__media--solo">
        <BoardPreview />
      </div>
    );
  }
  return (
    <div
      className={`board-card__body${hasImage && hasProfile ? " board-card__body--with-image" : ""}`}
    >
      {hasImage ? (
        <div className="board-card__media">
          <Image
            className="board-image"
            src={variant.boardImage ?? ""}
            alt={interpolate(t.levelDetail.title, { level: level.levelNumber })}
            width={720}
            height={1240}
            priority
          />
        </div>
      ) : null}
      {hasProfile ? (
        <BoardProfile profile={variant.boardProfile!} locale={locale} showProse={showProse} />
      ) : null}
    </div>
  );
}

/** 单关卡棋盘卡片；修改此组件会同时影响所有关卡页的棋盘展示。 */
export function BoardModule({
  level,
  variant,
  variantOptions,
  selectedIndex,
  onSelectVariant,
  locale,
}: BoardModuleProps) {
  const t = getMessages(locale);
  const showProse = level.sourceLocale === locale;
  const tierKey = level.contentTier === "full-guide" ? "fullGuide" : "video";
  const tierLabel = t.contentTier[tierKey as keyof typeof t.contentTier] ?? level.contentTier;
  const difficultyLabel =
    t.difficulty[level.difficulty as keyof typeof t.difficulty] ?? level.difficulty;
  return (
    <article className="board-card">
      <div className="detail-title">
        <div>
          <p className="eyebrow">{tierLabel}</p>
          <h1>{interpolate(t.common.level, { level: level.levelNumber })}</h1>
          {showProse ? <p>{level.summary}</p> : null}
        </div>
        {level.difficulty ? (
          <span className={`badge badge--${level.difficulty}`}>{difficultyLabel}</span>
        ) : null}
      </div>
      {variantOptions.length > 1 ? (
        <div className="variant-row" role="group" aria-label={t.levelDetail.variant}>
          {variantOptions.map((option, index) => (
            <button
              type="button"
              key={option.id}
              aria-pressed={selectedIndex === index}
              onClick={() => onSelectVariant(index)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="variant-label">{variantOptions[0]?.label}</p>
      )}
      <BoardBody level={level} variant={variant} locale={locale} showProse={showProse} />
      <p className="board-check">
        {t.levelDetail.boardDifferent}{" "}
        <Link href={withLocale(locale, "/board-matcher/")}>{t.levelDetail.compareSource}</Link>
      </p>
    </article>
  );
}
