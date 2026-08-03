/** 文件职责：在客户端把 <html lang> 校正为当前语言，补偿根布局无法读取动态段的情况。 */
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/locale-path";
import { localeMeta } from "@/lib/i18n/locale-meta";

/** 路径变化即同步文档语言；SSR 初始 HTML 统一为 en，水合后按路径修正。 */
export function HtmlLangSync() {
  const pathname = usePathname();
  useEffect(() => {
    const { locale } = stripLocale(pathname ?? "/");
    document.documentElement.lang = localeMeta[locale]?.htmlLang ?? "en";
  }, [pathname]);
  return null;
}
