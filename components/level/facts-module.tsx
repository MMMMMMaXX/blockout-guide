/** 文件职责：渲染关卡详情的快速事实卡片（状态、版本、平台、颜色、Booster、核验）。所有关卡复用同一组件。 */
import type { LevelArticle, LevelVariant } from "@/lib/content/types";
import { ColorChips } from "@/components/color-dot";

type FactsModuleProps = {
  level: LevelArticle;
  variant: LevelVariant;
};

/** 单关卡事实卡片；修改此组件会同时影响所有关卡页的事实展示。 */
export function FactsModule({ level, variant }: FactsModuleProps) {
  const colors = variant.boardProfile?.colors ?? [];
  return (
    <aside className="facts-card">
      <p className="eyebrow">QUICK FACTS</p>
      <h2>Match before you move</h2>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{level.status}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{variant.gameVersion ?? "Version not recorded"}</dd>
        </div>
        <div>
          <dt>Platform</dt>
          <dd>{variant.platforms.length > 0 ? variant.platforms.join(", ") : "Pending"}</dd>
        </div>
        <div>
          <dt>Booster</dt>
          <dd>{variant.boosterUsage}</dd>
        </div>
        <div>
          <dt>Verification</dt>
          <dd>{variant.verificationStatus.replaceAll("-", " ")}</dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>{variant.verifiedAt ?? "Not verified"}</dd>
        </div>
      </dl>
      {colors.length > 0 ? (
        <div className="facts-colors">
          <p className="facts-colors__label">Board colors</p>
          <ColorChips colors={colors} />
        </div>
      ) : null}
      <div className="callout">
        Follow this solution only when the opening board and platform match your game.
      </div>
    </aside>
  );
}
