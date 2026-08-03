/** 文件职责：把有来源的棋盘识别要点渲染为站点自有文本图卡，不复制第三方游戏截图。 */
import type { LevelVariant } from "@/lib/content/types";
import { ColorDot } from "@/components/color-dot";

/** 棋盘档案用于确认布局，不声称复刻游戏美术或像素级位置。 */
export function BoardProfile({ profile }: { profile: NonNullable<LevelVariant["boardProfile"]> }) {
  return (
    <div className="board-profile" role="group" aria-label="Board identification profile">
      <div className="board-profile__swatches" aria-label={`Colors: ${profile.colors.join(", ")}`}>
        {profile.colors.map((color) => (
          <span key={color}>
            <ColorDot name={color} /> {color}
          </span>
        ))}
      </div>
      <h2>Confirm these board landmarks</h2>
      <p>{profile.layout}</p>
      <ul>
        {profile.landmarks.map((landmark) => (
          <li key={landmark}>{landmark}</li>
        ))}
      </ul>
      <a href={profile.sourceUrl} rel="noreferrer" target="_blank">
        Compare with the documented source board
      </a>
    </div>
  );
}
