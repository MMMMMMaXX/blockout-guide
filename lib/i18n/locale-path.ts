/** 文件职责：在 URL 中解析、添加与切换语言前缀，供语言切换器与内部链接复用。 */
import { defaultLocale, isLocale, type Locale } from "./locales";

/** 把任意内部路径加上语言前缀，保证双斜杠与缺失前缀都被归一化。 */
export function withLocale(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** 从路径名中拆出语言段与剩余路径；非法前缀按默认语言处理。 */
export function stripLocale(pathname: string): { locale: Locale; rest: string } {
  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0];
  if (candidate && isLocale(candidate)) {
    return { locale: candidate, rest: `/${segments.slice(1).join("/")}` || "/" };
  }
  return { locale: defaultLocale, rest: pathname };
}

/** 在同一篇文章/关卡的不同语言版本间切换，保留路径其余部分。 */
export function changeLocale(pathname: string, locale: Locale): string {
  const { rest } = stripLocale(pathname);
  return withLocale(locale, rest);
}
