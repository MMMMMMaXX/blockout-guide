/** 文件职责：提供隐私增强、点击后加载的 YouTube 播放器与可键盘操作的章节跳转。 */
"use client";

import { useMemo, useState } from "react";
import type { LevelVariant } from "@/lib/content/types";

type YouTubePlayerProps = {
  levelNumber: number;
  video: LevelVariant["video"];
  chapters?: LevelVariant["chapters"];
  poster?: string;
};

/** 把秒数格式化为便于扫描的 mm:ss。 */
function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** 只允许视频 ID 与整数秒数进入隐私增强嵌入 URL。 */
export function buildYoutubeEmbedUrl(videoId: string, seconds: number): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    start: String(Math.max(0, Math.floor(seconds))),
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`;
}

/** 未点击前不联系 YouTube；章节按钮同时负责首次加载和后续精确跳转。 */
export function YouTubePlayer({ levelNumber, video, chapters = [], poster }: YouTubePlayerProps) {
  const [started, setStarted] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const iframeSrc = useMemo(() => {
    if (!video?.embedAllowed || !started) return null;
    return buildYoutubeEmbedUrl(video.videoId, startAt);
  }, [started, startAt, video]);

  if (!video?.embedAllowed) {
    return (
      <div className="video-placeholder" role="status">
        <span aria-hidden="true">▶</span>
        <p>No playable creator video is available for this board variant.</p>
        {video?.sourceUrl ? (
          <a href={video.sourceUrl} rel="noreferrer" target="_blank">
            Check the source on YouTube
          </a>
        ) : null}
      </div>
    );
  }

  /** 章节跳转通过更换 start 参数重建 iframe，避免依赖跨域播放器状态。 */
  const seekTo = (seconds: number) => {
    setStartAt(seconds);
    setStarted(true);
  };

  return (
    <div className="youtube-player">
      <div className="video-embed">
        {iframeSrc ? (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={`Block Out level ${levelNumber} solution video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            className="video-consent"
            type="button"
            onClick={() => setStarted(true)}
            aria-label={`Play Block Out level ${levelNumber} solution video`}
          >
            {poster ? (
              <img
                className="video-poster"
                src={poster}
                alt={`Block Out level ${levelNumber} board preview`}
              />
            ) : null}
            <span className="video-play" aria-hidden="true">
              ▶
            </span>
            <span className="video-consent__caption">
              YouTube loads only after you choose to play.
            </span>
          </button>
        )}
      </div>
      {chapters.length > 0 ? (
        <div className="chapter-list">
          <h2>Video chapters</h2>
          <ol>
            {chapters.map((chapter) => (
              <li key={`${chapter.seconds}-${chapter.label}`}>
                <button type="button" onClick={() => seekTo(chapter.seconds)}>
                  <span>{formatTime(chapter.seconds)}</span>
                  {chapter.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
