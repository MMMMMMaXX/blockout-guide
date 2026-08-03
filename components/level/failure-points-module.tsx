/** 文件职责：渲染关卡详情的常见失败点模块。所有关卡复用同一组件。 */
"use client";

import { highlightColors } from "@/components/color-dot";
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages } from "@/lib/i18n/messages";

type FailurePointsModuleProps = {
  failures: string[];
};

/** 失败点卡片循环使用的强调色，与视觉原型一致。 */
const ACCENT_CYCLE = ["pink", "purple", "cyan", "green", "orange", "yellow"] as const;

/** 单关卡失败点；修改此组件会同时影响所有关卡页的失败点展示。 */
export function FailurePointsModule({ failures }: FailurePointsModuleProps) {
  const t = getMessages(useLocale());
  return (
    <section className="content-panel failure-panel">
      <p className="eyebrow">{t.levelDetail.failurePoints}</p>
      <div className="failure-grid">
        {failures.map((failure, index) => (
          <div
            key={failure}
            className={`failure-card failure-card--${ACCENT_CYCLE[index % ACCENT_CYCLE.length]}`}
          >
            <span aria-hidden="true">{index + 1}</span>
            <p>{highlightColors(failure)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
