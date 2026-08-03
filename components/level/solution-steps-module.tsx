/** 文件职责：渲染关卡详情的逐步解法模块。所有关卡复用同一组件。 */
"use client";

import type { SolutionStep } from "@/lib/content/types";
import { highlightColors } from "@/components/color-dot";
import { useLocale } from "@/lib/i18n/use-locale";
import { getMessages } from "@/lib/i18n/messages";
import { StepImage } from "./step-image";

type SolutionStepsModuleProps = {
  steps: SolutionStep[];
};

/** 单关卡逐步解法；修改此组件会同时影响所有关卡页的解法展示。 */
export function SolutionStepsModule({ steps }: SolutionStepsModuleProps) {
  const t = getMessages(useLocale());
  return (
    <section className="content-panel solution-steps">
      <p className="eyebrow">{t.levelDetail.solutionSteps}</p>
      <h2>{t.levelDetail.solutionSteps}</h2>
      <ol>
        {steps.map((step) => (
          <li key={step.order}>
            <span>{step.order}</span>
            <div className="step-content">
              <div className="step-copy">
                <h3>{step.title}</h3>
                <p>{highlightColors(step.instruction)}</p>
              </div>
              {step.image ? (
                <StepImage
                  className="step-media"
                  src={step.image}
                  alt={step.imageAlt ?? `Board reference for step ${step.order}`}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
