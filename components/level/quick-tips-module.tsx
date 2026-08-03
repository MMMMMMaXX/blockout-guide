/** 文件职责：渲染关卡详情的快速提示模块。所有关卡复用同一组件。 */
"use client";

import { highlightColors } from "@/components/color-dot";
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages } from "@/lib/i18n/messages";

type QuickTipsModuleProps = {
  tips: string[];
};

/** 单关卡快速提示；修改此组件会同时影响所有关卡页的提示展示。 */
export function QuickTipsModule({ tips }: QuickTipsModuleProps) {
  const t = getMessages(useLocale());
  return (
    <article className="content-panel">
      <p className="eyebrow">{t.levelDetail.quickTips}</p>
      <ol className="tip-list">
        {tips.map((tip) => (
          <li key={tip}>{highlightColors(tip)}</li>
        ))}
      </ol>
    </article>
  );
}
