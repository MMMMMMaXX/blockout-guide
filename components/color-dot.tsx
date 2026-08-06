/** 文件职责：把颜色名映射为视觉色块，放在颜色名前作为“要操作的颜色块”提示。所有关卡复用。 */
import type { ReactNode } from "react";
import type { Locale } from "@/lib/content/types";
import { catalogs, getMessages } from "@/lib/i18n/messages";

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
  mint: "#5eead4",
  lime: "#9bd11a",
  magenta: "#d6409f",
  white: "#e8ebf5",
  black: "#2a2f45",
  gray: "#9aa1b8",
  grey: "#9aa1b8",
};

/**
 * 反向映射：把任意语言的颜色显示名（如 "红色" / "Rouge" / "Красный"）映射回英文 key（red）。
 * 颜色值是机器标识，content JSON 在翻译流程中偶尔会被写成本地化字符串；
 * 这个映射保证 ColorDot 仍能正确渲染色值，而不是全部回退成灰色。
 */
const LOCALIZED_TO_KEY: Record<string, string> = {};
for (const catalog of Object.values(catalogs)) {
  for (const [key, value] of Object.entries(catalog.color)) {
    if (typeof value === "string") {
      LOCALIZED_TO_KEY[value.toLowerCase().trim()] = key;
      LOCALIZED_TO_KEY[key.toLowerCase().trim()] = key;
    }
  }
}

/** 把任意颜色名稳定映射为一个十六进制色值；未知颜色回退到中性灰。 */
export function colorHex(name: string): string {
  const normalized = name.toLowerCase().trim();
  const key = LOCALIZED_TO_KEY[normalized] ?? normalized;
  return COLOR_HEX[key] ?? "#8a91a8";
}

/** 取得本地化颜色显示名；未知颜色保留原名。 */
export function localizedColorName(name: string, locale: Locale): string {
  const t = getMessages(locale);
  const normalized = name.toLowerCase().trim();
  return (
    (t.color[normalized as keyof typeof t.color] as string | undefined) ??
    (t.color[(LOCALIZED_TO_KEY[normalized] ?? normalized) as keyof typeof t.color] as
      string | undefined) ??
    name
  );
}

type ColorDotProps = { name: string; size?: number; locale?: Locale };

/** 单个颜色圆点；修改此组件会同时影响所有关卡页的颜色提示。 */
export function ColorDot({ name, size = 14, locale }: ColorDotProps) {
  return (
    <span
      className="color-dot"
      aria-hidden="true"
      title={locale ? localizedColorName(name, locale) : name}
      style={{ background: colorHex(name), width: size, height: size }}
    />
  );
}

type ColorChipsProps = { colors: string[]; locale?: Locale };

/** 一排“色块 + 颜色名”的组合；放在事实卡与棋盘档案中，使颜色可一眼辨识。 */
export function ColorChips({ colors, locale }: ColorChipsProps) {
  if (colors.length === 0) return null;
  const labels = colors.map((color) => localizedColorName(color, locale ?? "en")).join(", ");
  return (
    <span className="color-chips" aria-label={labels}>
      {colors.map((color) => (
        <span key={color} className="color-chip">
          <ColorDot name={color} locale={locale} /> {localizedColorName(color, locale ?? "en")}
        </span>
      ))}
    </span>
  );
}

const COLOR_PATTERN = new RegExp(`\\b(${Object.keys(COLOR_HEX).join("|")})\\b`, "gi");

type HighlightColorsProps = { text: string; locale?: Locale };

/**
 * 在普通文本中识别已知颜色名，并在其前方插入一枚色块，使其成为“要操作的颜色块”提示。
 * 屏幕阅读器仍读到颜色名本身；色块仅作视觉强调（aria-hidden）。
 */
export function highlightColors({ text, locale }: HighlightColorsProps): ReactNode {
  const parts = text.split(COLOR_PATTERN);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const key = part.toLowerCase();
      if (COLOR_HEX[key]) {
        return (
          <span key={index} className="color-inline">
            <ColorDot name={key} locale={locale} />{" "}
            {locale ? localizedColorName(part, locale) : part}
          </span>
        );
      }
    }
    return <span key={index}>{part}</span>;
  });
}
