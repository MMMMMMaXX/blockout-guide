/** 文件职责：定义全站统一语言契约（与 StratLore 三仓库一致），不共享代码只复制契约。 */
export const supportedLocales = [
  "en",
  "zh-cn",
  "pt-br",
  "ru",
  "de",
  "es",
  "fr",
  "ja",
  "ko",
  "tr",
] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en";

const localeSet: ReadonlySet<string> = new Set(supportedLocales);

/** 校验任意字符串是否为受支持的语言；用于 URL 段与 Cookie 防御。 */
export function isLocale(value: string): value is Locale {
  return localeSet.has(value);
}

/** 把任意输入规范为受支持语言，非法值回退到默认语言。 */
export function normalizeLocale(value: string | undefined | null): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}
