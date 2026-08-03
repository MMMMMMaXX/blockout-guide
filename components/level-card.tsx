/** 文件职责：以统一竖屏卡片展示关卡摘要与内容发布状态。 */
import Link from "next/link";
import type { LevelArticle, Locale } from "@/lib/content/types";
import { withLocale } from "@/lib/i18n/locale-path";
import { BoardPreview } from "./board-preview";

/** 优先使用真实棋盘封面或视频缩略图，避免占位图形冒充真实关卡。 */
function getCardThumbnail(level: LevelArticle): string | null {
  const variant = level.variants[0];
  if (!variant) return null;
  if (variant.boardImage) return variant.boardImage;
  if (variant.video?.videoId) {
    return `https://img.youtube.com/vi/${variant.video.videoId}/mqdefault.jpg`;
  }
  return null;
}

/** 整卡保持单一链接目标，并显式标明草稿以避免误解为真实攻略。 */
export function LevelCard({ level, locale }: { level: LevelArticle; locale: Locale }) {
  const thumb = getCardThumbnail(level);
  return (
    <Link className="level-card" href={withLocale(locale, `/levels/${level.levelNumber}/`)}>
      <div className="level-card__media">
        {thumb ? (
          <img
            className="level-card__thumb"
            src={thumb}
            alt={`Block Out level ${level.levelNumber} board`}
            loading="lazy"
          />
        ) : (
          <BoardPreview compact />
        )}
        <span className={`badge badge--${level.difficulty ?? "easy"}`}>
          {level.difficulty ?? "unrated"}
        </span>
      </div>
      <div className="level-card__body">
        <div>
          <p className="eyebrow">{level.contentTier}</p>
          <h3>Level {level.levelNumber}</h3>
        </div>
        <span aria-hidden="true">→</span>
      </div>
      <p>{level.summary}</p>
    </Link>
  );
}
