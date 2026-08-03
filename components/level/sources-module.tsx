/** 文件职责：渲染关卡详情的来源与核验模块，公开攻略出处与核验状态（数据驱动新增模块）。 */
import type { LevelArticle, LevelVariant } from "@/lib/content/types";

type SourcesModuleProps = {
  level: LevelArticle;
  variant: LevelVariant;
};

/** 单关卡来源模块；修改此组件会同时影响所有关卡页的来源展示。 */
export function SourcesModule({ level, variant }: SourcesModuleProps) {
  if (level.sourceReferences.length === 0) return null;
  return (
    <section className="content-panel source-panel">
      <p className="eyebrow">SOURCES &amp; VERIFICATION</p>
      <h2>Where this walkthrough comes from</h2>
      <ul>
        {level.sourceReferences.map((reference) => (
          <li key={reference}>
            <a href={reference} rel="nofollow noopener noreferrer" target="_blank">
              {reference}
            </a>
          </li>
        ))}
      </ul>
      <p className="source-note">
        Verification status: {variant.verificationStatus.replaceAll("-", " ")}. Solutions are
        matched to the source board before publication.
      </p>
    </section>
  );
}
