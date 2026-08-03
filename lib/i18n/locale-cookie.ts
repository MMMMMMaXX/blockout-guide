/** 文件职责：跨 StratLore 三子域共享的语言 Cookie 契约。 */
import type { Locale } from "./locales";

export const LOCALE_COOKIE = "stratlore_locale";

/** 生成可在 .stratlore.com 下跨子域读取的语言 Cookie 头值。 */
export function buildLocaleCookie(locale: Locale): string {
  const parts = [
    `${LOCALE_COOKIE}=${locale}`,
    "Domain=.stratlore.com",
    "Path=/",
    "SameSite=Lax",
    "Secure",
    "Max-Age=31536000",
  ];
  return parts.join("; ");
}
