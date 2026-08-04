/** 文件职责：渲染关卡详情的常见问题模块。所有关卡复用同一组件。 */
"use client";

import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages, interpolate } from "@/lib/i18n/messages";

type FaqModuleProps = {
  levelNumber: number;
  boosterUsage: string;
};

/** 单关卡 FAQ；修改此组件会同时影响所有关卡页的问答展示。 */
export function FaqModule({ levelNumber, boosterUsage }: FaqModuleProps) {
  const locale = useLocale();
  const t = getMessages(locale);
  const usageLabel =
    (t.boosterStatus[boosterUsage as keyof typeof t.boosterStatus] as string | undefined) ??
    boosterUsage;
  return (
    <section className="content-panel detail-faq">
      <p className="eyebrow">{t.levelDetail.faq}</p>
      <details>
        <summary>{interpolate(t.levelDetail.faqBoardDiffersQuestion, { level: levelNumber })}</summary>
        <p>{t.levelDetail.faqBoardDiffersAnswer}</p>
      </details>
      <details>
        <summary>{t.levelDetail.faqBoosterQuestion}</summary>
        <p>{interpolate(t.levelDetail.faqBoosterAnswer, { usage: usageLabel })}</p>
      </details>
    </section>
  );
}
