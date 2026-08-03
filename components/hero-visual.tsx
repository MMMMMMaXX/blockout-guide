/** 文件职责：首页英雄区使用多张真实游戏棋盘截图组成 3D 浮动拼贴，避免单张低清图被过度放大。 */

/**
 * 使用三张关卡棋盘封面组成错落卡片堆：中央主卡最大，左右后卡倾斜衬托。
 * 背景加柔和发光blob，前景加漂浮彩色方块，整体比单图+旋转线框更清晰、更有层次。
 */
export function HeroVisual() {
  return (
    <div className="hero-visual">
      <span className="hero-visual__glow hero-visual__glow--a" aria-hidden="true" />
      <span className="hero-visual__glow hero-visual__glow--b" aria-hidden="true" />
      <span className="hero-visual__glow hero-visual__glow--c" aria-hidden="true" />

      <div className="hero-visual__float hero-visual__float--back-left">
        <div className="hero-visual__card hero-visual__card--back-left">
          <img src="/boards/213.avif" alt="" loading="lazy" />
        </div>
      </div>

      <div className="hero-visual__float hero-visual__float--back-right">
        <div className="hero-visual__card hero-visual__card--back-right">
          <img src="/boards/400.avif" alt="" loading="lazy" />
        </div>
      </div>

      <div className="hero-visual__float hero-visual__float--main">
        <div className="hero-visual__card hero-visual__card--main">
          <img
            src="/boards/151.avif"
            alt="Block Out level 151 — a real in-game puzzle board"
          />
        </div>
      </div>

      <span className="hero-visual__block hero-visual__block--red" aria-hidden="true" />
      <span className="hero-visual__block hero-visual__block--blue" aria-hidden="true" />
      <span className="hero-visual__block hero-visual__block--green" aria-hidden="true" />
      <span className="hero-visual__block hero-visual__block--yellow" aria-hidden="true" />
      <span className="hero-visual__block hero-visual__block--purple" aria-hidden="true" />
    </div>
  );
}
