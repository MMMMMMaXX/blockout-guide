/** 文件职责：集中生成 canonical 与仅基于真实翻译实体的 hreflang 映射。 */
import type { Metadata } from "next";
import type { Locale } from "@/lib/content/types";

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
