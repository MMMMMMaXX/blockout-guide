/** 文件职责：以统一竖屏卡片展示关卡摘要与内容发布状态。 */
import Link from "next/link";
import type { Locale } from "@/lib/content/types";
import type { ResolvedLevel } from "@/lib/content/level-repository";
import { withLocale } from "@/lib/i18n/locale-path";
import { getMessages, interpolate } from "@/lib/i18n/messages";
import { BoardPreview } from "./board-preview";

type LevelCardProps = {
  level: ResolvedLevel;
  locale: Locale;
};

/** 优先使用真实棋盘封面或视频缩略图，避免占位图形冒充真实关卡。 */
function getCardThumbnail(level: ResolvedLevel): string | null {
  const variant = level.variants[0];
  if (!variant) return null;
  if (variant.boardImage) return variant.boardImage;
  if (variant.video?.videoId) {
    return `https://img.youtube.com/vi/${variant.video.videoId}/mqdefault.jpg`;
  }
  return null;
}

/** 整卡保持单一链接目标；摘要随关卡数据本地化渲染。 */
export function LevelCard({ level, locale }: LevelCardProps) {
  const t = getMessages(locale);
  const thumb = getCardThumbnail(level);
  const difficultyLabel =
    t.difficulty[level.difficulty as keyof typeof t.difficulty] ?? level.difficulty;
  const tierKey = level.contentTier === "full-guide" ? "fullGuide" : "video";
  const tierLabel = t.contentTier[tierKey as keyof typeof t.contentTier] ?? level.contentTier;
  return (
    <Link className="level-card" href={withLocale(locale, `/levels/${level.levelNumber}/`)}>
      <div className="level-card__media">
        {thumb ? (
          <img
            className="level-card__thumb"
            src={thumb}
            alt={interpolate(t.levelDetail.title, { level: level.levelNumber })}
            loading="lazy"
          />
        ) : (
          <BoardPreview compact />
        )}
        <span className={`badge badge--${level.difficulty ?? "easy"}`}>{difficultyLabel}</span>
      </div>
      <div className="level-card__body">
        <div>
          <p className="eyebrow">{tierLabel}</p>
          <h3>{interpolate(t.common.level, { level: level.levelNumber })}</h3>
        </div>
        <span aria-hidden="true">→</span>
      </div>
      <p>{level.summary}</p>
    </Link>
  );
}
