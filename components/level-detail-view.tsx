/** 文件职责：按内容层级和所选 Variant 组合关卡详情模块；所有关卡复用同一套模块与同一组合顺序。 */
"use client";

import { useState } from "react";
import type { LevelArticle } from "@/lib/content/types";
import type { ResolvedLevel } from "@/lib/content/level-repository";
import { useLocale } from "@/lib/i18n/use-locale";
import { BoardModule } from "./level/board-module";
import { FactsModule } from "./level/facts-module";
import { VideoModule } from "./level/video-module";
import { QuickTipsModule } from "./level/quick-tips-module";
import { SolutionStepsModule } from "./level/solution-steps-module";
import { FailurePointsModule } from "./level/failure-points-module";
import { FaqModule } from "./level/faq-module";
import { SourcesModule } from "./level/sources-module";

type LevelDetailViewProps = {
  level: ResolvedLevel;
};

/** Variant 标签优先使用平台与版本，避免假装拥有尚未记录的名称。 */
function getVariantLabel(level: LevelArticle, index: number) {
  const variant = level.variants[index];
  const platform =
    variant.platforms.length > 0 ? variant.platforms.join(" / ") : "Platform not recorded";
  return `${platform} · ${variant.gameVersion ?? `Variant ${index + 1}`}`;
}

/**
 * 关卡详情主体：模块顺序与条件渲染集中在此处。
 * 因为每一个模块都是独立组件，修改任一模块样式或在此调整模块顺序，都会同时作用于全部关卡页。
 * 上/下关与搜索已移至滚动后常驻的悬浮底部条（FloatingLevelBar），避免重复渲染。
 * 长文本模块（提示/步骤/失败点/FAQ）仅在目标语言存在对应 overlay 时展示，否则按视频层级呈现，绝不显示英文长文本。
 */
export function LevelDetailView({ level }: LevelDetailViewProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const locale = useLocale();
  const variant = level.variants[selectedVariantIndex];
  const showProse = level.sourceLocale === locale;
  const isEnhanced = level.contentTier !== "video";
  const variantOptions = level.variants.map((item, index) => ({
    id: item.id,
    label: getVariantLabel(level, index),
  }));

  return (
    <>
      <section className="detail-hero">
        <BoardModule
          level={level}
          variant={variant}
          variantOptions={variantOptions}
          selectedIndex={selectedVariantIndex}
          onSelectVariant={setSelectedVariantIndex}
          locale={locale}
        />
        <FactsModule level={level} variant={variant} locale={locale} />
      </section>

      <section className="detail-grid detail-grid--with-steps">
        <div className="detail-grid__top">
          <VideoModule
            levelNumber={level.levelNumber}
            video={variant.video}
            chapters={showProse && isEnhanced ? variant.chapters : undefined}
            poster={variant.boardImage}
            locale={locale}
          />
          {showProse && isEnhanced && variant.quickTips && variant.quickTips.length > 0 ? (
            <QuickTipsModule tips={variant.quickTips} />
          ) : null}
        </div>
        {showProse && level.contentTier === "full-guide" && variant.steps && variant.steps.length > 0 ? (
          <SolutionStepsModule steps={variant.steps} />
        ) : null}
      </section>

      {showProse && isEnhanced && variant.failurePoints && variant.failurePoints.length > 0 ? (
        <FailurePointsModule failures={variant.failurePoints} />
      ) : null}

      <SourcesModule level={level} variant={variant} locale={locale} />

      {showProse ? (
        <FaqModule levelNumber={level.levelNumber} boosterUsage={variant.boosterUsage} />
      ) : null}
    </>
  );
}
