/** 文件职责：渲染关卡详情的快速提示模块。所有关卡复用同一组件。 */
import { highlightColors } from "@/components/color-dot";

type QuickTipsModuleProps = {
  tips: string[];
};

/** 单关卡快速提示；修改此组件会同时影响所有关卡页的提示展示。 */
export function QuickTipsModule({ tips }: QuickTipsModuleProps) {
  return (
    <article className="content-panel">
      <p className="eyebrow">QUICK TIPS</p>
      <ol className="tip-list">
        {tips.map((tip) => (
          <li key={tip}>{highlightColors(tip)}</li>
        ))}
      </ol>
    </article>
  );
}
