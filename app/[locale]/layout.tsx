/** 文件职责：为每种语言路由挂载共享站点壳层，并注入对应 UI 词典。 */
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getMessages } from "@/lib/i18n/messages";

type LayoutProps = { children: ReactNode; params: Promise<{ locale: string }> };

/** 非法语言段直接 404，保证只有受支持的 10 种语言生成页面。 */
export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const messages = getMessages(locale);
  return (
    <SiteShell locale={locale} messages={messages}>
      {children}
    </SiteShell>
  );
}
