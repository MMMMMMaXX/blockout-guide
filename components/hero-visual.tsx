/** 文件职责：首页英雄区使用真实游戏棋盘截图并叠加轻量动效，替换原有的 CSS 占位示意图。 */

type HeroVisualProps = {
  src?: string;
  levelNumber?: number;
};

/**
 * 真实棋盘封面取自 /boards/{N}.avif（关卡专属真实图片），避免用占位图形冒充游戏画面。
 * 动效仅用于点缀：图片缓慢浮动、背后光斑漂移、表面高光扫过。
 */
export function HeroVisual({ src = "/boards/151.avif", levelNumber = 151 }: HeroVisualProps) {
  return (
    <div className="hero-visual">
      <span className="hero-visual__blob hero-visual__blob--a" aria-hidden="true" />
      <span className="hero-visual__blob hero-visual__blob--b" aria-hidden="true" />
      <span className="hero-visual__ring" aria-hidden="true" />
      <img
        className="hero-visual__img"
        src={src}
        alt={`Block Out level ${levelNumber} — a real in-game puzzle board`}
        width={320}
        height={560}
      />
    </div>
  );
}
