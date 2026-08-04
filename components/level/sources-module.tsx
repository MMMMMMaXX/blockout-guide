/** 文件职责：渲染关卡详情的来源与核验模块，公开攻略出处与核验状态（数据驱动新增模块）。 */
import type { LevelArticle, LevelVariant, Locale } from "@/lib/content/types";
import { getMessages, interpolate } from "@/lib/i18n/messages";

type SourcesModuleProps = {
  level: LevelArticle;
  variant: LevelVariant;
  locale: Locale;
};

/** 单关卡来源模块；修改此组件会同时影响所有关卡页的来源展示。 */
export function SourcesModule({ level, variant, locale }: SourcesModuleProps) {
  if (level.sourceReferences.length === 0) return null;
  const t = getMessages(locale);
  const statusText =
    variant.verificationStatus === "source-verified"
      ? t.verificationStatus.sourceVerified
      : variant.verificationStatus.replaceAll("-", " ");
  return (
    <section className="content-panel source-panel">
      <p className="eyebrow">{t.levelDetail.sources}</p>
      <h2>{t.levelDetail.sources}</h2>
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
        {interpolate(t.levelDetail.verificationNote, { status: statusText })}
      </p>
    </section>
  );
}
