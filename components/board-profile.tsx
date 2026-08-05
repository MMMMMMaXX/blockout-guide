/** 文件职责：把有来源的棋盘识别要点渲染为站点自有文本图卡，不复制第三方游戏截图。 */
import type { LevelVariant, Locale } from "@/lib/content/types";
import { ColorDot, localizedColorName } from "@/components/color-dot";
import { getMessages } from "@/lib/i18n/messages";

type BoardProfileProps = {
  profile: NonNullable<LevelVariant["boardProfile"]>;
  locale: Locale;
};

/** 棋盘档案用于确认布局，不声称复刻游戏美术或像素级位置。 */
export function BoardProfile({ profile, locale }: BoardProfileProps) {
  const t = getMessages(locale);
  const colorNames = profile.colors.map((color) => localizedColorName(color, locale)).join(", ");
  return (
    <div className="board-profile" role="group" aria-label={t.levelDetail.boardColors}>
      <div className="board-profile__swatches" aria-label={colorNames}>
        {profile.colors.map((color) => (
          <span key={color}>
            <ColorDot name={color} locale={locale} /> {localizedColorName(color, locale)}
          </span>
        ))}
      </div>
      <h2>{t.levelDetail.confirmLandmarks}</h2>
      <p>{profile.layout}</p>
      <ul>
        {profile.landmarks.map((landmark) => (
          <li key={landmark}>{landmark}</li>
        ))}
      </ul>
      <a href={profile.sourceUrl} rel="noreferrer" target="_blank">
        {t.levelDetail.compareSource}
      </a>
    </div>
  );
}
