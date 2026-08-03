/** 文件职责：把颜色名映射为视觉色块，放在颜色名前作为“要操作的颜色块”提示。所有关卡复用。 */
import type { ReactNode } from "react";

const COLOR_HEX: Record<string, string> = {
  blue: "#3b6fe0",
  red: "#e5484d",
  pink: "#f56f91",
  yellow: "#f3c44e",
  green: "#20ad73",
  cyan: "#4aa9ef",
  purple: "#8e6be8",
  violet: "#8e6be8",
  orange: "#f39356",
  teal: "#19b6c9",
  lime: "#9bd11a",
  magenta: "#d6409f",
  white: "#e8ebf5",
  black: "#2a2f45",
  gray: "#9aa1b8",
  grey: "#9aa1b8",
};

/** 把任意颜色名稳定映射为一个十六进制色值；未知颜色回退到中性灰。 */
export function colorHex(name: string): string {
  return COLOR_HEX[name.toLowerCase().trim()] ?? "#8a91a8";
}

type ColorDotProps = { name: string; size?: number };

/** 单个颜色圆点；修改此组件会同时影响所有关卡页的颜色提示。 */
export function ColorDot({ name, size = 14 }: ColorDotProps) {
  return (
    <span
      className="color-dot"
      aria-hidden="true"
      title={name}
      style={{ background: colorHex(name), width: size, height: size }}
    />
  );
}

type ColorChipsProps = { colors: string[] };

/** 一排“色块 + 颜色名”的组合；放在事实卡与棋盘档案中，使颜色可一眼辨识。 */
export function ColorChips({ colors }: ColorChipsProps) {
  if (colors.length === 0) return null;
  return (
    <span className="color-chips" aria-label={`Colors: ${colors.join(", ")}`}>
      {colors.map((color) => (
        <span key={color} className="color-chip">
          <ColorDot name={color} /> {color}
        </span>
      ))}
    </span>
  );
}

const COLOR_PATTERN = new RegExp(`\\b(${Object.keys(COLOR_HEX).join("|")})\\b`, "gi");

/**
 * 在普通文本中识别已知颜色名，并在其前方插入一枚色块，使其成为“要操作的颜色块”提示。
 * 屏幕阅读器仍读到颜色名本身；色块仅作视觉强调（aria-hidden）。
 */
export function highlightColors(text: string): ReactNode {
  const parts = text.split(COLOR_PATTERN);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const key = part.toLowerCase();
      if (COLOR_HEX[key]) {
        return (
          <span key={index} className="color-inline">
            <ColorDot name={key} /> {part}
          </span>
        );
      }
    }
    return <span key={index}>{part}</span>;
  });
}
