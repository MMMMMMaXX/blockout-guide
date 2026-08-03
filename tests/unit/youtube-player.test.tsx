/** 文件职责：验证 YouTube 初始隐私边界、失效回退与章节起播 URL。 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildYoutubeEmbedUrl, YouTubePlayer } from "@/components/youtube-player";

const video = {
  provider: "youtube" as const,
  videoId: "a/b",
  publisherLabel: "Publisher",
  sourceUrl: "https://www.youtube.com/watch?v=ab",
  embedAllowed: true,
  rightsBasis: "youtube-embed" as const,
};

describe("YouTubePlayer", () => {
  it("does not load an iframe before user intent", () => {
    const html = renderToStaticMarkup(
      <YouTubePlayer levelNumber={1} video={video} chapters={[{ seconds: 12, label: "Open" }]} />,
    );
    expect(html).toContain("Play solution video");
    expect(html).not.toContain("<iframe");
  });

  it("builds a privacy-enhanced chapter URL", () => {
    expect(buildYoutubeEmbedUrl("a/b", 12)).toBe(
      "https://www.youtube-nocookie.com/embed/a%2Fb?autoplay=1&rel=0&start=12",
    );
  });

  it("shows an external fallback when embedding is unavailable", () => {
    const html = renderToStaticMarkup(
      <YouTubePlayer levelNumber={1} video={{ ...video, embedAllowed: false }} />,
    );
    expect(html).toContain("No playable creator video");
    expect(html).toContain("Check the source on YouTube");
  });
});
