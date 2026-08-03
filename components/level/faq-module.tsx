/** 文件职责：渲染关卡详情的常见问题模块。所有关卡复用同一组件。 */
type FaqModuleProps = {
  levelNumber: number;
  boosterUsage: string;
};

/** 单关卡 FAQ；修改此组件会同时影响所有关卡页的问答展示。 */
export function FaqModule({ levelNumber, boosterUsage }: FaqModuleProps) {
  return (
    <section className="content-panel detail-faq">
      <p className="eyebrow">LEVEL FAQ</p>
      <details>
        <summary>Why might my Level {levelNumber} board look different?</summary>
        <p>Game version, platform or staged rollout differences can change a board layout.</p>
      </details>
      <details>
        <summary>Should I use a booster?</summary>
        <p>
          This Variant records booster use as <strong>{boosterUsage}</strong>. Match the board
          before treating that note as applicable.
        </p>
      </details>
    </section>
  );
}
