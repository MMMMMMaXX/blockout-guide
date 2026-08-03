/** 文件职责：用轻量 CSS 图形呈现竖屏棋盘占位，不冒充真实关卡截图。 */

const blocks = [
  ["violet", "wide", 0, 0],
  ["yellow", "tall", 2, 0],
  ["cyan", "tall", 0, 2],
  ["pink", "wide", 1, 3],
  ["green", "square", 2, 2],
  ["orange", "wide", 0, 5],
] as const;

/** 渲染明确标注为示意的棋盘，真实内容接入后由 boardImage 替换。 */
export function BoardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`board-preview${compact ? " board-preview--compact" : ""}`}
      role="img"
      aria-label="Abstract portrait board placeholder, not an actual level board"
    >
      <span className="board-label">BOARD SAMPLE</span>
      <div className="board-grid" aria-hidden="true">
        {blocks.map(([color, shape, column, row]) => (
          <i
            className={`board-block board-block--${color} board-block--${shape}`}
            key={`${color}-${column}-${row}`}
            style={{ gridColumnStart: column + 1, gridRowStart: row + 1 }}
          />
        ))}
      </div>
      <span className="board-gate board-gate--left" aria-hidden="true" />
      <span className="board-gate board-gate--right" aria-hidden="true" />
    </div>
  );
}
