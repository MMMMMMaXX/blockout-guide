/** 文件职责：每种语言的 HTML lang、hreflang 与展示名，跨仓库保持一致。 */
import type { Locale } from "./locales";

export const localeMeta = {
  en: { htmlLang: "en", hreflang: "en", label: "English" },
  "zh-cn": { htmlLang: "zh-CN", hreflang: "zh-CN", label: "简体中文" },
  "pt-br": { htmlLang: "pt-BR", hreflang: "pt-BR", label: "Português (Brasil)" },
  ru: { htmlLang: "ru", hreflang: "ru", label: "Русский" },
  de: { htmlLang: "de", hreflang: "de", label: "Deutsch" },
  es: { htmlLang: "es", hreflang: "es", label: "Español" },
  fr: { htmlLang: "fr", hreflang: "fr", label: "Français" },
  ja: { htmlLang: "ja", hreflang: "ja", label: "日本語" },
  ko: { htmlLang: "ko", hreflang: "ko", label: "한국어" },
  tr: { htmlLang: "tr", hreflang: "tr", label: "Türkçe" },
} as const;

export type LocaleMeta = (typeof localeMeta)[Locale];

/** 所有语言的 hreflang 候选（含 x-default），用于关卡页完整 10 语言交替链接。 */
export const hreflangLocales: Locale[] = [...Object.keys(localeMeta)] as Locale[];

export const xDefaultLocale: Locale = "en";
