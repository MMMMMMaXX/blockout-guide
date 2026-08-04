/** 文件职责：按内容层级和所选 Variant 组合关卡详情模块；所有关卡复用同一套模块与同一组合顺序。 */
"use client";

import { useState } from "react";
import type { LevelArticle, Locale } from "@/lib/content/types";
import type { ResolvedLevel } from "@/lib/content/level-repository";
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages } from "@/lib/i18n/messages";
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
function getVariantLabel(level: LevelArticle, index: number, locale: Locale) {
  const t = getMessages(locale);
  const variant = level.variants[index];
  const platforms = variant.platforms
    .map((p) => (t.platform[p as keyof typeof t.platform] as string | undefined) ?? p)
    .join(" / ");
  const platform = platforms || t.levelDetail.platform;
  const version = variant.gameVersion ?? `${t.levelDetail.variant} ${index + 1}`;
  return `${platform} · ${version}`;
}

/**
 * 关卡详情主体：模块顺序与条件渲染集中在此处。
 * 因为每一个模块都是独立组件，修改任一模块样式或在此调整模块顺序，都会同时作用于全部关卡页。
 * 上/下关与搜索已移至滚动后常驻的悬浮底部条（FloatingLevelBar），避免重复渲染。
 * 攻略正文（提示/步骤/失败点/FAQ）随视频一起展示：视频本身即英文 walkthrough，攻略正文同源英文，
 * 非源语言页保留本地化 UI 外壳并展示英文攻略主体，不再因语言差异留白。
 */
export function LevelDetailView({ level }: LevelDetailViewProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const locale = useLocale();
  const variant = level.variants[selectedVariantIndex];
  const isEnhanced = level.contentTier !== "video";
  const variantOptions = level.variants.map((item, index) => ({
    id: item.id,
    label: getVariantLabel(level, index, locale),
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
        <div className="detail-cell detail-cell--video">
          <VideoModule
            levelNumber={level.levelNumber}
            video={variant.video}
            chapters={isEnhanced ? variant.chapters : undefined}
            poster={variant.boardImage}
            locale={locale}
          />
        </div>
        {isEnhanced && variant.quickTips && variant.quickTips.length > 0 ? (
          <div className="detail-cell detail-cell--tips">
            <QuickTipsModule tips={variant.quickTips} />
          </div>
        ) : null}
        {level.contentTier === "full-guide" && variant.steps && variant.steps.length > 0 ? (
          <div className="detail-cell detail-cell--steps">
            <SolutionStepsModule steps={variant.steps} />
          </div>
        ) : null}
      </section>

      {isEnhanced && variant.failurePoints && variant.failurePoints.length > 0 ? (
        <FailurePointsModule failures={variant.failurePoints} />
      ) : null}

      <SourcesModule level={level} variant={variant} locale={locale} />

      <FaqModule levelNumber={level.levelNumber} boosterUsage={variant.boosterUsage} />
    </>
  );
}
