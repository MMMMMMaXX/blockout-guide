/** 文件职责：集中生成 canonical 与仅基于真实翻译实体的 hreflang 映射。 */
import type { Metadata } from "next";
import type { Locale } from "@/lib/content/types";
import { supportedLocales } from "@/lib/i18n/locales";
import { stripLocale, withLocale } from "@/lib/i18n/locale-path";

type TranslationTarget = { locale: Locale; path: string };

/** 没有真实翻译时只输出 canonical，绝不把英文页伪装成其他语言版本。 */
export function buildAlternates(canonical: string, translations: TranslationTarget[] = []) {
  const languages = Object.fromEntries(
    translations
      .filter((target) => target.path !== canonical)
      .map((target) => [target.locale, target.path]),
  );
  return {
    canonical,
    ...(Object.keys(languages).length > 0 ? { languages } : {}),
  } satisfies NonNullable<Metadata["alternates"]>;
}

/** 为所有 10 种语言（含 x-default=en）生成完整 hreflang；用于关卡页与稳定存在的栏目页。
 *  保证 alternate URL 与 canonical 使用一致的尾斜杠，避免 hreflang 与 canonical 互相冲突。 */
export function buildFullAlternates(canonical: string) {
  const { rest } = stripLocale(canonical);
  const normalizedRest = rest.endsWith("/") ? rest : `${rest}/`;
  const languages: Record<string, string> = {};
  for (const locale of supportedLocales) languages[locale] = withLocale(locale, normalizedRest);
  languages["x-default"] = withLocale("en", normalizedRest);
  return { canonical, languages } satisfies NonNullable<Metadata["alternates"]>;
}
