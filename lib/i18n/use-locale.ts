/** 文件职责：在客户端组件中从当前路径推导语言，避免逐层透传 locale 属性。 */
"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "./locale-path";
import { defaultLocale, type Locale } from "./locales";

/** 当前路径的展示语言；非法或缺失时回退默认语言。 */
export function useLocale(): Locale {
  const pathname = usePathname();
  return stripLocale(pathname ?? "/").locale ?? defaultLocale;
}
