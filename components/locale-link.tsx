/** 文件职责：把内部路径自动加上当前语言前缀，避免页面硬编码 /en/ 段。 */
"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { Locale } from "@/lib/content/types";
import { withLocale } from "@/lib/i18n/locale-path";
import { useLocale } from "@/lib/i18n/use-locale";

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** 可选：显式语言；缺省时从当前路径推导。 */
  locale?: Locale;
  /** 不含语言前缀的内部路径，例如 "/levels/" 或 "/levels/218/"。 */
  to: string;
};

/** 渲染带语言前缀的 next/link；`to` 已经过 withLocale 归一化。 */
export function LocaleLink({ locale, to, ...rest }: LocaleLinkProps) {
  const current = useLocale();
  const resolved = locale ?? current;
  return <Link href={withLocale(resolved, to)} {...rest} />;
}
