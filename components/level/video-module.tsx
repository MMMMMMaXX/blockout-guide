/** 文件职责：渲染关卡详情的竖屏视频模块（含可选章节起播与封面）。所有关卡复用同一组件。 */
import type { LevelVariant, Locale } from "@/lib/content/types";
import { getMessages } from "@/lib/i18n/messages";
import { YouTubePlayer } from "@/components/youtube-player";

type VideoModuleProps = {
  levelNumber: number;
  video: LevelVariant["video"];
  chapters: LevelVariant["chapters"];
  poster?: string;
  locale: Locale;
};

/** 单关卡视频模块；修改此组件会同时影响所有关卡页的视频展示。 */
export function VideoModule({ levelNumber, video, chapters, poster, locale }: VideoModuleProps) {
  const t = getMessages(locale);
  return (
    <article className="content-panel">
      <p className="eyebrow">{t.levelDetail.video}</p>
      <YouTubePlayer
        key={`${video?.videoId ?? "no-video"}-${poster ?? "no-poster"}`}
        levelNumber={levelNumber}
        video={video}
        chapters={chapters}
        poster={poster}
      />
    </article>
  );
}
