/** 文件职责：渲染关卡详情的快速事实卡片（状态、版本、平台、颜色、Booster、核验）。所有关卡复用同一组件。 */
import type { LevelArticle, LevelVariant, Locale } from "@/lib/content/types";
import { ColorChips } from "@/components/color-dot";
import { getMessages } from "@/lib/i18n/messages";

type FactsModuleProps = {
  level: LevelArticle;
  variant: LevelVariant;
  locale: Locale;
};

/** 单关卡事实卡片；修改此组件会同时影响所有关卡页的事实展示。 */
export function FactsModule({ level, variant, locale }: FactsModuleProps) {
  const t = getMessages(locale);
  const colors = variant.boardProfile?.colors ?? [];

  const statusValue =
    level.status === "published" ? t.status.published : level.status;
  const verificationValue =
    variant.verificationStatus === "source-verified"
      ? t.verificationStatus.sourceVerified
      : variant.verificationStatus.replaceAll("-", " ");
  const platformValue =
    variant.platforms.length > 0
      ? variant.platforms
          .map((p) => (t.platform[p as keyof typeof t.platform] as string | undefined) ?? p)
          .join(", ")
      : t.levelDetail.pending;
  const boosterValue =
    (t.boosterStatus[variant.boosterUsage as keyof typeof t.boosterStatus] as string | undefined) ??
    variant.boosterUsage;
  const gameVersionValue = variant.gameVersion ?? t.levelDetail.versionNotRecorded;
  const checkedValue = variant.verifiedAt ?? t.levelDetail.notVerified;

  return (
    <aside className="facts-card">
      <p className="eyebrow">{t.levelDetail.quickFacts}</p>
      <h2>{t.levelDetail.quickFacts}</h2>
      <dl>
        <div>
          <dt>{t.levelDetail.status}</dt>
          <dd>{statusValue}</dd>
        </div>
        <div>
          <dt>{t.levelDetail.gameVersion}</dt>
          <dd>{gameVersionValue}</dd>
        </div>
        <div>
          <dt>{t.levelDetail.platform}</dt>
          <dd>{platformValue}</dd>
        </div>
        <div>
          <dt>{t.levelDetail.booster}</dt>
          <dd>{boosterValue}</dd>
        </div>
        <div>
          <dt>{t.levelDetail.verification}</dt>
          <dd>{verificationValue}</dd>
        </div>
        <div>
          <dt>{t.levelDetail.checked}</dt>
          <dd>{checkedValue}</dd>
        </div>
      </dl>
      {colors.length > 0 ? (
        <div className="facts-colors">
          <p className="facts-colors__label">{t.levelDetail.boardColors}</p>
          <ColorChips colors={colors} locale={locale} />
        </div>
      ) : null}
      <div className="callout">{t.levelDetail.boardMatchNote}</div>
    </aside>
  );
}
