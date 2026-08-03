/** 文件职责：集中展示设计 Token 和共享组件状态，供开发阶段回归检查。 */
import { BoardPreview } from "./board-preview";
import { LevelJumpForm } from "./level-jump-form";

const colors = ["brand", "pink", "cyan", "green", "yellow", "orange", "violet"] as const;

/** 仅承载视觉合同示例，不包含可发布业务内容或真实游戏素材。 */
export function DesignSystemShowcase() {
  return (
    <div className="design-system shell">
      <header>
        <p className="eyebrow">DEVELOPMENT ONLY</p>
        <h1>Block Out design system</h1>
        <p>Token、排版、状态、输入、卡片和竖屏媒体的维护合同。</p>
      </header>
      <section>
        <h2>Color tokens</h2>
        <div className="token-grid">
          {colors.map((color) => (
            <div className="token" key={color}>
              <i className={`token-swatch token-swatch--${color}`} />
              <code>--{color}</code>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Type and actions</h2>
        <p className="eyebrow">SECTION LABEL</p>
        <h1>Primary display heading</h1>
        <h2>Section heading</h2>
        <p className="lede">
          Body copy uses compact spacing and readable contrast instead of oversized marketing
          typography.
        </p>
        <LevelJumpForm />
      </section>
      <section>
        <h2>Status and portrait media</h2>
        <div className="design-system__media">
          <div className="badge-row">
            <span className="badge badge--easy">Easy</span>
            <span className="badge badge--hard">Hard</span>
            <span className="badge badge--super-hard">Super hard</span>
          </div>
          <BoardPreview />
        </div>
      </section>
    </div>
  );
}
