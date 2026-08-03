/** 文件职责：渲染关卡详情的棋盘卡片（标题、难度、Variant 切换与开局棋盘）。所有关卡复用同一组件。 */
import Image from "next/image";
import Link from "next/link";
import type { LevelArticle, LevelVariant } from "@/lib/content/types";
import { BoardPreview } from "@/components/board-preview";
import { BoardProfile } from "@/components/board-profile";

type VariantOption = { id: string; label: string };

type BoardModuleProps = {
  level: LevelArticle;
  variant: LevelVariant;
  variantOptions: VariantOption[];
  selectedIndex: number;
  onSelectVariant: (index: number) => void;
};

/**
 * 棋盘 + 档案组合：开局势必露出可识别的颜色与地标，因此即便有开局图也保留档案块；
 * 没有开局图与档案时回退到通用占位，避免空容器。
 */
function BoardBody({ level, variant }: { level: LevelArticle; variant: LevelVariant }) {
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
            alt={`Opening board for Block Out level ${level.levelNumber}`}
            width={720}
            height={1240}
            priority
          />
        </div>
      ) : null}
      {hasProfile ? <BoardProfile profile={variant.boardProfile!} /> : null}
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
}: BoardModuleProps) {
  return (
    <article className="board-card">
      <div className="detail-title">
        <div>
          <p className="eyebrow">{level.contentTier.replaceAll("-", " ")}</p>
          <h1>Level {level.levelNumber}</h1>
          <p>{level.summary}</p>
        </div>
        {level.difficulty ? (
          <span className={`badge badge--${level.difficulty}`}>{level.difficulty}</span>
        ) : null}
      </div>
      {variantOptions.length > 1 ? (
        <div className="variant-row" role="group" aria-label="Board variants">
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
      <BoardBody level={level} variant={variant} />
      <p className="board-check">
        Board looks different? <Link href="/en/board-matcher/">Open the planned board matcher</Link>
        .
      </p>
    </article>
  );
}
